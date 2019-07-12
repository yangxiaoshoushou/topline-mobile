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
        <van-button class="btn" type="info" @click.prevent="handleLogin">登录</van-button>
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
      }
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
      try {
        // const data = await login(this.user)
        this.$validator.validate().then(async valid => {
          // 如果验证失败，则什么都不做
          if (!valid) {
            return
          }
          const data = await login(this.user)
          this.$store.commit('setUser', data)
        })
      } catch (err) {
        console.log(err)
        console.log('登录失败')
      }
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
