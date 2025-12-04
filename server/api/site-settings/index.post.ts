import { z } from "zod";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/database";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const body = await readBody(event);

  const serverSchema = z.object({
    key: z.string().min(1),
    value: z.any(), // Value is JSONB, so it can be anything. We'll rely on frontend to send valid JSON structure if it's a string.
    description: z.string().optional().nullable(),
    is_public: z.boolean().default(false),
  });

  const validation = serverSchema.safeParse(body);

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: validation.error.message,
    });
  }

  const client = await serverSupabaseClient<Database>(event);

  // Check if key already exists
  const { data: existing } = await client
    .from("site_settings")
    .select("key")
    .eq("key", validation.data.key)
    .single();

  if (existing) {
    throw createError({
      statusCode: 409,
      message: "A setting with this key already exists.",
    });
  }

  const { data, error } = await client
    .from("site_settings")
    .insert({
      ...validation.data,
      created_by: user.id,
      updated_by: user.id,
    })
    .select()
    .single();

  if (error) {
    throw createError({ statusCode: 500, message: error.message });
  }

  return data;
});
