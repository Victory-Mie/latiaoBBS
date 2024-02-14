<template>
    <div class="container-body article-list-body" :style="{ maxWidth: (proxy.globalInfo.bodyWidth - 100) + 'px' }"
        v-if="Object.keys(articleInfo).length > 0">
        <!--板块导航-->
        <div class="board-info">
            <router-link :to="`/forum/${articleInfo.pBoardId}`" class="a-link">
                {{ articleInfo.pBoardName }}
            </router-link>
            <span class="iconfont icon-right"></span>
            <router-link :to="`/forum/${articleInfo.pBoardId}${articleInfo.boardId ? '/' + articleInfo.boardId : ''
                }`" class="a-link">
                {{ articleInfo.boardId ? articleInfo.boardName : "全部" }}
            </router-link>
            <span class="iconfont icon-right"></span>
            <span>{{ articleInfo.title }}</span>
        </div>
        <!--文章详情-->
        <div class="detail-container" :style="{ maxWidth: (proxy.globalInfo.bodyWidth - 300) + 'px' }">
            <div class="article-detail">
                <div class="title">
                    {{ articleInfo.title }}
                </div>
                <div class="user-info">
                    <Avatar :userId="articleInfo.userId" :width="50"> </Avatar>
                    <div class="user-info-detail">
                        <router-link :to="`/user/${articleInfo.userId}`" class="nick-name a-link">
                            {{ articleInfo.nickName }}
                        </router-link>

                        <div class="time-info">
                            <span>
                                {{ articleInfo.postTime }}
                            </span>
                            <span class="address">
                                {{ articleInfo.userIpAddress }}
                            </span>
                            <span class="iconfont icon-eye-solid">
                                &nbsp;{{ articleInfo.readCount == 0 ? "阅读" : articleInfo.readCount }}
                            </span>
                            <router-link v-if="articleInfo.userId == currentUserInfo.userId"
                                :to="`/editPost/${articleInfo.articleId}`" class="a-link btn-edit">
                                <span class="iconfont icon-edit">编辑</span>
                            </router-link>
                        </div>
                    </div>
                </div>
                <el-divider :margin="10" />

                <div class="article-content" id="article-content" v-html="articleInfo.content">
                </div>


                <!--评论-->
                <div class="comment-panel" id="view-comment" v-if="articleInfo.status == 1">
                    <CommentList v-if="articleInfo.articleId" :articleId="articleInfo.articleId"
                        :articleUserId="articleInfo.articleUserId" @updateCommentCount="updateCommentCount">hello
                    </CommentList>
                </div>
            </div>

        </div>
        <!--目录-->
        <div class="toc-panel">
            <div class="top-containner">
                <div class="toc-title">目录</div>
                <div class="toc-list">
                    <template v-if="tocArray.length == 0">
                        <div class="no-toc">未解析到目录</div>
                    </template>
                    <template v-else>
                        <div v-for="toc in tocArray">
                            <span @click="gotoAnchor(toc.id)" :class="['toc-item', toc.id == anchorId ? 'active' : '']"
                                :style="{ 'padding-left': toc.level * 15 + 'px' }"> {{ toc.title }}</span>
                        </div>
                    </template>

                </div>
            </div>
        </div>
    </div>
    <!--左侧快捷操作-->
    <div class="quick-panel" :style="{ left: quickPanelLeft + 'px' }">
        <!--点赞-->
        <el-badge :value="articleInfo.goodCount" type="info" :hidden="!articleInfo.goodCount > 0">
            <div class="quick-item" @click="doLikeHandler">
                <span :class="['iconfont icon-good', haveLike ? 'have-like' : '']">
                </span>
            </div>
        </el-badge>
        <!--评论-->
        <el-badge :value="articleInfo.commentCount" type="info" :hidden="!articleInfo.commentCount > 0">
            <div class="quick-item" @click="goToPostion('view-comment')">
                <span class="iconfont icon-comment">
                </span>
            </div>
        </el-badge>
    </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex"
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-light.css"//样式
import CommentList from "./CommentList.vue"

const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();
const store = useStore();

const api = {
    getArticleDetail: "/forum/getArticleDetail",
    doLike: "/forum/doLike",
}

const currentUserInfo = ref({});
//拿到一个文章的具体信息
const articleInfo = ref({});
//是否已点赞
const haveLike = ref(false);

const getArticleDetail = async (articleId) => {
    let result = await proxy.Request({
        url: api.getArticleDetail,
        params: {
            articleId: articleId,

        }
    });
    if (!result) {
        return;
    }
    articleInfo.value = result.data.forumArticle;
    haveLike.value = result.data.haveLike;
    store.commit("setActivePboardId", result.data.forumArticle.pBoardId);
    store.commit("setActiveBoardId", result.data.forumArticle.boardId);

    highlightCode();
    //生成目录
    makeToc();
};

//监听用户登录
watch(
    () => store.state.loginUserInfo,
    (newVal, oldVal) => {
        currentUserInfo.value = newVal || {};
    },
    { immediate: true, deep: true }
)

//注册一个回调函数，在组件挂载完成后执行。
//这个钩子在服务器端渲染期间不会被调用。
onMounted(() => {
    getArticleDetail(route.params.articleId);
})

//快捷操作
const quickPanelLeft = ref(
    (window.innerWidth - proxy.globalInfo.bodyWidth) / 2 - 50
);
//监听页面大小
const listenResize = () => {
    quickPanelLeft.value =
        (window.innerWidth - proxy.globalInfo.bodyWidth) / 2 - 50;
    console.log(quickPanelLeft.value);
};

const goToPostion = (domId) => {
    document.querySelector("#" + domId).scrollIntoView();
};
//点赞
const doLikeHandler = async () => {
    if (!store.getters.getLoginUserInfo) {
        store.commit("showLogin", true);
        return;
    }
    let result = await proxy.Request({
        url: api.doLike,
        params: {
            articleId: articleInfo.value.articleId,
        },
    });
    if (!result) { return; }
    haveLike.value = !haveLike.value;
    let goodCount = 1;
    if (!haveLike.value) { goodCount = -1; }
    articleInfo.value.goodCount = articleInfo.value.goodCount + goodCount;
}



//代码块高亮
const highlightCode = () => {
    nextTick(() => {
        let blocks = document.querySelectorAll("pre code");
        blocks.forEach(item => {
            hljs.highlightBlock(item);
        })
    });
}

//更新评论数量
const updateCommentCount = (commentCount) => {
    articleInfo.value.commentCount = commentCount;
};

//获取目录
const tocArray = ref([]);
const makeToc = () => {
    nextTick(() => {
        const tocTags = ["H1", "H2", "H3", "H4", "H5", "H6"];
        //获取所有H标签
        const contentDom = document.querySelector("#article-content");
        const childNodes = contentDom.childNodes;

        let index = 0;
        childNodes.forEach((item) => {
            let tagName = item.tagName;
            if (tagName == undefined || !tocTags.includes(tagName.toUpperCase())) {
                return true;
            }
            index++;
            let id = "toc" + index;
            item.setAttribute("id", id);
            tocArray.value.push({
                id: id,
                title: item.innerText,
                level: Number.parseInt(tagName.substring(1)),
                offsetTop: item.offsetTop,
            });
        });
    });
}

const anchorId = ref(null);
const gotoAnchor = (domId) => {
    const dom = document.querySelector("#" + domId);
    dom.scrollIntoView({
        behavior: "smooth",
        block: "start",
    });
};

const listenerScroll = () => {
    let currentScrollTop = getScrollTop();
    tocArray.value.some((item, index) => {
        if (
            (index < tocArray.value.length - 1 &&
                currentScrollTop >= tocArray.value[index].offsetTop &&
                currentScrollTop < tocArray.value[index + 1].offsetTop) ||
            (index == tocArray.value.length - 1 &&
                currentScrollTop < tocArray.value[index].offsetTop)
        ) {
            anchorId.value = item.id;
            return true;
        }
    });
};

//获取滚动条的高度
const getScrollTop = () => {
    let scrollTop =
        document.documentElement.scrollTop ||
        window.pageYOffset ||
        document.body.scrollTop;
    return scrollTop;
};

onMounted(() => {
    window.addEventListener("scroll", listenerScroll, false);
    window.addEventListener("resize", listenResize, false);
});

onUnmounted(() => {
    window.removeEventListener("scroll", listenerScroll, false);
    window.removeEventListener("resize", listenResize, false);
});


const showComment = ref(false);
watch(
    () => store.state.sysSetting,
    (newVal, oldVal) => {
        if (newVal) {
            showComment.value = newVal.commentOpen;
        }
    },
    { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped>
.board-info {
    border-radius: 4px;
    display: inline-block;
    width: auto;
    background: #fff;
    padding: 5px 15px;
    color: #909090;
    font-size: 14px;

    .icon-right {
        margin: 0px 3px;
    }
}

.detail-container {
    border-radius: 4px;
    background-color: #fff;


    .article-detail {
        margin: 10px;
        padding: 20px;


        .title {
            padding: 0px 10px;
            font-weight: bolder;
            font-size: 30px;
        }

        .user-info {
            margin-top: 10px;
            display: flex;
            color: #909090;

            .user-info-detail {
                margin-left: 20px;

                .nick-name {
                    text-decoration: none;
                    font-size: 15px;
                    color: #2c3e50;
                    font-weight:bold;
                }

                .time-info {
                    .address {
                        margin-left: 15px;
                    }

                    .iconfont::before {
                        margin-left: 15px;
                    }
                }
            }
        }

        .article-content {
            letter-spacing: 1px;
            line-height: 25px;
            padding: 0 10px;


        }

        .article-content ::v-deep a {
            text-decoration: none;
        }

        .article-content ::v-deep p {
            margin: 10px auto;
        }

        .article-content ::v-deep img {
            cursor: pointer;
            display: block;
            max-width: 90%;
            margin: 10px auto;
        }

        .article-content ::v-deep code {
            font-family: "Lucida Console", "Courier New", monospace;
        }

        .comment-panel {
            margin-top: 20px;
            background: #fff;
        }

    }
}

.quick-panel {
    position: fixed;
    width: 50px;
    top: 200px;
    text-align: center;

    .el-badge__content.is-fixed {
        top: 5px;
        right: 15px;
    }

    .quick-item {
        width: 50px;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
        background: #fff;
        margin-bottom: 30px;
        cursor: pointer;

        .iconfont {
            font-size: 22px;
            color: var(--text2);
        }

        .have-like {
            color: red;
        }
    }
}

.toc-panel {
    position: absolute;
    top: 60px;
    right: 0px;
    width: 285px;

    .top-containner {
        width: 285px;
        position: fixed;
        background: #fff;
        right: 25px;

        .toc-title {
            font-weight: bold;
            font-size:18px;
            color: #31445b;
            border-bottom: 1px solid #ddd;
            padding: 10px;
        }

        .toc-list {
            max-height: calc(100vh - 200px);
            overflow: auto;
            padding: 5px;

            .no-toc {
                text-align: center;
                color: #5f5d5d;
                line-height: 40px;
                font-size: 13px;
            }

            .toc-item {
                cursor: pointer;
                display: block;
                line-height: 35px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                color: #555666;
                border-radius: 3px;
                font-size: 14px;
                border-left: 2px solid #fff;
            }

            .toc-item:hover {
                background: #eeeded;
            }

            .active {
                border-left: 2px solid #6ca1f7;
                border-radius: 0px 3px 3px 0px;
                background: #eeeded;
            }
        }
    }
}
</style>
