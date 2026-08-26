// 全局只允许一条 message 存在
// 适配 Naive UI 的 window.$message

export function showSingleMessage(
  type: 'error' | 'success' | 'info' | 'warning',
  content: string,
) {
  // 先销毁所有 message（Naive UI 支持）
  ;(window as Window).$message?.destroyAll?.()
  ;(window as Window).$message?.[type]?.(content)
}
