import { z } from "zod";
import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/database";

const schema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price_range: z.string().optional(),
  features: z.array(z.string()).optional(),
  icon: z.string().optional(),
  display_order: z.number().optional(),
  is_active: z.boolean().optional(),
});

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
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
    .from("services")
    .update({
      ...validation.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", Number(id))
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
