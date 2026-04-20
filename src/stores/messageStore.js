import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getUnreadCount } from '@/api/message'

/**
 * 全局消息状态管理
 * 统一管理未读消息数，支持多角色布局和消息中心之间的实时同步
 */
export const useMessageStore = defineStore('message', () => {
  // State
  const announcementUnread = ref(0)
  const privateMessageUnread = ref(0)
  const systemMessageUnread = ref(0)
  const lastUpdateTime = ref(null)
  const isLoading = ref(false)

  // Getters
  const totalUnread = computed(() => {
    return announcementUnread.value + privateMessageUnread.value + systemMessageUnread.value
  })

  const hasUnread = computed(() => totalUnread.value > 0)

  // Actions
  /**
   * 获取未读消息数
   * @param {boolean} force 是否强制刷新，忽略缓存
   */
  async function fetchUnreadCount(force = false) {
    // 如果正在加载，跳过
    if (isLoading.value) return

    // 如果30秒内已更新过，且不是强制刷新，则跳过
    if (!force && lastUpdateTime.value) {
      const elapsed = Date.now() - lastUpdateTime.value
      if (elapsed < 30000) return
    }

    isLoading.value = true
    try {
      const res = await getUnreadCount()
      if (res.code === 200 && res.data) {
        // 兼容不同的返回格式
        announcementUnread.value = res.data.announcementUnread || res.data.announcement_unread || 0
        privateMessageUnread.value = res.data.privateMessageUnread || res.data.private_message_unread || 0
        systemMessageUnread.value = res.data.systemMessageUnread || res.data.system_message_unread || 0
        lastUpdateTime.value = Date.now()
      }
    } catch (e) {
      console.warn('获取未读消息数失败:', e)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 更新公告未读数
   */
  function setAnnouncementUnread(count) {
    announcementUnread.value = count
  }

  /**
   * 更新私信未读数
   */
  function setPrivateMessageUnread(count) {
    privateMessageUnread.value = count
  }

  /**
   * 更新系统消息未读数
   */
  function setSystemMessageUnread(count) {
    systemMessageUnread.value = count
  }

  /**
   * 减少未读数（用于标记已读）
   */
  function decreaseAnnouncementUnread(count = 1) {
    announcementUnread.value = Math.max(0, announcementUnread.value - count)
  }

  function decreasePrivateMessageUnread(count = 1) {
    privateMessageUnread.value = Math.max(0, privateMessageUnread.value - count)
  }

  function decreaseSystemMessageUnread(count = 1) {
    systemMessageUnread.value = Math.max(0, systemMessageUnread.value - count)
  }

  /**
   * 清空所有未读数
   */
  function clearAllUnread() {
    announcementUnread.value = 0
    privateMessageUnread.value = 0
    systemMessageUnread.value = 0
  }

  /**
   * 初始化轮询
   * @param {number} interval 轮询间隔（毫秒），默认30秒
   */
  let pollTimer = null
  function startPolling(interval = 30000) {
    stopPolling()
    pollTimer = setInterval(() => {
      fetchUnreadCount()
    }, interval)
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  return {
    // State
    announcementUnread,
    privateMessageUnread,
    systemMessageUnread,
    isLoading,
    // Getters
    totalUnread,
    hasUnread,
    // Actions
    fetchUnreadCount,
    setAnnouncementUnread,
    setPrivateMessageUnread,
    setSystemMessageUnread,
    decreaseAnnouncementUnread,
    decreasePrivateMessageUnread,
    decreaseSystemMessageUnread,
    clearAllUnread,
    startPolling,
    stopPolling,
  }
})
