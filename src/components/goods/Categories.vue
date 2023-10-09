<template>
    <div>
         <!-- 面包屑导航  -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
                </el-col>
            </el-row>
            <!-- 表格 -->
            <tree-table :data="cateList" :columns="columns"
            show-index index-text='#' :selection-type="false" 
            :expand-type="false" border :show-row-hover='false'>
                <!-- 是否有效 自定义模板 -->
                <template slot="isok" slot-scope="scope">
                    <i class="el-icon-success" v-if="scope.row.cat_deleted === false"
                     style="color: lightgreen"></i>
                    <i class="el-icon-error" v-else style="color: red"></i>
                </template>
                 <!-- 排序 自定义模板 -->
                <template slot="order" slot-scope="scope">
                    <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
                      <el-tag v-if="scope.row.cat_level === 1" type="success">二级</el-tag>
                      <el-tag v-if="scope.row.cat_level === 2" type="warning">三级</el-tag>
                </template>
                <!-- 操作  自定义模板-->
                <template slot="opt" slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini"
                   @click="showCateDialog(scope.row.cat_id)">编辑</el-button>
                    <el-button type="danger" icon="el-icon-dalete" size="mini"
                    @click.prevent="onRemove(scope.row.cat_id)">删除</el-button>
                </template>

            </tree-table>
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
            <!-- 添加分类对话框 -->
            <el-dialog title="分配角色"
            :visible.sync="addCateDialogVisible"
            width="50%" @close="addCateDialogClosed" >
            <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" 
            label-width="100px">
                <el-form-item label="分类名称:" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name" ></el-input>
                </el-form-item>
                <el-form-item label="父级分类:" >
                    <!-- options 用来指定数据源 -->
                    <el-cascader v-model="selectedKeys" ref="cascaderHandle"
                        :options="parentCateList" 
                        :props="{ expandTrigger: 'hover', value:'cat_id',
                        label:'cat_name',children:'children',checkStrictly: true }"
                        @change="parentCateChange" clearable
                ></el-cascader>
                </el-form-item>
            </el-form>

            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate" >确 定</el-button>
            </span>
        </el-dialog>
        <!-- 修改分类 -->
        <el-dialog title="修改分类"
            :visible.sync="editCateDialogVisible"
            width="50%" >
            <el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef" 
            label-width="100px">
                <el-form-item label="分类名称:" prop="cat_name">
                    <el-input v-model="editCateForm.cat_name" ></el-input>
                </el-form-item>     
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editCateInfo" >确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data(){
        return {
            queryInfo:{
                type:3,
                pagenum:1,
                pagesize:5
            },
            cateList:[],
            total:0,
            columns:[
                {
                    label:'分类名称',
                    prop:'cat_name'
                },
                {
                    label:'是否有效',
                    type:'template',
                    template:'isok'
                },
                {
                    label:'排序',
                    type:'template',
                    template:'order'
                },
                {
                    label:'操作',
                    type:'template',
                    template:'opt'
                }
            ],
            addCateDialogVisible:false,
            addCateForm:{
                cat_name:'',
                cat_pid: 0 ,
                cat_level:0 
            },
            addCateFormRules:{
                cat_name:[
                    { required: true, message: '请输入分类名称', trigger: 'blur' },
                    { min: 1, max: 15, message: '长度在 1 到 15 个字符', trigger: 'blur' }
                ]
            },
            parentCateList:[],
            selectedKeys:[],
            editCateDialogVisible:false,
            editCateForm:{},
            editCateFormRules:{

            },
            
            cat_id:''

        }
    },
    created(){
        this.getCateList()
    },
    methods:{
        async getCateList(){
            const {data:res} = await this.$http.get('categories',{
                params:this.queryInfo
            })
            if(res.meta.status !==200){
                return this.$message.error('获取商品分类失败')
            }
            // console.log(res.data);
            this.cateList= res.data.result
            this.total = res.data.total

        },
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize
            this.getCateList()
        },
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage
            this.getCateList()
        },
        showAddCateDialog(){
            this.getParentCateList()
            this.addCateDialogVisible = true

        },
        // 获取父级分类列表
        async getParentCateList(){
            const {data:res} = await this.$http.get('categories',{
                params:{ type:2 } 
            })
            if(res.meta.status !==200){
                return this.$message.error('获取父级分类失败')
            }
            // console.log(res.data);
            this.parentCateList = res.data

        },
        parentCateChange(){
            // 如果 selectedKeys 数组中的 length 大于0 ，证明选中的是父级分类
            // 反之，就说明没有选择任何父级分类
            if(this.selectedKeys.length > 0){
                // 父级分类的id
                this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length -1]
                // 为当前分类的等级赋值
                this.addCateForm.cat_level = this.selectedKeys.length
                this.$refs.cascaderHandle.dropDownVisible = false;
                return
            }else{
                this.addCateForm.cat_pid = 0
                // 为当前分类的等级赋值
                this.addCateForm.cat_level = 0
            }
            this.$refs.cascaderHandle.dropDownVisible = false;

        },
        addCate(){
            // console.log(this.addCateForm);
            this.$refs.addCateFormRef.validate( async valid => {
                if(!valid) return
                const {data:res} = await this.$http.post('categories' ,this.addCateForm)
                   
                if(res.meta.status !==201) return this.$message.error('添加分类失败！')
                // console.log(res);
                this.$message.success('添加分类成功')
                this.addCateDialogVisible = false
                this.getCateList()
            })
        },
        addCateDialogClosed(){
            this.$refs.addCateFormRef.resetFields()
            this.selectedKeys = []
            this.addCateForm.cat_pid = 0
            this.addCateForm.cat_level = 0
        },
        async showCateDialog(cat_id){
            const {data:res} = await this.$http.get('categories/' + cat_id)
            // console.log(res);
            if(res.meta.status !== 200){
                return this.$message.error('查询用户信息失败')
            }
            this.editCateForm = res.data
            this.getParentCateList()
            this.editCateDialogVisible = true
        },
        async onRemove(cat_id){
            const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
                }).catch(err => err)
                // console.log(confirmResult);
                // 确认删除 confirm 取消 cancel
                if(confirmResult !== 'confirm') return this.$message.info('取消了删除！')
                const {data:res} =  await this.$http.delete('categories/' + cat_id)  
                // console.log(res);  
                if(res.meta.status !==200) {
                    return this.$message.error('删除失败')
                }
                this.$message.success('删除成功')
                this.getCateList()
            },
            editCateInfo(){
                this.$refs.editCateFormRef.validate( async valid => {
                if(!valid) return
                const {data:res} = await this.$http.put('categories/' + this.editCateForm.cat_id ,{
                    cat_name:this.editCateForm.cat_name})
                   
                if(res.meta.status !==200) return this.$message.error('更新用户失败！')
                console.log(res);
                this.$message.success('更新用户成功')
                this.editCateDialogVisible = false
                this.getCateList()
            })
            },
            
    }
}
</script>

<style>
    .el-cascader{
        width: 100%;   
    }
     .el-cascader-panel .el-radio{
        width: 100%;
        height: 100%;
        z-index: 10;
        position: absolute;
        top: 10px;
        right: 10px;
    }
    .el-cascader-panel .el-radio__input{
        visibility: hidden;
    }
    .el-cascader-panel .el-cascader-node__postfix {
        top: 10px;
    }
</style>