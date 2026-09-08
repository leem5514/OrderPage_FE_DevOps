<template>
    <v-app-bar app color="background" class="app-header" height="72">
        <v-container class="d-flex align-center px-4 px-md-8" fluid>

            <!-- 좌측 : 로고 -->
            <router-link to="/" class="brand-link mr-2 mr-md-8">
                <span class="brand-text">JAVA SHOP</span>
            </router-link>

            <!-- 좌측 : 네비게이션 (데스크탑) -->
            <nav class="d-none d-md-flex align-center nav-links">
                <router-link to="/product/list" class="nav-link">상품목록</router-link>
                <template v-if="userRole == 'ADMIN'">
                    <router-link to="/member/list" class="nav-link">회원관리</router-link>
                    <router-link to="/product/manage" class="nav-link">상품관리</router-link>
                    <a href="/order/list" class="nav-link d-flex align-center">
                        실시간 주문
                        <v-chip v-if="liveQuantity" class="ml-1" size="x-small" color="error" variant="flat">{{ liveQuantity }}</v-chip>
                    </a>
                </template>
            </nav>

            <v-spacer></v-spacer>

            <!-- 우측 : 액션 (데스크탑) -->
            <div class="d-none d-md-flex align-center">
                <v-btn
                    v-if="isLogin"
                    icon
                    variant="text"
                    :to="{ path: '/order/cart' }"
                    class="mr-1"
                >
                    <v-badge :content="getCartItemCount" :model-value="!!getCartItemCount" color="error" offset-x="2" offset-y="2">
                        <v-icon icon="mdi-cart-outline"></v-icon>
                    </v-badge>
                </v-btn>

                <template v-if="isLogin">
                    <v-btn variant="text" size="small" :to="{ path: '/mypage' }">MY PAGE</v-btn>
                    <v-btn variant="outlined" color="secondary" size="small" class="ml-2" @click="doLogout">로그아웃</v-btn>
                </template>
                <template v-else>
                    <v-btn variant="text" size="small" :to="{ path: '/member/create' }">회원가입</v-btn>
                    <v-btn variant="flat" color="primary" size="small" class="ml-2" :to="{ path: '/login' }">로그인</v-btn>
                </template>
            </div>

            <!-- 모바일 메뉴 버튼 -->
            <v-btn icon variant="text" class="d-flex d-md-none" @click="mobileMenu = true">
                <v-icon icon="mdi-menu"></v-icon>
            </v-btn>
        </v-container>
    </v-app-bar>

    <v-navigation-drawer v-model="mobileMenu" location="right" temporary width="280">
        <div class="pa-4 d-flex align-center justify-space-between">
            <span class="brand-text">JAVA SHOP</span>
            <v-btn icon variant="text" size="small" @click="mobileMenu = false">
                <v-icon icon="mdi-close"></v-icon>
            </v-btn>
        </div>
        <v-divider></v-divider>
        <v-list nav density="comfortable">
            <v-list-item :to="{ path: '/product/list' }" title="상품목록" @click="mobileMenu = false"></v-list-item>
            <template v-if="userRole == 'ADMIN'">
                <v-list-item :to="{ path: '/member/list' }" title="회원관리" @click="mobileMenu = false"></v-list-item>
                <v-list-item :to="{ path: '/product/manage' }" title="상품관리" @click="mobileMenu = false"></v-list-item>
                <v-list-item href="/order/list" :title="`실시간 주문 (${liveQuantity})`"></v-list-item>
            </template>
            <template v-if="isLogin">
                <v-list-item :to="{ path: '/order/cart' }" :title="`장바구니 (${getCartItemCount})`" @click="mobileMenu = false"></v-list-item>
                <v-list-item :to="{ path: '/mypage' }" title="MY PAGE" @click="mobileMenu = false"></v-list-item>
            </template>
        </v-list>
        <v-divider></v-divider>
        <div class="pa-4 d-flex flex-column ga-2">
            <template v-if="isLogin">
                <v-btn variant="outlined" color="secondary" block @click="doLogout">로그아웃</v-btn>
            </template>
            <template v-else>
                <v-btn variant="flat" color="primary" block :to="{ path: '/login' }" @click="mobileMenu = false">로그인</v-btn>
                <v-btn variant="outlined" color="secondary" block :to="{ path: '/member/create' }" @click="mobileMenu = false">회원가입</v-btn>
            </template>
        </div>
    </v-navigation-drawer>

    <v-snackbar v-model="cancelSnackbar" color="error" timeout="5000">
        {{ cancelMessage }}
    </v-snackbar>
</template>

<script>
import { mapGetters } from 'vuex';
// 서버와 실시간 알림서비스를 위한 의존성 추가 필요
import { EventSourcePolyfill } from 'event-source-polyfill';

export default {
    data() {
        return {
            userRole: null,
            isLogin: false,
            liveQuantity: 0,
            mobileMenu: false,
            cancelSnackbar: false,
            cancelMessage: ''
        }
    },
    computed: {
        ...mapGetters(['getCartItemCount'])
    },
    created() {
        const token = localStorage.getItem("token")
        if (token) {
            this.isLogin = true;
            this.userRole = localStorage.getItem("role");
        }
        //SSemitter
        // 알림의 경우 새로고침을 하면 사라지는 이슈 발생 -> localstorage 에 넣으면 해결 가능
        // 로그인한 사용자라면 누구나 구독 : 관리자는 신규주문(ordered), 구매자 본인은 주문취소(order-cancelled) 알림을 받는다.
        if (this.isLogin) {
            let sse = new EventSourcePolyfill(`${process.env.VUE_APP_API_BASIC_URL}/subscribe`, {headers: {Authorization: `Bearer ${token}`}});
            sse.addEventListener('connect', (event) => { console.log(event) })
            if (this.userRole === 'ADMIN') {
                sse.addEventListener('ordered', (event) => {
                    console.log(event.data)
                    this.liveQuantity++;
                })
            }
            sse.addEventListener('order-cancelled', (event) => {
                const order = JSON.parse(event.data);
                this.cancelMessage = `주문(#${order.id})이 취소되었습니다.`;
                this.cancelSnackbar = true;
            })
            sse.onerror = (error) => {
                console.log(error);
                sse.close();
            }
        }
    },
    methods: {
        doLogout() {
            localStorage.clear();
            window.location.reload();
        }
    }
};
</script>

<style scoped>
.app-header {
    border-bottom: 1px solid rgba(20, 20, 20, 0.1);
}

.brand-link {
    text-decoration: none;
    flex-shrink: 0;
}

.brand-text {
    color: #141414;
    font-family: 'Inter', sans-serif;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.14em;
}

.nav-links {
    gap: 28px;
}

.nav-link {
    position: relative;
    color: #141414;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    padding: 4px 0;
}

.nav-link::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -2px;
    width: 0;
    height: 1px;
    background: #141414;
    transition: width 0.2s ease;
}

.nav-link:hover::after {
    width: 100%;
}
</style>
