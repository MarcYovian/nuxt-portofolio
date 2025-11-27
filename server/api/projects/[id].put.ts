import { z } from "zod";
import {
  serverSupabaseClient,
  serverSupabaseUser,
  serverSupabaseServiceRole,
} from "#supabase/server";
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
  if (fields.category_id) fields.category_id = parseInt(fields.category_id);
  fields.is_active = fields.is_active === "true";
  fields.is_featured = fields.is_featured === "true";

  // Handle Optional/Empty strings
  [
    "demo_url",
    "github_url",
    "started_at",
    "completed_at",
    "status",
    "content",
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

  const updateData: any = { ...validation.data };
  updateData.updated_by = user.id;
  updateData.updated_at = new Date().toISOString();

  // Handle File Upload
  if (filePart && filePart.filename) {
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
    const fileExt = filePart.filename.split(".").pop();
    const fileName = `thumbnail-${Date.now()}.${fileExt}`;
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
      .from("projects")
      .upload(filePath, filePart.data, {
        contentType: cleanContentType,
        upsert: true,
      });

    if (uploadError) {
      throw createError({ statusCode: 500, message: "Failed to upload image" });
    }

    const { data: publicUrlData } = client.storage
      .from("projects")
      .getPublicUrl(filePath);

    updateData.image_url = publicUrlData.publicUrl;
    updateData.thumbnail_url = `${publicUrlData.publicUrl}?width=500&resize=cover&quality=60`;
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

  // Handle Skills Update
  if (fields.skills) {
    try {
      const skills = JSON.parse(fields.skills);
      if (Array.isArray(skills)) {
        // 1. Delete existing skills
        await client.from("project_skills").delete().eq("project_id", id);

        // 2. Insert new skills
        if (skills.length > 0) {
          const projectSkills = skills.map((skillId: number) => ({
            project_id: id,
            skill_id: skillId,
          }));

          const { error: skillsError } = await client
            .from("project_skills")
            .insert(projectSkills);

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
