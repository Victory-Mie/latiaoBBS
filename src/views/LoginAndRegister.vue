<template>
    <div>
        <Dialog
        :centerDialogVisible="dialogConfig.centerDialogVisible"
        :title="dialogConfig.title"
        :buttons="dialogConfig.buttons"
        width="400px"
        :showCancel="false"
        @close="dialogConfig.centerDialogVisible=false"
        >

        <el-form
        class="login-rigester" 
        :model="formData"
        :rules="rules"
        ref="formDataRef"
        
        >
        
        <el-form-item prop="email">
                <el-input
                clearable
                size="large"
                placeholder="请输入邮箱"
                v-model="formData.email"
                >
                <template #prefix>
                    <span class="iconfont icon-account"></span>
                </template>
            </el-input>
         </el-form-item> 
         <!--登录密码-->
         <el-form-item prop="password" v-if="opType==1">
                <el-input
                clearable
                size="large"
                placeholder="请输入密码"
                v-model="formData.password"
                show-password
                >
                <template #prefix>
                    <span class="iconfont icon-password"></span>
                </template>
            </el-input>
         </el-form-item>
         <!--注册验证码-->
         <el-form-item prop="emailCode" v-if="opType==0||opType==2">
            <div class="send-email-panel">
                <el-input
                clearable
                size="large"
                placeholder="请输入邮箱验证码"
                v-model="formData.emailCode"
                >
                <template #prefix>
                    <span class="iconfont icon-emailCode"></span>
                </template>
            </el-input>            
            <el-button color="#f6d365" type="primary" size="large" class="send-email-btm" @click="showSendMailDialog">获取验证码</el-button>
            </div>
         </el-form-item>
         <!--注册昵称-->
         <el-form-item prop="nickName" v-if="opType==0">
                <el-input
                clearable
                size="large"
                placeholder="请输入昵称"
                v-model="formData.nickName"
                >
                <template #prefix>
                    <span class="iconfont icon-account"></span>
                </template>
            </el-input>
         </el-form-item>
        <!--注册密码-->
        <el-form-item prop="regPassword" v-if="opType==0||opType==2">
                <el-input
                clearable
                size="large"
                placeholder="请输入密码"
                v-model="formData.regPassword"
                show-password
                >
                <template #prefix>
                    <span class="iconfont icon-password"></span>
                </template>
            </el-input>
         </el-form-item>
         <!--注册重复密码-->
         <el-form-item prop="rePassword" v-if="opType==0||opType==2">
                <el-input
                clearable
                size="large"
                placeholder="请再次输入密码"
                v-model="formData.rePassword"
                show-password
                >
                <template #prefix>
                    <span class="iconfont icon-password"></span>
                </template>
            </el-input>
         </el-form-item>
         <!--验证码-->
         <el-form-item prop="checkCode">
            <div class="check-code-panel">
                    <el-input
                clearable
                size="large"
                placeholder="请输入验证码"
                v-model="formData.checkCode"
                >
                <template #prefix>
                    <span class="iconfont icon-checkcode"></span>
                </template>
            </el-input>            
            <img :src="checkCodeUrl" class="check-code" @click="changeCheckCode(0)"/>
            </div>
         </el-form-item>

         <el-form-item v-if="opType==1">
            <div class="rememberMe-Panel">
                <el-checkbox  v-model="formData.rememberMe">记住我</el-checkbox>
            </div>
            <div class="no-account"  >
                <a href="javascript:void(0)" class="a-link" @click="showPanel(2)">忘记密码？</a>
                <a href="javascript:void(0)" class="a-link" @click="showPanel(0)">没有账号？</a>
            </div>
         </el-form-item>

         <el-form-item v-if="opType==0">
            <div class="rememberMe-Panel">
                <a href="javascript:void(0)" class="a-link" @click="showPanel(1)">已有帐号？</a>
            </div>
        </el-form-item>

        <el-form-item v-if="opType==2">
            <div class="rememberMe-Panel">
                <a href="javascript:void(0)" class="a-link" @click="showPanel(1)">去登陆</a>
            </div>
        </el-form-item>


         <el-form-item >
            <el-button type="primary" class="op-btn" color="#f6d365" @click="Submit">
                <span v-if="opType==0">注册</span>
                <span v-if="opType==1">登录</span>
                <span v-if="opType==2">重置密码</span>
            </el-button>
         </el-form-item>
        </el-form>

        </Dialog>
        <!--发送邮箱验证码验证弹框-->
        <Dialog
        :centerDialogVisible="dialog4SendCode.centerDialogVisible"
        :title="dialog4SendCode.title"
        :buttons="dialog4SendCode.buttons"
        width="400px"
        :showCancel="false"
        @close="dialog4SendCode.centerDialogVisible=false"
        >
        <el-form
        class="checkSendCode"
        :model="formData4SendCode"
        :rules="rules"
        ref="formData4SendCodeRef"
        label-width="80px"
        >
        <el-form-item label="邮箱">
               {{formData.email}}           
        </el-form-item>
        <el-form-item label="验证码" prop="checkCode">
            <div class="check-code-panel">
                <el-input
                clearable
                size="large"
                placeholder="请输入验证码"
                v-model="formData4SendCode.checkCode"
                >
                <template #prefix>
                    <span class="iconfont icon-checkcode"></span>
                </template>
            </el-input>            
            <img :src="checkCodeUrl4SendCode" class="check-code" @click="changeCheckCode(1)"/>
            </div>
        </el-form-item>
        </el-form>

        </Dialog>
    </div>
