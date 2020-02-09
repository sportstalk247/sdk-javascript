// @ts-ignore
const client = require('./SportsTalkClient');
const types = require('./DataModels');
// @ts-ignore
var SportsTalkClient = window.SportsTalkClient || client.default || client.SportsTalkClient || client;


if(window) {
    // @ts-ignore
    window.SportsTalkClient = SportsTalkClient;
    // @ts-ignore
    window.SportsTalk = {};
    // @ts-ignore
    window.SportsTalk.Types = types;
}
