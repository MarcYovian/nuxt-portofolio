import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/database";

export default defineEventHandler(async (event) => {
  const idParam = getRouterParam(event, "id");
  const id = idParam ? parseInt(idParam) : 0;

  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const client = await serverSupabaseClient<Database>(event);

  const { error } = await client.from("tags").delete().eq("id", id);

  if (error) {
    throw createError({ statusCode: 500, message: error.message });
  }

  return { success: true };
});
