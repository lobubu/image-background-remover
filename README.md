# Image Background Remover

> 基于 Next.js + remove.bg API 的在线图片背景移除工具

## 功能特性

- 🖼️ 一键去除图片背景
- 📦 支持拖拽上传
- ⚡ 5秒内完成处理
- 💾 透明 PNG 下载
- 📱 响应式设计，支持移动端
- 🎨 现代化 UI (Next.js + Tailwind CSS)

## 技术栈

- **前端框架**: Next.js 16 (App Router)
- **样式**: Tailwind CSS
- **语言**: TypeScript
- **托管**: Vercel / Cloudflare Pages
- **背景移除**: remove.bg API

## 项目结构

```
src/
├── app/
│   ├── api/
│   │   └── remove-background/
│   │       └── route.ts      # API 路由
│   ├── globals.css           # 全局样式
│   ├── layout.tsx            # 布局组件
│   └── page.tsx              # 主页面
├── PRD.md                    # 需求文档
└── README.md
```

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/lobubu/image-background-remover.git
cd image-background-remover
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

创建 `.env.local` 文件：

```env
REMOVE_BG_API_KEY=你的remove.bg API Key
```

获取 API Key: https://www.remove.bg/api

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 5. 构建生产版本

```bash
npm run build
npm start
```

## 部署

### Vercel (推荐)

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量 `REMOVE_BG_API_KEY`
4. 部署完成

## API 接口

### POST /api/remove-background

**请求**

```json
{
  "image": "data:image/jpeg;base64,..."
}
```

**成功响应**

```json
{
  "success": true,
  "result": "data:image/png;base64,..."
}
```

**错误响应**

```json
{
  "success": false,
  "error": "IMAGE_TOO_LARGE",
  "message": "图片大小不能超过 10MB"
}
```

## 成本

| 服务 | 免费额度 | 超出费用 |
|------|----------|----------|
| Vercel | 无限 | - |
| remove.bg API | 50 张/月 | $0.10-$0.20/张 |

## License

MIT

---

**GitHub**: https://github.com/lobubu/image-background-remover
