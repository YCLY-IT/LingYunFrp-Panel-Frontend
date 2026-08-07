# 项目记忆

## naive-ui NSteps 居中（关键技巧）

naive-ui 的 `NSteps` 默认每个 `.n-step` 都是 `flex: 1`，会把步骤强制拉伸到占满整行，圆圈按比例分布。仅在父级加 `justify-content: center` **无效**。

要真正让步骤在容器内聚拢居中，必须用 `:deep()` 覆盖内部样式：

```scss
.register-steps {
  justify-content: center;
}
.register-steps :deep(.n-step) {
  flex: none;
} /* 步骤不拉伸 */
.register-steps :deep(.n-step-splitor) {
  flex: none;
  width: 60px;
} /* 连接线固定宽度，否则会塌成 0 */
```

适用：本项目里 `Register.vue`、`ResetPassword.vue` 的 `.register-steps` 都用了这个模式。

## 项目视觉约定

- 卡片（登录/注册/找回密码）一律采用「**贴左停靠面板**」风格：
  - `border-radius: 0 16px 16px 0 !important`（左直角、右圆角）
  - 容器 `padding: 16px 16px 16px 0`（左内边距为 0 保持贴左、其余 16px 让底部圆角可见）
  - 父容器 `min-height: calc(100vh - <header>)` + `display: flex`，`onMounted` 设 `body.overflowY='hidden'`、`onUnmounted` 恢复
  - 引入共享样式：`@use '../assets/styles/auth.scss'`
- 共享 `auth.scss` 已有 `.auth-container` 模板（同样的高度/背景/卡片尺寸计算），新页面应优先复用。
- 主题色：`LingYunFRP`（紫蓝系）。

## 表单分步校验模式

- 复用 `naive-ui` 的 `NSteps` + `Form.validate(callback, shouldRuleBeApplied)`。
- 每条 `rule` 必须显式设 `key: '<字段名>'`，`shouldRuleBeApplied` 根据 `stepFields[step]` 筛选当前步字段。
- 注意：`rule.key` 不会被框架自动填充为 `path`，必须手动写。

## 后端交互

- `userApi.sendEmailCode(email, scene, captchaUrl)`：`scene` 取 `'register'` 或 `'forget'`。
- `userApi.register({ username, nickname, password, email, code })`。
- `userApi.forget({ email, password, code })`（无用户名、无昵称）。
- 极验（Geetest）全局类型 `GeetestResult` 在 `src/global.d.ts`，`GeetestService.initAndShowCaptchaForBind()` 拿到结果。

## 构建工具

- vite + naive-ui，**构建不做类型检查**（esbuild），编辑器 lint 误报不会阻塞运行。
- ts-plugin 偶发 "vue 没有导出成员 ref" 等 2305 误报，重编辑/重保存通常自动消失。

## naive-ui 按钮横向布局

- 不要在 flex 容器内的 `NButton` 上同时给多个按钮加 `block`：`.n-button--block` 强制 `width: 100%`，多个按钮叠加必然溢出 → 出现横向滚动条、按钮被挤出可视区。
- 正确做法：去掉 `block`，改用 CSS 平分宽度：
  ```scss
  .steps-action {
    display: flex;
    gap: 12px;
  }
  .steps-action :deep(.n-button) {
    flex: 1;
    min-width: 0;
  }
  ```
- 仅 1 个按钮时也安全（占满整行）。
- 同源问题：父容器记得加 `overflow-x: hidden` 兜底，避免长内容溢出页面。