</template>

<script setup>
import md5 from "js-md5";
import { ref,reactive,getCurrentInstance,nextTick } from 'vue';
import { useRouter,useRoute } from "vue-router";
import {useStore} from "vuex";

const store=useStore();
const {proxy}=getCurrentInstance();
const router=useRouter();
const route=useRoute();

const api={
    checkCode:"./api/checkCode",
    sendMailCode:"/sendEmailCode",
    register:"/register",
    login:"/login",
    resetPwd:"/resetPwd"
};

//0onType: 0:注册； 1：登录； 2：重置密码
const opType=ref();
const showPanel=(type)=>{
    opType.value=type;
    resetForm();

};

//验证码
const checkCodeUrl=ref(api.checkCode);
const checkCodeUrl4SendCode=ref(api.checkCode);

const changeCheckCode=(type)=>{
    //普通验证码与确认发送邮箱验证码时的验证码要区别为不同url
    if(type==0){
        checkCodeUrl.value=api.checkCode+"?type="+type+"&time="+new Date().getTime();
    }else{
        checkCodeUrl4SendCode.value=api.checkCode+"?type="+type+"&time="+new Date().getTime();
    }
   
}

const formData4SendCode=ref({});
const formData4SendCodeRef=ref({});
const dialog4SendCode = reactive({
  centerDialogVisible:false,
  title: "发送邮箱验证码",
  buttons:[{
    type:"primary",
    text:"发送验证码",
    click:()=>{
        sendEmailCode();
    },
  },],  
});


//输入校验
const formData =ref({});
const formDataRef=ref();
const dialogConfig = reactive({
  centerDialogVisible:false,
  title: "标题",
 
});

//显示确认发送邮箱验证码页面
const showSendMailDialog=()=>{
    formDataRef.value.validateField("email",(valid)=>{
        if(!valid){
            return;
        }else{
            //验证通过则：显示界面，并在下次dom更新时执行回调函数。
            dialog4SendCode.centerDialogVisible=true;
            nextTick(()=>{
                changeCheckCode(1);
                formData4SendCodeRef.value.resetFields();
                formData4SendCode.value={
                    email:formData.value.email,
                }
            })
        }
    })
}
//发送邮件
const sendEmailCode=()=>{
    formData4SendCodeRef.value.validate(async (valid)=>{
        if(!valid){
            return;
        }
            const params=Object.assign({},formData4SendCode.value);
            params.type= opType.value==0? 0:1;
            let result=await proxy.Request({
                url:api.sendMailCode,
                params:params,
                errorCallback:()=>{
                    changeCheckCode(1);
                }
            });
            if(!result){
                return;
            }
    })
}

//校验注册时重复密码
const checkRePassword=(rule,value,callback)=>{
    if(value!==formData.value.regPassword){
        callback(new Error(rule.message));
    }else{
        callback();
    }
}

