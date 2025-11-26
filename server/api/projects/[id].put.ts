import { z } from "zod";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/database";

export default defineEventHandler(async (event) => {
  const idParam = getRouterParam(event, "id");
  const id = idParam ? parseInt(idParam) : 0;

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
  if (fields.category_id) fields.category_id = parseInt(fields.category_id);
  if (fields.is_active) fields.is_active = fields.is_active === "true";
  if (fields.is_featured) fields.is_featured = fields.is_featured === "true";

  const schema = z.object({
    title: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    content: z.string().optional().nullable(),
    category_id: z.number().optional(),
    demo_url: z.string().optional().nullable(),
    github_url: z.string().optional().nullable(),
    is_active: z.boolean().optional(),
    is_featured: z.boolean().optional(),
    status: z.string().optional().nullable(),
    published_at: z.string().optional().nullable(),
    started_at: z.string().optional().nullable(),
    completed_at: z.string().optional().nullable(),
  });

  const validation = schema.safeParse(fields);

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: validation.error.message,
    });
  }

  const client = await serverSupabaseClient<Database>(event);
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const updateData: any = { ...validation.data };
  updateData.updated_by = user.id;
  updateData.updated_at = new Date().toISOString();

  // Handle File Upload
  if (filePart) {
    // 1. Get existing project to find old storage_path
    const { data: existingProject } = await client
      .from("projects")
      .select("storage_path")
      .eq("id", id)
      .single();

    // 2. Delete old file if exists
    if (existingProject?.storage_path) {
      await client.storage
        .from("projects")
        .remove([existingProject.storage_path]);
    }

    // 3. Upload new file
    const fileExt = filePart.filename?.split(".").pop();
    const fileName = `thumbnail-${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await client.storage
      .from("projects")
      .upload(filePath, filePart.data, {
        contentType: filePart.type,
        upsert: true,
      });

    if (uploadError) {
      throw createError({ statusCode: 500, message: "Failed to upload image" });
    }

    const { data: publicUrlData } = client.storage
      .from("projects")
      .getPublicUrl(filePath);

    updateData.image_url = publicUrlData.publicUrl;
    updateData.thumbnail_url = publicUrlData.publicUrl;
    updateData.storage_path = filePath;
  }

  const { data, error } = await client
    .from("projects")
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

  return data;
});
