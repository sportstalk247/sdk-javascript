import * as chai from 'chai';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { RestfulChatRoomService } from '../../../src/impl/REST/chat/RestfulChatRoomService';
import { DEFAULT_CONFIG } from '../../../src/impl/constants/api';

const { expect } = chai;
const TEST_CONFIG = Object.assign({}, DEFAULT_CONFIG, { appId: 'app1', apiToken: 'tok', endpoint: 'http://test' });

function bodyOf(config: any): any {
    return typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
}

describe('RestfulChatRoomService.joinRoom', () => {
    let mock: MockAdapter;
    beforeEach(() => { mock = new MockAdapter(axios); });
    afterEach(() => { mock.restore(); });

    // Regression: join sent `userId` (camelCase), which the API ignores -> anonymous join.
    it('sends lowercase userid (not userId) in the join body', async () => {
        let body: any;
        mock.onPost(/\/join$/).reply((config) => {
            body = bodyOf(config);
            return [200, { message: 'Success', data: { room: { id: 'room1' } } }];
        });
        const svc = new RestfulChatRoomService(TEST_CONFIG);
        await svc.joinRoom('room1', { userid: 'mod', handle: 'mod' } as any);
        expect(body.userid).to.equal('mod');
        expect(body.userId).to.be.undefined;
    });
});

// Regression: these returned response.message (the literal "Success" string) instead of
// the room object in response.data.
describe('RestfulChatRoomService open/close/update return the room', () => {
    let mock: MockAdapter;
    beforeEach(() => { mock = new MockAdapter(axios); });
    afterEach(() => { mock.restore(); });

    it('closeRoom resolves to the room object, not "Success"', async () => {
        mock.onPost(/\/chat\/rooms\/room1$/).reply(200, { message: 'Success', data: { id: 'room1', open: false } });
        const svc = new RestfulChatRoomService(TEST_CONFIG);
        const room: any = await svc.closeRoom('room1');
        expect(room).to.be.an('object');
        expect(room.id).to.equal('room1');
    });

    it('openRoom resolves to the room object', async () => {
        mock.onPost(/\/chat\/rooms\/room2$/).reply(200, { message: 'Success', data: { id: 'room2', open: true } });
        const svc = new RestfulChatRoomService(TEST_CONFIG);
        const room: any = await svc.openRoom('room2');
        expect(room.id).to.equal('room2');
    });
});
