<template>
  <div class="container-body ucenter" :style="{ maxWidth: (proxy.globalInfo.bodyWidth - 100) + 'px' }">
    <div class="user-banner">
      <router-link to="/" class="a-link">首页</router-link>
      <!--面包屑-->
      <span class="iconfont icon-right"></span>
      <span>个人中心</span>
    </div>
    <!--基本信息-->
    <div class="ucenter-panel">
      <div class="user-side">
        <div class="avatar-panel">
          <div class="editor-btn a-link" v-if="isCurrentUser" @click="updateUserInfo">修改资料</div>
          <div class="avatar-inner">
            <Avatar :userId="userInfo.userId" :width="120"></Avatar>
          </div>
          <div class="nick-name">
            <span class="name">{{ userInfo.nickName }}</span>
            <span v-if="userInfo.sex == 0" class="iconfont icon-woman"></span>
            <span v-if="userInfo.sex == 1" class="iconfont icon-man"></span>
          </div>
          <div class="desc">
            {{ userInfo.personDescription }}
          </div>
        </div>
        <!--扩展信息-->
        <div class="user-extent-panel">
          <!--<div class="info-item">
            <div class="label iconfont icon-integral">积分</div>
            <div class="value">{{ userInfo.currentIntegral }}</div>
          </div>-->
          <div class="info-item">
            <div class="label iconfont icon-like">获赞</div>
            <div class="value">{{ userInfo.likeCount }}</div>
          </div>
          <div class="info-item">
            <div class="label iconfont icon-post">发帖</div>
            <div class="value">{{ userInfo.postCount }}</div>
          </div>
          <div class="info-item">
            <div class="label iconfont icon-register">加入</div>
            <div class="value">{{ userInfo.joinTime }}</div>
          </div>
          <div class="info-item">
            <div class="label iconfont icon-login">最近登录</div>
            <div class="value">{{ userInfo.lastLoginTime }}</div>
          </div>
        </div>

      </div>
      <div class="article-panel">
        <el-tabs :model-value="activeTabName" @tab-change="changeTab">
          <el-tab-pane label="发帖" :name="0"></el-tab-pane>
          <el-tab-pane label="评论" :name="1"></el-tab-pane>
          <el-tab-pane label="点赞" :name="2"></el-tab-pane>
        </el-tabs>
        <div class="article-list">
          <DataList :loading="loading" :dataSource="articleListInfo" @loadData="loadArticle">
            <template #default="{ data }">
              <ArticleListItem :data="data"></ArticleListItem>
            </template>
          </DataList>
        </div>
      </div>
    </div>
    <UcenterEditor ref="ucenterEditUserInfoRef" @resetUserInfo="resetUserInfoHandler"></UcenterEditor>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex"
import ArticleListItem from "@/views/forum/ArticleListItem.vue";
import UcenterEditor from "./UcenterEditor.vue"

const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();
const store = useStore();
const api = {
  getUserInfo: "/ucenter/getUserInfo",
  loadUserArticle: "ucenter/loadUserArticle"
}
const userInfo = ref({})
const userId = ref(null);
const loadUserInfo = async () => {
  let result = await proxy.Request({
    url: api.getUserInfo,
    params: {
      userId: userId.value,
    },
    errorCallback: () => {
      setTimeout(() => {
        router.push("/");
      }, 1500)
    }
  });
  if (!result) {
    return;
  }
  userInfo.value = result.data;
};

const isCurrentUser = ref(false);
//重新设置当前用户
const resetCurrentUser = () => {
  const loginUserInfo = store.getters.getLoginUserInfo;
  if (loginUserInfo && loginUserInfo.userId === userId.value) {
    isCurrentUser.value = true;
  } else isCurrentUser.value = false

}


//右侧文章
const activeTabName = ref(0);
const changeTab = (type) => {
  activeTabName.value = type;
  loadArticle();
}
const articleInfoList = ref({});
const loading = ref(false);
const articleListInfo = ref({});
const loadArticle = async () => {
  loading.value = true;
  let params = {
    pageNo: articleListInfo.value.pageNo || undefined,
    type: activeTabName.value,
    userId: userId.value
  };

  console.log(params);

  let result = await proxy.Request({
    url: api.loadUserArticle,
    params: params,
    showLoading: false,
  });
  loading.value = false;
  if (!result) return;
  articleListInfo.value = result.data;
  //articleListInfo.value.list=[];
};

watch(
  () => store.state.loginUserInfo,
  (newVal, oldVal) => {
    resetCurrentUser();
  },
  { immediate: true, deep: true }
);


watch(
  () => route.params.userId,
  (newVal, oldVal) => {
    if (newVal) {
      userId.value = newVal;
      resetCurrentUser();
      loadUserInfo();
      loadArticle();
    }
  },

  { immediate: true, deep: true }
)

//修改用户信息
const ucenterEditUserInfoRef = ref(null);
const updateUserInfo = () => {

  ucenterEditUserInfoRef.value.showEditUserInfoDialog(userInfo.value);
  console.log(ucenterEditUserInfoRef.value)
};

const resetUserInfoHandler = (data) => {
  userInfo.value = data;
};

</script>

<style lang="scss" scoped>
.ucenter {
  .user-banner {
    color: #8a919f;
    line-height: 35px;

    .icon-right {
      padding: 0px 5px;

    }
  }

  .ucenter-panel {
    display: flex;

    .user-side {
      width: 300px;
      margin-right: 10px;

      .avatar-panel {
        border-radius: 4px;
        background-color: #fff;
        text-align: center;
        padding: 20px;

        .editor-btn {
          cursor: pointer;
          text-align: right;
          font-size: 14px;
        }

        .avatar-inner {
          display: flex;
          justify-content: center;
          margin: 5px;
        }

        .nick-name {
          margin: 5px;

          .name {
            font-size: 20px;
            font-weight: bolder;
          }


          .iconfont {
            margin-left: 5px;
            color: var(--link);
          }
        }

        .desc {
          font-size: 14px;
          color: #8a919f;
        }
      }

      .user-extent-panel {
        border-radius: 4px;
        margin-top: 10px;
        background-color: #fff;
        padding: 10px 20px;

        .info-item {
          display: flex;
          margin: 2px 0px;
          justify-content: space-between;
          line-height: 30px;

          .label {

            font-weight: bold;
            font-size: 13px;
            color: #31445b;
          }

          .label::before {
            font-size: 20px;
            color: #888888;
            padding-right: 5px;
          }

          .value {
            text-align: center;
          }


        }
      }
    }

    .article-panel {
      margin-bottom: 10px;
      border-radius: 4px;
      flex: 1;
      background: #fff;
      padding: 0px 20px;
    }
  }
}
</style>
