import type { Database } from "./database";

export type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

export const MessageStatus = {
  UNREAD: "unread",
  READ: "read",
  REPLIED: "replied",
  ARCHIVED: "archived",
  SPAM: "spam",
} as const;

export type MessageStatusType =
  (typeof MessageStatus)[keyof typeof MessageStatus];

export interface IMessage extends Omit<MessageRow, "status"> {
  status: MessageStatusType;
}
