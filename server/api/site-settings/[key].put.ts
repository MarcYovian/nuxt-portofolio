import { z } from "zod";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/database";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const key = getRouterParam(event, "key");
  if (!key) {
    throw createError({ statusCode: 400, message: "Missing key parameter" });
  }

  const body = await readBody(event);

  const serverSchema = z.object({
    value: z.any(),
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

  const { data, error } = await client
    .from("site_settings")
    .update({
      ...validation.data,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("key", key)
    .select()
    .single();

  if (error) {
    throw createError({ statusCode: 500, message: error.message });
  }

  return data;
});
