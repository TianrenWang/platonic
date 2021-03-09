import { User } from "./user.model";

export interface Message {
  created: Date,
  from: User,
  text: string,
  dialogue: string,
  attributes: any,
  _id: string
}