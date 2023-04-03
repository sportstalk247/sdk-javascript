module.exports = function(){
    let API_KEY = '';
    let ROOM_ID = '';
    if(process && process.argv) {
        const args = process.argv.slice(2);
        if (!args.length) {
            console.log("CANNOT TAIL. Please add API_KEY and ROOM_ID parameters.")
        }
        args.forEach(function (val, index, array) {
            if (val.startsWith('API_KEY')) {
                API_KEY = val.split("=");
                if (API_KEY.length > 1) {
                    API_KEY = API_KEY[1]
                }
            }
            if (val.startsWith('ROOM_ID')) {
                ROOM_ID = val.split("=");
                if (ROOM_ID.length > 1) {
                    ROOM_ID = API_KEY[1]
                }
            }
        });
    }
    return {ROOM_ID, API_KEY}
}