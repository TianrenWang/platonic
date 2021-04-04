export const getTimePast = (time: Date) => {
    let difference: number = new Date().getTime() - time.getTime();
    let seconds: number = difference / 1000;
    let minutes: number = seconds / 60;
    let hours: number = minutes / 60;
    let days: number = hours / 24;
    let weeks: number = days / 7;
    if (seconds < 60){
        return `${Math.round(seconds)} seconds ago`;
    } else if (minutes < 60){
        return `${Math.round(minutes)} minutes ago`;
    } else if (hours < 24){
        return `${Math.round(hours)} hours ago`;
    } else if (days < 7){
        return `${Math.round(days)} days ago`;
    } else {
        return `${Math.round(weeks)} weeks ago`;
    }
}