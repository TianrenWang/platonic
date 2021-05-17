export const imageFileValid = (file: File) => {
    if(!file) {
        return false;
    }

    let mimeType = file.type;

    if (mimeType.match(/image\/*/) === null) {
        return false;
    }
    
    return true;
}