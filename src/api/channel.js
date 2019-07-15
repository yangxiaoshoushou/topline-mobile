// 封装频道相关接口请求函数
import request from '@/utils/request'

export const getUserChannels = () => {
  return request({
    method: 'GET',
    url: '/app/v1_0/user/channels'
  })
}

// 获取所有频道列表
export const getAllChannels = () => {
  return request({
    method: 'GET',
    url: '/app/v1_0/channels'
  })
}

// 获取所有频道列表
export const deleteUserChannel = channelId => {
  return request({
    method: 'DELETE',
    url: `/app/v1_0/user/channels/${channelId}`
  })
}

/**
 * 批量修改用户频道列表（重置）
 * channels: []
 *   { id: 频道id, seq: 顺序序号 }
 * 数据的顺序都从 2 开始
 * 因为 推荐是用户默认频道，推荐从 1 开始的
 * [{ id: 频道id, seq: 1 }, { id: 频道id, seq: 序号 }, { id: 频道id, seq: 序号 }]
 */
export const resetUserChannels = channels => {
  return request({
    method: 'PUT',
    url: `/app/v1_0/user/channels`,
    data: {
      channels
    }
  })
}
