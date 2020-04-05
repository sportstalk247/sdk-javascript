import * as chai from 'chai';
import {RestfulUserManager} from "../../../src/impl/chat/REST/RestfulUserManager";
import * as dotenv from 'dotenv';
import {SportsTalkConfig} from "../../../src/models/CommonModels";
dotenv.config();

const { expect } = chai;
// @ts-ignore
const config: SportsTalkConfig = {apiKey:process.env.TEST_KEY, appId: process.env.TEST_APP_ID, endpoint: process.env.TEST_ENDPOINT};
describe("UserManager", function(){
    const UM = new RestfulUserManager(  config);
    let user;
    it("fake", function(done){
        done();
    })
    describe("Creation", function() {
        it("Can create a user", done => {
            UM.createOrUpdateUser({
                userid: "testuserid",
                handle: "testuserhandle"
            }).then(u=>{
                user=u;
                done();
            })
        })
    });
    describe("Ban", function(){
        it("Can ban the user", done=>{
            UM.setBanStatus(user, true).then(res=>{
                user = res.data;
                expect(user.banned).to.be.true;
                done();
            }).catch(done);
        })
        it("Can unban the user", done=>{
            UM.setBanStatus(user, false).then(res=>{
                user = res.data;
                expect(user.banned).to.be.false;
                done();
            }).catch(done)
        })
    })
    describe("List", function(){
        it("Can list user messages", done=>{
            UM.listUserMessages(user).then(messages=> {
                expect(messages.length).to.be.equal(0);
                done();
            }).catch(done);
        })
    })
})
