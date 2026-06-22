import * as chai from 'chai';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { RestfulChatRoomService } from '../../src/impl/REST/chat/RestfulChatRoomService';
import { RestfulChatModerationService } from '../../src/impl/REST/chat/RestfulChatModerationService';
import { RestfulUserService } from '../../src/impl/REST/users/RestfulUserService';
import { RestfulNotificationService } from '../../src/impl/REST/notifications/RestfulNotificationService';
import { RestfulCommentService } from '../../src/impl/REST/comments/RestfulCommentService';
import { RestfulPollService } from '../../src/impl/REST/poll/RestfulPollService';
import { DEFAULT_CONFIG } from '../../src/impl/constants/api';

const { expect } = chai;
const TEST_CONFIG = Object.assign({}, DEFAULT_CONFIG, { appId: 'app1', apiToken: 'tok', endpoint: 'http://test' });

function pathOf(url: string): string {
    return (url || '').replace(/^https?:\/\/[^/]+/, '');
}

// Assert the SDK builds the exact METHOD + PATH documented in the SportsTalk API reference
// (apiref.sportstalk247.com). Guards against regression of the conformance fixes.
describe('API conformance: method + path', () => {
    let mock: MockAdapter;
    let captured: { method: string; url: string };
    beforeEach(() => {
        mock = new MockAdapter(axios);
        captured = { method: '', url: '' };
        mock.onAny().reply((config) => {
            captured = { method: (config.method || '').toUpperCase(), url: config.url || '' };
            return [200, { message: 'Success', data: {} }];
        });
    });
    afterEach(() => { mock.restore(); });

    it('shadowbanUserInRoom -> POST chat/rooms/{id}/shadowban (not the moderation-queue path)', async () => {
        await new RestfulChatModerationService(TEST_CONFIG).shadowbanUserInRoom('u1', 'room1');
        expect(captured.method).to.equal('POST');
        expect(captured.url).to.contain('/chat/rooms/room1/shadowban');
        expect(captured.url).to.not.contain('moderation/queues/events/room1/shadowban');
    });

    it('reportUser -> POST chat/rooms/{id}/users/{uid}/report, no double slash', async () => {
        await new RestfulChatRoomService(TEST_CONFIG).reportUser('u1', 'mod1', undefined, 'room1');
        expect(captured.method).to.equal('POST');
        expect(captured.url).to.contain('/chat/rooms/room1/users/u1/report');
        expect(pathOf(captured.url)).to.not.contain('//');
    });

    it('listParticipants -> GET with limit= (not maxresults)', async () => {
        await new RestfulChatRoomService(TEST_CONFIG).listParticipants({ id: 'room1' } as any, '', 50);
        expect(captured.method).to.equal('GET');
        expect(captured.url).to.contain('limit=50');
        expect(captured.url).to.not.contain('maxresults');
    });

    it('setNotificationReadStatusByChatEventId -> PUT notificationsbyid/chateventid path', async () => {
        await new RestfulNotificationService(TEST_CONFIG).setNotificationReadStatusByChatEventId('ce1', 'u1', true);
        expect(captured.method).to.equal('PUT');
        expect(captured.url).to.contain('/notification/notificationsbyid/chateventid/ce1/update');
    });

    it('deleteNotificationByChatEventId -> DELETE notification/notificationsbyid (singular)', async () => {
        await new RestfulNotificationService(TEST_CONFIG).deleteNotificationByChatEventId('ce1', 'u1');
        expect(captured.method).to.equal('DELETE');
        expect(captured.url).to.contain('/notification/notificationsbyid/chateventid/ce1');
        expect(captured.url).to.not.contain('/notifications/notificationsbyid');
    });

    it('listUsersInModerationQueue -> GET (not POST)', async () => {
        await new RestfulUserService(TEST_CONFIG).listUsersInModerationQueue({} as any);
        expect(captured.method).to.equal('GET');
        expect(captured.url).to.contain('user/moderation/queues/reportedusers');
    });

    it('comment react -> POST .../comments/{id}/react (matches the working Kotlin SDK; docs show a trailing slash but the real API/SDK omit it)', async () => {
        await new RestfulCommentService(TEST_CONFIG as any).react('conv1', 'cmt1', { userid: 'u1' } as any, { reaction: 'like', reacted: true } as any);
        expect(captured.method).to.equal('POST');
        expect(captured.url).to.match(/\/comments\/cmt1\/react$/);
    });

    it('listResponsesByUser resolves a Poll OBJECT by its `id` -> GET poll/poll/{id}/responses/user/{uid}', async () => {
        // Regression: this method used to read only `pollid`, so a Poll object (which has
        // `id`, not `pollid`) threw "Must supply a poll id". It must now resolve from `id`.
        await new RestfulPollService(TEST_CONFIG as any).listResponsesByUser({ id: 'p1' } as any, 'u1');
        expect(captured.method).to.equal('GET');
        expect(captured.url).to.match(/\/poll\/poll\/p1\/responses\/user\/u1$/);
    });
});

// buildAPI now fails loudly on a missing appId instead of building ".../undefined/...".
describe('buildAPI config validation', () => {
    it('throws when appId is missing', () => {
        const svc = new RestfulChatRoomService({ apiToken: 'tok', endpoint: 'http://test' } as any);
        expect(() => svc.listParticipants({ id: 'room1' } as any)).to.throw(/appId/);
    });
});
