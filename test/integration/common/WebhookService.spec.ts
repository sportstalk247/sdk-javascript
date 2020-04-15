import * as chai from 'chai';
import {RestfulWebhookManager} from "../../../src/impl/common/REST/RestfulWebhookManager";
import * as dotenv from 'dotenv';
import {Kind, SportsTalkConfig, WebHook, WebhookEvent, WebhookType} from "../../../src/models/CommonModels";
dotenv.config();

const { expect } = chai;
let posthook:WebHook;
let prehook:WebHook;
// @ts-ignore
const config: SportsTalkConfig = {apiToken:process.env.TEST_KEY, appId: process.env.TEST_APP_ID, endpoint: process.env.TEST_ENDPOINT};
describe("Webhook Manager", function(){
    const HookManager = new RestfulWebhookManager(  config);

    describe("Creation", function() {
        it("Can create a post publish webhook", done => {
           HookManager.createWebhook({
               label: "postpublish test hook",
               url: "https://localhost:443",
               enabled: true,
               type: WebhookType.postpublish,
               events: [
                   WebhookEvent.chatspeech,
                   WebhookEvent.chataction,
                   WebhookEvent.chatcustom,
                   WebhookEvent.chatenter,
                   WebhookEvent.chatexit,
                   WebhookEvent.chatpurge,
                   WebhookEvent.chatreaction,
                   WebhookEvent.chatreply,
                   WebhookEvent.chatroomclosed,
                   WebhookEvent.chatroomopened]
           }).then(resp=>{
               posthook = resp;
               expect(posthook.type).to.be.equal(WebhookType.postpublish);
               expect(resp).to.be.not.null;
               expect(resp.id).to.be.not.null;
               done()
           }).catch(resp=>{
               done(resp);
           });
        });

        it("Can create a pre publish webhook", done => {
            HookManager.createWebhook({
                label: "prepublish test hook",
                url: "https://localhost:443",
                enabled: true,
                type: WebhookType.prepublish,
                events: [
                    WebhookEvent.chatspeech,
                ]
            }).then(resp=>{
                prehook = resp;
                expect(prehook.type).to.be.equal(WebhookType.prepublish);
                expect(resp.id).to.be.not.null;
                done()
            }).catch(e=>{
                done(e);
            });
        })
    });

    describe("Modify", function(){
        it("Can update the pre publish hook", done=>{
            const updated = Object.assign(prehook, {events:[]})
           HookManager.updateWebhook(updated).then(resp=>{
               expect(resp.events).to.have.lengthOf(0);
               done();
           }).catch(e=>{
               done(e);
           })
        })
        it("Can update the post publish hook", done=>{
            const updated = Object.assign(posthook, {events:[]})
            HookManager.updateWebhook(updated).then(resp=>{
                expect(resp.events).to.have.lengthOf(0);
                done();
            }).catch(e=>{
                done(e);
            })
        })
    })
    describe("List", function(){
        it("Can list hookss", done=>{
           HookManager.listWebhooks().then(resp=>{
               expect(resp.length).to.be.greaterThan(0);
               done();
           }).catch(e=>{
               done(e);
           })
        })
    })
    describe("Delete", function(){
        it('Can delete hooks', async()=>{
            try {
                let hook;
                if (prehook) {
                    hook = await HookManager.deleteWebhook(prehook);
                    expect(hook.kind).to.be.equal(Kind.webhook);
                    const listsofhooks = await HookManager.listWebhooks();
                    const found = listsofhooks.find(webhook => webhook.id === hook.id);
                    expect(!found).to.be.true;
                }
                if (posthook) {
                    hook = await HookManager.deleteWebhook(posthook)
                    const listsofhooks = await HookManager.listWebhooks();
                    const found = listsofhooks.find(webhook => webhook.id === hook.id);
                    expect(!found).to.be.true;
                }
            }catch(e) {
                throw e;
            }
        })
    });
})
