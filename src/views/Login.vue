<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="">
      </div>
      <!-- 登录表单 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" class="login_form" >
        <!-- 用户名 -->
        <el-form-item  prop="username" >
          <el-input v-model="loginForm.username" 
          prefix-icon="el-icon-user-solid" ></el-input>
        </el-form-item>
        <!-- 登录密码 -->
         <el-form-item prop="password" >
          <el-input v-model="loginForm.password" prefix-icon="el-icon-lock"
           type="password"></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary"  @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>  
    </div>
  </div>
</template>

<script>

export default {
  data(){
    return {
      loginForm: {
        username:'admin',
        password:'123456'
      },
      loginFormRules:{
        username:[
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 2, max: 15, message: '长度在 2 到 15 个字符', trigger: 'blur' }
        ],
        password:[
            { required: true, message: '请输入登录密码', trigger: 'blur' },
            { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods:{
    // 点击重置按钮 重置表单
    resetLoginForm(){
      this.$refs.loginFormRef.resetFields()
    },
    login(){
      this.$refs.loginFormRef.validate(async valid => {
        if(!valid) return
        const {data:res} = await this.$http.post('login',this.loginForm)
        // console.log(res);
        if(res.meta.status !==200) return this.$message.error('登录失败')
        this.$message.success('登录成功');
        // 1.将登录成功之后的token，保存到客户端的 sessionStorage 中
        //   1.1项目中除了登录之外的其他API接口，必须登录后才能访问
        //   1.2 token 只应在当前网站打开期间生效，所以将 token 保存在  sessionStorage 中
        window.sessionStorage.setItem('token',res.data.token)
        // 2.通过编程式导航跳转到后台主页，路由地址是/home
        this.$router.push('/home')
      })
    }
  }
  
}
</script>
<style lang="less" scoped>
  .login_container{
    background-color: #2b4b6b;
    height: 100%;
  }
  .login_box{
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    .avatar_box{
      position: absolute;
      left: 50%;

      transform: translate(-50%,-50%);
      padding: 10px;
      height: 130px;
      width: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      box-shadow: 0 0 10px #ddd;
      background-color: #fff;
      img{
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
      .login_form{
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 0 20px;
        box-sizing: border-box;
      }
    .btns{
      display: flex;
      justify-content: end;
    }
  }

</style>

