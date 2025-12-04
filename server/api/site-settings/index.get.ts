import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/database";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const client = await serverSupabaseClient<Database>(event);

  const { data, error } = await client
    .from("site_settings")
    .select("*")
    .order("key", { ascending: true });

  if (error) {
    throw createError({ statusCode: 500, message: error.message });
  }

  return data;
});
