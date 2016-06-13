// utils
export function generateUuid() {
    var d = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        d = Math.floor(d/16);
        var r = (d + Math.random()*16)%16 | 0;
        return (c == 'x' ? r : (r&0x3|0x8)).toString(16);
    });
}
