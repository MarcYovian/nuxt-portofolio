import { z } from "zod";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/database";

export default defineEventHandler(async (event) => {
  const idParam = getRouterParam(event, "id");
  const id = idParam ? parseInt(idParam) : 0;

  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const formData = await readMultipartFormData(event);
  if (!formData) {
    throw createError({ statusCode: 400, message: "No form data" });
  }

  // Parse fields from formData
  const fields: Record<string, any> = {};
  let filePart: any = null;

  for (const part of formData) {
    if (part.name === "image") {
      filePart = part;
    } else if (part.name) {
      fields[part.name] = part.data.toString();
    }
  }

  // Convert types
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

  const schema = z.object({
    company: z.string().min(1).optional(),
    role: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    company_website: z.string().optional().nullable(),
    start_date: z.string().min(1).optional(),
    end_date: z.string().optional().nullable(),
    is_current: z.boolean().optional(),
    is_active: z.boolean().optional(),
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

  const validation = schema.safeParse(fields);

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: validation.error.message,
    });
  }

  const client = await serverSupabaseClient<Database>(event);

  const updateData: any = { ...validation.data };
  updateData.updated_by = user.id;
  updateData.updated_at = new Date().toISOString();

  // Handle File Upload
  if (filePart && filePart.filename) {
    // 1. Get existing experience to find old storage_path
    const { data: existingExperience } = await client
      .from("experiences")
      .select("storage_path")
      .eq("id", id)
      .single();

    // 2. Delete old file if exists
    if (existingExperience?.storage_path) {
      await client.storage
        .from("experiences")
        .remove([existingExperience.storage_path]);
    }

    // 3. Upload new file
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
      .from("experiences")
      .upload(filePath, filePart.data, {
        contentType: cleanContentType,
        upsert: true,
      });

    if (uploadError) {
      throw createError({ statusCode: 500, message: "Failed to upload image" });
    }

    const { data: publicUrlData } = client.storage
      .from("experiences")
      .getPublicUrl(filePath);

    updateData.company_logo = publicUrlData.publicUrl;
    updateData.storage_path = filePath;
  }

  const { data, error } = await client
    .from("experiences")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message,
    });
  }

  // Handle Skills Update
  if (fields.skills) {
    try {
      const skills = JSON.parse(fields.skills);
      if (Array.isArray(skills)) {
        // 1. Delete existing skills
        await client.from("experience_skills").delete().eq("experience_id", id);

        // 2. Insert new skills
        if (skills.length > 0) {
          const experienceSkills = skills.map((skillId: number) => ({
            experience_id: id,
            skill_id: skillId,
          }));

          const { error: skillsError } = await client
            .from("experience_skills")
            .insert(experienceSkills);

          if (skillsError) {
            console.error("Failed to update skills:", skillsError);
          }
        }
      }
    } catch (e) {
      console.error("Failed to parse skills:", e);
    }
  }

  return data;
});
