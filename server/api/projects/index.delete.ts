import { z } from "zod";
import {
  serverSupabaseClient,
  serverSupabaseServiceRole,
} from "#supabase/server";
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

  // 1. Get storage paths for the projects to be deleted
  const { data: projectsToDelete, error: fetchError } = await client
    .from("projects")
    .select("storage_path")
    .in("id", validation.data.ids);

  if (fetchError) {
    throw createError({
      statusCode: 500,
      message: fetchError.message,
    });
  }

  // 2. Delete files from storage
  if (projectsToDelete && projectsToDelete.length > 0) {
    const pathsToDelete = projectsToDelete
      .map((p) => p.storage_path)
      .filter((path): path is string => !!path); // Filter out nulls

    if (pathsToDelete.length > 0) {
      const { error: storageError } = await client.storage
        .from("projects")
        .remove(pathsToDelete);

      if (storageError) {
        console.error("Failed to delete images:", storageError);
        // We continue to delete the records even if image deletion fails,
        // but it's good to log it.
      }
    }
  }

  // 3. Delete records from database
  const { error } = await client
    .from("projects")
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
