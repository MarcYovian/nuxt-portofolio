import { z } from "zod";
import { serverSupabaseClient } from "#supabase/server";
import { MessageStatus } from "../../../app/types/messages";
import type { Database } from "../../../app/types/database";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const result = schema.safeParse(body);

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Validation Error",
      data: result.error.flatten(),
    });
  }

  const client = await serverSupabaseClient<Database>(event);
  const { name, email, subject, message } = result.data;

  // Get IP and User Agent for metadata
  const ip_address = getRequestIP(event);
  const user_agent = getRequestHeader(event, "user-agent");

  const { error } = await client.from("messages").insert({
    name,
    email,
    subject,
    message,
    status: MessageStatus.UNREAD,
    ip_address,
    user_agent,
  });

  if (error) {
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: error.message,
    });
  }

  const html = await renderEmailComponent("EmailNewContactMessage", {
    name,
    email,
    subject,
    message,
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

  try {
    await sendMail({
      to: "marcellinusyovian@gmail.com",
      subject,
      text: message,
      html: html,
    });
  } catch (error: any) {
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: error.message,
    });
  }

  return { success: true, message: "Message sent successfully" };
});
