import axios from "axios";
//Loading 还可以以服务的方式调用。 你可以像这样引入 Loading 服务：
import { ElLoading } from "element-plus";
import Message from "@/utils/Message";
import store from "vuex";

const contentTypeForm = "application/x-www-form-urlencoded;charset=UTF-8"
const contentTypeJson = "application/json"



//自定义配置新建一个实例
const instance = axios.create({
    baseURL: "/api",
    timeout: 10 * 1000,
})

let loading = null;

//请求前过滤器
instance.interceptors.request.use((config) => {
    // 在发送请求之前做些什么
    if (config.showLoading) {
        loading = ElLoading.service({
            lock: true,
            text: "加载中......(●'◡'●)",
            background: 'rgba(0,0,0,0,7)'
        })
    }
    return config;
}, (error) => {
    console.log("error")
    // 对请求错误做些什么
    if (error.config.showLoading && loading) {
        loading.close();
    }
    Message.error("请求发送失败。");
    return Promise.reject("请求发送失败");
});

//请求后过滤器
instance.interceptors.response.use((response) => {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    const { showLoading, errorCallback, showError } = response.config;
    if (showLoading && loading) {
        loading.close();
    }
    const responseData = response.data;
    if (responseData.code == 200) {
        return responseData;
    } else if (responseData.code == 901) {
        store.commit("showLogin", true);
        store.commit("updateLoginUserInfo", null);
        return Promise.reject({ showError: false, msg: "登陆超时" });
    } else {
        if (errorCallback) {
            errorCallback(responseData)
        }
        return Promise.reject({ showError: showError, msg: responseData.info });
    }
}, (error) => {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    if (error.config.showLoading && loading) {
        loading.close();

    }
    return Promise.reject({ showError: true, msg: "网络异常" });
});


const request = (config) => {
    const { url, params, dataType, showLoading = true, errorCallback, showError = true } = config;
    let contentType = contentTypeForm;
    let formData = new FormData();
    for (let key in params) {
        formData.append(key, params[key] == undefined ? '' : params[key]);
    }
    if (dataType != null && dataType == Json) {
        contentType = contentTypeJson;
    }
    let header = {
        'Content-Type': contentType,
        'X-Request-With': 'XMLHttpRequest',
    }
    return instance.post(url, formData, {
        header: Headers,
        showLoading: showLoading,
        errorCallback: errorCallback,
        showError: showError,
    }).catch(error => {
        if (error.showError) {
            Message.error(error.msg);
        }
        return null;
    })

}

export default request;

/*
这段代码定义了一个自定义的 HTTP 请求函数 request，
它基于 axios 库实现，支持发送 POST 请求，并在请求前后添加了拦截器。

具体来说，代码中使用了以下变量和对象：
axios: 一个第三方 HTTP 客户端库，用于发送 HTTP 请求。
ElLoading: 一个 Vue 3 组件库（Element Plus）中的 Loading 组件，用于显示加载中的动画效果。
Message: 一个自定义的消息提示框组件，用于显示请求错误信息。
store: 一个 Vuex Store 实例，用于管理应用程序的状态。

函数 request 的实现如下：
首先，根据传入的 config 参数解构出请求的 URL、请求参数、数据类型、
是否显示加载中动画、请求错误回调函数、是否显示请求错误信息等参数。
然后，根据数据类型设置请求头的 Content-Type 字段
（默认为 application/x-www-form-urlencoded;charset=UTF-8），
并将请求参数转换为 FormData 格式。

接下来，使用 instance.post 方法发送 POST 请求，
并传入请求的 URL、请求参数、请求头、是否显示加载中动画、请求错误回调函数、是否显示请求错误信息等参数。
这里使用了 instance 对象，它是通过 axios.create 方法创建的一个新的 axios 实例，
可以自定义请求配置（例如 baseURL、timeout 等）。

在请求前后，我们使用 instance.interceptors 对象添加了请求拦截器和响应拦截器。
请求拦截器可以在请求发送前拦截请求，并添加一些额外的配置；响应拦截器可以在响应返回后拦截响应，并对响应数据进行处理。
在这个例子中，请求拦截器用于显示 Loading 动画，响应拦截器用于处理响应数据和错误信息，并关闭 Loading 动画。

最后，我们将 request 函数导出，以便在其他模块中使用。
通常情况下，我们可以在 Vue.js 的组件中通过引入 request 函数来发送 HTTP 请求，并将响应数据绑定到组件的数据中进行渲染。
*/