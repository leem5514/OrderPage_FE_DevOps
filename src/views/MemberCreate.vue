<template>

    <v-container class="py-10" style="max-width:560px;">
        <v-row justify="center">
            <v-col cols="12">
                <div class="text-center mb-6">
                    <div class="section-eyebrow">JOIN US</div>
                    <h1 class="text-h5 font-weight-bold mt-2">회원가입</h1>
                    <p class="text-body-2 text-medium-emphasis mt-1">몇 가지 정보만 입력하면 가입이 완료돼요</p>
                </div>
                <v-card class="pa-6" variant="flat" border>
                    <v-form @submit.prevent="memberCreate">
                        <div class="section-eyebrow mb-3">계정 정보</div>
                        <v-text-field label="이름" v-model="name" prepend-inner-icon="mdi-account-outline" required>
                        </v-text-field>
                        <v-text-field label="이메일" v-model="email" type="email" prepend-inner-icon="mdi-email-outline" required>
                        </v-text-field>
                        <v-text-field label="비밀번호" v-model="password" type="password" required
                            prepend-inner-icon="mdi-lock-outline">
                        </v-text-field>

                        <div class="section-eyebrow mb-3 mt-2">배송지 정보</div>
                        <v-text-field label="도시" v-model="city" prepend-inner-icon="mdi-city-variant-outline"></v-text-field>
                        <v-text-field label="상세주소" v-model="street" prepend-inner-icon="mdi-home-outline"></v-text-field>
                        <v-text-field label="우편번호" v-model="zipcode" prepend-inner-icon="mdi-mailbox-outline"></v-text-field>

                        <!-- block은 부모 컨테이너 너비만큼을 꽉 채우는 것 -->
                        <v-btn type="submit" color="primary" block size="large" class="mt-2">회원가입</v-btn>

                    </v-form>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import axios from 'axios'

export default {
    data() {
        return {
            name: "",
            email: "",
            password: "",
            city: "",
            street: "",
            zipcode: "",
        }
    },
    methods: {
        async memberCreate() {
            try {
                const registerData = {
                    name: this.name,
                    email: this.email,
                    password: this.password,
                    address: {
                        city: this.city,
                        street: this.street,
                        zipcode: this.zipcode
                    }
                }

                // async, await가 없다면 우선 post를 던져두고 바로 push로 넘어가버
                await axios.post(`${process.env.VUE_APP_API_BASIC_URL}/member/create`, registerData);
                // await axios.post("http://localhost:8080/member/create", registerData)


                this.$router.push("/");
            } catch (e) {
                const error_message = e.response.data.error_message
                console.error(error_message);
                alert(error_message);
            }

        }
    }
}
</script>