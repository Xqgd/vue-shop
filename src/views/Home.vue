<template>
  <el-container class="home-container" style="height: 100%">
    <el-header>
      <div>
        <img src="../assets/header.png" alt="">
        <span>电商管理系统</span>
      </div>
       <el-button type="info" @click="logout">注销</el-button>
    </el-header>
    <el-container style="height: 100%">
      <!-- 侧边栏   true 64px    -->
      <el-aside :width="isCollapse ? '64px' : '200px'"> 
        <div class="toggle-button" @click="toggleCollapse">| | |</div>
        <!-- 侧边栏菜单 -->
          <el-menu  background-color="#333744"
            text-color="#fff"
            active-text-color="#409eff"
            unique-opened
            :collapse= "isCollapse"
            :collapse-transition = "false"
            :router = "true"
            :default-active = "activePath">
            <!-- 一级菜单 -->
            <el-submenu :index="item.id + '' " v-for="item in menuList" :key="item.id">
              <template slot="title">
                <!-- 图标 -->
                <i :class="icon[item.id]"></i>
                <!-- 文字 -->
                <span>{{item.authName}}</span>
              </template>
              <!-- 二级菜单 -->
                <el-menu-item :index=" '/' + subItem.path" v-for="subItem in item.children " 
                :key="subItem.id" @click="saveNaveState( '/' + subItem.path)">
                  <template slot="title">
                    <!-- 图标 -->
                    <i class="el-icon-menu"></i>
                    <!-- 文字 -->
                    <span>{{subItem.authName}}</span>
                  </template>
                </el-menu-item>
             
            </el-submenu>
            
          </el-menu>
      </el-aside>

      <el-main>
        <!-- <keep-alive></keep-alive> -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>


export default {
  data(){
    return {
      menuList:'',
      icon:{
        '125':'el-icon-user-solid',
        '103':'el-icon-set-up',
        '101':'el-icon-s-goods',
        '102':'el-icon-tickets',
        '145':'el-icon-s-platform'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  created(){
    this.getMenuList()
    setTimeout(() => {
      this.activePath =  window.sessionStorage.getItem('activePath')
    },200)
    
  },
  methods:{
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取所有的菜单
    async getMenuList(){
      const {data:res} = await this.$http.get('menus')
      if(res.meta.status !==200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
      // console.log(res);
    },
    // 点击按钮切换菜单的折叠
    toggleCollapse(){
      this.isCollapse = !this.isCollapse
    },
    saveNaveState(activePath){
      window.sessionStorage.setItem('activePath',activePath)
      this.activePath = activePath
      
    }
  }

}
</script>
<style lang="less" scoped>
  .home-container{
    height: 100%;
  }
  .el-header{
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    font-size: 20px;
    > div {
      display: flex;
      align-items: center;
      span {
        margin-left: 15px;
      }
    }
  }
  .el-aside{
    
    background-color: #333744;
    .el-menu {
      border-right:none;
    }
  }
  .el-main{
    background-color: #eaedf1;
  }
  .toggle-button {
    background-color: #4a5064;
    font-size: 10px;
    color: #fff;
    line-height: 24px;
    text-align: center;
    cursor: pointer;
  }
</style>>

