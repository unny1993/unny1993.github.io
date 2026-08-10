# 推送备忘

## 仓库
- GitHub: unny1993/unny1993.github.io
- 分支: main
- 本地: D:\BLOG

## 推送命令
```bash
cd D:\BLOG
git add app.js index.html style.css README.md .gitignore
git commit -m "update"
git push origin main
```
> 不要用 `git add -A`：仓库根目录的 `.workbuddy/`（WorkBuddy 工具记忆目录）已在 `.gitignore` 忽略，精准 add 上面列出的文件即可，避免误提交工具数据。

## 关键文件
- index.html — 首页 + 仪表盘渲染逻辑
- app.js — 数据层（DEFAULT_XXX 常量、loadFromStorage、DATA_VERSION）
- style.css — 样式
- .nojekyll — 必须存在，否则 GitHub Pages 吞 JS

## 注意事项
- 改 DEFAULT_XXX 后递增 DATA_VERSION，所有浏览器自动同步
- 仪表盘数据走 localStorage，首次加载由 loadFromStorage 写回
- 管理后台增删改只写 localStorage，要持久化：后台点「导出文件」下载 blog-data.json → 发给我回填 app.js（或自行「导入文件」即时生效）→ 推送
