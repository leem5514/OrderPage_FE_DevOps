<template>
    <OrderListComponent 
    :isAdmin="true"
    />
</template>
<script>
import OrderListComponent from '../components/OrderListComponent.vue';
export default {
    
    components:{
        OrderListComponent
    }
}
</script>