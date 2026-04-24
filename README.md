# Cosmray Frontend

基于 Next.js 15 的 AI 数字人平台前端，支持数字人创建、实时对话和知识图谱管理。

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000，确保后端服务已在 http://localhost:8000 运行。

### 一键启动 (Windows)

```powershell
.\start.ps1
```

## 项目结构

```
frontend/
├── app/                        # 页面路由 (App Router)
│   ├── layout.tsx              # 根布局
│   ├── page.tsx                # 首页 - 数字人列表
│   ├── login/page.tsx          # 登录页
│   ├── register/page.tsx       # 注册页
│   ├── profile/page.tsx        # 用户资料页
│   ├── dashboard/page.tsx      # 用户仪表盘
│   ├── create-agent/page.tsx   # 数字人创建向导 (5步)
│   └── chat/[agentId]/page.tsx # 对话页面
├── components/                 # 组件
│   ├── AgentFormModal.tsx      # 数字人创建/编辑弹窗
│   ├── Alert.tsx               # 通知组件
│   ├── AuthLayout.tsx          # 认证页布局
│   ├── Button.tsx              # 通用按钮
│   ├── ChatPanel.tsx           # 对话面板
│   ├── ChatInput.tsx           # 消息输入框
│   ├── ConfirmDialog.tsx       # 确认弹窗
│   ├── ConversationList.tsx    # 会话历史列表
│   ├── FormInput.tsx           # 表单输入框
│   ├── MessageBubble.tsx       # 消息气泡
│   └── PasswordInput.tsx       # 密码输入框
├── contexts/
│   └── AuthContext.tsx         # 全局认证状态管理
├── lib/
│   ├── api/
│   │   ├── client.ts          # Axios 实例 (拦截器/错误处理)
│   │   └── auth.ts            # 认证 API 接口
│   └── services/
│       ├── agentService.ts     # 数字人 CRUD
│       ├── authService.ts      # 认证服务
│       ├── chatService.ts      # 对话与 SSE 流式通信
│       ├── knowledgeService.ts # 知识图谱管理
│       └── configService.ts    # 配置管理
├── middleware.ts               # 路由守卫 (未登录重定向)
├── tailwind.config.js          # 自定义主题 (深色/渐变)
├── .env.local                  # 环境变量
└── start.ps1                   # Windows 启动脚本
```

## 核心功能

### 数字人管理
- 创建、编辑、删除数字人
- 5 步创建向导：基础信息 -> 类型技能 -> 权限设置 -> 对话风格 -> AI 参数
- 自定义头像、性格、对话风格、温度等参数

### 实时对话
- SSE (Server-Sent Events) 流式响应，逐字输出
- 对话历史管理和持久化
- 自动生成对话标题
- 支持中断生成

### 认证系统
- JWT Token 认证 (localStorage + sessionStorage)
- Cookie 双重存储用于中间件验证
- 自动 Token 刷新和 401 重定向
- 路由守卫保护受保护页面

### 知识图谱
- 文档上传和管理
- 知识图谱可视化 (react-force-graph-2d)

## 页面说明

| 路由 | 说明 | 认证 |
|------|------|------|
| `/` | 首页，数字人卡片列表与搜索 | 可选 |
| `/login` | 登录页 | 已登录跳转首页 |
| `/register` | 注册页 | 已登录跳转首页 |
| `/profile` | 用户资料与数字人展示 | 需要 |
| `/dashboard` | 用户仪表盘与统计 | 需要 |
| `/create-agent` | 数字人创建向导 | 需要 |
| `/chat/[agentId]` | 与数字人对话 | 需要 |

## 技术栈

- **Next.js 15** - App Router, SSR
- **React 19** - UI 框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 自定义深色主题
- **Axios** - HTTP 客户端 + 拦截器
- **react-force-graph-2d** - 知识图谱可视化

## 可用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | 运行代码检查 |

## 环境变量

在 `.env.local` 中配置：

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## UI 设计

- 深色主题为主，多层背景 (primary/secondary/tertiary)
- 宇宙蓝 (#00D9FF) + 紫色 (#7B68EE) 渐变色彩体系
- 毛玻璃效果 (backdrop-blur)
- 浮动背景动画
- 全面响应式布局
