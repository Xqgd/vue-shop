<template>
  <div>
       <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-alert title="注意:只允许为第三方分类设置相关系数" type="warning" show-icon
            :closable="false"></el-alert>
            <el-row class="cat_opt">
                <el-col>
                    <span>选择商品分类：</span>
                    <el-cascader v-model="selectedKeys" ref="cascaderHandle"
                        :options="cateList" 
                        :props="{ expandTrigger: 'hover', value:'cat_id',
                        label:'cat_name',children:'children',checkStrictly: true }"
                        @change="parentCateChange" clearable
                    ></el-cascader>
                </el-col>
            </el-row>
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" size="mini"
                    :disabled= "isBtndisable" @click="addDialogVisible = true" >添加参数</el-button>
                    <!-- 动态参数表格 -->
                    <el-table :data="manyTableData" border stripe>
                        <!-- 展开行 -->
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i"
                                 closable  @close="handleClose(i,scope.row)">
                                    {{item}}
                                </el-tag>
                                <el-input class="input-new-tag"
                                    v-if= "scope.row.inputVisible"
                                    v-model= "scope.row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="#" ></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作" >
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini" 
                                @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini"
                                @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>             
                </el-tab-pane>

                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" size="mini"
                    :disabled = "isBtndisable" @click="addDialogVisible = true">添加属性</el-button>
                    <!-- 静态表格 -->
                    <el-table :data="onlyTableData">
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i"
                                 closable  @close="handleClose(i,scope.row)">
                                    {{item}}
                                </el-tag>
                                <el-input class="input-new-tag"
                                    v-if= "scope.row.inputVisible"
                                    v-model= "scope.row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="#"  ></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作" >
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini" 
                                @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini"
                                @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>
        <!-- 添加对话框 -->
        <el-dialog :title= " '添加' + titleText"
            :visible.sync="addDialogVisible"
            width="50%" @close="addDialogClosed" >
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" 
            label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name" ></el-input>
                </el-form-item>
                
            </el-form>

            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParams" >确 定</el-button>
            </span>
        </el-dialog>
        <!-- 编辑对话框 -->
         <el-dialog :title= " '修改' + titleText"
            :visible.sync="editDialogVisible"
            width="50%" @close="editDialogClosed" >
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" 
            label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name" ></el-input>
                </el-form-item>
                
            </el-form>

            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParams" >确 定</el-button>
            </span>
        </el-dialog>
  </div>
</template>

