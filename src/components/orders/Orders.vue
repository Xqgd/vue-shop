<template>
  <div>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>订单管理</el-breadcrumb-item>
        <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
        <el-row :gutter="20">
            <el-col :span="8">
                <el-input placeholder="请输入内容"  v-model="queryInfo.query" clearable @clear="getOrderList">
                    <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
                </el-input>
            </el-col>
            <el-col :span="4">
                <el-button type="primary" >添加商品</el-button>
            </el-col>
             <el-table :data="ordersList" border stripe>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="订单编号" prop="order_number" ></el-table-column>
            <el-table-column label="订单价格" prop="order_price" ></el-table-column>
            <el-table-column label="是否付款" prop="pay_status" >
                <template slot-scope="scope">
                    <el-tag v-if="scope.row.pay_status === '1'" type="success" >已付款</el-tag>
                    <el-tag v-else type="danger">未付款</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="是否发货" prop="is_send" ></el-table-column>
            <el-table-column label="下单时间" prop="create_time" >
                <template slot-scope="scope">
                    {{scope.row.create_time | dataFormat }}
                </template>
            </el-table-column>
            <el-table-column label="操作"  width="130px">
                <template >
                    <!-- 修改 -->
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox"></el-button>
                    <!-- 删除 -->
                    <el-button type="success" icon="el-icon-location" size="mini" @click="showProgress" ></el-button>     
                </template>
            </el-table-column>
        </el-table>
        </el-row>
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[ 5, 10,15]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
        </el-pagination>
    </el-card>
    <!-- 修改地址 -->
    <el-dialog
        title="修改地址"
        :visible.sync="ordersDialogVisible"
        width="50%"
        @close="addressDialogClosed">
        <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
            <el-form-item label="省市区/县" prop="address1">
                <el-input v-model="addressForm.address1"></el-input>
            </el-form-item>
            <el-form-item label="详细地址" prop="address2">
                <el-input v-model="addressForm.address2"></el-input>
            </el-form-item>
        </el-form>
       
        <span slot="footer" class="dialog-footer">
            <el-button @click="ordersDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="ordersDialogVisible = false">确 定</el-button>
        </span>
    </el-dialog>
    <!-- 时间线 -->
     <el-dialog
        title="物流进度"
        :visible.sync="progressDialogVisible"
        width="50%"
        >
        <el-form :model="progressForm"  label-width="100px">
            <!-- 时间线 -->
            <el-timeline :reverse="reverse">
                <el-timeline-item
                v-for="(activity, index) in progressInfo"
                :key="index"
                :timestamp="activity.time">
                {{activity.context}}
                </el-timeline-item>
            </el-timeline>
        </el-form>
       
        <span slot="footer" class="dialog-footer">
            <el-button @click="progressDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="progressDialogVisible = false">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
    data(){
        return{
            queryInfo:{
                query:'',
                pagenum:1,
                pagesize:10,
            },
            ordersList:[],
            total:0,
            ordersDialogVisible:false,
            addressForm:{
                address1:[],
                address2:''
            },
            addressFormRules:{
                address1:[
                     { required: true, message: '请选择省市区', trigger: 'blur' },
                ],
                address2:[
                     { required: true, message: '请输入详细地址', trigger: 'blur' },
                ]
            },
            progressDialogVisible:false,
            progressForm:{},
            progressInfo:[],
            reverse: true,

        }
    },
    created(){
        this.getOrderList()
    },
    methods:{
        async getOrderList(){
            const {data:res} = await this.$http.get('orders',{
                params:this.queryInfo
            })
             if(res.meta.status !== 200){
               return this.$message.error('获取商品分类数据失败')
            } 
            this.ordersList = res.data.goods
            this.total = res.data.total
        },
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize
            this.getOrderList()
        },
        // 监听 页码值 改变的事件
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage
            this.getOrderList()
        }, 
        showBox(){
            this.ordersDialogVisible = true
        },
        addressDialogClosed(){
            this.$refs.addressFormRef.resetFields()
        },
        async showProgress(){
            const {data:res} = await this.$http.get('/kuaidi/1106975712662')
            if(res.meta.status !== 200){
               return this.$message.error('获取物流信息失败')
            } 
            this.progressInfo = res.data
            this.progressDialogVisible =true
            console.log(this.progressInfo);
        }
    }
}
</script>

<style>

</style>