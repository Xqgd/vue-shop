<template>
  <div>
    <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
        <el-row :gutter="20">
            <el-col :span="8">
                <el-input placeholder="请输入内容"  v-model="queryInfo.query" clearable @clear="getGoodsList">
                    <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                </el-input>
            </el-col>
            <el-col :span="4">
                <el-button type="primary" @click="goAddPage">添加商品</el-button>
            </el-col>
        </el-row>
         <el-table :data="goodsList" border stripe>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="商品名称" prop="goods_name" ></el-table-column>
            <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
            <el-table-column label="商品数量" prop="goods_number" width="70px"></el-table-column>
            <el-table-column label="创建时间" prop="add_time" width="140px">
                <template slot-scope="scope">
                    {{scope.row.add_time | dataFormat }}
                </template>
            </el-table-column>
            <el-table-column label="操作"  width="130px">
                <template slot-scope="scope">
                    <!-- 修改 -->
                    <el-button type="primary" icon="el-icon-edit" size="mini" ></el-button>
                    <!-- 删除 -->
                    <el-button type="danger" icon="el-icon-delete" size="mini"
                     @click.prevent="onRemove(scope.row.goods_id)" ></el-button>     
                </template>
            </el-table-column>
        </el-table>
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[1, 2, 5, 10]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
        </el-pagination>
    </el-card>
    
  </div>
</template>

<script>
export default {
    data(){
        return {
            queryInfo:{
                query:'',
                pagenum: 1,
                pagesize: 10
            },
            goodsList:[],
            total: 0,
            addDialogVisible: false,

        }
    },
    created(){
        this.getGoodsList()
    },
    methods:{
        async getGoodsList(){
            const {data:res} = await this.$http.get('goods',{params: this.queryInfo})
           if(res.meta.status !== 200){
               return this.$message.error('获取商品列表失败')
           } 
        //    console.log(res.data.goods);
            this.goodsList = res.data.goods
            this.total = res.data.total
        },
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize
            this.getGoodsList()
        },
        // 监听 页码值 改变的事件
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage
            this.getGoodsList()
        }, 
        async onRemove(id){
            const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
                }).catch(err => err)
                // console.log(confirmResult);
                // 确认删除 confirm 取消 cancel
                if(confirmResult !== 'confirm') return this.$message.info('取消了删除！')
                const {data:res} =  await this.$http.delete('goods/' + id)  
                 
                if(res.meta.status !==200) {
                    return this.$message.error('删除失败')
                }
                this.$message.success('删除成功')
                this.getGoodsList()
        },
        goAddPage(){
           this.$router.push('goods/add')
        }
    }
}
</script>

<style>

</style>