import * as chai from 'chai';
import {RestfulUserManager} from "../../../src/impl/common/REST/RestfulUserManager";
import * as dotenv from 'dotenv';
import {SearchType, SportsTalkConfig} from "../../../src/models/CommonModels";
import {RestfulRoomManager} from "../../../src/impl/chat/REST/RestfulRoomManager";

dotenv.config();

const { expect } = chai;
// @ts-ignore
const config: SportsTalkConfig = {apiKey:process.env.TEST_KEY, appId: process.env.TEST_APP_ID, endpoint: process.env.TEST_ENDPOINT};
describe("UserManager", function(){
    const UM = new RestfulUserManager(  config);
    const RM = new RestfulRoomManager(  config);

    let user;
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
    describe("Search", function() {
        it("Can search by userid", async()=>{
           const results = await UM.searchUsers("testuserid", SearchType.userid)
           expect(results.length).to.be.equal(1);
        })
        it("Can search by name", async()=>{
            const results = await UM.searchUsers("someuser", SearchType.name)
            expect(results.length).to.be.equal(0);
        })
        it("Can search by handle", async()=>{
            const results = await UM.searchUsers("testuserhandle", SearchType.handle)
            expect(results.length).to.be.equal(1);
        })
        it("Won't find by bad handle", async()=>{
            const results = await UM.searchUsers("doesntexisthandle", SearchType.handle)
            expect(results.length).to.be.equal(0);
        })
    })

})
