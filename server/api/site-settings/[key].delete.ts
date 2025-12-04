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

  const client = await serverSupabaseClient<Database>(event);

  const { error } = await client.from("site_settings").delete().eq("key", key);

  if (error) {
    throw createError({ statusCode: 500, message: error.message });
  }

  return { success: true };
});
