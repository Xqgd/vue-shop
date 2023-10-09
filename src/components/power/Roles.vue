<template>
  <div>
    <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
        <el-row>
            <el-col>
                <el-button type="primary"  @click="addDialogVisible = true">添加角色</el-button>
            </el-col>
        </el-row>
        <el-table :data="rolesList" border stripe>
            <el-table-column type="expand">
                <template slot-scope="scope">
                    <!-- <pre>{{scope.row}}</pre> -->
                    <el-row :class="['bdbottom' , i1 === 0 ? 'bdtop' : '','vcenter']" v-for="(item1 ,i1) in scope.row.children" :key="item1.id">
                        <!-- 一级权限 -->
                        <el-col :span="5"> 
                            <el-tag closable @close="removeRightById(scope.row,item2.id)">
                                {{item1.authName}}
                            </el-tag>
                            <i class="el-icon-caret-right"></i>
                        </el-col>
                        <!-- 二级和三级权限 -->
                        <el-col :span="19">
                            <el-row :class="[i2 === 0 ? '':'bdtop' ,'vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
                                <el-col :span="6" >
                                    <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">
                                        {{item2.authName}}
                                    </el-tag>
                            <i class="el-icon-caret-right"></i>
                                </el-col>
                                <el-col :span="18">
                                    <el-tag type="warning" v-for="(item3) in item2.children" 
                                    :key="item3.id" closable @close="removeRightById(scope.row,item3.id)">{{item3.authName}} </el-tag>
                                </el-col>
                            </el-row>
                        </el-col>
                    </el-row>
                </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="角色名称" prop="roleName"></el-table-column>
            <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
            <el-table-column label="操作" width="300px">
                <template slot-scope="scope">
                    <el-button size="mini" type="primary" icon="el-icon-edit"
                     @click="showEditDialog(scope.row.id)">编辑</el-button>
                    <el-button size="mini" type="danger" icon="el-icon-delete" 
                    @click.prevent="onRemove(scope.row.id)">删除</el-button>
                    <el-button size="mini" type="warning" icon="el-icon-setting" 
                    @click="showSetRightDialog(scope.row)">分配权限</el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-card>
    <!-- 添加角色表单 -->
    <el-dialog
        title="添加角色"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="onDialogClosed">
         <!-- 添加用户表单 -->
        <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addFromRef">
            <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addForm.roleName"></el-input>
            </el-form-item>
            <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addForm.roleDesc" ></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addRoles">确 定</el-button>
        </span>
    </el-dialog>
    <!-- 修改角色表单 -->
    <el-dialog
        title="修改角色"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed">
         <!-- 修改用户表单 -->
        <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editFormRef">
            <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editForm.roleName" disabled></el-input>
            </el-form-item>
            <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model=" editForm.roleDesc" ></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editUserInfo" >确 定</el-button>
        </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
     <el-dialog
        title="分配权限"
        :visible.sync="SetRightDialogVisible"
        width="50%"
        @close="SetRightDialogClosed">
        <!-- 树形控件 -->
        <el-tree :data="rightsList" :props="treeProps" show-checkbox
        node-key="id" default-expand-all :default-checked-keys="defKeys"
        ref="treeRef"></el-tree>
        <span slot="footer" class="dialog-footer">
            <el-button @click="SetRightDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
    data(){
        return {
            rolesList:[],
            addDialogVisible:false,
            addForm:{
                roleName:'',
                roleDesc:'',        
            },
            addFormRules: {
                roleName: [
                { required: true, message: '角色名称', trigger: 'blur' },
                { min: 1, max: 15, message: '长度在 1 到 15 个字符', trigger: 'blur' }
                ],
                roleDesc: [
                { required: true, message: '角色描述', trigger: 'blur' },
                { min: 1, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
                ],
            },
            editForm:{},
            editFormRules:{
                roleDesc: [
                { required: true, message: '角色描述', trigger: 'blur' },
                { min: 1, max: 15, message: '长度在 1 到 15 个字符', trigger: 'blur' }
                ],
            },
            editDialogVisible:false,
            SetRightDialogVisible:false,
            rightsList:[],
            // 树形控件的属性绑定对象
            treeProps:{
                label:'authName',
                children:'children'
            },
            // 默认选中的Id值数组
            defKeys:[],
            roleId :''
        }
    },
    created(){
        this.getRolesList()
    },
    methods:{
        async getRolesList(){
            const {data:res} = await this.$http.get('roles')
             if(res.meta.status !==200){
                return this.$message.error('获取角色列表失败')
            }
            this.rolesList = res.data
            // console.log(this.rolesList);
        },
        addRoles(){
            this.$refs.addFromRef.validate( async valid => {
                if(!valid) return
                const {data:res} = await this.$http.post('/roles',this.addForm)
                // console.log(res);
                if(res.meta.status !==201) return this.$message.error('添加失败！')
                this.$message.success('添加成功')
                this.addDialogVisible = false
                this.getRolesList()
            }) 
        },
          // 监听对话框关闭的事件
        onDialogClosed(){
            // 调用from组件的resetFields方法，重置表单
            this.$refs.addFromRef.resetFields()
        },
        editDialogClosed(){
            this.$refs.editFormRef.resetFields()
        },
        async showEditDialog(roleId){
            const {data:res} = await this.$http.get('/roles/' + roleId)
            // console.log(res);
            if(res.meta.status !== 200){
                return this.$message.error('查询用户信息失败')
            }
            this.editForm = res.data
            this.editDialogVisible = true
        },
        editUserInfo(){
                this.$refs.editFormRef.validate( async valid => {
                if(!valid) return
                const {data:res} = await this.$http.put('roles/' + this.editForm.roleId ,{
                    roleName: this.editForm.roleName,
                    roleDesc:this.editForm.roleDesc})
                   
                if(res.meta.status !==200) return this.$message.error('更新用户失败！')
                // console.log(res);
                this.$message.success('更新用户成功')
                this.editDialogVisible = false
                this.getRolesList()
            })
        },
         async onRemove(roleId){
            const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
                }).catch(err => err)
                // console.log(confirmResult);
                // 确认删除 confirm 取消 cancel
                if(confirmResult !== 'confirm') return this.$message.info('取消了删除！')
                const {data:res} =  await this.$http.delete('roles/' + roleId)  
                // console.log(res);  
                if(res.meta.status !==200) {
                    return this.$message.error('删除失败')
                }
                this.$message.success('删除成功')
                this.getRolesList()
            },
            async removeRightById( role,rightId){
                 const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
                }).catch(err => err)
                if(confirmResult !== 'confirm') {
                    return this.$message.info('取消了删除！')
                }
                const {data:res} =  await this.$http.delete(`roles/${ role.id}/rights/${rightId}`)
                if(res.meta.status !==200) {
                    return this.$message.error('删除失败')
                }
                 this.$message.success('删除成功')
                 role.children = res.data
            },
            async showSetRightDialog(role){
                this.roleId = role.id
                const {data:res} = await this.$http.get('/rights/tree')
                if(res.meta.status !==200) {
                    return this.$message.error('获取权限数据失败！')
                }
                // 获取到的权限数据
                this.rightsList =res.data
                console.log(this.rightsList);
                //递归获取三级权限id
                this.getdefKeys(role,this.defKeys)
                // console.log(role);
                // console.log(this.defKeys);

                this.SetRightDialogVisible = true
            },
            // 通过递归的形式，获取所有三级权限id，并保存到 defKeys 数组中
            getdefKeys(node,arr){
                // 如果当前节点不包含 children，则是三级节点
                if(!node.children){
                    return arr.push(node.id)
                }
                node.children.forEach(item => 
                    this.getdefKeys(item,arr))
            },
            SetRightDialogClosed(){
                this.defKeys = []
            },
            async allotRights(){
                const keys = [
                    ...this.$refs.treeRef.getCheckedKeys(),
                    ...this.$refs.treeRef.getHalfCheckedNodes()
                ]
                const idStr = keys.join(',')
                const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids: idStr })
                 if(res.meta.status !==200) {
                    return this.$message.error('分配权限数据失败！')
                }
                this.$message.success('分配权限成功!')
                this.getRolesList()
                this.SetRightDialogVisible = false

            }

    }
}
</script>

<style lang="less" scoped>
    .el-tag{
        margin: 7px;
    }
    .bdtop {
        border-top: 1px solid #eee;
    }
    .bdbottom {
        border-bottom: 1px solid #eee;
    }
    .vcenter {
        display: flex;
        align-items: center;
    }
</style>>

