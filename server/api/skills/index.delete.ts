import { z } from "zod";
import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/database";

const schema = z.object({
  ids: z.array(z.number()),
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
  const { error } = await client
    .from("skills")
    .delete()
    .in("id", validation.data.ids);

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message,
    });
  }

  return { success: true };
});
