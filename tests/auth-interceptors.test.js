const { test } = require('node:test');
const assert = require('node:assert/strict');
const axios = require('axios');
const installAuthInterceptors = require('../src/auth-interceptors');

function setup({ refreshWorks = false, hasRefresh = true, status = 401 } = {}) {
    const requests = [];
    const values = new Map([['token', 'old-access']]);
    if (hasRefresh) values.set('refreshToken', 'old-refresh');
    const state = { expired: 0, reloaded: 0 };
    const client = axios.create({ adapter: async config => {
        requests.push(config);
        if (config.url.endsWith('/refresh-token') && refreshWorks) {
            return { data: { result: { token: 'new-access' } }, status: 200, config, headers: {} };
        }
        throw new axios.AxiosError('HTTP failure', 'ERR_BAD_RESPONSE', config, null, { status, data: {} });
    }});
    installAuthInterceptors(client, {
        storage: { getItem: key => values.get(key), removeItem: key => values.delete(key),
            setItem: (key, value) => values.set(key, value), clear: () => values.clear() },
        apiURL: 'https://api.example.test',
        onRefreshed: () => state.reloaded++, onExpired: () => state.expired++
    });
    return { client, requests, values, state };
}

test('expired refresh token makes one refresh request and logs out', async () => {
    const s = setup();
    await assert.rejects(s.client.get('/member/myInfo'));
    assert.equal(s.requests.length, 2);
    assert.equal(s.requests[1].headers.Authorization, undefined);
    assert.equal(s.state.expired, 1);
    assert.equal(s.values.size, 0);
});

test('missing refresh token does not call refresh API', async () => {
    const s = setup({ hasRefresh: false });
    await assert.rejects(s.client.get('/member/myInfo'));
    assert.equal(s.requests.length, 1);
    assert.equal(s.state.expired, 1);
});

test('successful refresh saves token without replaying an order POST', async () => {
    const s = setup({ refreshWorks: true });
    await assert.rejects(s.client.post('/order/create', [{ productId: 1, count: 1 }]));
    assert.equal(s.requests.filter(r => r.url === '/order/create').length, 1);
    assert.equal(s.values.get('token'), 'new-access');
    assert.equal(s.state.reloaded, 1);
});

test('concurrent unauthorized requests share one refresh', async () => {
    const s = setup({ refreshWorks: true });
    await Promise.allSettled([s.client.get('/a'), s.client.get('/b')]);
    assert.equal(s.requests.filter(r => r.url.endsWith('/refresh-token')).length, 1);
    assert.equal(s.state.reloaded, 1);
});

test('login and server errors do not trigger refresh', async () => {
    for (const scenario of [{ url: '/doLogin', status: 401 }, { url: '/order/list', status: 500 }]) {
        const s = setup({ status: scenario.status });
        await assert.rejects(s.client.get(scenario.url));
        assert.equal(s.requests.length, 1);
        assert.equal(s.state.expired, 0);
    }
});
