import { z } from "zod";
import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/database";

const schema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  price_range: z.string().optional(),
  features: z.array(z.string()).optional(),
  icon: z.string().optional(),
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
    .from("services")
    .insert({
      title: validation.data.title,
      slug: validation.data.slug,
      description: validation.data.description,
      price_range: validation.data.price_range,
      features: validation.data.features,
      icon: validation.data.icon,
      display_order: validation.data.display_order,
      is_active: validation.data.is_active,
    })
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
