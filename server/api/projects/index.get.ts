import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/database";

export default eventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);

  const { data, error } = await client
    .from("projects")
    .select("*, project_categories(name)")
    .order("created_at", { ascending: false });

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }

  return data;
});
