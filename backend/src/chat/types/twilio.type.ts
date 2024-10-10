export enum MessageType {
    TEXT = 'text',
    INTERACTIVE = 'interactive',
    CONTACTS = 'contacts',
  }

export type ResponseMessage = {
  from: string;
  to: string;
  body: string;
};

export type IncomingMessage = {
  ProfileName: string;
  From: string;
  To: string;
  Body: string;
  MessageType: MessageType;
};