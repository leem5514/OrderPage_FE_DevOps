// main.js는 vue 어플리케이션의 시작점

import { createApp } from 'vue'
import App from './App.vue'
// src/router/index.js 파일의 router를 사용하겠다고 선언
import router from '@/router/index.js'
import vuetify from './plugins/vuetify';
import '@mdi/font/css/materialdesignicons.css'
import './assets/styles/global.css'
import axios from 'axios'
import store from './store/index.js'


// createApp(App).mount('#app')
const app = createApp(App);


//axios 요청 인터셉터를 설정하여 모든 요청에 덱세스 토큰을 포함
// 회원가입, 로그인은 토큰이없어야만하는데, 이 상황에서는 토큰이 없는 상황이기떄문에 신경써주지않아도 됨
axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        // 해당 인터셉터 무시되고, 사용자의 본래 요청인 화면으로 라우팅
        return Promise.reject(error);
    }
)

// 401응답을 받을 경우에 인터셉터를 통해 전역적으로 rt를 통한 at 재발급 
// 만약 rt도 401응답을 받을 경우에는 로그아웃 (localStorage에서 토큰제거) 시킨 후 로그인 화면으로 리다이렉트
axios.interceptors.response.use(
    response => response,
    async error => {
        if (error.response && error.response.status === 401) {
            // RT를 가지고 AT를 받아옴
            const refreshToken = localStorage.getItem('refreshToken');
            try {
                localStorage.removeItem('token');
                const response = await axios.post(`${process.env.VUE_APP_API_BASIC_URL}/refresh-token`, { refreshToken });    // rt를 body에 넣어서 받아온 response
                localStorage.setItem('token', response.data.result.token);  // reponse에서 토큰값 추출
                window.location.reload();
            } catch (e) {
                console.log(e);
                // RT가 만료된 경우
                localStorage.clear();
                window.location.href = "/login"; // 로그인화면으로 redirect

            }

        }
        return Promise.reject(error)
    }
)

app.use(store);
app.use(router);
app.use(vuetify);
app.mount('#app');

