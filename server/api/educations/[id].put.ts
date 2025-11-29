import { z } from "zod";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/database";

export default defineEventHandler(async (event) => {
  // 1. Check User Auth
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  // 2. Get ID
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, message: "ID is required" });
  }

  // 3. Read Multipart Form Data
  const formData = await readMultipartFormData(event);
  if (!formData) {
    throw createError({ statusCode: 400, message: "No form data received" });
  }

  // 4. Parse Data
  const fields: Record<string, any> = {};
  let filePart: any = null;

  for (const part of formData) {
    if (part.name === "image") {
      filePart = part;
    } else if (part.name) {
      fields[part.name] = part.data.toString();
    }
  }

  // 5. Convert Data Types
  if (fields.is_current !== undefined)
    fields.is_current = fields.is_current === "true";
  if (fields.is_active !== undefined)
    fields.is_active = fields.is_active === "true";
  if (fields.display_order) fields.display_order = Number(fields.display_order);
  if (fields.gpa) fields.gpa = Number(fields.gpa);
  if (fields.max_gpa) fields.max_gpa = Number(fields.max_gpa);

  // Handle Optional/Empty strings
  [
    "field_of_study",
    "location",
    "description",
    "institution_website",
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

  // Handle Arrays/JSON
  if (fields.honors) {
    try {
      fields.honors = JSON.parse(fields.honors);
    } catch (e) {
      fields.honors = [];
    }
  }

  if (fields.activities) {
    try {
      fields.activities = JSON.parse(fields.activities);
    } catch (e) {
      fields.activities = [];
    }
  }

  // 6. Validation
  const serverSchema = z
    .object({
      institution: z.string().min(1).optional(),
      degree: z.string().min(1).optional(),
      field_of_study: z.string().optional().nullable(),
      location: z.string().optional().nullable(),
      institution_website: z.string().optional().nullable(),
      start_date: z.string().min(1).optional(),
      end_date: z.string().optional().nullable(),
      is_current: z.boolean().optional(),
      is_active: z.boolean().optional(),
      gpa: z.number().optional().nullable(),
      max_gpa: z.number().default(4.0).optional().nullable(),
      honors: z.array(z.string()).optional().nullable(),
      activities: z.array(z.string()).optional().nullable(),
      description: z.string().optional().nullable(),
    })
    .refine(
      (data) => {
        if (data.gpa && data.max_gpa && data.gpa > data.max_gpa) {
          return false;
        }
        return true;
      },
      {
        message: "GPA cannot be greater than Max GPA",
        path: ["gpa"],
      },
    );

  const validation = serverSchema.safeParse(fields);

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: validation.error.message,
    });
  }

  const client = await serverSupabaseClient<Database>(event);

  // 7. Handle Image Upload (if new image provided)
  let updateData: any = {
    ...validation.data,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  };

  if (filePart && filePart.filename) {
    // Fetch existing record to get old storage path
    const { data: existingRecord, error: fetchError } = await client
      .from("education")
      .select("storage_path")
      .eq("id", Number(id))
      .single();

    if (fetchError) {
      throw createError({
        statusCode: 404,
        message: "Education record not found",
      });
    }

    // Delete old image if exists
    if (existingRecord?.storage_path) {
      await client.storage
        .from("education")
        .remove([existingRecord.storage_path]);
    }

    // Upload new image
    const fileExt = filePart.filename.split(".").pop();
    const fileName = `institution-${Date.now()}.${fileExt}`;
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
      .from("education")
      .upload(filePath, filePart.data, {
        contentType: cleanContentType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload Error:", uploadError);
      throw createError({ statusCode: 500, message: "Failed to upload image" });
    }

    const { data: publicUrlData } = client.storage
      .from("education")
      .getPublicUrl(filePath);

    updateData.institution_logo = publicUrlData.publicUrl;
    updateData.storage_path = filePath;
  }

  // 8. Update Database
  const { data, error } = await client
    .from("education")
    .update(updateData)
    .eq("id", Number(id))
    .select()
    .single();

  if (error) {
    throw createError({ statusCode: 500, message: error.message });
  }

  return data;
});
