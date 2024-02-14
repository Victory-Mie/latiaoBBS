<template>
    <div class="comment-body">
        <div class="comment-title">
            <div class="title">评论<span class="count"></span> </div>
            <div class="tab">
                <span>热榜</span>
                <el-divider direction="vertical" />
                <span>最新</span>
            </div>
        </div>
        <div class="comment-form-panel">
            <PostComment :articleId="articleId" :pCommentId="0" :avatarWidth="50" :userId="currentUserInfo.userId"
                :showInsertImg="currentUserInfo.userId != null" @postCommentFinish="postCommentFinish">
            </PostComment>
        </div>

        <div class="comment-list">
            <DataList :dataSource=" commentListInfo " :loading=" loading " @loadData=" loadComment ">
                <!--#default 表示默认插槽，{data} 表示将父组件传递过来的数据解构赋值给变量 data。
                    这样，我们就可以在模板中使用 data 变量来访问父组件传递过来的数据。-->
                <template #default=" { data } ">
                    <!--:commentData 表示将变量 data 作为 commentData 属性传递给组件，用于渲染组件的内容。-->
                    <CommentListItem :articleId="articleId" :commentData=" data " :articleUserId=" articleUserId "
                        :currentUserId=" currentUserInfo.userId " @hiddenAllReply=" hiddenAllReplyHandler ">
                    </CommentListItem>
                </template>
            </DataList>
        </div>
    </div>
</template>

<script setup>
import { async } from "@kangc/v-md-editor";
import { ref, reactive, getCurrentInstance, watch, } from "vue";
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import CommentListItem from "./CommentListItem.vue"
import PostComment from "./PostComment.vue";

const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();
const store = useStore();
//API
const api = {
    loadComment: "/comment/loadComment",
    postComment: "/comment/postComment",
    doLike: " /comment/doLike",
    changeTopType: "/comment/changeTopType",
};

const props = defineProps({
    articleId: {
        type: String
    },
    articleUserId: {
        type: String
    },

});

//排序
const orderType = ref(0);
//评论列表
const loading = ref(null);
const commentListInfo = ref({});
const loadComment = async () => {
    let params = {
        pageNo: commentListInfo.value.pageNo,
        articleId: props.articleId,
        orderType: orderType.value,
    };
    loading.value = true;
    /*使用一个代理对象(proxy)向后端API发送请求，
    请求的URL为api.loadComment，请求参数为上述params对象。
    这里使用了await关键字，表示等待请求响应返回。*/
    let result = await proxy.Request({
        url: api.loadComment,
        params,
    });
    loading.value = false;
    /*如果返回的result为假值，即请求失败或返回数据为空，则函数直接返回。
    否则，将请求返回的数据存储在commentListInfo中。*/
    if (!result) {
        return;
    }
    commentListInfo.value = result.data;
};
loadComment();

//隐藏所有回复框
const hiddenAllReplyHandler = () => {
    commentListInfo.value.list.forEach(element => {
        element.showReply = false;
    });
}

//评论发布完成
const postCommentFinish=(resultData)=>{
    commentListInfo.value.list.unshift(resultData);
}


//当前用户信息
const currentUserInfo = ref({});
watch(
    () => store.state.loginUserInfo,
    (newVal, oldVal) => {
        currentUserInfo.value = newVal || {};
    },
    { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped>
.comment-body {
    .comment-title {
        display: flex;
        align-items: center;

        .title {
            font-size: 20px;

            .count {
                font-size: 14px;
                padding: 0px 10px;
            }
        }
    }

    .comment-form-panel {
        margin-top: 20px;
    }

}
</style>
