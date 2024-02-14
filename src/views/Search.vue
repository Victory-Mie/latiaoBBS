<template>
    <div class="container-body search-body" :style="{ maxWidth: (proxy.globalInfo.bodyWidth - 100) + 'px' }">
        <div class="search-panel">
            <el-form :model="formData" :rules="rules" ref="formDataRef">
                <el-form-item prop="keyword">
                    <el-input clearable placeholder="请输入关键词" v-model="formData.keyword" size="large" @keyup.enter="search"
                        @focus="startSearchHandler">
                        <template #suffix>
                            <span class="iconfont icon-search" @click="search"
                                @blur="formData.keyword = $event.target.value.trim()"></span>

                        </template>

                    </el-input>
                </el-form-item>

            </el-form>
        </div>
        <div class="article-list">
            <DataList :loading="loading" :dataSource="articleListInfo" @loadData="search" noDataMsg="没有发现帖子，赶紧发布一个吧">
                <template #default="{ data }">
                    <ArticleListItem :data="data"></ArticleListItem>
                </template>
            </DataList>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";
import ArticleListItem from "@/views/forum/ArticleListItem.vue"
const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();
const api = {
    loadArticle: "/forum/search",
}
const formData = ref({});
const formDataRef = ref();
const rules = {
    keyword: [
        { require: true, message: "请输入关键字" },
        { min: 3, message: "关键字至少三个字" }
    ],
    title: [{ required: true, message: "请输入内容" }],
}

//开始搜索
const startSearch = ref(false);
const startSearchHandler = () => {
    startSearch.value = true;
}

const loading = ref(false);
const articleListInfo = ref({});
const search = async () => {
    loading.value = true;
    let params = {
        pageNo: articleListInfo.value.pageNo || undefined,
        keyword: formData.value.keyword,
    };

    //console.log(params);

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

</script>

<style lang="scss" scoped>
.search-body {
    margin-top: 70px;
    background: #fff;
    padding: 10px;

    .search-panel {

        display: flex;
        justify-content: center;

        .el-input {
            margin: 30px 0px;
            width: 700px;
        }
    }
}
</style>
