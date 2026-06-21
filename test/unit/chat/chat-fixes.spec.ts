import * as chai from 'chai';
import * as sinon from 'sinon';
import { ChatClient } from '../../../src/impl/ChatClient';
import { RestfulChatEventService } from '../../../src/impl/REST/chat/RestfulChatEventService';
import { DEFAULT_CONFIG } from '../../../src/impl/constants/api';

const { expect } = chai;
const TEST_CONFIG = Object.assign({}, DEFAULT_CONFIG, { appId: 'app1', apiToken: 'tok', endpoint: 'http://test' });

// Regression: createOrUpdateUser set the client's _user but never told the event service,
// so keep-alive/touch ran as "anonymous" (POST .../sessions/anonymous/touch -> 404).
describe('ChatClient.createOrUpdateUser propagation', () => {
    it('propagates the created user to the event service', async () => {
        const client = ChatClient.init(TEST_CONFIG);
        const user = { userid: 'mod', handle: 'mod' };
        sinon.stub((client as any)._userService, 'createOrUpdateUser').resolves(user as any);
        const eventService: any = client.getEventService();
        const setUserSpy = sinon.spy(eventService, 'setUser');
        await client.createOrUpdateUser(user as any);
        expect(setUserSpy.calledOnce).to.be.true;
        expect(eventService._user.userid).to.equal('mod');
    });
});

// Regression: the guard was inverted (`if(id) return false`), so with a valid user the
// reports check was unreachable and the method could never return true.
describe('ChatClient.messageIsReported', () => {
    it('returns true when the current user has reported the event', () => {
        const client = ChatClient.init(TEST_CONFIG);
        client.setUser({ userid: 'u1', handle: 'u1' });
        const event: any = { id: 'e1', reports: [{ userid: 'u1', reason: 'abuse' }] };
        expect(client.messageIsReported(event)).to.be.true;
    });

    it('returns false when the current user has NOT reported it', () => {
        const client = ChatClient.init(TEST_CONFIG);
        client.setUser({ userid: 'u2', handle: 'u2' });
        const event: any = { id: 'e1', reports: [{ userid: 'u1', reason: 'abuse' }] };
        expect(client.messageIsReported(event)).to.be.false;
    });
});

// Regression: `userid || this._user ? this._user.userid : ''` ignored the passed userid
// because || binds tighter than ?:.
describe('ChatClient notification userid precedence', () => {
    it('forwards an explicitly passed userid', () => {
        const client = ChatClient.init(TEST_CONFIG);
        client.setUser({ userid: 'current', handle: 'c' });
        const stub = sinon.stub((client as any)._notificationServce, 'setNotificationReadStatus').resolves({} as any);
        client.setNotificationReadStatus('n1', true, 'explicit');
        expect(stub.firstCall.args[1]).to.equal('explicit');
    });

    it('falls back to the current user when no userid is passed', () => {
        const client = ChatClient.init(TEST_CONFIG);
        client.setUser({ userid: 'current', handle: 'c' });
        const stub = sinon.stub((client as any)._notificationServce, 'deleteNotification').resolves({} as any);
        client.deleteNotification('n1');
        expect(stub.firstCall.args[1]).to.equal('current');
    });
});

// Regression: env was read into a try/catch whose catch never fired, so config value was
// ignored and a non-numeric env produced NaN.
describe('RestfulChatEventService poll-frequency precedence', () => {
    const ORIGINAL = process.env.SPORTSTALK_POLL_FREQUENCY;
    afterEach(() => {
        if (ORIGINAL === undefined) { delete process.env.SPORTSTALK_POLL_FREQUENCY; }
        else { process.env.SPORTSTALK_POLL_FREQUENCY = ORIGINAL; }
    });

    it('uses config.chatEventPollFrequency when provided', () => {
        delete process.env.SPORTSTALK_POLL_FREQUENCY;
        const svc = new RestfulChatEventService(Object.assign({}, TEST_CONFIG, { chatEventPollFrequency: 1200 }));
        expect((svc as any)._pollFrequency).to.equal(1200);
    });

    it('defaults to 800 when neither config nor env are set', () => {
        delete process.env.SPORTSTALK_POLL_FREQUENCY;
        const svc = new RestfulChatEventService(TEST_CONFIG);
        expect((svc as any)._pollFrequency).to.equal(800);
    });

    it('falls back to 800 for a non-numeric env (no NaN)', () => {
        process.env.SPORTSTALK_POLL_FREQUENCY = 'garbage';
        const svc = new RestfulChatEventService(TEST_CONFIG);
        expect((svc as any)._pollFrequency).to.equal(800);
    });
});

// Regression/hardening: user-action methods now fail loudly instead of sending an empty userid.
describe('RestfulChatEventService.executeChatCommand user guard', () => {
    it('throws synchronously when no valid user is set', () => {
        const svc = new RestfulChatEventService(TEST_CONFIG);
        expect(() => svc.executeChatCommand({ userid: '' } as any, 'hello')).to.throw();
    });
});
