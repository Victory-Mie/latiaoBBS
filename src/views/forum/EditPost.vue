<template>
    <div class="edit-post">
        <el-form class="post-panel" :model="formData" :rules="rules" ref="formDataRef">
            <div class="post-editor">
                <el-card>
                    <template #header>
                        <div class="post-editor-title">
                            <span>正文</span>
                            <div class="change-editor-type">
                                <span class="iconfont icon-change" @click="changeEditor">切换为{{ editorType == 0 ?
                                    "markdown编辑器" : "富文本编辑器" }}
                                </span>
                            </div>
                        </div>
                    </template>
                    <el-form-item prop="content" label-width="0px">
                        <EditorHtml v-if="editorType == 0" v-model="formData.content" :height="htmlEditorHeight">
                        </EditorHtml>
                        <EditorMarkdown v-if="editorType == 1" v-model="formData.markdownContent" :height="markdownHeight"
                            @HtmlContent="setHtmlContent">
                        </EditorMarkdown>
                    </el-form-item>

                </el-card>

            </div>

            <div class="post-setting">
                <el-card>
                    <template #header>
                        <span>设置</span>

                    </template>
                    <div class="setting-inner">
                        <!--输入-->
                        <el-form-item label="标题" prop="title">

                            <el-input clearable placeholder="提示信息" v-model="formData.title">

                            </el-input>
                        </el-form-item>
                        <el-form-item prop="boardIds" label="板块">
                            <el-cascader placeholder="请选择模块" :options="boardList" :props="boardProps" clearable
                                v-model="formData.boardIds" :style="{ width: '100%' }">

                            </el-cascader>
                        </el-form-item>
                        <el-form-item prop="cover" label="封面">
                            <CoverUpload v-model="formData.cover"></CoverUpload>
                        </el-form-item>
                        <el-form-item label="摘要" prop="summary">

                            <el-input clearable placeholder="提示信息" v-model="formData.summary" type="textarea" :rows="5"
                                :maxlength="150" resize="none" show-word-limit>

                            </el-input>
                        </el-form-item>
                        <el-form-item label="" prop="">
                            <el-button type="primary" :style="{ width: '100%' }" @click="postHandler">
                                保存
                            </el-button>
                        </el-form-item>
                    </div>
                </el-card>
            </div>

        </el-form>
    </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, watch, nextTick, registerRuntimeCompiler, } from "vue";
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';

const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();

const markdownHeight = window.innerHeight - 60 - 60;
const htmlEditorHeight = window.innerHeight - 60 - 160;

const api = {
    loadBoard: "/forum/loadBoard4Post",
    postArticle: "/forum/postArticle",
    articleDetail4Update: "/forum/articleDetail4Update",
    updateArticle: "/forum/updateArticle",
};

const articleId = ref(null);
const getArticleDetail = () => {
    nextTick(async () => {
        formDataRef.value.resetFields();
        if (articleId.value) {
            //修改
            let result = await proxy.Request({
                url: api.articleDetail4Update,
                params: {
                    articleId: articleId.value,
                },
                showError: false,
                errorCallback: (response) => {
                    ElMessageBox.alert(response.info, "错误", {
                        "show-close": false,
                        callback: (action) => {
                            router.go(-1);
                        },
                    });


                }
            });
            if (!result) {
                return;
            }
            let articleInfo = result.data.forumArticle;
            //设置编辑器
            editorType.value = articleInfo.editorType;
            //设置板块信息
            articleInfo.boardIds = [];
            articleInfo.boardIds.push(articleInfo.pBoardId);
            if (articleInfo.boardId != null && articleInfo.boardId !== 0) {
                articleInfo.boardIds.push(articleInfo.boardId);
            }
            //设置封面信息
            if (articleInfo.cover) {
                articleInfo.cover = { imageUrl: articleInfo.cover };
            }

            formData.value = articleInfo;
        } else {
            //新增
            formData.value = {};
            editorType.value = proxy.VueCookies.get("editorType" || 0)
        }
    })
}
////设置markdown编辑器的富文本信息
const setHtmlContent = (htmlContent) => {
    formData.value.content = htmlContent;
}
watch(
    () => route,
    (newVal, oldVal) => {
        if (newVal.path.indexOf("/editPost") != -1 ||
            newVal.path.indexOf("/newPost") != -1) {
            articleId.value = newVal.params.articleId;
            getArticleDetail();
        }
    },
    { immediate: true, deep: true }
)

const formData = ref({});
const formDataRef = ref();
const rules = {
    title: [{ required: true, message: "请输入内容" }],
    boardIds: [{ required: true, message: "请选择板块" }],
    content: [{ required: true, message: "请输入正文" }],
}
//提交信息
const postHandler = () => {
    formDataRef.value.validate(async (valid) => {
        if (!valid) return;
        let params = {};
        Object.assign(params, formData.value);
        if (params.boardIds.length == 1) {
            params.pBoardId = params.boardIds[0]
        } else if (params.boardIds.length == 2) {
            params.pBoardId = params.boardIds[0];
            params.boardId = params.boardIds[1];
        }
        delete params.boardIds;
        params.editorType = editorType.value;
        //获取内容
        const contentText = params.content.replace(/<(?!img).*?>/g, "");
        if (contentText == "") {
            proxy.message.warning("正文不能为空");
            return;
        }
        if (!params.cover instanceof File) {
            delete params.cover
        }
        console.log(params);
        let result=await proxy.Request({
            url:params.articleId?api.updateArticle:api.postArticle,
            params:params
        });
        if(!result) return;
        proxy.Message.success("保存成功");
        router.push(`/post/${result.data}`)
    })
}
//板块信息
const boardProps = {
    multiple: false,
    checkStrictly: true,
    value: "boardId",
    label: "boardName",
}
const boardList = ref([]);
const loadBoardList = async () => {
    let result = await proxy.Request({
        url: api.loadBoard,
    });
    if (!result) {
        return;
    }
    boardList.value = result.data;

}
loadBoardList();

//定义编辑器类型 0:富文本 1：markdown
const editorType = ref(proxy.VueCookies.get("editorType") || null);

//切换编辑器
const changeEditor = () => {
    proxy.Confirm("切换编辑器会清空正在编辑的内容，确定要切换吗？", () => {
        editorType.value = editorType.value == 0 ? 1 : 0;
        formData.value.content = "";
        formData.value.markdownContent = "";
        proxy.VueCookies.set("editorType", editorType.value, -1);
    });
};


</script>

<style lang="scss" scoped>
.edit-post {
    .post-panel {
        display: flex;

        :deep(.el-card__header) {
            padding: 10px;
        }

        .post-editor {
            margin: 5px;
            flex: 1;

            .post-editor-title {
                display: flex;
                justify-content: space-between;
                padding: 0px 10px;

                .change-editor-type {
                    cursor: pointer;

                    .iconfont {
                        color: #ff9d00;
                        font-size: 14px;
                    }

                }
            }
        }

        .post-setting {
            margin: 5px;
            width: 450px;

            .setting-inner {
                max-height: calc(100vh - 100px);
                overflow: auto;
            }
        }
    }
}
</style>
