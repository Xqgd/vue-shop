<template>
  <div>
        <!-- 面包屑导航  -->
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
        <!-- 搜索与添加 -->
        <el-row :gutter="20">
            <el-col :span="8">
                <el-input placeholder="请输入内容"  v-model="queryInfo.query" clearable @clear="getUserList">
                    <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                </el-input>
            </el-col>
            <el-col :span="4">
                <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
            </el-col>
        </el-row>
        <!-- table -->
        <el-table :data="userList" border stripe>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="姓名" prop="username"></el-table-column>
            <el-table-column label="邮箱" prop="email"></el-table-column>
            <el-table-column label="电话" prop="mobile"></el-table-column>
            <el-table-column label="角色" prop="role_name"></el-table-column>
            <el-table-column label="状态" prop="mg_state">
                <template slot-scope="scope">
                    <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)" >
                        </el-switch>
                </template>
            </el-table-column>
            <el-table-column label="操作" prop="role_name" width="180px">
                <template slot-scope="scope">
                    <!-- 修改 -->
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
                    <!-- 删除 -->
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click.prevent="onRemove(scope.row.id)"></el-button>
                    <el-tooltip  effect="dark" content="分配角色" placement="bottom" :enterable="false">
                        <el-button type="warning" icon="el-icon-setting" size="mini"
                         @click="setRole(scope.row)" ></el-button>
                    </el-tooltip>
                    
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
    <!-- 添加用户对话框 -->
    <el-dialog
        title="添加用户"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="onDialogClosed">
         <!-- 添加用户表单 -->
        <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addFormRef">
            <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password" ></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
            </el-form-item>
            <el-form-item label="手机" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
     <el-dialog
        title="修改用户"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed">
         <!-- 添加用户表单 -->
        <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editFormRef">
            <el-form-item label="用户名" >
            <el-input v-model="editForm.username" disabled></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
            </el-form-item>
            <el-form-item label="手机" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editUserInfo" >确 定</el-button>
        </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色"
        :visible.sync="setRolesDialogVisible"
        width="50%" @close="setRolesDialogClosed" >
        <div>
            <p>当前的用户：{{userInfo.username}}</p>
            <p>当前的角色：{{userInfo.role_name}}</p>
            <p>分配的新角色：
                <el-select v-model="selectRoleId" placeholder="请选择">
                    <el-option
                    v-for="item in rolesList"
                    :key="item.id"
                    :label="item.roleName"
                    :value="item.id">
                    </el-option>
                </el-select>
            </p>

        </div>
        <span slot="footer" class="dialog-footer">
            <el-button @click="setRolesDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="saveRolesInfo" >确 定</el-button>
        </span>
    </el-dialog>
  </div>

    
</template>

