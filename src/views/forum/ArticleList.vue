<template>
    <div 
    class="container-body article-list-body"
    :style="{ maxWidth: (proxy.globalInfo.bodyWidth - 100) + 'px' }"
    >
        <div class="sub-board" v-if="pBoardId">
            <span :class="['board-item',boardId==0? 'active':' ']" >
                <router-link :to=" `/forum/${pBoardId}`">全部</router-link>
            </span>
            <span v-for="item in subBoardList" :class="['board-item',item.boardId==boardId? 'active':' ']">
                <router-link :to="`/forum/${item.pBoardId}/${item.boardId}`">{{ item.boardName }}</router-link>
            </span>
        </div>
        <div class="article-panel">
            <div class="top-tab">
                <div :class="['tab', orderType == 0 ? 'active' : '']" @click="changeOrderType(0)" style="padding: 5px;">热榜
                </div>
                <el-divider direction="vertical"></el-divider>
                <div :class="['tab', orderType == 1 ? 'active' : '']" @click="changeOrderType(1)" style="padding: 5px;">发布时间
                </div>
                <el-divider direction="vertical"></el-divider>
                <div :class="['tab', orderType == 2 ? 'active' : '']" @click="changeOrderType(2)" style="padding: 5px;">最新
                </div>
            </div>
            <div class="article-list">
                <DataList :loading="loading" :dataSource="articleListInfo" @loadData="loadArticle">
                    <template #default="{ data }">
                        <ArticleListItem :data="data"></ArticleListItem>
                    </template>
                </DataList>
            </div>
        </div>
    </div>
</template>

<script setup>
import ArticleListItem from "./ArticleListItem.vue";
import { ref, reactive, getCurrentInstance, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import {useStore} from "vuex"
const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();
const store=useStore();

const api = {
    loadArticle: "/forum/loadArticle",
}

const changeOrderType = (type) => {
    orderType.value = type;
    loadArticle();
}
//文章列表
//定义板块信息：一级板块
const pBoardId = ref(0);
//二级板块
const boardId = ref(0);

const orderType = ref(0)
const loading = ref(false);
const articleListInfo = ref({});
const loadArticle = async () => {
    loading.value = true;
    let params = {
        pageNo: articleListInfo.value.pageNo || undefined,
        pBoardId: pBoardId.value || undefined,
        boardId: boardId.value,
        orderType: orderType.value,
    };

    console.log(params);

    let result = await proxy.Request({
        url: api.loadArticle,
        params: params,
        showLoading: false,
    });
    loading.value = false;
    if (!result) return;
    articleListInfo.value = result.data;
    //articleListInfo.value.list=[];
};
//loadArticle();

//二级板块
const subBoardList=ref([]);
const setSubBoard=()=>{
    subBoardList.value=store.getters.getSubBoardList(pBoardId.value);
};

//watch监听路由变化
watch(
    () => route.params,
    (newVal, oldVal) => {
        pBoardId.value = newVal.pBoardId;
        boardId.value = newVal.boardId || 0;
        setSubBoard();
        loadArticle();
        store.commit("setActivePBoardId",newVal.pBoardId);
        store.commit("setActiveBoardId",newVal.BoardId);
    },
    { immediate: true, deep: true }
);
//watch监听boardList板块数据变化
watch(
    ()=>store.state.boardList,
    (newVal,oldVal)=>{
        setSubBoard();
        
    },
    {immediate:true,deep:true}
)
</script>

<style lang="scss">
.article-list-body {
    
    .article-panel {
        margin-bottom: 10px;
        border-radius: 4px;
        background-color: white;
    }

    .top-tab {
        padding: 7px 14px;
        display: flex;
        align-items: center;
        font-size: 15px;
        
    }

 
    .sub-board{
        border-radius: 4px;
        display: inline-block;
        width: auto;
        background: #fff;
        margin-bottom: 5px;
        padding: 5px;
            .board-item{
                align-items: center;
                margin:auto 10px;
                cursor: pointer;
                font-size: 14px;
                a{
                    color: #909090;
                    text-decoration: none;
                }
            }   
            .active {
                a{
                    color: #ff9d00;
                }
            }
    }


    .tab {
        cursor: pointer;
    }
    
    .active {
        color: #ff9d00;
    }

}

</style>