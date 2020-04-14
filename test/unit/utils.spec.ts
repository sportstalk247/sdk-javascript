import {buildAPI} from '../../src/impl/utils'
import {SportsTalkConfig} from "../../src/models/CommonModels";
import * as chai from 'chai';
import {CommentRequest, ListSortDirection} from "../../src/models/ConversationModels";

const {expect} = chai;

const config:SportsTalkConfig = {
    appId: "FakeAppId",
    apiToken: "FakeToken",
    endpoint: "http://www.endpoint"
}
describe("buildApi", function(){
    it("Will build an API endpoint", ()=>{
        const api = buildAPI(config, "test");
        expect(api).to.be.equal("http://endpoint/FakeAppId//test")
    });

    it("Will accept a request", ()=>{
        const request:CommentRequest = {
            sort: "oldest",
        }
        let api = buildAPI(config, "test", request);
        expect(api).to.be.equal("http://www.endpoint/FakeAppId/test?sort=oldest")
        request.includechilden = true;
        api = buildAPI(config, "test", request);
        expect(api).to.be.equal("http://www.endpoint/FakeAppId/test?sort=oldest&includechilden=true")
        request.direction = ListSortDirection.forward;
        api = buildAPI(config, "test", request)
        expect(api).to.be.equal("http://www.endpoint/FakeAppId/test?sort=oldest&includechilden=true&direction=forward")
       ;
    })
})