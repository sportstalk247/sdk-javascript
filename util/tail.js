// print process.argv
let API_KEY=''
let ROOM_ID = ''
let JWT = ''

if(!ROOM_ID) throw new Error("Require ROOM_ID to tail");
if(!API_KEY) throw new Error("Require API_KEY to tail")
console.log(`Tailing ROOM ${ROOM_ID} with API_KEY ${API_KEY}`)

module.exports = function({ROOM_ID, API_KEY}) {
    if(process && procss.argv && process.argv.length>2) {
        const args = process.argv.slice(2);
        args.forEach(function (val) {
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
    if(!ROOM_ID) throw new Error("Require ROOM_ID to tail");
    if(!API_KEY) throw new Error("Require API_KEY to tail")
    console.log(`Tailing ROOM ${ROOM_ID} with API_KEY ${API_KEY}`)
}