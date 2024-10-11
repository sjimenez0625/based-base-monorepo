import { User } from "src/user/entities/user.entity";

export type Session = {
  threadId: string;
  phone: string;
  user: User;
};