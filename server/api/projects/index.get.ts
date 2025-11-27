import { serverSupabaseClient } from "#supabase/server";
import { Database } from "~/types/database";

export default eventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);

  const { data, error } = await client
    .from("projects")
    .select(
      "*, project_categories(name), project_skills(skill_id, skills(id, name, icon))",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }

  return data;
});
