import {ChatClient} from '../../../src/impl/ChatClient';

import * as chai from 'chai';
import * as dotenv from 'dotenv';
import {DEFAULT_CONFIG} from "../../../src/impl/constants/api";
import {EventResult} from "../../../src/models/ChatModels";
import {Reaction} from "../../../src/models/CommonModels";
dotenv.config();

const event:EventResult = require('./event.json');

const { expect } = chai;
const client = ChatClient.init(DEFAULT_CONFIG)

describe("Chat Client", function(){
    it("Can set current room state", function(){
        const id = "FAKE_ID";
        const name = "FAKE ROOM NAME";
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

    it('Can tell me if the current User has liked an event', function(){
        client.setUser({userid:'aldo', handle:'Aldo'})
        let isLiked = client.messageIsReactedTo(event, Reaction.like);
        expect(isLiked).to.be.true;
        client.setUser({userid:'lucas', handle:'Lucas'})
        isLiked = client.messageIsReactedTo(event, Reaction.like);
        expect(isLiked).to.be.false
    })

})