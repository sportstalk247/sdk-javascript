import {SettingsError, ValidationError} from "../../../src/impl/errors";
import * as chai from 'chai';
const { expect } = chai;

describe("Errors", function(){
    it("Can create a Settings error", ()=>{
        const error = new SettingsError("Message")
        expect(error.message).to.be.equal("Message");
        expect(typeof error).to.be.equal("object");
        expect(error instanceof Error).to.be.true;
    })
    it("Can create a Validation error", ()=>{
        const error = new ValidationError("Message")
        expect(error.message).to.be.equal("Message");
        expect(typeof error).to.be.equal("object");
        expect(error instanceof Error).to.be.true;
    })
})
