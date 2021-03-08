import { User } from "./user.model";

export interface Message {
  mine?: boolean;
  created: Date;
  from: User;
  text: string;
  twilioChannelId: string;
  index: number;
  sid: string;
  _id: string;
  attributes: any;
}
