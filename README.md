# SimpleChat - 智能聊天助手

基于 Deepseek API 的智能聊天工具，采用前后端分离架构。

## 功能特性

- 💬 流畅的聊天界面
- 🤖 基于 Deepseek 的 AI 对话
- 📱 响应式设计，支持移动端
- ⚡ 快速响应，实时对话
- 🎨 现代化的 UI 设计

## 项目结构

```
SimpleChat/
├── backend/                    # 后端服务
│   ├── server.js              # Express 服务器入口
│   ├── config.js              # 配置管理
│   ├── routes/                 # 路由
│   │   └── chat.js            # 聊天接口路由
│   ├── utils/                  # 工具函数
│   │   ├── streamParser.js    # 流式数据解析
│   │   └── errorHandler.js    # 错误处理
│   └── package.json
├── frontend/                   # 前端应用
│   ├── src/
│   │   ├── components/         # React 组件
│   │   │   ├── ChatHeader.jsx
│   │   │   ├── ChatInput.jsx
│   │   │   └── Message.jsx
│   │   ├── utils/              # 工具函数
│   │   │   └── api.js         # API 调用
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 快速开始

### 前置要求

- Node.js 18+ 
- npm 或 yarn
- Deepseek API Key

### 1. 安装后端依赖

```bash
cd backend
npm install
```

### 2. 配置后端环境变量

在 `backend` 目录下创建 `.env` 文件并填入配置：

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 3. 启动后端服务

```bash
npm start
# 或开发模式（自动重启）
npm run dev
```

后端服务将运行在 `http://localhost:3001`

### 4. 安装前端依赖

打开新的终端窗口：

```bash
cd frontend
npm install
```

### 5. 启动前端应用

```bash
npm run dev
```

前端应用将运行在 `http://localhost:5173`

## 使用说明

1. 在浏览器中打开 `http://localhost:5173`
2. 在输入框中输入你的问题
3. 按 Enter 发送消息，或点击"发送"按钮
4. AI 助手会实时回复你的消息

## API 接口

### POST /api/chat

发送聊天消息

**请求体：**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "你好"
    }
  ]
}
```

**响应（流式 SSE）：**
```
data: {"content":"你","done":false}

data: {"content":"好","done":false}

data: {"content":"！","done":false}

data: {"done":true}
```

## 技术栈

### 后端
- Node.js
- Express
- Axios
- CORS

### 前端
- React 18
- Vite
- Fetch API (流式响应)
- CSS3

## 开发

### 后端开发模式
```bash
cd backend
npm run dev
```

### 前端开发模式
```bash
cd frontend
npm run dev
```

### 构建生产版本
```bash
cd frontend
npm run build
```

## 注意事项

1. **API Key 安全**：请勿将 `.env` 文件提交到版本控制系统
2. **CORS 配置**：如需部署，请修改后端的 CORS 配置
3. **API 限制**：注意 Deepseek API 的调用频率限制

## 许可证

MIT

