import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/database";

export default eventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);

  const { data, error } = await client
    .from("skills")
    .select("*, skill_categories(name)")
    .order("display_order", { ascending: true });

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }

  return data;
});
