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

  // 1. Get storage paths for the experiences to be deleted
  const { data: experiencesToDelete, error: fetchError } = await client
    .from("experiences")
    .select("storage_path")
    .in("id", validation.data.ids);

  if (fetchError) {
    throw createError({
      statusCode: 500,
      message: fetchError.message,
    });
  }

  // 2. Delete files from storage
  if (experiencesToDelete && experiencesToDelete.length > 0) {
    const pathsToDelete = experiencesToDelete
      .map((p) => p.storage_path)
      .filter((path): path is string => !!path); // Filter out nulls

    if (pathsToDelete.length > 0) {
      const { error: storageError } = await client.storage
        .from("experiences")
        .remove(pathsToDelete);

      if (storageError) {
        console.error("Failed to delete images:", storageError);
      }
    }
  }

  // 3. Delete records from database
  const { error } = await client
    .from("experiences")
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
