import * as chai from 'chai';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { RestfulWebhookService } from '../../../src/impl/REST/webhooks/RestfulWebhookService';
import { DEFAULT_CONFIG } from '../../../src/impl/constants/api';

const { expect } = chai;
const TEST_CONFIG = Object.assign({}, DEFAULT_CONFIG, { appId: 'app1', apiToken: 'tok', endpoint: 'http://test' });

// Regression: logRequest (limit/cursor) was accepted but never serialized, so paging was
// impossible — every call returned the server's default page.
describe('RestfulWebhookService.listWebhookLogs', () => {
    let mock: MockAdapter;
    let lastUrl: string;
    beforeEach(() => {
        mock = new MockAdapter(axios);
        lastUrl = '';
        mock.onGet(/logentries/).reply((config) => {
            lastUrl = config.url || '';
            return [200, { message: 'Success', data: {} }];
        });
    });
    afterEach(() => { mock.restore(); });

    it('serializes the paging request into the query string', async () => {
        const svc = new RestfulWebhookService(TEST_CONFIG);
        await svc.listWebhookLogs('hook1', { limit: 5, cursor: 'abc' } as any);
        expect(lastUrl).to.contain('limit=5');
        expect(lastUrl).to.contain('cursor=abc');
    });
});
