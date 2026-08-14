#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""猴子策略每日 A 股复盘 → 博客文章登记（blog-push/app.js DEFAULT_ARTICLES + DEFAULT_COLLECTIONS）

用法:
    python review_publish.py [YYYY-MM-DD] [push] [--dry-run]
    例: python review_publish.py 2026-08-14 push

流程: 读 D:\\猴子策略\\data\\reviews\\review_<date>.{json,html}
      → 构造文章(分类"回顾") → 追加 DEFAULT_ARTICLES
      → 更新/创建「回顾」文集 articleIds → DATA_VERSION+1 → node --check
      → cache-bust → [push] git add/commit/push
幂等: 若该日期已有「回顾」文章，跳过不重复登记
"""
import sys
import os
import json
import re
import datetime
import subprocess

BASE = os.path.dirname(os.path.abspath(__file__))
APP_JS = os.path.join(BASE, 'app.js')
INDEX_HTML = os.path.join(BASE, 'index.html')
REVIEW_DIR = r"D:\猴子策略\data\reviews"
CATEGORY = "回顾"
COLLECTION_NAME = "回顾,"


def err(msg):
    print('[ERROR]', msg, file=sys.stderr)
    sys.exit(1)


def extract_const_block(src, name):
    """返回 (start, end)：const NAME = ...; 的绝对区间。"""
    m = re.search(r'const ' + name + r'\s*=\s*', src)
    if not m:
        return None
    k = m.end()
    while k < len(src) and src[k] in ' \t':
        k += 1
    open_ch = src[k]
    close_ch = '}' if open_ch == '{' else ']'
    depth = 0
    p = k
    while p < len(src):
        c = src[p]
        if c == open_ch:
            depth += 1
        elif c == close_ch:
            depth -= 1
            if depth == 0:
                return (m.start(), p + 1)
        p += 1
    return None


def replace_const(src, name, new_val):
    """在 src 中整体替换 const NAME = ...; 为 json 序列化的新值"""
    blk = extract_const_block(src, name)
    if not blk:
        err('app.js 中未找到 ' + name)
    s, e = blk
    new_text = 'const {0} = {1};'.format(name, json.dumps(new_val, ensure_ascii=False, indent=4))
    return src[:s] + new_text + src[e:]


def make_excerpt(d):
    """从复盘 JSON 生成文章摘要"""
    m, s, ld = d.get('market', {}), d.get('sentiment', {}), d.get('ladder', {})
    parts = []
    if m.get('shanghai'):
        parts.append(f"上证 {m['shanghai']}({m.get('shanghai_pct',0):+.2f}%)")
    if m.get('amount_yi'):
        parts.append(f"成交{m['amount_yi']:.0f}亿")
    if s.get('limit_up') is not None:
        parts.append(f"涨停{s['limit_up']}/跌停{s['limit_down']}")
    if s.get('zha_ban_rate') is not None:
        parts.append(f"炸板率{s['zha_ban_rate']}%")
    if ld.get('max_board'):
        parts.append(f"最高{ld['max_board']}板")
    sec = d.get('sectors', [])
    if sec:
        parts.append(f"主线:{sec[0]['行业']}")
    return ' · '.join(parts)


def main():
    today = sys.argv[1] if len(sys.argv) > 1 else datetime.date.today().strftime('%Y-%m-%d')
    mode = 'push' if 'push' in sys.argv else ''
    dry = '--dry-run' in sys.argv

    rj = os.path.join(REVIEW_DIR, f'review_{today}.json')
    rh = os.path.join(REVIEW_DIR, f'review_{today}.html')
    if not os.path.exists(rj) or not os.path.exists(rh):
        err(f'复盘文件不存在: 需要 {rj} 与 {rh}\n先运行 review_gen.py {today}')
    d = json.load(open(rj, encoding='utf-8'))
    content = open(rh, encoding='utf-8').read()

    with open(APP_JS, encoding='utf-8') as f:
        src = f.read()

    blk = extract_const_block(src, 'DEFAULT_ARTICLES')
    if not blk:
        err('app.js 中未找到 DEFAULT_ARTICLES')
    articles = json.loads(src[blk[0]:blk[1]].split('=', 1)[1].strip().rstrip(';'))
    blk2 = extract_const_block(src, 'DEFAULT_COLLECTIONS')
    collections = json.loads(src[blk2[0]:blk2[1]].split('=', 1)[1].strip().rstrip(';'))

    # 幂等检查
    exists = [a for a in articles if a.get('date') == today and a.get('category') == CATEGORY]
    if exists:
        print(f'==> {today} 已有「{CATEGORY}」文章 (id={exists[0].get("id")})，跳过登记')
        return 0

    # 构造文章
    new_id = (max((a.get('id', 0) for a in articles), default=0)) + 1
    article = {
        "id": new_id,
        "category": CATEGORY,
        "date": today,
        "title": f"{today} A股复盘",
        "excerpt": make_excerpt(d),
        "content": content,
    }
    articles.append(article)

    # 更新/创建「回顾」文集
    col = next((c for c in collections if c.get('name', '').strip('，,') == COLLECTION_NAME), None)
    if col is None:
        col = {"name": COLLECTION_NAME, "articleIds": []}
        collections.append(col)
    if new_id not in col['articleIds']:
        col['articleIds'].append(new_id)

    print('==> 待登记文章:')
    print('   ', json.dumps({k: article[k] for k in ('id', 'category', 'date', 'title')}, ensure_ascii=False))
    print('    摘要:', article['excerpt'])
    print('==> 追加后文章共', len(articles), '篇；「%s」文集 %d 篇' % (COLLECTION_NAME, len(col['articleIds'])))

    if dry:
        print('==> --dry-run 模式：仅预览，未修改任何文件')
        return 0

    # 重写两个常量（从后往前替换避免偏移）
    out = src
    out = replace_const(out, 'DEFAULT_COLLECTIONS', collections)
    out = replace_const(out, 'DEFAULT_ARTICLES', articles)

    # DATA_VERSION +1
    m = re.search(r'const DATA_VERSION = (\d+);', out)
    if not m:
        err('未找到 DATA_VERSION')
    old_ver, new_ver = int(m.group(1)), int(m.group(1)) + 1
    out = out[:m.start()] + 'const DATA_VERSION = {0};'.format(new_ver) + out[m.end():]

    # node --check
    tmp = APP_JS + '.tmpcheck.js'
    with open(tmp, 'w', encoding='utf-8', newline='\n') as f:
        f.write(out)
    node_bin = os.environ.get('NODE_BIN', 'node')
    r = subprocess.run([node_bin, '--check', tmp], capture_output=True, text=True)
    if r.returncode != 0:
        err('JS 语法错误，已中止（未写盘）:\n' + (r.stderr or r.stdout))

    with open(APP_JS, 'w', encoding='utf-8', newline='\n') as f:
        f.write(out)

    # cache-bust
    with open(INDEX_HTML, encoding='utf-8') as f:
        html = f.read()
    if not re.search(r'app\.js\?v=[0-9a-z]+', html):
        err('index.html 中未找到 app.js?v= 引用')
    new_v = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
    html2 = re.sub(r'app\.js\?v=[0-9a-z]+', 'app.js?v=' + new_v, html)
    with open(INDEX_HTML, 'w', encoding='utf-8', newline='\n') as f:
        f.write(html2)

    print('==> 已更新 app.js: 文章+文集，DATA_VERSION {0}->{1}，cache-bust v={2}'.format(old_ver, new_ver, new_v))

    if mode == 'push':
        subprocess.run(['git', 'add', 'app.js', 'index.html'], cwd=BASE, check=True)
        subprocess.run(['git', 'commit', '-m',
                        'data: {0} A股复盘推送，DATA_VERSION {1}->{2}'.format(today, old_ver, new_ver)],
                       cwd=BASE, check=True)
        subprocess.run(['git', 'push', 'origin', 'main'], cwd=BASE, check=True)
        print('==> 已提交并推送')
    else:
        print('==> 未推送。加 push 参数可自动提交推送。')
    return 0


if __name__ == '__main__':
    sys.exit(main())
