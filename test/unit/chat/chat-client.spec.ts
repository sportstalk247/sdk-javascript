import {ChatClient} from '../../../src/impl/ChatClient';

import * as chai from 'chai';
import * as dotenv from 'dotenv';
import {DEFAULT_CONFIG} from "../../../src/impl/constants/api";
dotenv.config();

const { expect } = chai;

describe("Chat Client", function(){
    it("Can set current room state", function(){
        const id = "FAKE_ID";
        const name = "FAKE ROOM NAME";
        const client = ChatClient.init(DEFAULT_CONFIG)
        client.setCurrentRoom({id, name});
        const room = client.getCurrentRoom();
        // @ts-ignore
        expect(room.id).to.be.equal(id)
        // @ts-ignore
        expect(room.name).to.be.equal(name);
    })
    it("Can be configured with handlers on construction", function(){
        const client = ChatClient.init(DEFAULT_CONFIG, {
            onAdminCommand: function() {
            }
        })
        const handlers = client.getEventHandlers();
        expect(handlers.onAdminCommand).to.be.not.null;
        expect(Object.keys(handlers).length).to.be.equal(1);
    });

})