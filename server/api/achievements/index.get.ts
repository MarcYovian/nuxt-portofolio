import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/database";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const client = await serverSupabaseClient<Database>(event);

  const { data, error } = await client
    .from("achievements")
    .select(
      `
            *,
            achievement_tags (
                tag_id,
                tags (
                    id,
                    name,
                    color,
                    slug
                )
            )
        `,
    )
    .order("date", { ascending: false });

  if (error) {
    throw createError({ statusCode: 500, message: error.message });
  }

  // Transform data to include tags array
  const transformedData = data?.map((item) => ({
    ...item,
    tags: item.achievement_tags?.map((at: any) => at.tags) || [],
  }));

  return transformedData;
});
