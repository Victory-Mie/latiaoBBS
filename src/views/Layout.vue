<template>
  <div>
    <el-collapse-transition>
      <el-menu class="header" v-if="showHeader">
        <div class="header-content" :style="{ maxWidth: (proxy.globalInfo.bodyWidth - 100) + 'px' }">
          <!--logo-->
          <router-link class="logo" to="/">
            <img src="..\assets\images\logo.png" alt="hh">
          </router-link>

          <!--菜单栏（板块信息）-->
          <div class="menu-panel">
            <router-link class="menu-item" to="/">首页</router-link>
            <!--<router-link class="menu-item" to="/">首页</router-link>-->

            <template v-for="board in boardList">
              <el-popover placement="bottom-start" :width="300" trigger="hover" v-if="board.children.length > 0">

                <template #reference>
                  <span :class="['menu-item', board.boardId == activePBoardId ? 'active' : ' ']"
                    @click="boardClick(board)">{{ board.boardName }}</span>
                </template>
                <div class="sub-board-list">
                  <span :class="['sub-board', subBoard.boardId == activeBoardId ? 'active' : ' ']"
                    v-for="subBoard in board.children" @click="subBoardClick(subBoard)">
                    {{ subBoard.boardName }}
                  </span>
                </div>
              </el-popover>
              <span :class="['menu-item', board.boardId == activePBoardId ? 'active' : ' ']" v-else
                @click="boardClick(board)">{{ board.boardName }} </span>
            </template>
          </div>

          <!--用户登陆注册-->
          <div class="user-info-panel">
            <el-button color="#f6d365" type="primary" class="op-btn" @click="newPost">
              发帖<span class="iconfont icon-add"></span>
            </el-button>
            <el-button color="#f6d365" type="primary" class="op-btn" @click="goToSearch">
              搜索<span class="iconfont icon-search"></span>
            </el-button>
            <template v-if="userInfo.userId">
              <div class="message-info">
                <el-dropdown>
                  <el-badge :value="messageCountInfo.total" class="item"
                    :hidden="messageCountInfo.total==null || messageCountInfo.total == 0">
                    <div class="iconfont icon-message"></div>
                  </el-badge>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="gotoMessage('reply')" class="message-item">
                        <span class="text">回复我的</span>
                        <span class="count-tag" v-if="messageCountInfo.reply > 0">
                          {{ messageCountInfo.reply > 99 ? "99+" : messageCountInfo.reply }}
                        </span>
                      </el-dropdown-item>
                      <el-dropdown-item @click="gotoMessage('likePost')" class="message-item">
                        <span class="text">赞了我的文章</span>
                        <span class="count-tag" v-if="messageCountInfo.likePost > 0">
                          {{ messageCountInfo.likePost > 99 ? "99+" : messageCountInfo.likePost }}
                        </span>
                      </el-dropdown-item>
                      <!--<el-dropdown-item @click="gotoMessage('reply')">下载了我的文章</el-dropdown-item>-->
                      <el-dropdown-item @click="gotoMessage('likeComment')" class="message-item">
                        <span class="text">赞了我的评论</span>
                        <span class="count-tag" v-if="messageCountInfo.likeComment > 0">
                          {{ messageCountInfo.likeComment > 99 ? "99+" : messageCountInfo.likeComment }}
                        </span>
                      </el-dropdown-item>
                      <el-dropdown-item @click="gotoMessage('sys')" class="message-item">
                        <span class="text">系统消息</span>
                        <span class="count-tag" v-if="messageCountInfo.sys > 0">
                          {{ messageCountInfo.sys > 99 ? "99+" : messageCountInfo.sys }}
                        </span>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
              <div class="user-info">
                <el-dropdown>
                  <avatar :userId="userInfo.userId"></avatar>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="goToUcenter(userInfo.userId)">我的主页</el-dropdown-item>
                      <el-dropdown-item @click="logout">退出</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>

            <el-button-group style="margin-left: 10px;" v-else>
              <el-button color="#f6d365" type="primary" @click="logAReg(1)">登录</el-button>
              <el-button color="#f6d365" type="primary" @click="logAReg(0)">注册</el-button>
            </el-button-group>

          </div>
        </div>
      </el-menu>
    </el-collapse-transition>
    <Dialog :centerDialogVisible="show" :buttons="buttons" @close="show = false">
      <div>内容</div>
    </Dialog>

    <div class="body-content">
      <Router-View />
    </div>

    <!--登陆注册-->
    <loginAndRegister ref="logARegRef"></loginAndRegister>


  </div>
