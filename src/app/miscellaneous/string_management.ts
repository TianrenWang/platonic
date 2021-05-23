export const truncateText = (text: string, maxMessageLength: number) => {
    if (text.length < maxMessageLength){
        return text;
    } else {
        return text.substring(0, maxMessageLength) + ".....";
    }
}