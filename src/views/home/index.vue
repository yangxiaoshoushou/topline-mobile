<template>
  <div>
    <div class="home">
      <van-nav-bar title="首页" fixed />
      <van-tabs class="channel-tabs" v-model="activeChannelIndex">
          <div slot="nav-right" class="wap-nav">
            <van-icon name="wap-nav"/>
          </div>
          <van-tab
            v-for="channelItem in channels"
            :key="channelItem.id"
            :title="channelItem.name"
          >
          <van-pull-refresh
            v-model="channelItem.downPullLoading"
            @refresh="onRefresh"
            :success-text="channelItem.downPullSuccessText"
            :success-duration="1000"
            >
          <van-list
            v-model="channelItem.upPullLoading"
            :finished="channelItem.upPullFinished"
            finished-text="没有更多了"
            @load="onLoad"
          >
          <van-cell
            v-for="articleItem  in channelItem.articles"
            :key="articleItem.art_id"
            :title="articleItem.title"
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
import { getArticles } from '@/api/article'
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
  computed: {
    // 当前激活的频道
    activeChannel () {
      return this.channels[this.activeChannelIndex]
    }
  },
  watch: {
    // 监视容器中的user用户
    // 只要能this. 出来的都可以在这里监视
    async '$store.state.user' () {
      this.loadChannels()
      this.activeChannel.upPullLoading = true
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
        item.timestamp = Date.now() // 存储下一页数据的时间戳
        item.downPullLoading = false // 用来控制当前频道的下拉刷新
        item.upPullLoading = false // 用来控制当前频道的上拉加载更多
        item.upPullFinished = false // 用来控制当前频道数据是否加载完毕
      })
      this.channels = channels
    },
    // 上拉加载更多push数据
    async  onLoad () {
      await this.$sleep(800)
      // 异步更新数据
      let data = []
      data = await this.loadArticles()

      if (!data.pre_timestamp && !data.results.length) {
        // 设置该频道数据已加载完毕，组件会自动给出提示，并且不再onLoad
        this.activeChannel.upPullFinished = true

        // 取消loading
        this.activeChannel.upPullLoading = false

        // 代码就不需要往后继续执行了
        return
      }

      // 解决初始化的时候没有最新推荐的问题（没有最新数据，那就加载上一次推荐数据）
      if (data.pre_timestamp && !data.results.length) {
        this.activeChannel.timestamp = data.pre_timestamp

        // 加载下一页的数据
        data = await this.loadArticles()
      }
      // 数据加载好以后，将pre_timestamp更新到当前频道中用于加载下下页数据
      this.activeChannel.timestamp = data.pre_timestamp

      // 将文章数据更新到频道中
      this.activeChannel.articles.push(...data.results)

      // 数据加载完毕，取消上拉 loading
      this.activeChannel.upPullLoading = false
    },
    // 下拉刷新，如果有新数据，则是重置列表数据
    async onRefresh () {
      const { activeChannel } = this
      const timestamp = activeChannel.timestamp
      // 使用最新时间戳去请求最新推荐的数据
      activeChannel.timestamp = Date.now()
      const data = await this.loadArticles()

      // 如果有最新数据，将数据更新到频道文章中
      if (data.results.length) {
        activeChannel.articles = data.results

        // 由于重置了时间戳，那么当前数据中的pre_timestamp 就是上拉获取下一页的时间戳
        activeChannel.timestamp = data.pre_timestamp
        activeChannel.downPullSuccessText = '更新成功'
        // 当重置下拉刷新后数据没有占满屏幕，所以我们用onload再加载一页
        this.onLoad()
      } else {
        // 如果没有最新数据，提示已是最新内容
        activeChannel.downPullSuccessText = '已是最新数据'
      }
      // 下拉刷新结束，取消loading状态
      activeChannel.downPullLoading = false
      // 没有最新数据，将原来的用于请求下一页的时间戳恢复过来
      activeChannel.timestamp = timestamp
    },
    async loadArticles () {
      const { id: channelId, timestamp } = this.activeChannel
      const data = await getArticles({
        channelId, // 当前激活频道id
        timestamp, // 当前频道下一页数据的时间戳
        withTop: 1 // 是否包含置顶数据
      })
      return data
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
.channel-tabs /deep/ .wap-nav {
  position: fixed;
  right: 0;
}
</style>
