import { z } from "zod";
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/database";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const body = await readBody(event);

  const schema = z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    color: z.string().optional().nullable(),
  });

  const validation = schema.safeParse(body);

  if (!validation.success) {
    throw createError({ statusCode: 400, message: validation.error.message });
  }

  const client = await serverSupabaseClient<Database>(event);

  const { data, error } = await client
    .from("tags")
    .insert({
      ...validation.data,
      created_by: user.sub,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw createError({
        statusCode: 409,
        message: "Tag with this slug already exists.",
      });
    }
    throw createError({ statusCode: 500, message: error.message });
  }

  return data;
});
