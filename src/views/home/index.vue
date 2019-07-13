<template>
  <div>
    <div class="home">
      <van-nav-bar title="首页" fixed />
      <van-tabs class="channel-tabs" v-model="activeChannelIndex">
          <van-tab
            v-for="channelItem in channels"
            :key="channelItem.id"
            :title="channelItem.name"
          >
          <van-pull-refresh v-model="isLoading" @refresh="onRefresh">
          <van-list
            v-model="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad"
          >
          <van-cell
            v-for="item in list"
            :key="item"
            :title="item"
          />
          </van-list>
          </van-pull-refresh>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script>
import { getUserChannels } from '@/api/channel'
export default {
  name: 'HomeIndex',
  data () {
    return {
      activeChannelIndex: 0,
      list: [],
      loading: false,
      finished: false,
      isLoading: false,
      channels: []
    }
  },
  created () {
    this.loadChannels()
  },
  methods: {
    async loadChannels () {
      const { user } = this.$store.state
      let channels = []
      // 已登录
      if (user) {
        const data = await getUserChannels()
        channels = data.channels
      } else {
        // 未登录
        // 如果有本地存储数据则使用本地存储中的频道列表
        const localChannels = JSON.parse(window.localStorage.getItem('channels'))
        if (localChannels) {
          channels = localChannels
        } else {
          // 如果没有本地存储数据则请求默认推荐频道列表
          const data = await getUserChannels()
          channels = data.channels
        }
      }
      // 修改channles，将这个数据结构改为我们需要的
      channels.forEach(item => {
        item.articles = [] // 用来存当前的文章列表
        item.downPullLoading = false // 用来控制当前频道的下拉刷新
        item.upPullLoading = false // 用来控制当前频道的上拉加载更多
        item.upPullFinished = false // 用来控制当前频道数据是否加载完毕
      })
      this.channels = channels
    },
    // 上拉加载更多push数据
    onLoad () {
    // 异步更新数据
      setTimeout(() => {
        for (let i = 0; i < 10; i++) {
          this.list.push(this.list.length + 1)
        }
        // 加载状态结束
        this.loading = false

        // 数据全部加载完成
        if (this.list.length >= 40) {
          this.finished = true
        }
      }, 1000)
    },
    // 下拉刷新，如果有新数据，则是重置列表数据
    onRefresh () {
      console.log('onRefresh')
      setTimeout(() => {
        this.isLoading = false
      }, 3000)
    }
  }
}
</script>

<style lang="less" scoped>
.channel-tabs {
  margin-bottom: 100px;
}
.channel-tabs /deep/ .van-tabs__wrap {
  position: fixed;
  top: 92px;
}
.channel-tabs /deep/ .van-tabs__content {
  margin-top: 100px;
}
</style>