const rules={
    email:[{required:true,message:"请输入邮箱"},
    {max:150,message:"邮箱太长"},
    {validator:proxy.Verify.email,message:"请输入正确的邮箱"}
    ],
    password:[{required:true,message:"请输入密码"},
    {max:18,message:"密码太长"},
    {validator:proxy.Verify.password,message:"密码只能是数字，字母，下划线“_”，长度在6-18之间。"}
    ],
    regPassword:[{required:true,message:"请输入密码"},
    {max:18,message:"密码太长"},
    {validator:proxy.Verify.password,message:"密码只能是数字，字母，下划线“_”，长度在6-18之间。"}
    ],
    checkCode:[{required:true,message:"请输入图片验证码"},
    ],
    nickName:[{required:true,message:"请输入昵称"},
    {max:10,message:"昵称太长"}
    ],
    rePassword:[{required:true,message:"请输入密码"},
    {max:18,message:"密码太长"},
    {validator:checkRePassword,message:"两次输入的密码不一致"}
    ],
    emailCode:[{required:true,message:"请输入验证码"},
    ],
};

//登录、注册、重置密码：提交表单
const Submit=()=>{
    formDataRef.value.validate(async(valid)=>{
        if(!valid) return ;
        let params={};
        Object.assign(params,formData.value);

        //注册(部分功能与重置密码重合)
        if(opType.value==0||opType.value==2){
            params.password=params.regPassword;
        }
        //登录
        if(opType.value==1){
            let cookieLoginInfo=proxy.VueCookies.get("loginInfo");
            let cookiePassword= cookieLoginInfo==null? null:cookieLoginInfo.password;
            if(params.password!==cookiePassword){
                params.password=md5(params.password);
            }
        }

        let url=null;
        if(opType.value==0){
            url=api.register;
        }else if(opType.value==1){
            url=api.login;
        }else if(opType.value==2){
            url=api.resetPwd;
        } 

        let result=await proxy.Request({
            url:url,
            params:params,
            errorCallback:()=>{
                changeCheckCode(0);
            }
        })
        if(!result){
            return;
        }
        //注册返回
        if(opType.value==0){
            proxy.Message.success("注册成功！请登录~");
            showPanel(1);
        }else if(opType.value==1){
            //登录
            if(params.rememberMe){
                const loginInfo={
                    email:params.email,
                    password:params.password,
                    rememberMe:params.rememberMe,
                }
                proxy.VueCookies.set("loginInfo",loginInfo,"7d");
            }else{
                proxy.VueCookies.remove("loginInfo");
            }
            dialogConfig.centerDialogVisible=false;
            proxy.Message.success("登陆成功~");
            store.commit("updateLoginUserInfo",result.data);
        }else if(opType.value==2){
            //重置密码
            proxy.Message.success("重置成功！请登录~");
            showPanel(1);
        }
        
    })
}

//重置表单
const resetForm=()=>{
    dialogConfig.centerDialogVisible=true;
    if(opType.value==0){
        dialogConfig.title="注册";
    }else if(opType.value==1){
        dialogConfig.title="登录";
    }else if(opType.value==2){
        dialogConfig.title="重置密码";
    }
    //表单刷新
    nextTick(()=>{
        changeCheckCode(0);
        formDataRef.value.resetFields();
        formData.value={};

        if(opType.value==1){
            const cookieLoginInfo = proxy.VueCookies.get("loginInfo");
            if(cookieLoginInfo){
                formData.value=cookieLoginInfo;
            }
        }


    });
};

defineExpose({showPanel});
</script>

<style lang="scss" scoped>
.login-rigester{
    .send-email-panel{
        display: flex;
        width: 100%;
        justify-content: space-between;
        .send-email-btm{
            margin-left: 5px;
        }
    }
    .check-code-panel{
        display: flex;
        .check-code{
            margin-left: 5px;
            //手型指针
            cursor:pointer;
        }
    }
    .rememberMe-Panel{
        width:100%;
    }
    .no-account{
        width: 100%;
        display: flex;
        justify-content: space-between;
    }
    .op-btn{
        width: 100%;
    }
    
}
.checkSendCode{
    .check-code-panel{
        display: flex;
        .check-code{
            margin-left: 5px;
            //手型指针
            cursor:pointer;
        }
    }
}

// 选中且不被禁用的样式
::v-deep .el-checkbox__input.is-checked  {
    .el-checkbox__inner {
        background-color: #f6d365;
        border-color: #f6d365;
    }
}
//选中状态的文本样式
::v-deep .el-checkbox__input.is-checked +.el-checkbox__label{
    color:#f6d365!important;
}

</style>