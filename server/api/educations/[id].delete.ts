import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/database";

export default defineEventHandler(async (event) => {
  // 1. Check User Auth
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  // 2. Get ID
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, message: "ID is required" });
  }

  const client = await serverSupabaseClient<Database>(event);

  // 3. Fetch record to get storage_path
  const { data: record, error: fetchError } = await client
    .from("education")
    .select("storage_path")
    .eq("id", Number(id))
    .single();

  if (fetchError) {
    throw createError({
      statusCode: 404,
      message: "Education record not found",
    });
  }

  // 4. Delete image from storage if exists
  if (record?.storage_path) {
    const { error: storageError } = await client.storage
      .from("education")
      .remove([record.storage_path]);

    if (storageError) {
      console.error("Failed to delete image from storage:", storageError);
      // Continue to delete record even if storage delete fails
    }
  }

  // 5. Delete record from database
  const { error } = await client
    .from("education")
    .delete()
    .eq("id", Number(id));

  if (error) {
    throw createError({ statusCode: 500, message: error.message });
  }

  return { message: "Education deleted successfully" };
});
