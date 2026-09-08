<template>
    <v-container>
        <v-row justify="center">
            <v-col cols="12" md="8">
                <v-card-title class="text-center text-h5">
                    주문목록
                </v-card-title>
                <v-card-text>
                    <v-data-table
                    :headers="tableHeaders"
                    :items="orderList"
                    class="elevation-1"
                    show-expand
                    >
                    <template v-slot:[`item.actions`]="{item}">
                        <v-btn color="error" variant="outlined" v-if="isAdmin && item.orderStatus === 'ORDERED'" @click.stop="cancelOrder(item.id)" size="small">
                            CANCEL
                        </v-btn>
                    </template>
                    <template v-slot:expanded-row="{item}">
                        <v-row>
                            <v-col>
                                <v-list-item  v-for="orderItem in item.orderDetailDtos" :key="orderItem.id">
                                    <v-list-item-center>
                                        <v-list-item-title>
                                            {{ orderItem.productName }} {{ orderItem.count }}
                                        </v-list-item-title>
                                    </v-list-item-center>
                                </v-list-item>
                            </v-col>
                        </v-row>
                    </template>
                    </v-data-table>
                </v-card-text>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import axios from 'axios'
export default {
    props: ['isAdmin'],
    data() {
        return {
            orderList: [],
            tableHeaders: [
                { title: 'ID', key: 'id', align: 'center' },
                { title: '회원EMAIL', key: 'memberEmail', align: 'center' },
                { title: '주문상태', key: 'orderStatus', align: 'center' },
                { title: 'ACTION', key: 'actions', align:'start'},
            ]
        }
    },
    async created() {
        if(this.isAdmin) {
            const response = await axios.get(`${process.env.VUE_APP_API_BASIC_URL}/order/list`); 
            this.orderList = response.data.result;
        } else {
            const response = await axios.get(`${process.env.VUE_APP_API_BASIC_URL}/order/myorders`); 
            this.orderList = response.data.result;
        }
        
                
                
    },
    methods:{
        async cancelOrder(id) {
            try {
                await axios.patch(`${process.env.VUE_APP_API_BASIC_URL}/order/${id}/cancel`);
                window.location.reload();
            } catch(e) {
                console.log(e)
            } 
        }
    }
}
</script>