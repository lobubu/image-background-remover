# Image Background Remover

> 基于 Cloudflare Workers + remove.bg API 的在线图片背景移除工具

## 功能特性

- 🖼️ 一键去除图片背景
- 📦 支持拖拽上传
- ⚡ 5秒内完成处理
- 💾 透明 PNG 下载
- 📱 响应式设计，支持移动端

## 技术栈

- **前端**: HTML + Tailwind CSS + Vanilla JS
- **托管**: Cloudflare Pages
- **API**: Cloudflare Workers
- **背景移除**: remove.bg API

## 项目结构

```
├── frontend/          # 前端静态页面
│   ├── index.html
│   ├── style.css
│   └── app.js
├── worker/            # Cloudflare Workers API
│   └── index.js
├── PRD.md             # 需求文档
└── README.md
```

## 快速开始

### 1. 部署 Workers API

```bash
cd worker
npm install
npm run deploy
```

### 2. 配置环境变量

在 Cloudflare Dashboard 中设置：
- `REMOVE_BG_API_KEY`: 你的 remove.bg API Key

### 3. 部署前端

```bash
cd frontend
# 上传到 Cloudflare Pages
```

## 成本

- **Cloudflare Pages**: 免费
- **Cloudflare Workers**: 10万次请求/天 免费
- **remove.bg API**: 50张/月 免费

## License

MIT
