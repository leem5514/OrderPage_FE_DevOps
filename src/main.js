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
import installAuthInterceptors from './auth-interceptors';


// createApp(App).mount('#app')
const app = createApp(App);


installAuthInterceptors(axios, {
    storage: localStorage,
    apiURL: process.env.VUE_APP_API_BASIC_URL,
    onRefreshed: () => window.location.reload(),
    onExpired: () => { window.location.href = '/login'; }
});

app.use(store);
app.use(router);
app.use(vuetify);
app.mount('#app');

