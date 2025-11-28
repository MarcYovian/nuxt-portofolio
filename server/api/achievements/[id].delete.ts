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

  // 1. Get storage path before deleting record
  const { data: item } = await client
    .from("achievements")
    .select("storage_path")
    .eq("id", id)
    .single();

  // 2. Delete record (cascade should handle achievement_tags, but we'll let DB handle it)
  const { error } = await client.from("achievements").delete().eq("id", id);

  if (error) {
    throw createError({ statusCode: 500, message: error.message });
  }

  // 3. Delete file from storage if exists
  if (item?.storage_path) {
    await client.storage.from("achievements").remove([item.storage_path]);
  }

  return { success: true };
});
