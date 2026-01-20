# Next.js Hello World

这是一个使用 Next.js 创建的简单 Hello World 应用。

## 快速开始

1. **安装依赖**
```bash
cd frontend
npm install
```

2. **运行开发服务器**
```bash
npm run dev
```

3. **访问应用**
打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
frontend/
├── app/
│   ├── api/
│   │   └── hello/
│   │       └── route.ts       # API 路由示例
│   ├── globals.css            # 全局样式
│   ├── layout.tsx             # 根布局
│   └── page.tsx               # 主页
├── public/                    # 静态资源
├── .eslintrc.json            # ESLint 配置
├── .gitignore                # Git 忽略文件
├── next.config.ts            # Next.js 配置
├── package.json              # 项目依赖
├── postcss.config.mjs        # PostCSS 配置
├── tailwind.config.ts        # Tailwind CSS 配置
└── tsconfig.json             # TypeScript 配置
```

## 可用命令

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run start` - 启动生产服务器
- `npm run lint` - 运行代码检查

## 功能特性

- ✅ Next.js 15 (App Router)
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ ESLint
- ✅ API Routes 示例

## 学习资源

- [Next.js 文档](https://nextjs.org/docs)
- [React 文档](https://react.dev)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