</template>

<script setup>

import loginAndRegister from "./LoginAndRegister.vue";
import { ref, reactive, getCurrentInstance, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";

//es6对象的解构赋值(以后调用proxy就相当于getCurrentInstance.proxy()了)
const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();
const store = useStore();
const showHeader = ref(true);

const api = {
  getUserInfo: "/getUserInfo",
  loadBoard: "/board/loadBoard",
  getMessageCount: "/ucenter/getMessageCount",
  logout: "/logout"
};

//获取滚动条高度
const getScrollTop = () => {
  //考虑浏览器兼容问题
  let scrollTop = document.documentElement.scrollTop ||
    window.pageYOffset ||
    document.body.scrollTop;
  return scrollTop;
};

//监听滚动
const initScroll = () => {
  //初始位置
  let initScrollTop = getScrollTop();
  //滚动方向标识
  let scrollType = 0;

  window.addEventListener("scroll", () => {
    //当前位置
    let currentScrollTop = getScrollTop();
    if (currentScrollTop > initScrollTop) {
      //向上滚
      scrollType = 0;
    } else {
      //向下滚
      scrollType = 1;
    }
    initScrollTop = currentScrollTop;
    console.log(scrollType == 1 ? "up" : "down")
    if (scrollType == 0 && currentScrollTop >= 200) {
      showHeader.value = false;
    } else {
      showHeader.value = true;
    }
  });
};

onMounted(() => {
  initScroll();
  getUserInfo();
});

//获取用户信息
const getUserInfo = async () => {
  let result = await proxy.Request({
    url: api.getUserInfo,
  });
  if (!result) {
    return;
  }
  store.commit("updateLoginUserInfo", result.data);
};

//获取板块信息
const boardList = ref([]);
const loadBoard = async () => {
  let result = await proxy.Request({
    url: api.loadBoard,
  });
  if (!result) {
    return;
  }
  boardList.value = result.data;
  store.commit("saveBoardList", result.data);
}
loadBoard();

//登陆注册
const logARegRef = ref();
const logAReg = (type) => {
  logARegRef.value.showPanel(type);
}

//监听store的状态变化 登陆用户信息
const userInfo = ref({});
watch(
  () => store.state.loginUserInfo,
  (newVal, oldVal) => {
    if (newVal != undefined && newVal != null) {
      userInfo.value = newVal;
    } else {
      userInfo.value = {};
    }
  },
  { immediate: true, deep: true },
);
//监听是否展示登录框
watch(
  () => store.state.showLogin,
  (newVal, oldVal) => {
    if (newVal) {
      logAReg(1);
    }
  },
  { immediate: true, deep: true }
)

//板块点击切换
const boardClick = (board) => {
  //console.log(board.boardId)
  //console.log(board.pBoardId)
  router.push(`/forum/${board.boardId}/${board.pBoardId}`);
};
const subBoardClick = (subBoard) => {
  //console.log(subBoard.boardId)
  //console.log(subBoard.pBoardId)
  router.push(`/forum/${subBoard.pBoardId}/${subBoard.boardId}`);
};
//监听当前选中的版块
const activePBoardId = ref(0);
watch(
  () => store.state.activePBoardId,
  (newVal, oldVal) => {
    if (newVal != 0) {
      activePBoardId.value = newVal;
    }
  },
  { immediate: true, deep: true }
)
const activeBoardId = ref(0);
watch(
  () => store.state.activeBoardId,
  (newVal, oldVal) => {
    if (newVal != 0) {
      activeBoardId.value = newVal;
    }
  },
  { immediate: true, deep: true }
)

//发帖
const newPost = () => {
  if (!store.getters.getLoginUserInfo) {
    logAReg(1);
  } else {
    router.push("/newPost");
  }
}

const goToUcenter = (userId) => {
  router.push(`/user/${userId}`)
}

//消息
const gotoMessage = (type) => {
  router.push(`/user/message/${type}`);
}
const messageCountInfo = ref({});
const getMessageCount = async () => {
  let result = await proxy.Request({
    url: api.getMessageCount,
  });
  if (!result) return;
  messageCountInfo.value = result.data;
  store.commit("updateMessageCountInfo",result.data)
};


watch(
  () => store.state.messageCountInfo,
  (newVal, oldVal) => {
    messageCountInfo.value=newVal||{};
   },
  { immediate: true, deep: true }
);

watch(
  () => store.state.loginUserInfo,
  (newVal, oldVal) => {
    if (newVal) {
      getMessageCount();
    }
  },
  { immediate: true, deep: true }
);

//退出登录
const logout = () => {
  proxy.Confirm("确定要退出吗？", async () => {
    let result = await proxy.Request({
      url: api.logout,
    });
    if (!result) return;
    store.commit("updateLoginUserInfo", null);
  })

}

const goToSearch=()=>{
  router.push(`/search`);
}
</script>

<style lang="scss" scoped>
.header {
  position: fixed;
  top: 0px;
  width: 100%;
  height: 60px;
  z-index: 1000;
  background: white;
  box-shadow: 0 2px 5px 0 #ababab;

  .header-content {
    margin: 0px auto;
    height: 60px;
    //弹性盒子flex-box
    display: flex;
    align-items: center;
  }
}

.logo {
  float: left;
  display: block;

}

.menu-panel {
  flex: 1;
  height: 60px;

  .menu-item {
    border-top: solid 5px;
    border-bottom: solid 5px;
    border-color: transparent;
    float: left;
    height: 60px;
    display: flex;
    align-items: center;
    margin-left: 30px;
    font-size: 16px;
    text-decoration: none;
    cursor: pointer;
  }

  .active {
    color: #ff9d00;
  }

  a:active {
    color: #2c3e50;
  }

  a:visited {
    color: #2c3e50;
  }

  .menu-item:hover {
    border-bottom-color: #f6d365;
  }
}

.user-info-panel {
  width: 310px;
  float: right;
  display: flex;
  align-items: center;

  .op-btn {
    display: block;
    margin-left: 5px;
  }

  .message-info {
    cursor: pointer;

    .icon-message {
      font-size: 23px;
      color: rgb(147, 147, 147);
    }





    margin-inline: 20px;
  }

  .user-info {
    cursor: pointer;
  }
}

.sub-board-list {
  display: flex;
  flex-wrap: wrap;

  .sub-board {
    padding: 3px 10px;
    border-radius: 20px;
    margin-right: 10px;
    background-color: hsl(46, 100%, 82%);
    color: rgb(119, 118, 118);

  }

  .sub-board:hover {
    text-decoration: none;
    color: var(--link);
    cursor: pointer;

  }
}

.body-content {
  margin-top: 60px;
  position: relative;
}

.message-item {
  display: flex;
  justify-content: space-around;

  .text {
    flex: 1;
  }

  .count-tag {
    color: #fff;
    min-width: 20px;
    //display: inline-block;
    background: #f56c6c;
    height: 15px;
    border-radius: 45%;
    font-size: 13px;
    text-align: center;
    line-height: 20px;
    display: inline-flex;
    justify-content: center;
    align-items: center;

  }
}
</style>
