<template>
    <div class="article-item">
        <div class="article-item-inner">
            <div class="article-body">
                <div class="user-info">
                    <Avatar :userId="data.userId" :width="30" >  
                    </Avatar>
                    <router-link :to="'/user/'+data.userId" class="link-info" style="font-weight: bold; color: #4a4a4a;">
                        {{ data.nickName }}
                    </router-link>
                    <el-divider direction="vertical"></el-divider>
                    <div class="post-time">{{ data.postTime }}</div>
                    <div class="address">{{ data.userIpAddress }}</div>
                    <el-divider direction="vertical"></el-divider>
                    <router-link :to="`/forum/${data.pBoardId}`"  class="link-info">
                        {{ data.pBoardName }}
                    </router-link>
                    <template v-if="data.boardId">
                        <span>&nbsp;&nbsp;·&nbsp;&nbsp;</span>
                        <router-link :to="`/forum/${data.pBoardId}/${data.boardId}`"  class="link-info">{{ data.boardName }}</router-link>
                    </template>
                </div>
                <router-link :to="`/post/${data.articleId}`" class="title">
                    {{ data.title }}
                </router-link>
                <div class="summary">
                    {{ data.summary }}
                </div>
                <div class="article-info">
                    <span class="iconfont icon-eye-solid">{{ data.readCount==0? "阅读":data.readCount }}</span>
                    <span class="iconfont icon-good">{{ data.goodCount==0? "点赞":data.goodCount }}</span>
                    <span class="iconfont icon-comment">{{ data.commentCount==0? "评论":data.commentCount }}</span>
                </div>
            </div>
            <router-link :to="`/post/${data.articleId}`">
                <Cover v-if="data.cover" :cover="data.cover">
                </Cover>
            </router-link>
            
        </div>
    </div>
</template>

<script setup>
const props=defineProps({
    data:{
        type:Object,
    },
});
</script>

<style lang="scss">
.article-item{
    padding:5px 20px;
    .article-item-inner{
        display: flex;
        padding:10px;
        border-bottom: 1px solid #ddd;
        .article-body{
            flex:1;
            .user-info{
                display: flex;
                align-items: center;
                font-size: 14px;
               
                .link-info{
                    font-weight:500;
                    margin-left:10px;
                    color:#8a919f;
                    text-decoration: none;
                }
                .link-info:hover{
                    color:  #ff9d00; 
                }
                .post-time{
                    
                    color: #8a919f;
                }
                
                .address{
                   margin-left: 20px;
                   color: #8a919f;
                }
            }
            .title{
                font-weight: bold;
                text-decoration: none;
                color:#4a4a4a;
                font-size: 18px;
                display: inline-block;
                margin:10px;
            }
            .summary{

                color:#8a919f;
                margin:0px 10px;
                font-size: 14px;
            }
            .article-info{
                margin:10px 10px 0;
                display: flex;
                align-items: center;
                .iconfont{
                    font-size: 14px;
                    color: #8a919f;
                    margin-right: 25px;
                }
                .iconfont:before{
                    padding-right:6px;
                }
            }
        }
        .cover{
            float:right;
            
        }
    }

}
.article-item:hover{
    background-color: #fafafa;
}
</style>