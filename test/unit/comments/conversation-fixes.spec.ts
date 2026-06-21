import * as chai from 'chai';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { RestfulConversationService } from '../../../src/impl/REST/comments/RestfulConversationService';
import { DEFAULT_CONFIG } from '../../../src/impl/constants/api';

const { expect } = chai;
const TEST_CONFIG = Object.assign({}, DEFAULT_CONFIG, { appId: 'app1', apiToken: 'tok', endpoint: 'http://test' });

function bodyOf(config: any): any {
    return typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
}

describe('RestfulConversationService.reactToConversationTopic', () => {
    let mock: MockAdapter;
    beforeEach(() => { mock = new MockAdapter(axios); });
    afterEach(() => { mock.restore(); });

    // Regression: `reacted: reaction.reacted || true` could never send false, so a caller
    // could never un-react.
    it('sends reacted:false when un-reacting', async () => {
        let body: any;
        mock.onPost(/\/react\/?$/).reply((config) => {
            body = bodyOf(config);
            return [200, { message: 'Success', data: {} }];
        });
        const svc = new RestfulConversationService(TEST_CONFIG);
        await svc.reactToConversationTopic('conv1', { reaction: 'like', reacted: false }, { userid: 'u1' } as any);
        expect(body.reacted).to.equal(false);
    });

    it('sends reacted:true when reacting', async () => {
        let body: any;
        mock.onPost(/\/react\/?$/).reply((config) => {
            body = bodyOf(config);
            return [200, { message: 'Success', data: {} }];
        });
        const svc = new RestfulConversationService(TEST_CONFIG);
        await svc.reactToConversationTopic('conv1', { reaction: 'like', reacted: true }, { userid: 'u1' } as any);
        expect(body.reacted).to.equal(true);
    });
});

describe('RestfulConversationService.deleteConversation', () => {
    let mock: MockAdapter;
    beforeEach(() => { mock = new MockAdapter(axios); });
    afterEach(() => { mock.restore(); });

    // Regression: returned the whole envelope instead of unwrapping .data.
    it('unwraps response.data (not the envelope)', async () => {
        mock.onDelete(/.*/).reply(200, { kind: 'deletion.response', message: 'Success', data: { conversationid: 'conv1', deletedConversations: 1 } });
        const svc = new RestfulConversationService(TEST_CONFIG);
        const result: any = await svc.deleteConversation('conv1');
        expect(result.deletedConversations).to.equal(1);
        expect(result.kind).to.be.undefined;
    });
});
