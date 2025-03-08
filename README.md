# PinDown - Pinterest 图片下载工具

一个简单易用的工具，帮助您从 Pinterest 链接中提取并下载高清原图。

![PinDown 应用截图](./screenshot/1.png)

## 项目简介

PinDown 是一个基于 Web 的应用程序，专为解决从 Pinterest 下载的图片不是原图而设计。它可以从 Pinterest 链接中提取高清原图，并提供一键下载功能，无需注册或安装浏览器插件。

### 主要功能

- 从 Pinterest 链接中提取高清原图
- 一键复制图片链接
- 一键下载图片到本地
- 简洁美观的用户界面
- 响应式设计，适配各种设备

## 技术栈

- **前端框架**: [Svelte](https://svelte.dev/) + [SvelteKit](https://kit.svelte.dev/)
- **UI 组件**: [DaisyUI](https://daisyui.com/) + [Tailwind CSS](https://tailwindcss.com/)
- **图标**: [Lucide Icons](https://lucide.dev/)
- **运行时**: [Bun](https://bun.sh/)
- **HTML 解析**: [Cheerio](https://cheerio.js.org/)
- **容器化**: Docker/Podman

## 本地开发

### 前提条件

- [Bun](https://bun.sh/) (推荐) 或 Node.js 16+

### 安装步骤

1. 克隆仓库

```bash
git clone https://github.com/yourusername/pindown.git
cd pindown
```

2. 安装依赖

```bash
bun install
# 或者使用 npm
# npm install
```

3. 启动开发服务器

```bash
bun run dev
# 或者在新的浏览器标签中打开应用
bun run dev -- --open
```

4. 构建生产版本

```bash
bun run build
```

5. 预览生产构建

```bash
bun run preview
```

## Docker 部署

### 使用 Docker 或 Podman 部署

```bash
# 使用 Docker
docker run -p 3000:3000 jlvihv/pindown:latest

# 使用 Podman
podman run -p 3000:3000 docker.io/jlvihv/pindown:latest
```

### 自定义端口

容器内部暴露的是 3000 端口，您可以将其映射到主机的任意端口：

```bash
# 映射到主机的 8080 端口
docker run -p 8080:3000 jlvihv/pindown:latest

# 或使用 Podman
podman run -p 8080:3000 docker.io/jlvihv/pindown:latest
```

这样您就可以通过 http://localhost:8080 访问应用了。

## 使用方法

1. 访问应用（本地开发为 http://localhost:5173，Docker部署为 http://localhost:3000）
2. 粘贴 Pinterest 图片链接到输入框
3. 点击「解析」按钮
4. 等待解析完成后，可以选择复制图片链接或直接下载图片

## 贡献指南

欢迎提交 Pull Request 或创建 Issue 来帮助改进这个项目！

## 许可证

MIT
