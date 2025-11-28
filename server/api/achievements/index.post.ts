import { z } from "zod";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/database";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const formData = await readMultipartFormData(event);
  if (!formData) {
    throw createError({ statusCode: 400, message: "No form data received" });
  }

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
  fields.is_active = fields.is_active === "true";
  fields.is_featured = fields.is_featured === "true";
  if (fields.display_order)
    fields.display_order = parseInt(fields.display_order);

  // Handle Optional/Empty strings
  [
    "description",
    "credential_id",
    "credential_url",
    "type",
    "deleted_at",
    "created_at",
    "updated_at",
    "created_by",
    "updated_by",
  ].forEach((key) => {
    if (
      fields[key] === "" ||
      fields[key] === "undefined" ||
      fields[key] === "null"
    ) {
      fields[key] = null;
    }
  });

  const serverSchema = z.object({
    title: z.string().min(1),
    issuer: z.string().min(1),
    date: z.string().min(1),
    description: z.string().optional().nullable(),
    credential_id: z.string().optional().nullable(),
    credential_url: z.string().optional().nullable(),
    type: z
      .enum([
        "certification",
        "award",
        "publication",
        "patent",
        "course",
        "other",
      ])
      .optional()
      .nullable(),
    is_active: z.boolean().default(true),
    is_featured: z.boolean().default(false),
    display_order: z.number().optional().nullable(),
  });

  const validation = serverSchema.safeParse(fields);

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: validation.error.message,
    });
  }

  const client = await serverSupabaseClient<Database>(event);
  let imageUrl = null;
  let storagePath = null;

  // Upload Image
  if (filePart && filePart.filename) {
    const fileExt = filePart.filename.split(".").pop();
    const fileName = `achievement-${Date.now()}.${fileExt}`;
    const filePath = `${user.sub}/${fileName}`; // [user-id]/achievement-[timestamp].[ext]

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
      .from("achievements")
      .upload(filePath, filePart.data, {
        contentType: cleanContentType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload Error:", uploadError);
      throw createError({ statusCode: 500, message: "Failed to upload image" });
    }

    const { data: publicUrlData } = client.storage
      .from("achievements")
      .getPublicUrl(filePath);

    imageUrl = publicUrlData.publicUrl;
    storagePath = filePath;
  }

  // Insert to Database
  const { data, error } = await client
    .from("achievements")
    .insert({
      ...validation.data,
      image_url: imageUrl,
      storage_path: storagePath,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    throw createError({ statusCode: 500, message: error.message });
  }

  // Insert Tags (Pivot)
  if (fields.tags) {
    try {
      const tags = JSON.parse(fields.tags);
      if (Array.isArray(tags) && tags.length > 0) {
        const achievementTags = tags.map((tagId: number) => ({
          achievement_id: data.id,
          tag_id: tagId,
        }));

        const { error: tagsError } = await client
          .from("achievement_tags")
          .insert(achievementTags);

        if (tagsError) {
          console.error("Failed to insert tags:", tagsError);
        }
      }
    } catch (e) {
      console.error("Failed to parse tags:", e);
    }
  }

  return data;
});