<script>
export default {
    data(){
        // 验证邮箱的规则
        var checkemail = (rule, value, callback) => {
            const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
            if(regEmail.test(value)){
                return callback()
            }
            callback(new Error('请输入合法的邮箱'))
      }
        var checkemobile = (rule, value, callback) => {
            const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
            if(regMobile.test(value)){
                return callback()
            }
            callback(new Error('请输入合法的手机号'))
      };
        return {
            queryInfo:{
                query: '',
                pagenum: 1,
                pagesize: 2
            },
            userList:[],
            total: 0,
            
            addDialogVisible:false,
            editDialogVisible:false,
            // 添加用户的表单数据
            addForm:{
                username:'',
                password:'',
                email:'',
                mobile:''
            },
            // 添加表单的验证规则
            addFormRules: {
                username: [
                { required: true, message: '用户名是必填项', trigger: 'blur' },
                { min: 1, max: 15, message: '长度在 1 到 15 个字符', trigger: 'blur' }
                ],
                password: [
                { required: true, message: '密码是必填项', trigger: 'blur' },
                { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
                ],
                email: [
                { required: true, message: '邮箱是必填项', trigger: 'blur' },
                { validator:checkemail, trigger: 'blur' }
                ],
                 mobile: [
                { required: true, message: '手机是必填项', trigger: 'blur' },
                { validator:checkemobile, trigger: 'blur' }
                ],
            
            },
            // 查询到的用户的表单数据
            editForm:{},
            // 修改表单的验证规则
            editFormRules:{
                email: [
                { required: true, message: '邮箱是必填项', trigger: 'blur' },
                { validator:checkemail, trigger: 'blur' }
                ],
                 mobile: [
                { required: true, message: '手机是必填项', trigger: 'blur' },
                { validator:checkemobile, trigger: 'blur' }
                ],
            },
            userInfo: {},
            setRolesDialogVisible: false,
            rolesList:{},
            selectRoleId:''
        }
    },
    created(){
        this.getUserList()
    },
    methods:{
        async getUserList(){
           const {data:res} = await this.$http.get('users',{params: this.queryInfo})
           if(res.meta.status !== 200){
               return this.$message.error('获取用户列表失败')
           } 
            this.userList = res.data.users
            this.total = res.data.total
        //    console.log(res);
        },
        // 监听 pageszie 改变的事件
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize
            this.getUserList()
        },
        // 监听 页码值 改变的事件
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage
            this.getUserList()
        },
        async userStateChanged(userinfo){
            // console.log(userinfo);
            const {data:res} = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
            if(res.meta.status !== 200){
                userinfo.mg_state = !userinfo.mg_state
                return this.$message.error('更新用户状态失败')
            }
            this.$message.success('更新用户状态成功')
        },
        // 监听对话框关闭的事件
        onDialogClosed(){
            // 调用from组件的resetFields方法，重置表单
            this.$refs.addFormRef.resetFields()
        },
        editDialogClosed(){
            this.$refs.editFormRef.resetFields()
        },
        addUser(){
            this.$refs.addFromRef.validate( async valid => {
                if(!valid) return
                const {data:res} = await this.$http.post('/users',this.addForm)
                if(res.meta.status !==201) return this.$message.erro('添加失败！')
                this.$message.success('添加成功')
                this.addDialogVisible = false
                this.getUserList()
            }) 
        },
        async showEditDialog(id){
            const {data:res} = await this.$http.get('/users/' + id)
            if(res.meta.status !== 200){
                return this.$message.error('查询用户信息失败')
            }
            this.editForm = res.data
            this.editDialogVisible = true
        },
        editUserInfo(){
             this.$refs.editFormRef.validate( async valid => {
                if(!valid) return
                const {data:res} = await this.$http.put('users/' +this.editForm.id ,{
                    email: this.editForm.email,
                    mobile:this.editForm.mobile})
                if(res.meta.status !==200) return this.$message.error('更新用户失败！')
                this.$message.success('更新用户成功')
                this.editDialogVisible = false
                this.getUserList()
            }) 
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
                const {data:res} =  await this.$http.delete('users/' + id)  
                 
                if(res.meta.status !==200) {
                    return this.$message.error('删除失败')
                }
                this.$message.success('删除成功')
                this.getUserList()
            },
            async setRole(userInfo){
                this.userInfo = userInfo
                const {data:res} = await this.$http.get('roles')
                 if(res.meta.status !==200) {
                    return this.$message.error('获取角色列表失败')
                }
                this.rolesList = res.data
                this.setRolesDialogVisible = true
            },
            async saveRolesInfo(){
                if(!this.selectRoleId){
                    return this.$message.error('请选择要分配的角色')
                }
                const {data:res} = await this.$http.put(`/users/${this.userInfo.id}/role`,
                {rid: this.selectRoleId})
                if(res.meta.status !==200) {
                    return this.$message.error('更新角色失败')
                }

                this.$message.success('更新角色成功')
                this.getUserList()
                this.setRolesDialogVisible = false

            },
            setRolesDialogClosed(){
                this.selectRoleId =''
                this.userinfo = {}
            }
    }
}
</script>

<style>

</style>