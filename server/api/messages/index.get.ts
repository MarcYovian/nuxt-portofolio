import { serverSupabaseUser, serverSupabaseClient } from "#supabase/server";
import { MessageStatus } from "../../../app/types/messages";
import type { Database } from "../../../app/types/database";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const query = getQuery(event);
  const client = await serverSupabaseClient<Database>(event);

  let supabaseQuery = client.from("messages").select("*", { count: "exact" });

  // Filtering by status
  if (query.status && typeof query.status === "string") {
    // Handle "inbox" which might mean unread OR read, or just specific status
    // The user requirement says: "Inbox (shows 'unread' & 'read')"
    if (query.status === "inbox") {
      supabaseQuery = supabaseQuery.in("status", [
        MessageStatus.UNREAD,
        MessageStatus.READ,
      ]);
    } else {
      supabaseQuery = supabaseQuery.eq("status", query.status);
    }
  }

  // Searching
  if (query.search && typeof query.search === "string") {
    const searchTerm = query.search;
    // "It should perform a case-insensitive search on name, email, or subject."
    // Supabase 'or' syntax: column.ilike.val,column2.ilike.val
    supabaseQuery = supabaseQuery.or(
      `name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,subject.ilike.%${searchTerm}%`,
    );
  }

  // Sorting
  // "Sort by created_at descending."
  supabaseQuery = supabaseQuery.order("created_at", { ascending: false });

  // Pagination
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  supabaseQuery = supabaseQuery.range(from, to);

  const { data, count, error } = await supabaseQuery;

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }

  return {
    data,
    total: count,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0,
  };
});
