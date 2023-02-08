import * as chai from 'chai';
import {RestfulUserService} from "../../../src/impl/REST/users/RestfulUserService";
import * as dotenv from 'dotenv';
import {Kind, SportsTalkConfig} from "../../../src/models/CommonModels";
import {RestfulChatRoomService} from "../../../src/impl/REST/chat/RestfulChatRoomService";
import {UserClient} from "../../../src";
import {RestfulNotificationService} from "../../../src/impl/REST/notifications/RestfulNotificationService";
import {User, UserSearchType} from "../../../src/models/user/User";

dotenv.config();

const { expect } = chai;
// @ts-ignore
const config: SportsTalkConfig = {apiToken:process.env.TEST_KEY, appId: process.env.TEST_APP_ID, endpoint: process.env.TEST_ENDPOINT};
describe("UserManager Service", function(){
    this.timeout(5000);
    const UM = new RestfulUserService(config);
    const NS = new RestfulNotificationService(config);
    const RM = new RestfulChatRoomService(config);
    const UC = UserClient.init(config);
    const otherUC = UserClient.init();
    const userid = "107AC57E-85ED-4E1D-BDAF-2533CD3872EB"
    let user:User = {
        userid,
    };
    let reporter;
    describe("Creation", function() {
        it("Can create a user", done => {
            UM.createOrUpdateUser({
                userid: userid,
                handle: "testuserhandle",
                displayname: "someuser"
            }).then(u=>{
                user=u;
                return UM.createOrUpdateUser({
                    userid: 'reporter',
                    handle: 'reporter'
                });
            }).then((reportinguser)=>{
                reporter = reportinguser;
                done()
            }).catch(done);
        })
    });
    describe("Ban user", function() {
        it("Can ban the user", done => {
            UM.setBanStatus(user, true).then(res => {
                user = res;
                expect(user.banned).to.be.true;
                done();
            }).catch(done);
        })
    });
    describe('Unban user', function() {
        it("Can unban the user", done => {
            UM.setBanStatus(user, false).then(res => {
                user = res;
                expect(user.banned).to.be.false;
                done();
            }).catch(done)
        })
    });
    describe('Ban with ID', function() {
        it("Can ban the user with id", done => {
            UM.setBanStatus(userid, true).then(res => {
                user = res;
                expect(user.banned).to.be.true;
                done();
            }).catch(done);
        })
    });
    describe('Unban with ID', function(){
        it("Can unban the user with id", done=>{
            UM.setBanStatus(userid, false).then(res=>{
                user = res;
                expect(user.banned).to.be.false;
                done();
            }).catch(done)
        })
    })
    describe("ShadowBan", function(){
        it("Can shadowban the user", done=>{
            UM.setShadowBanStatus(user, true).then(res=>{
                user = res;
                expect(user.shadowbanned).to.be.true;
                done();
            }).catch(done);
        })
        it("Can unshadowban the user", done=>{
            UM.setShadowBanStatus(user, false).then(res=>{
                user = res;
                expect(user.shadowbanned).to.be.false;
                done();
            }).catch(done)
        })
        it("Can shadowban the user with id", done=>{
            UM.setShadowBanStatus(userid, true).then(res=>{
                user = res;
                expect(user.shadowbanned).to.be.true;
                done();
            }).catch(done);
        })
        it("Can unshadowban the user with id", done=>{
            UM.setShadowBanStatus(userid, false).then(res=>{
                user = res;
                expect(user.shadowbanned).to.be.false;
                done();
            }).catch(done)
        })
        it("Can shadowban the user with an expiry time", done=>{
            UM.setShadowBanStatus(user, true, 90).then(res=>{
                user = res;
                expect(user.shadowbanned).to.be.true;
                //@ts-ignore
                const date: Date = new Date(user.shadowbanexpires);
                expect(date).be.greaterThan(new Date());
                done();
            })
        })
    })


    describe("Search", function() {
        it("Can search by userid", async()=>{
           const results = await UM.searchUsers(userid, UserSearchType.userid)
           expect(results.users.length).to.be.equal(1);
        })
        it("Can search by name", async()=>{
            const results = await UM.searchUsers("someuser", UserSearchType.name)
            expect(results.users.length).to.be.equal(1);
        })
        it("Can search by handle", async()=>{
            const results = await UM.searchUsers("testuserhandle", UserSearchType.handle)
            expect(results.users.length).to.be.equal(1);
        })
        it("Won't find by bad handle", async()=>{
            const results = await UM.searchUsers("doesntexisthandle", UserSearchType.handle)
            expect(results.users.length).to.be.equal(0);
        })
        it("Won't find by bad name", async()=>{
            const results = await UM.searchUsers("doesntexistname", UserSearchType.name)
            expect(results.users.length).to.be.equal(0);
        })
        it("Won't find by bad userid", async()=>{
            const results = await UM.searchUsers("doesntexistuserid", UserSearchType.userid)
            expect(results.users.length).to.be.equal(0);
        })
    })

    describe('Report user', function() {
        it('Report a user', async() =>{
            const reported = await UM.reportUser(user, reporter);
            expect(reported.kind).to.be.equal('app.user');
            expect(reported.userid).to.be.equal(user.userid);
            expect(reported.reports).to.have.lengthOf(1);
        })
    })

    describe("List", function(){
        it("Can list users", async()=>{
            const response = await UM.listUsers();
            expect(response.users.length).to.be.greaterThan(0);
        })
        it("Can limit the list length", async()=>{
            await UM.createOrUpdateUser({userid:"fakeforTesting", handle:"fakefortesting"});
            const response = await UM.listUsers({limit:1});
            expect(response.users.length).to.be.equal(1);
        })
    })

    describe("Can request notifications", function() {
        it("Can list notifications", async ()=> {
            const response = await NS.listUserNotifications({
                userid: user.userid,
            })
            expect(response);
        })
    })
    describe('Subscriptions', function(){
        it('Can get user chat subscriptions', async()=>{
            const response = await UM.listUserSubscribedRooms(user)
            expect(response.kind).to.be.equal(Kind.userroomsubscriptions)
        })
    })

    describe("Deletion", function() {
        it("Can delete a user by User object", async() => {
           const user = await UM.createOrUpdateUser({
                userid: userid,
                handle: "testuserhandle"
            });
           const response = await UM.deleteUser(user);
           expect(response.user.kind).to.be.equal(Kind.user);
           const resp = await UM.searchUsers(userid, UserSearchType.userid);
           expect(resp.users.length).to.be.equal(0);
        })
        it("Can delete a user by id", async() => {
            const user = await UM.createOrUpdateUser({
                userid: "testuserid2",
                handle: "testuserhandle"
            });
            const response = await UM.deleteUser("testuserid2");
            expect(response.user.kind).to.be.equal(Kind.user);
            const users = await UM.searchUsers("testuserid2", UserSearchType.userid);
            expect(users.users.length).to.be.equal(0);
            //cleanup from prior test
            try {
                UM.deleteUser({userid:"fakeforTesting", handle:"fakefortesting"});
            } catch(e) {
                console.log(e);
            }
        })
    });

})
