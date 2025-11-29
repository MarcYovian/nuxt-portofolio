import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/database";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);

  const { data, error } = await client
    .from("education")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) {
    throw createError({ statusCode: 500, message: error.message });
  }

  return data;
});
