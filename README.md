# 推送备忘

## 仓库
- GitHub: unny1993/unny1993.github.io
- 分支: main
- 本地: C:\Users\a1324\blog-push（唯一本地仓库；D:\BLOG 已于 2026-08-10 删除）

## 推送命令
```bash
cd C:\Users\a1324\blog-push
git add app.js index.html style.css README.md .gitignore
git commit -m "update"
git push origin main
```
> 不要用 `git add -A`：仓库根目录的 `.workbuddy/`（WorkBuddy 工具记忆目录）已在 `.gitignore` 忽略，精准 add 上面列出的文件即可，避免误提交工具数据。

## 备份（推送成功后必做）
```bash
git bundle create C:\Users\a1324\backup\blog-push-$(date +%Y%m%d).bundle --all
```
> `C:\Users\a1324\backup` 不在阿里云同步范围内，作为本地离线兜底；恢复方法：`git clone <bundle文件> 新目录`。GitHub 远端是权威源（Pages 从 GitHub 拉），本地 `.git` 即使被同步盘搞坏也能秒级恢复。

## ⚠️ 阿里云同步风险（重要）
- 本地目录 `C:\Users\a1324\blog-push` 被阿里云同步盘以 backup 模式整目录监控（含 `.git`）。
- 官方客户端排除规则只支持按文件扩展名/类别，**无法排除 `.git` 目录**（其内多为无扩展名文件），直接改客户端数据库会被覆盖。
- 风险：push/commit 时同步客户端可能锁住 `index`/`packed-refs`，偶发 `index.lock`/`cannot lock ref` 错误。遇到报错把信息发给 AI 排查即可，数据不会丢（有 GitHub + bundle 双保险）。
- 彻底根除方案（可选）：把仓库迁出同步目录（如 `C:\repos\blog-push`），阿里云只同步发布产物。

## 关键文件
- index.html — 首页 + 仪表盘渲染逻辑
- app.js — 数据层（DEFAULT_XXX 常量、loadFromStorage、DATA_VERSION）
- style.css — 样式
- .nojekyll — 必须存在，否则 GitHub Pages 吞 JS

## 注意事项
- 改 DEFAULT_XXX 后递增 DATA_VERSION，所有浏览器自动同步
- 仪表盘数据走 localStorage，首次加载由 loadFromStorage 写回
- 管理后台增删改只写 localStorage，要持久化：后台点「导出文件」下载 blog-data.json → 发给我回填 app.js（或自行「导入文件」即时生效）→ 推送
