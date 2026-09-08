<template>

    <v-container class="fill-height" style="max-width:480px;">
        <v-row justify="center" class="w-100">
            <v-col cols="12">
                <div class="text-center mb-6">
                    <div class="section-eyebrow">WELCOME BACK</div>
                    <h1 class="text-h5 font-weight-bold mt-2">로그인</h1>
                    <p class="text-body-2 text-medium-emphasis mt-1">이메일과 비밀번호를 입력해주세요</p>
                </div>
                <v-card class="pa-6" variant="flat" border>
                    <v-form @submit.prevent="doLogin">

                        <v-text-field label="이메일" v-model="email" type="email" prepend-inner-icon="mdi-email-outline" required>
                        </v-text-field>
                        <v-text-field label="비밀번호" v-model="password" type="password" required
                            prepend-inner-icon="mdi-lock-outline">
                        </v-text-field>

                        <v-btn type="submit" color="primary" block size="large" class="mt-2">로그인</v-btn>

                        <div class="text-center mt-4">
                            <a class="text-link" @click="showPassWordModal">비밀번호를 잊으셨나요?</a>
                        </div>
                    </v-form>
                </v-card>

                <div class="text-center mt-6 text-body-2 text-medium-emphasis">
                    아직 계정이 없으신가요?
                    <router-link to="/member/create" class="text-link">회원가입</router-link>
                </div>
            </v-col>
        </v-row>

        <!-- resetPassword가 true가 될 째 해당 모달창이 보여짐 -->
        <!-- @update:dialog는 모달 컴포넌트가 update:dialog라는 이벤트를 발생시킬 때 실행할 이벤트 핸들러를 정의함 -->
        <!-- $event는 자식요소로부터 전달된 값: true/false가 모달로부터 전달 -->
        <ResetPasswordModal v-model="resetPassword" @update:dialog="resetPassword = $event"></ResetPasswordModal>
    </v-container>
</template>

<script>
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import ResetPasswordModal from './ResetPasswordModal.vue'

export default {
    components: {
        ResetPasswordModal
    },
    data() {
        return {
            email: "",
            password: "",
            resetPassword: false
        }
    },
    methods: {
        async doLogin() {
            // try catch로 묶어서 Login성공시 token을 console.log로 출력
            try {
                const loginData = {
                    email: this.email,
                    password: this.password
                }

                const response = await axios.post(`${process.env.VUE_APP_API_BASIC_URL}/doLogin`, loginData);
                const token = response.data.result.token;
                const refreshToken = response.data.result.refreshToken;
                const role = jwtDecode(token).role;
                localStorage.setItem('token', token)
                localStorage.setItem('refreshToken', refreshToken)
                localStorage.setItem('role', role)
                
                // this.$router.push("/")
                // sse 을 위한 연결코드
                

                window.location.href = "/"

            } catch (e) {
                const error_message = e.response.data.error_message
                console.error(error_message);
                alert(error_message);
            }
        },
        showPassWordModal() {
            this.resetPassword = true;
        }

    }
}
</script>

<style scoped>
.text-link {
    color: #141414;
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
}
</style>