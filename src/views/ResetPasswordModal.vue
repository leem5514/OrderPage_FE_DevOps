<template>
    <v-dialog max-width="500px">
        <v-card>
            <v-card-title class="text-h5 text-center">
                비밀번호 변경하기
            </v-card-title>
            <v-card-text>
                <v-form @submit.prevent="resetPassword">
                    <v-text-field label="email" type="email" v-model="email" prepend-icon="mdi-email" required></v-text-field>
                    <v-text-field label="old password" type="password" v-model="asIsPassword" prepend-icon="mdi-lock" required></v-text-field>
                    <v-text-field label="new password" type="password" v-model="toBePassword" prepend-icon="mdi-lock" required></v-text-field>
                    <v-btn type="submit" color="primary" block class="mb-2"> 비밀번호 변경하기 </v-btn>
                    <v-btn @click="closeModal" variant="outlined" color="secondary" block > 닫기 </v-btn>
                </v-form>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
import axios from 'axios'


export default {
    data() {
        return {
            email: "",
            asIsPassword: "",
            toBePassword: ""
        }
    },
    methods: {
        async resetPassword() {
            // member / reset - password
            // 비밀번호 변경하면 alert를 띄우고 수동으로 모달창을 닫아주는 식으로 -> 이 부분은 자동으로 모달 닫아주는 방식으로 적용해보기
            try {
                const resetData = {
                    email: this.email,
                    asIsPassword: this.asIsPassword,
                    toBePassword: this.toBePassword
                }
                // {body} => body: {email:xxx, password:aaa}
                // body => {email:xxx, password:aaa}
                const response = await axios.patch(`${process.env.VUE_APP_API_BASIC_URL}/member/reset-password`, resetData);
                console.log(response.data)  // error가 발생하면 response에는 아무것도 담기지않고 .data롤 통해 참조할 때 오류발생
                alert("정상처리 되었습니다.")
            } catch (e) {
                console.log(e)
                alert(e.response?.data?.error_message || "입력값을 확인해주세요")
            }
        },
        closeModal() {
            //this.emit은 vue에서 컴포넌트간의 이벤트를 전달하는 메커니즘
            // 자식컴포넌트에서 this.$emit을 호출하면 update:dialog라는 이벤트가 실행되고 false 부모 컴포넌트로 전달 
            this.$emit('update:dialog');
        }
    }
}
</script>