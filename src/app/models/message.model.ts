export interface Message {
  created: Date,
  from: string,
  text: string,
  dialogue: string,
  attributes: any,
  _id: string
}

export interface Comment extends Message{};

export const isChunk = (firstMessage: Message, secondMessage: Message) => {
  if (!firstMessage){
    return false;
  }
  let differenceInMinutes: number = new Date(secondMessage.created).getTime() - new Date(firstMessage.created).getTime();
  return firstMessage.from === secondMessage.from && differenceInMinutes/1000/60 < 10;
}

export const getTime = (message: Message) => {
  if (!message){
    return "";
  }
  return new Date(message.created).toLocaleTimeString("en-US");
}