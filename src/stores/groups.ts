import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminApi } from '@/net'

export interface GroupOption {
  label: string
  value: string
}

export const useGroupsStore = defineStore('groups', () => {
  // 状态
  const groupOptions = ref<GroupOption[]>([])
  const loading = ref(false)

  // Actions
  const fetchUserGroups = async (message?: any) => {
    loading.value = true
    try {
      const data = await adminApi.getGroupList()
      if (data.code === 0) {
        // 过滤掉 traffic 和 proxies 组
        const filteredGroups = data.data.groups.filter((group: any) => 
          !['traffic', 'proxies'].includes(group.name)
        )
        
        groupOptions.value = filteredGroups.map((group: any) => ({
          label: group.friendlyName,
          value: group.name
        }))
      } else {
        message?.error(data.message || '获取用户组列表失败')
      }
    } catch (error: any) {
      message?.error(error?.response?.data?.message || '获取用户组列表失败')
    } finally {
      loading.value = false
    }
  }

  // 重置状态
  const resetState = () => {
    groupOptions.value = []
    loading.value = false
  }

  return {
    // 状态
    groupOptions,
    loading,
    
    // Actions
    fetchUserGroups,
    resetState
  }
}) 