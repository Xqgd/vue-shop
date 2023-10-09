<template>
  <div>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
        <el-alert title="添加商品信息" type="info" center show-icon :closable= "false"> </el-alert>
        <el-steps :space="200" :active="activeIndex -0" finish-status="success"  align-center>
            <el-step title="基本信息"></el-step>
            <el-step title="商品参数"></el-step>
            <el-step title="商品属性"></el-step>
            <el-step title="商品图片"></el-step>
            <el-step title="商品内容"></el-step>
            <el-step title="完成"></el-step>
        </el-steps>
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
            <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClicked">
                <el-tab-pane label="基本信息" name="0">
                    <el-form-item label= "商品名称" prop= "goods_name" >
                        <el-input v-model="addForm.goods_name"></el-input>
                    </el-form-item>
                    <el-form-item label= "商品价格" prop= "goods_price" >
                        <el-input v-model="addForm.goods_price" type="number"></el-input >
                    </el-form-item>
                    <el-form-item label= "商品重量" prop= "goods_weight" >
                        <el-input v-model="addForm.goods_weight" type="number"></el-input>
                    </el-form-item>
                    <el-form-item label= "商品数量" prop= "goods_number" >
                        <el-input v-model="addForm.goods_number" type="number"></el-input>
                    </el-form-item>
                    <el-form-item label="商品分类" prop="goods_cat">
                        <el-cascader v-model="addForm.goods_cat" ref="cascaderHandle"
                        :options="cateList" 
                        :props="{ expandTrigger: 'hover', value:'cat_id',
                        label:'cat_name',children:'children',checkStrictly: true }"
                        @change="handleChange" clearable></el-cascader>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品参数" name="1">
                    <!-- 渲染表单的 item项 -->
                    <el-form-item :label="item.attr_name" v-for="item in manyTabData" :key="item.attr_id">
                        <el-checkbox-group v-model="item.attr_vals">
                            <el-checkbox :label= "item2" v-for="(item2,i) in item.attr_vals" :key="i" border>

                            </el-checkbox>
                            
                         </el-checkbox-group>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品属性" name="2">
                    <el-form-item :label= "item.attr_name" v-for="item in onlyTabData" :key="item.attr_id">
                        <el-input v-model="item.attr_vals"></el-input>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品图片" name="3">
                    <!--action 图片上传地址  -->
                    <el-upload :action= uploadURL
                        :on-preview="handlePreview" :headers="headerObj"
                        :on-remove="handleRemove"   :on-success="handleSuccess"
                        list-type="picture">
                        <el-button size="small" type="primary">点击上传</el-button>
                        <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                    </el-upload>
                </el-tab-pane>
                <el-tab-pane label="商品内容" name="4">
                    <quill-editor v-model="addForm.goods_introduce"/>
                    <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
                </el-tab-pane>
            </el-tabs>  
        </el-form>  
    </el-card>
    <el-dialog
        title="图片预览"
        :visible.sync="previewsVisible"
        width="30%">

        <img :src="previewPath" alt="">

    </el-dialog>

  </div>
</template>

