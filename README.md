# 推送备忘

## 仓库
- GitHub: unny1993/unny1993.github.io
- 分支: main
- 本地: D:\BLOG

## 推送命令
```bash
cd D:\BLOG
git add -A
git commit -m "update"
git push origin main
```

## 关键文件
- index.html — 首页 + 仪表盘渲染逻辑
- app.js — 数据层（DEFAULT_XXX 常量、loadFromStorage、DATA_VERSION）
- style.css — 样式
- .nojekyll — 必须存在，否则 GitHub Pages 吞 JS

## 注意事项
- 改 DEFAULT_XXX 后递增 DATA_VERSION，所有浏览器自动同步
- 仪表盘数据走 localStorage，首次加载由 loadFromStorage 写回
- 管理后台增删改只写 localStorage，要持久化需导出 JSON → 更新 app.js → 推送
