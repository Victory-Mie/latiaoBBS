<template>
    <div class="no-data">
        <el-empty :image-size="200" description="啥也没有"/>
    </div>
</template>
 
<script setup>
const props=defineProps({
    msg:{
        type:String,
    },
});

</script>

<style lang="scss">

</style>