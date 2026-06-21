import * as chai from 'chai';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { RestfulNotificationService } from '../../../src/impl/REST/notifications/RestfulNotificationService';
import { DEFAULT_CONFIG } from '../../../src/impl/constants/api';

const { expect } = chai;
const TEST_CONFIG = Object.assign({}, DEFAULT_CONFIG, { appId: 'app1', apiToken: 'tok', endpoint: 'http://test' });

// Regression: these endpoints had a leading "/" in the buildAPI ext, producing a
// double-slash (".../app1//user/...") that the gateway rejects. The path after the appId
// must never start with a slash.
describe('RestfulNotificationService URL building', () => {
    let mock: MockAdapter;
    let lastUrl: string;
    beforeEach(() => {
        mock = new MockAdapter(axios);
        lastUrl = '';
        mock.onAny().reply((config) => {
            lastUrl = config.url || '';
            return [200, { message: 'Success', data: {} }];
        });
    });
    afterEach(() => { mock.restore(); });

    function pathAfterHost(url: string): string {
        // strip "http://test" so we can assert on the path portion
        return url.replace(/^https?:\/\/[^/]+/, '');
    }

    it('setNotificationReadStatus builds no double slash', async () => {
        const svc = new RestfulNotificationService(TEST_CONFIG);
        await svc.setNotificationReadStatus('n1', 'u1', true);
        expect(pathAfterHost(lastUrl)).to.not.contain('//');
        expect(lastUrl).to.contain('/user/users/u1/notification/notifications/n1/update');
    });

    it('deleteNotification builds no double slash', async () => {
        const svc = new RestfulNotificationService(TEST_CONFIG);
        await svc.deleteNotification('n1', 'u1');
        expect(pathAfterHost(lastUrl)).to.not.contain('//');
    });

    it('markAllNotificationsAsRead builds no double slash', async () => {
        const svc = new RestfulNotificationService(TEST_CONFIG);
        await svc.markAllNotificationsAsRead('u1', true);
        expect(pathAfterHost(lastUrl)).to.not.contain('//');
    });

    it('listUserNotifications builds a clean query (no "?&")', async () => {
        const svc = new RestfulNotificationService(TEST_CONFIG);
        await svc.listUserNotifications({ userid: 'u1' });
        expect(lastUrl).to.not.contain('?&');
        expect(lastUrl).to.contain('filterNotificationTypes=');
    });
});
