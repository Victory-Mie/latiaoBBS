<template>
    <div v-if="!loading&& dataSource.list != null && dataSource.list.length==0">
        <NoData :msg="noDataMsg"/>
    </div>
    <div class="skeleton" v-if="loading">
        <el-skeleton :rows="5" animated :throttle="500"/>
    </div>
    <div v-for="item in dataSource.list" v-if="!loading">
        <slot :data="item"> </slot>
    </div>
    <div class="pagination">
        <el-pagination
        v-if="dataSource.pageTotal > 1"
        background
        :total="dataSource.totalCount"
        :current-page.sync="dataSource.pageNo"
        layout="prev, pager, next, jumper"
        @current-change="handleCurrentChange"
        :page-size="15"
        />
    </div>
</template>

<script setup>
import { ref } from 'vue'

const props=defineProps({
    dataSource:{
        type:Object,
    },
    loading:{
        type:Boolean,
    }, 
    noDataMsg: {
    type: String,
    default: "空空如也",
  },
});

const emit=defineEmits(["loadData"]);
const handleCurrentChange = (pageNo) => {
   // console.log(pageNo);
    props.dataSource.pageNo=pageNo;
    emit("loadData");
};
</script>

<style lang="scss">
.pagination{
    padding:5px;
}
.el-pagination{
    --el-pagination-hover-color:#ffba00;
}
.el-pagination.is-background .el-pager li.is-active {
    background-color:#f6d365;
    color:#fff;
}
.skeleton{
    padding:5px;
}
</style>

