import { createRouter, createWebHistory } from 'vue-router';
// @는 src(루트폴더 경로)를 의미
// 파일 내부에 export default가 있는 경우에는 {}가 필요없고, 그렇지 않으면 {}필요
// import하는 요소가 여러개 있을 때에도 {}를 붙인다
// import HomeComponent from '@/components/HomeComponent.vue';
// import TestComponent from '@/components/TestComponent.vue';


import { memberRouter } from './memberRouter'
import { productRouter } from './productRouter'
import { orderRouter } from './orderRouter';
const routes = [
    // {
    //     //     // path로도 라우팅이 가능하고, name으로도 라우팅이 가능
    //     //     // name으로 라우팅하는 경우 js코드 내에서 라우팅하는 경우
    //     path: '/',
    //     name: 'HOME',
    //     component: HomeComponent
    // },
    ...memberRouter,
    ...productRouter,
    ...orderRouter
]


const router = createRouter({
    // vue router는 내부적으로 두가지 방식의 히스토리 관리를 제공
    // 1) createWebHistory, /home 2) createHashHistory /#/home
    // 대부분 WebHistory 사용
    history: createWebHistory(),
    routes
})

export default router;