<script>
export default {
    data(){
        return{
            cateList:[],
            selectedKeys:[],
            activeName:'many',
            // 动态参数数组
            manyTableData:[],
            // 静态数组
            onlyTableData:[],
            addDialogVisible:false,
            addForm:{
                attr_name:''
            },
            addFormRules:{
                attr_name:[
                    { required: true, message: '请输入分类名称', trigger: 'blur' },
                    { min: 1, max: 15, message: '长度在 1 到 15 个字符', trigger: 'blur' }
                ]
            },
            editDialogVisible:false,
            editForm:{},
            editFormRules:{
                attr_name:[
                    { required: true, message: '请输入分类名称', trigger: 'blur' },
                    { min: 1, max: 15, message: '长度在 1 到 15 个字符', trigger: 'blur' }
                ]
            },
            // inputVisible: false,
            // inputValue:'',


        }
    },
    created(){
        this.getCateList()
    },
    methods:{
        async getCateList(){
            const {data:res} = await this.$http.get('categories')
            if(res.meta.status !==200){
                return this.$message.error('获取商品分类失败')
            }
            // console.log(res.data);
            this.cateList= res.data
            // this.total = res.data.total
        },
        parentCateChange(){
           this.getParamsData()
        },
        async getParamsData(){
             if(this.selectedKeys.length !== 3){
                this.selectedKeys = []
                this.manyTableData = []
                this.onlyTableData = []
                this.$refs.cascaderHandle.dropDownVisible = false;
                return
            }    
            this.$refs.cascaderHandle.dropDownVisible = false;    
            const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,
            { params: {sel: this.activeName}}) 
            if(res.meta.status !==200){
                return this.$message.error('获取参数列表失败')
            }
          
            res.data.forEach(item=> {
                item.attr_vals = item.attr_vals ?
                item.attr_vals.split(',') : []
                // 控制文本框的显示和隐藏
                item.inputVisible = false
                // 文本框中输入的值
                item,this.inputValue = ''
            });
            //   console.log(res.data); 
            if(this.activeName === 'many'){
                this.manyTableData = res.data
            }
            else{
                this.onlyTableData = res.data

            }
        },
        handleTabClick(){
            this.getParamsData()
        },
         addDialogClosed(){
            this.$refs.addFormRef.resetFields()
        },
        addParams(){
            this.$refs.addFormRef.validate( async valid => {
                if(!valid) return
                const {data:res} = await this.$http.post(`categories/${this.cateId}/attributes  `,{
                    attr_name:this.addForm.attr_name,
                    attr_sel:this.activeName})
                   
                if(res.meta.status !==201) return this.$message.error('添加参数失败！')
                // console.log(res);
                this.$message.success('添加参数成功')
                this.addDialogVisible = false
                this.getParamsData()
            })
        },
        async showEditDialog(attr_id){
            const {data:res} = await this.$http.get(
                `categories/${this.cateId}/attributes/${attr_id}`,{
                    params:{attr_sel:this.activeName}
                })
            if(res.meta.status !==200){
                return this.$message.error('获取参数信息失败！')
            }
            // console.log(res.data);
            this.editForm = res.data
            this.editDialogVisible = true
        },
        editDialogClosed(){
            this.$refs.editFormRef.resetFields()
        },
        editParams(){
            this.$refs.editFormRef.validate( async valid =>{
                if(!valid) return
                const {data:res} = await this.$http.put(
                `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,{
                    attr_name:this.editForm.attr_name,
                    attr_sel:this.activeName
                })
            if(res.meta.status !==200){
                return this.$message.error('修改参数信息失败！')
            }
            this.$message.success('修改参数信息成功！')
            this.getParamsData()
            this.editDialogVisible = false
            })
        },
        async removeParams(attr_id){
             const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
                }).catch(err => err)
                // console.log(confirmResult);
                // 确认删除 confirm 取消 cancel
                if(confirmResult !== 'confirm') return this.$message.info('取消了删除！')
                const {data:res} =  await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)  
                // console.log(res);  
                if(res.meta.status !==200) {
                    return this.$message.error('删除失败')
                }
                this.$message.success('删除成功')
                this.getParamsData()
        },
        handleClose(i,row) {
            row.attr_vals.splice(i, 1);
            this.setAttrVals(row)
        },
        // 文本框失去了焦点，或按了enter 都会触发
        async handleInputConfirm(row){
            // trim() 去除两边的空格
            if(row.inputValue.trim().length === 0) {
                row.inputValue = ''
                row.inputVisible = false
                return
            }
            // 没有return 则需要进行下一步处理
            row.attr_vals.push(row.inputValue.trim())
            row.inputValue = ''
            row.inputVisible = false
            // 需要发起请求 ，保存这次操作
            this.setAttrVals(row)

        },
        async setAttrVals(row){
             const {data:res} = await this.$http.put(
                `categories/${this.cateId}/attributes/${row.attr_id}`,{
                    attr_name: row.attr_name,
                    attr_sel: row.attr_sel,
                    attr_vals: row.attr_vals.join(',')
                })
            if(res.meta.status !==200) return this.$message.error('修改参数失败！')
                // console.log(res);
                this.$message.success('修改参数成功')  
        },
        showInput(row){
            row.inputVisible =true
            // $nextTick 当页面被重新渲染之后，才会指定回调函数中的代码
            this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus();
            });
        }

    },
    computed:{
        // 如果按钮需要禁用，返回true
        isBtndisable(){
            if(this.selectedKeys.length !==3){
                return true
            }
            return false
        },
        // 当前选中的三级分类ID
        cateId(){
            if(this.selectedKeys.length === 3){
                return this.selectedKeys[2]
            }
            return null
        },
        titleText(){
            if(this.activeName === 'many'){
                return '动态参数'
            }
            return '静态参数'
        }
    }
}
</script>

<style lang="less" scoped>
    .cat_opt{
        margin: 15px 0 ;
    }
    .el-tag{
        margin: 10px;
    }
    .input-new-tag {
    width: 100px;
    margin-left: 10px;
    vertical-align: center;
  }
</style>
    
