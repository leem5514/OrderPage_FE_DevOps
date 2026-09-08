function initState() {
    return {
        count: 0,
        message: ""
    }
}

const practice = {
    // state : 상태를 의미하는 객체로서 initState을 통해서 상태 초기화
    state: initState,
    // mutations는 상태를 변경하기 위한 함수들의 집합
    // mutation 은 컴포넌트에서 직접 호출하지 않고, actions 을 통해서 mutation 이 호출됩니다.
    // 그 이유는 여러 mutation 을 연속적으로 호출하는 등의 경우가 있을 수 있기 때문입니다.
    mutations: {
        increment(state){
            state.count++;
        },    
        updateMessage(state, newMessage){
            state.message = newMessage;
        }
    },
    actions: {
        // actions 의 함수를 통해서 mutation의 함수를 호출
        // 그러면 결국, 컴포넌트에서는 actions 의 함수를 호출합니다.
        incrementCount(context){
            context.commit('increment');
        },
        updateMessage(context, newMessage){
            context.commit('updateMessage', newMessage)
        }
    },
    // 상태(변수)를 get 하기 위한 함수들의 집합
    getters: {
        getCount: state => state.count,
        getUpdateMessage: state => state.message
    }
}

export default practice;
