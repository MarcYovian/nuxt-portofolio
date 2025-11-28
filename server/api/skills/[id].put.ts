import { z } from "zod";
import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/database";

const schema = z.object({
  category_id: z.number().optional(),
  name: z.string().min(1).optional(),
  icon: z.string().optional(),
  proficiency_level: z.number().min(1).max(5).optional(),
  years_of_experience: z.number().min(0).optional(),
  display_order: z.number().optional(),
  is_active: z.boolean().optional(),
});

export default defineEventHandler(async (event) => {
  const idParam = getRouterParam(event, "id");
  const id = idParam ? parseInt(idParam) : 0;
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
    .update(validation.data)
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
