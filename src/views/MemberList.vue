<template>

    <v-container>
        <v-row>
            <v-col>
                <v-card>
                    <v-card-title class="text-h5 text-center">회원목록</v-card-title>
                    <v-card-text>
                        <v-data-table :headers="tableHeaders" :items="memberList"></v-data-table>
                    </v-card-text>

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
            tableHeaders: [
                { title: 'ID', key: 'id', align: 'center' },
                { title: '이름', key: 'name', align: 'center' },
                { title: 'EMAIL', key: 'email', align: 'center' },
                { title: '주문수량', key: 'orderCount', align: 'center' }],
            memberList: []
        }
    },
    async created() {
        //     const token = localStorage.getItem("token");
        //     const headers = { Authorization: `Bearer ${token}` };
        try {
            const response = await axios.get(`${process.env.VUE_APP_API_BASIC_URL}/member/list`);
            this.memberList = response.data.result.content;
        } catch (e) {
            console.log(e);
        }


    },
    methods: {

    }
}
</script>

<style>
.text-center {
    text-align: center;
}
</style>