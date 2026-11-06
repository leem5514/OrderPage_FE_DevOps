// 갱신 요청에는 동일한 응답 인터셉터를 붙이지 않는다.
// 만료된 refresh token의 401을 다시 갱신하면 무한 요청이 발생한다.
module.exports = function installAuthInterceptors(client, { storage, apiURL, onRefreshed, onExpired }) {
    const refreshClient = client.create();
    let refreshInFlight = null;

    client.interceptors.request.use(config => {
        const token = storage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    });

    client.interceptors.response.use(response => response, async error => {
        const url = (error.config && error.config.url || '').split('?')[0];
        if (!error.response || error.response.status !== 401 || /\/(doLogin|refresh-token)$/.test(url)) {
            return Promise.reject(error);
        }
        if (!refreshInFlight) {
            refreshInFlight = (async () => {
                const refreshToken = storage.getItem('refreshToken');
                storage.removeItem('token');
                try {
                    if (!refreshToken) throw new Error('Missing refresh token');
                    const response = await refreshClient.post(`${apiURL}/refresh-token`, { refreshToken });
                    const token = response.data.result.token;
                    if (!token) throw new Error('Missing access token');
                    storage.setItem('token', token);
                    onRefreshed();
                } catch (refreshError) {
                    storage.clear();
                    onExpired();
                }
            })();
        }
        try {
            await refreshInFlight;
        } finally {
            refreshInFlight = null;
        }
        // 기존 새로고침 동작을 유지하며 주문 POST를 자동 재전송하지 않는다.
        return Promise.reject(error);
    });
};
