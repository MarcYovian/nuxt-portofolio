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

  const fields: Record<string, any> = {};
  let filePart: any = null;

  for (const part of formData) {
    if (part.name === "image") {
      filePart = part;
    } else if (part.name) {
      fields[part.name] = part.data.toString();
    }
  }

  fields.is_active = fields.is_active === "true";
  fields.is_featured = fields.is_featured === "true";
  if (fields.display_order)
    fields.display_order = parseInt(fields.display_order);

  ["description", "credential_id", "credential_url", "type"].forEach((key) => {
    if (
      fields[key] === "" ||
      fields[key] === "undefined" ||
      fields[key] === "null"
    ) {
      fields[key] = null;
    }
  });

  const schema = z.object({
    title: z.string().min(1).optional(),
    issuer: z.string().min(1).optional(),
    date: z.string().min(1).optional(),
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
    is_active: z.boolean().optional(),
    is_featured: z.boolean().optional(),
    display_order: z.number().optional().nullable(),
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
    // 1. Get existing achievement to find old storage_path
    const { data: existingItem } = await client
      .from("achievements")
      .select("storage_path")
      .eq("id", id)
      .single();

    // 2. Delete old file if exists
    if (existingItem?.storage_path) {
      await client.storage
        .from("achievements")
        .remove([existingItem.storage_path]);
    }

    // 3. Upload new file
    const fileExt = filePart.filename.split(".").pop();
    const fileName = `achievement-${Date.now()}.${fileExt}`;
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
      .from("achievements")
      .upload(filePath, filePart.data, {
        contentType: cleanContentType,
        upsert: true,
      });

    if (uploadError) {
      throw createError({ statusCode: 500, message: "Failed to upload image" });
    }

    const { data: publicUrlData } = client.storage
      .from("achievements")
      .getPublicUrl(filePath);

    updateData.image_url = publicUrlData.publicUrl;
    updateData.storage_path = filePath;
  }

  const { data, error } = await client
    .from("achievements")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw createError({ statusCode: 500, message: error.message });
  }

  // Handle Tags Update
  if (fields.tags) {
    try {
      const tags = JSON.parse(fields.tags);
      if (Array.isArray(tags)) {
        // 1. Delete existing tags
        await client.from("achievement_tags").delete().eq("achievement_id", id);

        // 2. Insert new tags
        if (tags.length > 0) {
          const achievementTags = tags.map((tagId: number) => ({
            achievement_id: id,
            tag_id: tagId,
          }));

          const { error: tagsError } = await client
            .from("achievement_tags")
            .insert(achievementTags);

          if (tagsError) {
            console.error("Failed to update tags:", tagsError);
          }
        }
      }
    } catch (e) {
      console.error("Failed to parse tags:", e);
    }
  }

  return data;
});
