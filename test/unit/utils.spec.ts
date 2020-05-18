import {buildAPI, forceObjKeyOrString, getJSONHeaders} from '../../src/impl/utils'
import {SportsTalkConfig} from "../../src/models/CommonModels";
import * as chai from 'chai';
import {CommentRequest, ListSortDirection} from "../../src/models/CommentsModels";
import {API_TOKEN_HEADER, APPLICATION_JSON} from "../../src/impl/constants/api";
import {ValidationError} from "../../src/impl/errors";

const {expect} = chai;

const config:SportsTalkConfig = {
    appId: "FakeAppId",
    apiToken: "FakeToken",
    endpoint: "http://www.endpoint"
}
describe("buildApi", function(){
    it("Will build an API endpoint", ()=>{
        const api = buildAPI(config, "test");
        expect(api).to.be.equal("http://www.endpoint/FakeAppId/test")
    });

    it("Will accept a request", ()=>{
        const request:CommentRequest = {
            sort: "oldest",
        }
        let api = buildAPI(config, "test", request);
        expect(api).to.be.equal("http://www.endpoint/FakeAppId/test?sort=oldest")
        request.includechildren = true;
        api = buildAPI(config, "test", request);
        expect(api).to.be.equal("http://www.endpoint/FakeAppId/test?sort=oldest&includechildren=true")
        request.direction = ListSortDirection.forward;
        api = buildAPI(config, "test", request)
        expect(api).to.be.equal("http://www.endpoint/FakeAppId/test?sort=oldest&includechildren=true&direction=forward")
       ;
    })
})

describe("JSON headers", ()=>{
    it("Will build json headers", ()=>{
        const headers = getJSONHeaders( "token");;
        //expect(headers["Content-Type"]).to.be.equal(APPLICATION_JSON);
        expect(headers[API_TOKEN_HEADER]).to.be.equal("token");
    })
})

describe("forceObjKey", ()=>{
    it("Will throw an error if string key is missing", ()=>{
        try {
            forceObjKeyOrString({})
        }catch(e) {
            expect(e instanceof ValidationError).to.be.true;
        }
    })
    it("Will throw an error if the key does not have a string value", ()=>{
        try{
            forceObjKeyOrString({id:[]});
        }catch(e) {
            expect(e instanceof ValidationError).to.be.true;
        }
    })
    it("Will return identity if passed a string", ()=>{
        expect(forceObjKeyOrString("SomeKey")).to.be.equal("SomeKey");
    })
    it("Will return the id property by default", ()=>{
        expect(forceObjKeyOrString({id:"TestId"})).to.be.equal("TestId");
    })
    it("Will return a custom id property if specified", ()=>{
        expect(forceObjKeyOrString({userid:"TestId"}, "userid")).to.be.equal("TestId");
    })
})