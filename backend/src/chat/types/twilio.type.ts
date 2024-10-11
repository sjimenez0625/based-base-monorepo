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
