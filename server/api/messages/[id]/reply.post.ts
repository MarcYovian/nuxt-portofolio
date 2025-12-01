import { z } from "zod";
import { serverSupabaseUser, serverSupabaseClient } from "#supabase/server";
import { MessageStatus } from "../../../../app/types/messages";
import type { Database } from "../../../../app/types/database";

const schema = z.object({
  reply_body: z.string().min(1, "Reply body is required"),
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

  const { reply_body } = result.data;
  const client = await serverSupabaseClient<Database>(event);

  // 1. Fetch the original message to get email, subject, name, and message
  const { data: originalMessage, error: fetchError } = await client
    .from("messages")
    .select("email, subject, name, message")
    .eq("id", id)
    .single();

  if (fetchError || !originalMessage) {
    throw createError({ statusCode: 404, statusMessage: "Message not found" });
  }

  // 2. Send Email
  try {
    const html = await renderEmailComponent("EmailContactReply", {
      name: originalMessage.name,
      subject: originalMessage.subject,
      replyMessage: reply_body,
      originalMessage: originalMessage.message,
      sentDate: new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }),
    });

    const { sendMail } = useNodeMailer();

    await sendMail({
      to: originalMessage.email,
      subject: `Re: ${originalMessage.subject}`,
      text: reply_body,
      html: html,
    });
  } catch (emailError) {
    console.error("Failed to send email:", emailError);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to send email",
    });
  }

  // 3. Update Database
  const { data, error } = await client
    .from("messages")
    .update({
      status: MessageStatus.REPLIED,
      replied_at: new Date().toISOString(),
      replied_by: user.id,
      reply_message: reply_body,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }

  return { success: true, message: "Reply sent successfully", data };
});
