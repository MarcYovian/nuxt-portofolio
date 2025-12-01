import { z } from "zod";
import { serverSupabaseUser, serverSupabaseClient } from "#supabase/server";
import {
  MessageStatus,
  type MessageStatusType,
} from "../../../app/types/messages";
import type { Database } from "../../../app/types/database";

const schema = z.object({
  status: z.enum([
    MessageStatus.UNREAD,
    MessageStatus.READ,
    MessageStatus.REPLIED,
    MessageStatus.ARCHIVED,
    MessageStatus.SPAM,
  ]),
});

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const idStr = getRouterParam(event, "id");
  if (!idStr) {
    throw createError({ statusCode: 400, statusMessage: "Missing message ID" });
  }
  const id = parseInt(idStr);

  const body = await readBody(event);
  const result = schema.safeParse(body);

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Validation Error",
      data: result.error.flatten(),
    });
  }

  const { status } = result.data;
  const client = await serverSupabaseClient<Database>(event);

  const { data, error } = await client
    .from("messages")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }

  return { success: true, message: "Status updated successfully", data };
});
