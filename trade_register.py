#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""猴子策略交易登记脚本：买卖成交 → 同步登记博客仪表板（blog-push/app.js DEFAULT_TRADE_RECORDS）

用法:
    python trade_register.py <date> <type> <code> <name> <amount> <fee> [push] [--dry-run]
    例: python trade_register.py 2026-08-17 买入 600667 太极实业 64500.00 16.5 push
    例: python trade_register.py 2026-08-18 卖出 600667 太极实业 67000.00 18.0 push

流程: 解析 app.js DEFAULT_TRADE_RECORDS → 追加记录(id自增) → 重写常量
      → DATA_VERSION+1 → node --check → cache-bust → [push] git add/commit/push
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
CONST_NAME = 'DEFAULT_TRADE_RECORDS'
START_MARKER = '// ===== 默认数据 ====='
END_MARKER = '// ===== 数据版本控制 ====='


def err(msg):
    print('[ERROR]', msg, file=sys.stderr)
    sys.exit(1)


def extract_const_block(src, name):
    """返回 (start, end, raw)：const NAME = ...; 的绝对区间与原文。"""
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
                return (m.start(), p + 1, src[m.start():p + 1])
        p += 1
    return None


def main():
    if len(sys.argv) < 7:
        err('用法: trade_register.py <date> <type> <code> <name> <amount> <fee> [push] [--dry-run]')
    date, ttype, code, name = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
    amount, fee = float(sys.argv[5]), float(sys.argv[6])
    mode = sys.argv[7] if len(sys.argv) > 7 else ''
    dry = '--dry-run' in sys.argv

    with open(APP_JS, encoding='utf-8') as f:
        src = f.read()

    block = extract_const_block(src, CONST_NAME)
    if not block:
        err('app.js 中未找到 ' + CONST_NAME)
    s, e, raw = block
    cur = json.loads(raw[raw.index('=') + 1:].strip().rstrip(';'))

    new_id = (max((r.get('id', 0) for r in cur), default=0)) + 1
    record = {"id": new_id, "date": date, "type": ttype, "code": code,
              "name": name, "amount": amount, "fee": fee}
    cur.append(record)

    print('==> 待登记记录:')
    print('   ', json.dumps(record, ensure_ascii=False))
    print('==> 追加后共', len(cur), '条')

    if dry:
        print('==> --dry-run 模式：仅预览，未修改任何文件')
        return 0

    # ---- 重写 DEFAULT_TRADE_RECORDS 常量（仅此一个，其他不动）----
    start = src.index(START_MARKER)
    end = src.index(END_MARKER)
    region_start = start + len(START_MARKER)
    out = src[:start] + START_MARKER
    # 区段内只此一个常量（trade_records 定义位置在默认数据区）
    new_text = 'const {0} = {1};'.format(CONST_NAME, json.dumps(cur, ensure_ascii=False, indent=4))
    if region_start <= s:
        out += src[region_start:s] + new_text + src[e:end]
    else:
        # 保险：若常量在区段外，直接整体替换
        out = src[:s] + new_text + src[e:]
        out = out[:out.index(END_MARKER)] + src[src.index(END_MARKER):]
    out += src[end:]

    # ---- DATA_VERSION +1 ----
    m = re.search(r'const DATA_VERSION = (\d+);', out)
    if not m:
        err('未找到 DATA_VERSION')
    old_ver = int(m.group(1))
    new_ver = old_ver + 1
    out = out[:m.start()] + 'const DATA_VERSION = {0};'.format(new_ver) + out[m.end():]

    # ---- node --check ----
    tmp = APP_JS + '.tmpcheck.js'
    with open(tmp, 'w', encoding='utf-8', newline='\n') as f:
        f.write(out)
    node_bin = os.environ.get('NODE_BIN', 'node')
    r = subprocess.run([node_bin, '--check', tmp], capture_output=True, text=True)
    if r.returncode != 0:
        err('JS 语法错误，已中止（未写盘）:\n' + (r.stderr or r.stdout))

    with open(APP_JS, 'w', encoding='utf-8', newline='\n') as f:
        f.write(out)

    # ---- cache-bust ----
    with open(INDEX_HTML, encoding='utf-8') as f:
        html = f.read()
    if not re.search(r'app\.js\?v=[0-9a-z]+', html):
        err('index.html 中未找到 app.js?v= 引用')
    new_v = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
    html2 = re.sub(r'app\.js\?v=[0-9a-z]+', 'app.js?v=' + new_v, html)
    with open(INDEX_HTML, 'w', encoding='utf-8', newline='\n') as f:
        f.write(html2)

    print('==> 已更新 app.js: {0}，DATA_VERSION {1}->{2}，cache-bust v={3}'.format(
        CONST_NAME, old_ver, new_ver, new_v))

    # ---- push ----
    if mode == 'push':
        subprocess.run(['git', 'add', 'app.js', 'index.html'], cwd=BASE, check=True)
        subprocess.run(['git', 'commit', '-m',
                        'data: 交易登记 {0} {1} {2}，DATA_VERSION {3}->{4}'.format(
                            ttype, code, date, old_ver, new_ver)],
                       cwd=BASE, check=True)
        subprocess.run(['git', 'push', 'origin', 'main'], cwd=BASE, check=True)
        print('==> 已提交并推送（post-commit 钩子自动备份）')
    else:
        print('==> 未推送。加 push 参数可自动提交推送。')
    return 0


if __name__ == '__main__':
    sys.exit(main())
