import { createRouter, createWebHistory } from 'vue-router'
//创建路由实例并传递 `routes` 配置。
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path:'/',
      name:"Layout",
      component:()=>import('@/views/Layout.vue'),
      //子模块
      children:[{
        path:'/',
        name:"所有文章",
        component:()=>import('@/views/forum/ArticleList.vue'),
      },
      {
        path:'/forum/:pBoardId',
        name:"一级板块",
        component:()=>import('@/views/forum/ArticleList.vue'),
      },
      {
        path:'/forum/:pBoardId/:boardId',
        name:"二级板块",
        component:()=>import('@/views/forum/ArticleList.vue'),
      },
      {
        path:'/user/:userId',
        name:"用户信息",
        component:()=>import('@/views/uCenter/Ucenter.vue'),
      },
      {
        path:'/post/:articleId',
        name:"文章详情",
        component:()=>import('@/views/forum/ArticleDetail.vue'),
      },{
        path:'/newPost',
        name:"发帖",
        component:()=>import('@/views/forum/EditPost.vue'),
      },
      {
        path:'/editPost/:articleId',
        name:"编辑文章",
        component:()=>import('@/views/forum/EditPost.vue'),
      },{
        path:'/user/:message/:type',
        name:"消息",
        component:()=>import('@/views/uCenter/MessageList.vue'),
      },
      {
        path:'/search',
        name:"搜索",
        component:()=>import('@/views/Search.vue'),
      },
    ]
    }
  
  ]
})

//导出router
export default router
