export interface Message {
  created: Date,
  from: string,
  text: string,
  dialogue?: string,
  attributes: any,
  _id?: string
}