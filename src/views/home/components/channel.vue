<template>
  <van-popup
    :style="{ height: '95%' }"
    :value = "value"
    @input="$emit('input', $event)"
    position="bottom"
    get-container="body"
    :lazy-render="false"
  >
    <div class="channel">
      <div class="channel-head">
        <div>
          <span class="title">我的频道</span>
          <span class="desc">点击进入频道</span>
        </div>
        <div>
          <van-button
            type="danger"
            plain
            size="mini"
            @click="isEdit = !isEdit"
          >{{ isEdit ? '完成' : '编辑' }}</van-button>
        </div>
      </div>
      <van-grid class="channel-content" :gutter="10" clickable>
        <van-grid-item
          v-for="(item, index) in userChannels"
          :key="item.id"
          @click="handleUserChannelClick(item, index)"
        >
          <span
            class="text"
            :class="{ active: index === activeIndex && !isEdit }"
          >{{item.name}}</span>
          <van-icon class="close-icon" v-show="isEdit  && !aliveChannels.includes(item.name)" name="close" />
        </van-grid-item>
      </van-grid>
    </div>
     <!-- 推荐频道 -->
    <div class="channel">
      <div class="channel-head">
        <div>
          <span class="title">频道推荐</span>
          <span class="desc">点击添加频道</span>
        </div>
      </div>
      <van-grid class="channel-content" :gutter="10" clickable>
        <van-grid-item
          v-for="item in recommendChannels"
          :key="item.id"
          @click="handleAddChannel(item)"
        >
          <div class="info">
            <span class="text">{{item.name}}</span>
          </div>
        </van-grid-item>
      </van-grid>
    </div>
  </van-popup>
</template>

<script>
import {
  getAllChannels,
  deleteUserChannel,
  resetUserChannels
} from '@/api/channel'

import { mapState } from 'vuex'
export default {
  name: 'HomeChannel',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    userChannels: {
      type: Array,
      default: () => []
    },
    activeIndex: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      allChannels: [], // 所有的频道列表
      isEdit: false,
      aliveChannels: ['推荐']
    }
  },
  computed: {
    // 过滤出不含用户频道列表的数据
    recommendChannels () {
      console.log('recommendChannels called')
      const duplicates = this.userChannels.map(item => item.id)
      return this.allChannels.filter(item => !duplicates.includes(item.id))
    },
    ...mapState(['user'])
  },
  created () {
    this.loadAllChannels()
  },
  methods: {
    async loadAllChannels () {
      const data = await getAllChannels()
      data.channels.forEach(item => {
        item.articles = [] // 用来存当前的文章列表
        item.timestamp = Date.now() // 存储下一页数据的时间戳
        item.downPullLoading = false // 用来控制当前频道的下拉刷新
        item.upPullLoading = false // 用来控制当前频道的上拉加载更多
        item.upPullFinished = false // 用来控制当前频道数据是否加载完毕
      })
      this.allChannels = data.channels
    },
    async handleAddChannel (item) {
      // 将点击添加的频道添加到用户频道中
      this.userChannels.push(item)
      // 持久化：
      if (this.user) {
        // 如果用户已登录，则将数据请求添加到后端
        const data = this.userChannels.slice(1).map((item, index) => {
          return {
            id: item.id,
            seq: index + 2
          }
        })
        await resetUserChannels(data)
        return
      }
      // 如果未登录，则将数据持久化到本地存储
      window.localStorage.setItem('channels', JSON.stringify(this.userChannels))
    },
    changeChannel (item, index) {
      this.$emit('update:active-index', index)
      this.$emit('input', false)
    },
    async deleteChannel (item, index) {
      this.userChannels.splice(index, 1)
      // TODO: 删除当前频道，下一个激活的频道没有数据的问题
      // 手动的设置一下当前激活的标签索引，用来触发那个 onLoad 调用，否则可能会看不到那个数据
      // this.$emit('update:active-index', 1)
      // 判断当前激活频道中是否有数据，如果没有则手动的 onLoad 一下
      if (this.user) {
        // 登录：发请求删除
        await deleteUserChannel(item.id)
        return
      }
      // 未登录，删除本地存储的数据
      window.localStorage.setItem('channels', JSON.stringify(this.userChannels))
    },
    handleUserChannelClick (item, index) {
      if (!this.isEdit) {
        // 非编辑状态：切换频道
        this.changeChannel(item, index)
      } else {
        // 编辑状态：删除频道
        !this.aliveChannels.includes(item.name) && this.deleteChannel(item, index)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.channel {
  .channel-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    .title {
      font-size: 30px;
      margin-right: 5px;
    }
    .desc {
      font-size: 12px;
    }
    .action {}
  }
  .channel-content {
    .text {
      font-size: 24px;
    }
    .active {
      color: red;
    }
    .close-icon {
      font-size: 30px;
      position: absolute;
      top: -5px;
      right: -5px;
      z-index: 999;
      background-color: #fff;
    }
    .info {
      display: flex;
      align-items: center;
    }
  }
}
</style>
