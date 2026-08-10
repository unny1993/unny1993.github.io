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
# 1) 离线 bundle 兜底（不在任何同步盘内）
git bundle create C:\Users\a1324\backup\blog-push-$(date +%Y%m%d).bundle --all

# 2) 同步纯文件备份目录（阿里云同步盘监控这个目录，不含 .git）
cp -f app.js index.html style.css rss.xml avatar.jpeg README.md .nojekyll C:/Users/a1324/blog-backup/
```
> `C:\Users\a1324\backup` 是本地离线 bundle 兜底（不在同步盘）；`C:\Users\a1324\blog-backup` 是纯发布文件备份目录（无 .git），**请在阿里云同步盘客户端把同步/备份路径指向它**。bundle 恢复方法：`git clone <bundle文件> 新目录`。GitHub 远端是权威源（Pages 从 GitHub 拉）。

## ⚠️ 阿里云同步策略（重要）
- **不要把 git 仓库目录（C:\Users\a1324\blog-push）放进阿里云同步盘**：官方客户端排除规则只支持按文件扩展名/类别，无法排除 `.git` 目录（其内多为无扩展名文件）；同步客户端会锁住 `index`/`packed-refs`，导致偶发 `index.lock`/`cannot lock ref`（2026-08-10 实测遇到过一次）。
- **正确姿势**：git 仓库留在本地不参与同步；每次推送后把 7 个发布文件复制到 `C:\Users\a1324\blog-backup`，阿里云只同步这个纯文件目录做云端备份。

## 关键文件
- index.html — 首页 + 仪表盘渲染逻辑
- app.js — 数据层（DEFAULT_XXX 常量、loadFromStorage、DATA_VERSION）
- style.css — 样式
- .nojekyll — 必须存在，否则 GitHub Pages 吞 JS

## 注意事项
- 改 DEFAULT_XXX 后递增 DATA_VERSION，所有浏览器自动同步
- 仪表盘数据走 localStorage，首次加载由 loadFromStorage 写回
- 管理后台增删改只写 localStorage，要持久化：后台点「导出文件」下载 blog-data.json → 发给我回填 app.js（或自行「导入文件」即时生效）→ 推送
