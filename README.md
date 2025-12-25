<div align="center">

# 💬 SimpleChat AI

> 基于 DeepSeek API 的现代化智能聊天助手 | Modern AI Chat Assistant powered by DeepSeek API

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5+-purple.svg)](https://vitejs.dev/)

一个简洁、高效的前后端分离聊天应用，支持实时流式对话、多会话管理、Markdown 渲染等功能。

[功能特性](#-功能特性) • [快速开始](#-快速开始) • [技术栈](#-技术栈) • [项目结构](#-项目结构)

</div>

---

## ✨ 功能特性

- 🤖 **智能对话** - 基于 DeepSeek API，提供流畅的 AI 对话体验
- 💨 **实时流式响应** - 采用 SSE 流式传输，消息实时显示
- 📱 **响应式设计** - 完美适配桌面端和移动端
- 🎨 **现代化 UI** - 毛玻璃效果、平滑动画、暗色/亮色主题切换
- 📝 **Markdown 支持** - 完美渲染 Markdown 格式，支持代码高亮
- 💾 **本地存储** - 聊天记录自动保存到本地，无需担心数据丢失
- 🗂️ **多会话管理** - 支持创建多个独立对话，轻松切换
- ⏸️ **暂停功能** - 可随时暂停 AI 响应
- 🎯 **简洁回答** - 优化的系统提示，让 AI 回答更精准简洁

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 或 **yarn** >= 1.22.0
- **DeepSeek API Key** ([获取地址](https://platform.deepseek.com/))

### 安装步骤

#### 1️⃣ 克隆项目

```bash
git clone https://github.com/Yevin-Yu/SimpleChatAI.git
cd SimpleChatAI
```

#### 2️⃣ 配置后端

```bash
cd backend
npm install
```

创建 `.env` 文件：

```env
# DeepSeek API 配置
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com/chat/completions

# 服务器配置
PORT=3001

# 前端地址（生产环境需要修改）
FRONTEND_URL=http://localhost:5173

# 可选：自定义系统提示（默认会要求 AI 回答简洁精准）
# DEEPSEEK_SYSTEM_PROMPT=你的自定义提示
```

#### 3️⃣ 启动后端服务

```bash
npm start
# 开发模式（自动重启）
npm run dev
```

后端服务运行在：`http://localhost:3001`

#### 4️⃣ 配置前端

```bash
cd ../frontend
npm install
```

#### 5️⃣ 启动前端应用

```bash
npm run dev
# 开发模式（热更新）
```

前端应用运行在：`http://localhost:5173`

### 🎉 完成！

打开浏览器访问 `http://localhost:5173`，开始使用 SimpleChat AI！

## 🛠️ 技术栈

### 后端
- **Node.js** - 运行时环境
- **Express** - Web 框架
- **Axios** - HTTP 客户端
- **dotenv** - 环境变量管理

### 前端
- **React 18** - UI 框架
- **Vite** - 构建工具
- **React Markdown** - Markdown 渲染
- **remark-gfm** - GitHub 风格 Markdown 支持
- **rehype-highlight** - 代码高亮
- **CSS3** - 样式（原生 CSS，无 UI 框架依赖）


## 🔧 配置说明

### 环境变量

#### 后端 (`backend/.env`)

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | - | ✅ |
| `DEEPSEEK_API_URL` | DeepSeek API 地址 | `https://api.deepseek.com/chat/completions` | ❌ |
| `PORT` | 服务器端口 | `3001` | ❌ |
| `FRONTEND_URL` | 前端地址（CORS） | `http://localhost:5173` | ❌ |
| `DEEPSEEK_SYSTEM_PROMPT` | 自定义系统提示 | `请用最少、最精准的文字回答...` | ❌ |

### 自定义系统提示

你可以通过环境变量 `DEEPSEEK_SYSTEM_PROMPT` 自定义 AI 的系统提示，控制 AI 的回答风格。

默认提示会让 AI 回答更简洁精准，你可以根据需求修改：

```env
DEEPSEEK_SYSTEM_PROMPT=你是一个专业的技术顾问，请提供详细的技术解答。
```

## 📡 API 接口

### POST `/api/chat`

发送聊天消息（流式响应）

**请求：**
```http
POST /api/chat
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "你好" }
  ]
}
```

**响应（SSE 流式）：**
```
data: {"content":"你","done":false}
data: {"content":"好","done":false}
data: {"content":"！","done":false}
data: {"done":true}
```

## 🏗️ 开发

### 开发模式

```bash
# 后端（自动重启）
cd backend
npm run dev

# 前端（热更新）
cd frontend
npm run dev
```

### 生产构建

```bash
# 构建前端
cd frontend
npm run build

# 构建产物在 dist/ 目录
```

### 代码规范

- 使用 ES6+ 语法
- 遵循 React Hooks 最佳实践
- 组件采用函数式组件
- 使用自定义 Hooks 封装复用逻辑

## ⚠️ 注意事项

1. **API Key 安全**
   - 不要将 `.env` 文件提交到版本控制系统
   - 生产环境请使用环境变量或密钥管理服务

2. **CORS 配置**
   - 部署时需要修改后端的 `FRONTEND_URL` 环境变量
   - 支持多个地址，用逗号分隔

3. **API 限制**
   - 注意 DeepSeek API 的调用频率和额度限制
   - 建议添加请求限流和错误处理

4. **浏览器兼容**
   - 现代浏览器（Chrome, Firefox, Safari, Edge 最新版本）
   - 移动端浏览器支持良好

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

## 🙏 致谢

- [DeepSeek](https://www.deepseek.com/) - 提供强大的 AI API
- [React](https://reactjs.org/) - 优秀的 UI 框架
- [Vite](https://vitejs.dev/) - 极速的前端构建工具

---

<div align="center">

**如果这个项目对你有帮助，请给个 ⭐ Star！**

Made with ❤️ by [Yevin-Yu](https://github.com/Yevin-Yu)

</div>
