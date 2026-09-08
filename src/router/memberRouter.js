import MemberCreate from '../views/MemberCreate.vue'
import LoginPage from '../views/LoginPage.vue'
import LogoutPage from '../views/LogoutPage.vue'
import MyPage from '../views/MyPage.vue'
import OrderCart from '../views/OrderCart.vue'
import MemberList from '../views/MemberList.vue'



export const memberRouter = [
    {
        path: '/member/create',
        name: 'MemberCreate',
        component: MemberCreate
    },
    {
        path: '/login',
        name: 'LoginPage',
        component: LoginPage
    },
    {
        path: '/logout',
        name: 'LogoutPage',
        component: LogoutPage
    },
    {
        path: '/ordercart',
        name: 'OrderCart',
        component: OrderCart
    },
    {
        path: '/member/list',
        name: 'MemberList',
        component: MemberList
    },
    {
        path: '/mypage',
        name: 'MyPage',
        component: MyPage
    },

    

]