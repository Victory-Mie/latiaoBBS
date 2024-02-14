import { createApp } from 'vue'
import App from './App.vue'

//引入router
import router from './router'

//引入cookies
import VueCookies from 'vue-cookies'
//引入element plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// collapse
import { ElCollapseTransition } from 'element-plus'

//我们使用sass 所以这里将base.css 改成base.scss
import '@/assets/base.scss'

//图标 图标在附件中
import '@/assets/icon/iconfont.css'
import './assets/base.scss'

//引入store
import store from './store'

//全局方法
import Confirm  from './utils/Confirm'
import Verify  from './utils/Verify'
import Message from './utils/Message'
import Request from './utils/Request'
//全局组件
import Dialog from "@/components/Dialog.vue"
import Avatar from "@/components/Avatar.vue"
import Cover from "@/components/Cover.vue"
import DataList from "@/components/DataList.vue"
import NoData from "@/components/NoData.vue"
import EditorHtml from "@/components/EditorHtml.vue"
import EditorMarkdown from "@/components/EditorMarkdown.vue"
import CoverUpload from "@/components/CoverUpload.vue"
//创建并挂载根实例
const app = createApp(App)
//确保 _use_ 路由实例使整个应用支持路由。
app.use(router)

app.use(store)
app.use(ElementPlus);
app.config.globalProperties.VueCookies = VueCookies;

app.config.globalProperties.globalInfo={
    bodyWidth:1300,
    avatarUrl:"/api/file/getAvatar/",
    imageUrl:"/api/file/getImage/",
}
app.config.globalProperties.Confirm=Confirm;
app.config.globalProperties.Verify=Verify;
app.config.globalProperties.Message=Message;
app.config.globalProperties.Request=Request;

app.component(ElCollapseTransition.name, ElCollapseTransition)
app.component("Dialog",Dialog);
app.component("Avatar",Avatar);
app.component("Cover",Cover);
app.component("DataList",DataList);
app.component("NoData",NoData);
app.component("EditorHtml",EditorHtml);
app.component("EditorMarkdown",EditorMarkdown);
app.component("CoverUpload",CoverUpload);
app.mount('#app')
