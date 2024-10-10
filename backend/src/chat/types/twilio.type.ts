import { TwilioMediaContentType } from '../constant/twilio.constant';

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
  profileName: string;
  from: string;
  to: string;
  body: string;
  messageType: MessageType;
  mediaContentType0?: TwilioMediaContentType;
  mediaUrl0?: string;
};
