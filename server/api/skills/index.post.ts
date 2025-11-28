import { z } from "zod";
import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/database";

const schema = z.object({
  category_id: z.number(),
  name: z.string().min(1),
  icon: z.string().optional(),
  proficiency_level: z.number().min(1).max(5).optional(),
  years_of_experience: z.number().min(0).optional(),
  display_order: z.number().optional(),
  is_active: z.boolean().default(true),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const validation = schema.safeParse(body);

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: validation.error.message,
    });
  }

  const client = await serverSupabaseClient<Database>(event);
  const { data, error } = await client
    .from("skills")
    .insert(validation.data)
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
