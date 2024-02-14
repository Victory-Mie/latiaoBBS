<template>
    <div class="cover" :style="{width:width+'px',height:width+'px'}">
        <el-image :style="{width:width+'px',height:width+'px'}" fit="scale-down" laoding="lazy"
        :src="proxy.globalInfo.imageUrl+cover">


        </el-image>
    </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from "vue"
const { proxy } = getCurrentInstance();
const props=defineProps({
    cover:{
        type:String,
    },
    width:{
        type:Number,
        default:100,
    },
});
</script>

<style lang="scss">
.cover{
    background:#f0f0f0;
    border-radius:5px;
    overflow:hidden;
}
</style>