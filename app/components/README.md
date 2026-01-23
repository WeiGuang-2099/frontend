# 认证组件库

本目录包含用于登录和注册页面的可复用组件，全部使用 Tailwind CSS 构建。

## 组件列表

### AuthLayout
认证页面的统一布局组件，包含背景效果、网格背景和页面标题。

```tsx
<AuthLayout title="登录账户" subtitle="欢迎回来">
  {/* 页面内容 */}
</AuthLayout>
```

### FormInput
通用的表单输入组件，支持标签、提示文本和错误信息。

```tsx
<FormInput
  type="email"
  label="邮箱"
  hint="（可选提示）"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="请输入邮箱地址"
  error={errorMessage}
  required
/>
```

### PasswordInput
密码输入组件，内置显示/隐藏密码功能。

```tsx
<PasswordInput
  label="密码"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  placeholder="请输入密码"
  error={errorMessage}
  required
/>
```

### Alert
警告/成功提示组件。

```tsx
<Alert type="error">错误信息</Alert>
<Alert type="success">成功信息</Alert>
```

### Button
按钮组件，支持主要按钮和社交登录按钮两种样式。

```tsx
<Button type="submit">登录</Button>
<Button variant="social">🔍</Button>
```

## 设计特点

1. **统一的设计系统**：所有组件使用相同的颜色方案和样式规范
2. **可复用性**：组件高度解耦，易于在不同页面中使用
3. **Tailwind CSS**：所有样式使用 Tailwind 实现，无内联样式
4. **响应式**：组件支持不同屏幕尺寸
5. **可访问性**：包含适当的 aria 属性和语义化 HTML

## 颜色规范

- 主背景：`#0A1628`
- 卡片背景：`#16213E`
- 输入框背景：`#1A1A2E`
- 主色调：`#00D9FF` (青色)
- 辅助色：`#7B68EE` (紫色)
- 文本主色：`#F5F5F5`
- 文本次色：`#B8BCC8`
- 提示文本：`#6C7293`
- 错误色：`#EE5A6F`
- 成功色：`#00F5A0`
