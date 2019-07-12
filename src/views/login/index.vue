<template>
  <div class="login-wrap">
    <van-nav-bar title="标题" />
    <form>
      <van-cell-group>
        <van-field
          v-model="user.mobile"
          v-validate="'required'"
          name="mobile"
          :error-message="errors.first('mobile')"
          required
          clearable
          label="手机号"
          placeholder="请输入手机号" />
        <van-field
          v-model="user.code"
           v-validate="'required'"
          name="code"
          :error-message="errors.first('code')"
          type="code"
          label="验证码"
          placeholder="请输入验证码"
          required />
      </van-cell-group>
      <div class="login-btn">
        <van-button
          class="btn"
          type="info"
          @click.prevent="handleLogin"
          :loading="loginLoading"
        >登录</van-button>
      </div>
    </form>
  </div>
</template>

<script>
import { login } from '@/api/user'

export default {
  name: 'LoginIndex',
  data () {
    return {
      user: {
        mobile: '',
        code: ''
      },
      loginLoading: false
    }
  },
  // methods () {
  //   handleLogin () {
  //     const res = await axios({
  //       method: 'POST',
  //       url: 'Http://toutiao.course.itcast.cn/app/v1_0/authorizations',
  //       data: this.user
  //     })
  //   }
  // }
  created () {
    this.configCustomMessages()
  },
  methods: {
    async  handleLogin () {
      this.loginLoading = true
      try {
        // const data = await login(this.user)
        // this.$validator.validate().then(async valid => {
        //   // 如果验证失败，则什么都不做
        //   if (!valid) {
        //     return
        //   }
        const valid = await this.$validator.validate()
        if (!valid) {
          this.loginLoading = false
          return
        }
        // 验证通过提交表单
        const data = await login(this.user)
        // 通过提交mutation更新Vuex容器中的装填
        this.$store.commit('setUser', data)
        // 登录成功先跳转到首页
        this.$router.push({
          name: 'home'
        })
      } catch (err) {
        console.log(err)
        this.$toast.fail('登录失败')
      }
      this.loginLoading = false
    },
    configCustomMessages () {
      const dict = {
        custom: {
          mobile: {
            required: '手机号不能为空'
          },
          code: {
            required: () => '验证码不能为空'
          }
        }
      }
      this.$validator.localize('zh_CN', dict)
    }
  }
}
</script>

<style lang="less" scoped>
.login-btn {
  padding: 10px;
  .btn {
    width: 100%;
  }
}
</style>
