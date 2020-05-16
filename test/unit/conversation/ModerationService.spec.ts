import {RestfulCommentModerationService} from '../../../src/impl/REST/comments/RestfulCommentModerationService';
import * as chai from 'chai';
import * as dotenv from 'dotenv';
import {DEFAULT_CONFIG} from "../../../src/impl/constants/api";
import {SettingsError} from "../../../src/impl/errors";
dotenv.config();

const { expect } = chai;

describe("Moderation Service", function(){
    describe("Sportstalk Configuration", function(){
        it("Requires an config", ()=>{
            const service = new RestfulCommentModerationService()
            try {
                service.getModerationQueue()
            }catch(e) {
                expect(e instanceof SettingsError).to.be.true;
            }
        })
        it("Requires an AppId", ()=>{
            const service = new RestfulCommentModerationService(DEFAULT_CONFIG)
            try {
                service.getModerationQueue()
            }catch(e) {
                expect(e instanceof SettingsError).to.be.true;
            }
        })
    })

})