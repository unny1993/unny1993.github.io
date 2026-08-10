#!/bin/bash
# ============================================================
# 博客一键推送 + 自动备份（post-commit 钩子自动调用）
# 用法：
#   手动一键推送：bash push-and-backup.sh
#   每次 git commit 后自动执行备份（无需手动）
# ============================================================
set -u

REPO="C:/Users/a1324/blog-push"
BUNDLE_DIR="C:/Users/a1324/backup"
SYNC_DIR="C:/Users/a1324/blog-backup"
FILES="app.js index.html style.css rss.xml avatar.jpeg README.md .nojekyll"

cd "$REPO" || { echo "[backup] 无法进入仓库 $REPO"; exit 1; }

# ---------- 1. bundle 离线兜底备份 ----------
STAMP=$(date +%Y%m%d)
BUNDLE="$BUNDLE_DIR/blog-push-$STAMP.bundle"
mkdir -p "$BUNDLE_DIR"
git bundle create "$BUNDLE" --all >/dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "[backup] bundle OK -> $BUNDLE"
else
  echo "[backup] bundle 失败（忽略，不影响后续）"
fi

# ---------- 2. 同步纯文件备份目录（阿里云同步盘指向这里） ----------
mkdir -p "$SYNC_DIR"
for f in $FILES; do
  if [ -f "$f" ]; then
    cp -f "$f" "$SYNC_DIR/"
  else
    echo "[backup] 警告：仓库缺少 $f"
  fi
done
echo "[backup] 已同步 $FILES -> $SYNC_DIR"

# ---------- 3. 若带参数 push 则顺便推送 ----------
if [ "${1:-}" = "push" ]; then
  git add app.js index.html style.css README.md .gitignore
  git commit -m "update" 2>/dev/null || echo "[push] 无变更可提交"
  git push origin main && echo "[push] 已推送到 GitHub"
fi

echo "[backup] 完成 ✅"
# test
