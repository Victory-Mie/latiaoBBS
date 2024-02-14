import { createStore } from "vuex";

export default createStore({
    state: {
        //用户登陆状态
        loginUserInfo: null,
        //是否展示登陆界面
        showLogin: false,
        //板块信息
        boardList: [],
        //当前一级板块
        activePBoardId: 0,
        //当前二级板块
        activeBoardId: 0,
        //消息数量
        messageCountInfo: {},
        //系统设置
        sysSetting: {},
    },
    getters: {
        getLoginUserInfo: (state) => {
            return state.loginUserInfo;
        },
        getBoardList: (state) => {
            return state.boardList;
        },
        getSubBoardList: (state) => (boardId) => {
            let board = state.boardList.find(item => {
                return item.boardId == boardId;
            })
            return board ? board.children : []
        },
        getActivePBoardId: (state) => {
            return state.activePBoardId;
        },
        getActiveBoardId: (state) => {
            return state.activeBoardId;
        },
        getMessageCountInfo: (state) => {
            return state.messageCountInfo;
        },
    },
    actions: {

    },
    mutations: {
        updateLoginUserInfo(state, value) {
            state.loginUserInfo = value;
        },
        showLogin(state, value) {
            state.showLogin = value;
        },
        saveBoardList(state, value) {
            state.boardList = value;
        },
        setActivePBoardId(state, value) {
            state.activePBoardId = value;
        },
        setActiveBoardId(state, value) {
            state.activeBoardId = value;
        },
        //设置消息数
        updateMessageCountInfo: (state, value) => {
            state.messageCountInfo = value;
        },
        readMessage: (state, value) => {
            state.messageCountInfo.total = state.messageCountInfo.total - state.messageCountInfo[value]
            state.messageCountInfo[value] = 0;
        },
        saveSysSetting: (state, value) => {
            state.sysSetting = value;
        },
    },
    actions: {},
    modules: {

    },
})