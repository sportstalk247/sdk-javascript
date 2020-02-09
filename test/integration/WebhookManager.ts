import * as chai from 'chai';
import {RestfulWebhookManager} from "../../src/impl/REST/RestfulWebhookManager";
import {WebhookEvent, WebhookType} from "../../src/DataModels";


const { expect } = chai;

describe("Webhook Manager", function(){
    const HookManager = new RestfulWebhookManager(  {
        apiKey:process.env.TEST_KEY,
        endpoint: process.env.TEST_ENDPOINT,
    })
    let posthook;
    let prehook;
    describe("Creation", function() {
        it("Can create a post publish webhook", done => {
           HookManager.createWebhook({
               label: "prepublish test hook",
               url: "https://localhost:443",
               enabled: true,
               type: WebhookType.postpublish,
               events: [
                   WebhookEvent.speech,
                   WebhookEvent.action,
                   WebhookEvent.custom,
                   WebhookEvent.enter,
                   WebhookEvent.exit,
                   WebhookEvent.purge,
                   WebhookEvent.reaction,
                   WebhookEvent.reply,
                   WebhookEvent.roomclosed,
                   WebhookEvent.roomopened]
           }).then(resp=>{
               posthook = resp;
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
                    WebhookEvent.speech,
                    WebhookEvent.action,
                    WebhookEvent.custom,
                    WebhookEvent.enter,
                    WebhookEvent.exit,
                    WebhookEvent.purge,
                    WebhookEvent.reaction,
                    WebhookEvent.reply,
                    WebhookEvent.roomclosed,
                    WebhookEvent.roomopened]
            }).then(resp=>{
                prehook = resp;
                expect(resp).to.be.not.null;
                expect(resp.id).to.be.not.null;
                done()
            }).catch(resp=>{
                done(resp);
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
                if (prehook) {
                    await HookManager.deleteWebhook(prehook);
                }
                if (posthook) {
                    await HookManager.deleteWebhook(posthook)
                }
            }catch(e) {
                throw e;
            }
        })
    });
})
