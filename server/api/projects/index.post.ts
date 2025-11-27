import { z } from "zod";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/database";

export default defineEventHandler(async (event) => {
  // 1. Cek User Auth (Wajib login)
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  // 2. Baca Multipart Form Data
  const formData = await readMultipartFormData(event);
  if (!formData) {
    throw createError({ statusCode: 400, message: "No form data received" });
  }

  // 3. Parsing Data: Pisahkan File dan Text Fields
  // FormData values aslinya adalah Buffer, harus diconvert ke String/Number/Boolean
  const fields: Record<string, any> = {};
  let filePart: any = null;

  for (const part of formData) {
    if (part.name === "image") {
      filePart = part;
    } else if (part.name) {
      // Convert Buffer ke String
      fields[part.name] = part.data.toString();
    }
  }

  // 4. Konversi Tipe Data (Penting!)
  // Semua text field dari FormData adalah string. Kita harus convert manual.
  if (fields.category_id) fields.category_id = Number(fields.category_id);

  // Handle Boolean (checkbox mengirim string "true" atau "on" jika dicentang)
  // UCheckbox biasanya mengirim "true" atau "false" sebagai string dalam FormData Nuxt
  fields.is_active = fields.is_active === "true";
  fields.is_featured = fields.is_featured === "true";

  // Handle Optional/Empty strings menjadi null
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

  // 5. Validasi Text Fields dengan Zod
  // Kita buat schema baru khusus Server yang tidak mengecek 'instanceof(File)'
  const serverSchema = z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().min(1),
    content: z.string().optional().nullable(),
    category_id: z.number(), // Sudah diconvert jadi number di atas
    demo_url: z.string().optional().nullable(),
    github_url: z.string().optional().nullable(),
    is_active: z.boolean().default(true),
    is_featured: z.boolean().default(false),
    status: z.string().optional().nullable(),
    published_at: z.string().optional().nullable(),
    started_at: z.string().optional().nullable(),
    completed_at: z.string().optional().nullable(),
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
  let imageUrl = null;
  let thumbnailUrl = null;
  let storagePath = null;

  // Cek apakah ada file image yang dikirim
  // Note: UFileUpload mengirim file dengan content-type
  if (filePart && filePart.filename) {
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

    // Gunakan map, atau fallback ke filePart.type, atau fallback ke octet-stream
    const cleanContentType =
      mimeMap[fileExt] || filePart.type || "application/octet-stream";

    // Upload Buffer ke Storage
    const { error: uploadError } = await client.storage
      .from("projects")
      .upload(filePath, filePart.data, {
        contentType: cleanContentType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload Error:", uploadError);
      throw createError({ statusCode: 500, message: "Failed to upload image" });
    }

    // Get Public URL
    const { data: publicUrlData } = client.storage
      .from("projects")
      .getPublicUrl(filePath);

    imageUrl = publicUrlData.publicUrl;
    // Gunakan fitur transform Supabase untuk thumbnail
    thumbnailUrl = `${publicUrlData.publicUrl}?width=500&resize=cover&quality=60`;
    storagePath = filePath;
  } else {
    // Opsional: Jika Image Wajib, throw error di sini
    throw createError({ statusCode: 400, message: "Image is required" });
  }

  // 7. Insert ke Database
  const { data, error } = await client
    .from("projects")
    .insert({
      ...validation.data,
      image_url: imageUrl,
      thumbnail_url: thumbnailUrl,
      storage_path: storagePath,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw createError({
        statusCode: 409,
        message: "Project with this slug already exists.",
      });
    }
    throw createError({ statusCode: 500, message: error.message });
  }

  // 8. Insert Skills
  if (fields.skills) {
    try {
      const skills = JSON.parse(fields.skills);
      if (Array.isArray(skills) && skills.length > 0) {
        const projectSkills = skills.map((skillId: number) => ({
          project_id: data.id,
          skill_id: skillId,
        }));

        const { error: skillsError } = await client
          .from("project_skills")
          .insert(projectSkills);

        if (skillsError) {
          console.error("Failed to insert skills:", skillsError);
          // Optional: throw error or just log it
        }
      }
    } catch (e) {
      console.error("Failed to parse skills:", e);
    }
  }

  return data;
});
