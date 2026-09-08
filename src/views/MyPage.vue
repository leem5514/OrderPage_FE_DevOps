<template>
    <v-container>
        <v-row justify="center">
            <v-col cols="12" md="8">
                <v-card>
                    <v-card-title  class="text-center" text-h5>
                        회원정보
                    </v-card-title>
                    <v-card-text>
                        <v-table>
                            <tbody>
                                <tr v-for="member in memberInfoList" :key="member.key">
                                    <td>{{ member.key }}</td>
                                    <td>{{ member.value }}</td>
                                </tr>
                            </tbody>
                        </v-table>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
    <OrderListComponent :isAdmin="false"/>
</template>
<script>
import OrderListComponent from '../components/OrderListComponent.vue';
import axios from 'axios';
export default {
    components:{
        OrderListComponent
    },
    data() {
        return {
            memberInfo: {},
            memberInfoList: []
        }
    },
    async created() {
        try {
            const response = await axios.get(`${process.env.VUE_APP_API_BASIC_URL}/member/myInfo`);
            this.memberInfo = response.data.result;
            this.memberInfoList = [
                { key: "이름", value: this.memberInfo.name },
                { key: "이메일", value: this.memberInfo.email },
                { key: "도시", value: this.memberInfo.address?.city },
                { key: "상세주소", value: this.memberInfo.address?.street },
                { key: "우편번호", value: this.memberInfo.address?.zipcode }
            ];
        } catch (error) {
            console.error("Error fetching member info:", error);
        }
    }
}

</script>