import * as chai from 'chai';

const { expect } = chai;

// The transport (fetch vs axios) is chosen at import time by getRequestLibrary() based on
// window.fetch. To exercise the browser/fetch path (makeRequest), we set a window with a
// stubbed fetch in a before() hook, re-require the network module so it binds to fetch, and
// restore everything in after() so the other (axios-based) specs are unaffected.
const NET_PATH = require.resolve('../../../src/impl/network');

let fetchStub: (...args: any[]) => Promise<any>;

function fakeResponse(opts: { ok: boolean; status: number; statusText?: string; body?: string }) {
    return {
        ok: opts.ok,
        status: opts.status,
        statusText: opts.statusText || '',
        text: () => Promise.resolve(opts.body == null ? '' : opts.body),
    };
}

describe('network fetch transport (browser path)', () => {
    let net: any;
    const prevWindow = (global as any).window;

    before(() => {
        (global as any).window = {
            fetch: (...args: any[]) => fetchStub(...args),
            AbortController: (global as any).AbortController,
        };
        delete require.cache[NET_PATH];
        net = require('../../../src/impl/network');
    });

    after(() => {
        if (prevWindow === undefined) { delete (global as any).window; }
        else { (global as any).window = prevWindow; }
        delete require.cache[NET_PATH];
    });

    // Regression: makeRequest threw new Error(response.statusText) and discarded the body,
    // so callers only ever saw "Bad Request".
    it('surfaces the upstream error body on non-2xx', async () => {
        fetchStub = () => Promise.resolve(fakeResponse({ ok: false, status: 400, statusText: 'Bad Request', body: JSON.stringify({ message: 'User not in room' }) }));
        let threw = false;
        try {
            await net.stRequest({ url: 'http://x', headers: {} });
        } catch (e: any) {
            threw = true;
            expect(e.message).to.contain('User not in room');
            expect(e.response.status).to.equal(400);
            expect(e.response.statusText).to.equal('Bad Request');
            expect(e.response.data.message).to.equal('User not in room');
        }
        expect(threw, 'expected stRequest to reject on a 400').to.be.true;
    });

    // Regression: response.json() threw on an empty/204 body (touch, delete).
    it('tolerates an empty 2xx body (resolves null)', async () => {
        fetchStub = () => Promise.resolve(fakeResponse({ ok: true, status: 204, body: '' }));
        const result = await net.stRequest({ url: 'http://x', headers: {} });
        expect(result).to.equal(null);
    });

    it('parses a JSON 2xx body', async () => {
        fetchStub = () => Promise.resolve(fakeResponse({ ok: true, status: 200, body: JSON.stringify({ data: { ok: 1 } }) }));
        const result = await net.stRequest({ url: 'http://x', headers: {} });
        expect(result.data.ok).to.equal(1);
    });

    // Regression: Content-Type was force-set to application/json, clobbering url-encoded headers.
    it('does not clobber a caller-set Content-Type', async () => {
        let seen: any;
        fetchStub = (_url: string, cfg: any) => { seen = cfg; return Promise.resolve(fakeResponse({ ok: true, status: 200, body: '{}' })); };
        await net.stRequest({ url: 'http://x', headers: { 'content-type': 'application/x-www-form-urlencoded' }, data: { a: 1 } });
        expect(seen.headers['content-type']).to.equal('application/x-www-form-urlencoded');
        expect(seen.headers['Content-Type']).to.be.undefined;
    });

    // Regression: the fetch path ignored errorHandlerfunction entirely (browser/Node divergence).
    it('routes errors through errorHandlerfunction when supplied', async () => {
        fetchStub = () => Promise.reject(new Error('Failed to fetch'));
        let calls = 0;
        const result = await net.stRequest({ url: 'http://x', headers: {} }, (_e: any) => { calls++; return 'recovered'; });
        expect(calls).to.equal(1);
        expect(result).to.equal('recovered');
    });

    // Regression: bindJWTUpdates compared exp (seconds) against Date.now() (ms).
    describe('bindJWTUpdates', () => {
        it('refreshes a near-expiry token and skips a far-future one', async () => {
            fetchStub = () => Promise.resolve(fakeResponse({ ok: true, status: 200, body: '{}' }));
            const nowSec = Math.floor(Date.now() / 1000);

            let refreshes = 0;
            const near: any = { getTokenExp: () => nowSec + 5, refreshUserToken: () => { refreshes++; return Promise.resolve('newtok'); } };
            const cfg: any = { url: 'http://x', headers: {} };
            await net.bindJWTUpdates(near)(cfg);
            expect(refreshes).to.equal(1);
            expect(cfg.headers['Authorization']).to.equal('Bearer newtok');

            let refreshes2 = 0;
            const far: any = { getTokenExp: () => nowSec + 100000, refreshUserToken: () => { refreshes2++; return Promise.resolve('x'); } };
            await net.bindJWTUpdates(far)({ url: 'http://x', headers: {} });
            expect(refreshes2).to.equal(0);
        });

        it('de-dups concurrent refreshes into a single call', async () => {
            fetchStub = () => Promise.resolve(fakeResponse({ ok: true, status: 200, body: '{}' }));
            const nowSec = Math.floor(Date.now() / 1000);
            let refreshes = 0;
            let resolveRefresh: any;
            const target: any = { getTokenExp: () => nowSec - 10, refreshUserToken: () => { refreshes++; return new Promise((r) => { resolveRefresh = r; }); } };
            const bound = net.bindJWTUpdates(target);
            const p1 = bound({ url: 'http://x', headers: {} });
            const p2 = bound({ url: 'http://x', headers: {} });
            resolveRefresh('tok');
            await Promise.all([p1, p2]);
            expect(refreshes).to.equal(1);
        });
    });

    describe('retry (idempotent GET only)', () => {
        it('retries a transient 503 GET, then succeeds', async () => {
            let calls = 0;
            fetchStub = () => {
                calls++;
                if (calls < 2) { return Promise.resolve(fakeResponse({ ok: false, status: 503, statusText: 'Service Unavailable', body: '{"message":"try later"}' })); }
                return Promise.resolve(fakeResponse({ ok: true, status: 200, body: JSON.stringify({ data: { ok: 1 } }) }));
            };
            const result = await net.stRequest({ url: 'http://x', method: 'GET', headers: {} });
            expect(calls).to.equal(2);
            expect(result.data.ok).to.equal(1);
        });

        it('does NOT retry a 4xx GET', async () => {
            let calls = 0;
            fetchStub = () => { calls++; return Promise.resolve(fakeResponse({ ok: false, status: 400, statusText: 'Bad Request', body: '{"message":"nope"}' })); };
            let threw = false;
            try { await net.stRequest({ url: 'http://x', method: 'GET', headers: {} }); } catch (e) { threw = true; }
            expect(threw).to.be.true;
            expect(calls).to.equal(1);
        });

        it('does NOT retry a non-GET (POST) even on a network error', async () => {
            let calls = 0;
            fetchStub = () => { calls++; return Promise.reject(new Error('network down')); };
            let threw = false;
            try { await net.stRequest({ url: 'http://x', method: 'POST', headers: {} }); } catch (e) { threw = true; }
            expect(threw).to.be.true;
            expect(calls).to.equal(1);
        });
    });
});
