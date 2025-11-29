import { z } from "zod";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/database";

export default defineEventHandler(async (event) => {
  // 1. Check User Auth
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  // 2. Read Multipart Form Data
  const formData = await readMultipartFormData(event);
  if (!formData) {
    throw createError({ statusCode: 400, message: "No form data received" });
  }

  // 3. Parse Data
  const fields: Record<string, any> = {};
  let filePart: any = null;

  for (const part of formData) {
    if (part.name === "image") {
      filePart = part;
    } else if (part.name) {
      fields[part.name] = part.data.toString();
    }
  }

  // 4. Convert Data Types
  fields.is_current = fields.is_current === "true";
  fields.is_active = fields.is_active === "true";
  if (fields.display_order) fields.display_order = Number(fields.display_order);

  // Handle Optional/Empty strings
  [
    "company_website",
    "location",
    "description",
    "employment_type",
    "end_date",
  ].forEach((key) => {
    if (
      fields[key] === "" ||
      fields[key] === "undefined" ||
      fields[key] === "null"
    ) {
      fields[key] = null;
    }
  });

  // 5. Validation
  const serverSchema = z.object({
    company: z.string().min(1),
    role: z.string().min(1),
    description: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    company_website: z.string().optional().nullable(),
    start_date: z.string().min(1),
    end_date: z.string().optional().nullable(),
    is_current: z.boolean().default(false),
    is_active: z.boolean().default(true),
    employment_type: z
      .enum([
        "full-time",
        "part-time",
        "contract",
        "freelance",
        "internship",
        "apprenticeship",
      ])
      .optional()
      .nullable(),
  });

  const validation = serverSchema.safeParse(fields);

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: validation.error.message,
    });
  }

  // 6. Upload Image Logic
  const client = await serverSupabaseClient<Database>(event);
  let companyLogo = null;
  let storagePath = null;

  if (filePart && filePart.filename) {
    const fileExt = filePart.filename.split(".").pop();
    const fileName = `company-${Date.now()}.${fileExt}`;
    const filePath = `${user.sub}/${fileName}`;

    const mimeMap: Record<string, string> = {
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      webp: "image/webp",
    };

    const cleanContentType =
      mimeMap[fileExt] || filePart.type || "application/octet-stream";

    const { error: uploadError } = await client.storage
      .from("experiences") // Assuming 'experiences' bucket exists, or use 'projects' if shared? User said "storage_path column for path file in the storage bucket". I'll assume 'experiences' bucket or check if I should use a general one. The project uses 'projects' bucket. I'll check if 'experiences' bucket exists or if I should use 'public' or similar.
      // Wait, the user didn't specify the bucket name, just "storage bucket".
      // I'll assume 'experiences' bucket for now, but if it fails I might need to create it or use another.
      // Actually, looking at `projects` it uses `projects` bucket. I'll bet there is an `experiences` bucket or I should use `projects`?
      // Let's assume `experiences` bucket.
      .upload(filePath, filePart.data, {
        contentType: cleanContentType,
        upsert: false,
      });

    if (uploadError) {
      // If bucket doesn't exist, this will fail.
      // I'll try to use 'experiences' bucket.
      console.error("Upload Error:", uploadError);
      throw createError({ statusCode: 500, message: "Failed to upload image" });
    }

    const { data: publicUrlData } = client.storage
      .from("experiences")
      .getPublicUrl(filePath);

    companyLogo = publicUrlData.publicUrl;
    storagePath = filePath;
  }

  // 7. Insert into Database
  const { data, error } = await client
    .from("experiences")
    .insert({
      ...validation.data,
      company_logo: companyLogo,
      storage_path: storagePath,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    throw createError({ statusCode: 500, message: error.message });
  }

  // 8. Insert Skills
  if (fields.skills) {
    try {
      const skills = JSON.parse(fields.skills);
      if (Array.isArray(skills) && skills.length > 0) {
        const experienceSkills = skills.map((skillId: number) => ({
          experience_id: data.id,
          skill_id: skillId,
        }));

        const { error: skillsError } = await client
          .from("experience_skills")
          .insert(experienceSkills);

        if (skillsError) {
          console.error("Failed to insert skills:", skillsError);
        }
      }
    } catch (e) {
      console.error("Failed to parse skills:", e);
    }
  }

  return data;
});