<script>
import _ from 'lodash'
export default {
    data(){
        return {
            activeIndex: '0',
            addForm:{
                goods_name: '' ,
                goods_price: 0,
                goods_weight: 0,
                goods_number: 0,
                goods_cat:[] ,
                pics:[],
                goods_introduce: '',
                attrs:[]
            },
            addFormRules:{
                goods_name:[
                    { required: true, message: '请输入商品名称', trigger: 'blur' }, 
                ],
                goods_price:[
                    { required: true, message: '请输入商品价格', trigger: 'blur' }, 
                ],
                goods_weight:[
                    { required: true, message: '请输入商品重量', trigger: 'blur' }, 
                ],
                goods_number:[
                    { required: true, message: '请输入商品数量', trigger: 'blur' },
                ],
                goods_cat:[
                    { required: true, message: '请选择商品分类', trigger: 'blur' },
                ] 
            },
            cateList:[],
            manyTabData:[],
            onlyTabData:[],
            uploadURL:"https://lianghj.top:8888/api/private/v1/upload",
            headerObj:{
                Authorization: window.sessionStorage.getItem('token')
            },
            previewPath:'',
            previewsVisible: false
        }
    },
    created(){
        this.getCateList()
    },
    methods:{
        async getCateList(){
            const {data:res} = await this.$http.get('categories')
            if(res.meta.status !== 200){
               return this.$message.error('获取商品分类数据失败')
            } 
            this.cateList = res.data
            // console.log(this.cateList);

        },
        handleChange(){
            // console.log(this.addForm.goods_cat);
            if(this.addForm.goods_cat.length !==3){
                this.addForm.goods_cat = []

                this.$refs.cascaderHandle.dropDownVisible = false
            }
            this.$refs.cascaderHandle.dropDownVisible = false;
        },
        beforeTabLeave(activeName,oldActiveName){
        //     console.log(oldActiveName);
        //    console.log(activeName);
            if(oldActiveName === '0' && this.addForm.goods_cat.length !==3) {
                this.$message.error('请先选择商品分类')
                return false
            }
        },
        async tabClicked(){
            if(this.activeIndex === '1'){
                // console.log(this.addForm.goods_cat);
                const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{
                    params:{sel: 'many'}
                })
                if(res.meta.status !== 200){
                return this.$message.error('获取动态参数列表失败')
                } 
                
                res.data.forEach(item => {
                    item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
                });
                // console.log(res.data);
                this.manyTabData = res.data

            }else if(this.activeIndex === '2'){
                 const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{
                    params:{sel: 'only'}
                })
                if(res.meta.status !== 200){
                return this.$message.error('获取静态参数列表失败')
                } 
                // console.log(res.data);
                this.onlyTabData = res.data
            }
        },
        handlePreview(file){
            console.log(file);
            this.previewPath = file.response.data.url
            console.log(this.previewPath);
            this.previewsVisible = true
        },
        handleRemove(file){
            // 1.获取将要删除的图片的临时路径
            const filePath = file. response.data.tmp_path
            // 2.从pics 数组中，找到这个图片对应的索引值
            const i = this.addForm.pics.findIndex(x => {
                x.pic = filePath
            })
            // 3.调用数组的spilce 方法，把图片信息对象，从pics数组中移除 
            this.addForm.pics.splice(i,1)
            // console.log(this.addForm);
        },
        handleSuccess(response){
            // console.log(response);
            // 1.拼接得到一个图片信息对象
            const picInfo = {pic:response.data.tmp_path}
            // 2.将图片信息对象，push到pics 数组中
            this.addForm.pics.push(picInfo)
            // console.log(this.addForm);
        },
        add(){
            this.$refs.addFormRef.validate(async valid => {
                if(!valid){
                    return this.$message.error('请填写必要的表单项')
                } 
                let form = _.cloneDeep(this.addForm)
                this.addForm.goods_cat = form.goods_cat.join(',')
                
                // console.log(this.addForm.goods_cat);
                
                // 处理动态参数
                // console.log(this.manyTabData);
                // console.log(this.addForm.attrs);
                this.manyTabData.forEach(item => {
                    const newInfo = { attr_id: item.attr_id,
                    attr_value: item.attr_vals.join(',')}
                    // console.log(newInfo1);
                    this.addForm.attrs.push(newInfo)
                })
                // 处理静态参数
                 this.onlyTabData.forEach(item => {
                    const newInfo = {attr_id: item.attr_id,
                    attr_value: item.attr_vals}
                    this.addForm.attrs.push(newInfo)
                })
                form.attrs = this.addForm.attrs

                const {data:res} = await this.$http.post('/goods' ,form)
                
                console.log(res.data);
                if(res.meta.status !==201){
                    return this.$message.error('添加商品失败')
                }
                
                this.$message.success('添加商品成功')
                this.$router.push('/goods')
            })
        }
    },
    computed:{
        cateId(){
            if(this.addForm.goods_cat.length === 3){
                return this.addForm.goods_cat[2]
            }
            return null
        }
    }
}
</script>

<style lang="less" scoped>
    .el-checkbox{
        margin: 0 10px 0 0 !important
    }
    .btnAdd{
        margin-top: 15px;
    }
    
</style>

