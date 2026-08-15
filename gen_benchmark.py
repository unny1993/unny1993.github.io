# -*- coding: utf-8 -*-
"""
生成 blog-push 仪表盘的「猴子策略」基准数据。
读取 V5 向上取整基准 equity_curve，rebase 到实盘起点资本，
输出 benchmark_data.js 供 index.html 叠加「实盘净值 vs 基准曲线」与百万倒计时使用。

用法: python gen_benchmark.py
依赖: pandas, numpy（托管 venv）
"""
import pandas as pd
import numpy as np
import json
import os

EQ_PATH = r"D:\猴子策略\output\monkey_strategy_v5\equity_curve.csv"
SH_PATH = r"D:\猴子策略\data\sh000001_close.csv"
OUT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "benchmark_data.js")

# 实盘口径（与 data/account.json、dashboard START_DATE 对齐）
LIVE_START = "2026-08-15"
LIVE_CAPITAL = 9314.41
TARGET = 1_000_000.0

def main():
    eq = pd.read_csv(EQ_PATH, encoding="utf-8-sig")
    eq["date"] = pd.to_datetime(eq["date"])
    eq = eq.sort_values("date").reset_index(drop=True)
    eq_vals = eq["equity"].to_numpy(dtype=float)
    start, end = eq_vals[0], eq_vals[-1]
    n = len(eq_vals)
    years = (eq["date"].iloc[-1] - eq["date"].iloc[0]).days / 365.25
    cagr = (end / start) ** (1 / years) - 1

    # 每日净值比值（相对起点 9000），用于复盘叠加与回撤/滚动夏普图
    daily_ratio = (eq_vals / start).round(4).tolist()

    # 年化波动率（用于基准置信带）
    daily_ret = np.diff(eq_vals) / eq_vals[:-1]
    ann_vol = float(daily_ret.std(ddof=1) * np.sqrt(250))

    # 上证对比序列：rebase 到 V5 净值同一起点(首日)，按 V5 交易日对齐(ffill)
    try:
        sh = pd.read_csv(SH_PATH, index_col=0, parse_dates=True, encoding="utf-8-sig").iloc[:, 0]
        sh = sh[sh.index >= eq["date"].iloc[0]]
        sh = sh.reindex(eq["date"]).ffill().dropna()
        sh_ratio = (sh / sh.iloc[0]).round(4).tolist()
        sh_ok = True
    except Exception as e:
        sh_ratio = []; sh_ok = False
        print("WARN 上证序列加载失败:", e)

    # 倒计时用的几何年化（CAGR）
    # 预计达成年数: ln(TARGET/capital)/ln(1+cagr)
    yrs_to_target = np.log(TARGET / LIVE_CAPITAL) / np.log(1 + cagr)

    data = {
        "liveStart": LIVE_START,
        "liveCapital": LIVE_CAPITAL,
        "target": TARGET,
        "cagr": round(cagr, 4),
        "annVol": round(ann_vol, 4),
        "benchStart": str(eq["date"].iloc[0].date()),
        "benchEnd": str(eq["date"].iloc[-1].date()),
        "benchLen": n,
        "daily": daily_ratio,          # 基准每日净值 / 9000（实际曲线，含回撤）
        "sh": sh_ratio,               # 上证 rebased 1.000（与 daily 同日对齐）
        "shOk": sh_ok,
        "yrsToTarget": round(float(yrs_to_target), 2),
    }

    js = "// 自动生成 by gen_benchmark.py —— 不要手改\n"
    js += "// 猴子策略(V5向上取整口径)基准曲线 rebased 到实盘起点，供仪表盘叠加与百万倒计时\n"
    js += "window.MONKEY_BENCH = " + json.dumps(data, ensure_ascii=False) + ";\n"
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        f.write(js)

    print(f"基准区间 {data['benchStart']}~{data['benchEnd']} ({n} 交易日)")
    print(f"实盘起点 {LIVE_START} | 本金 {LIVE_CAPITAL:,.2f} | 目标 {TARGET:,.0f}")
    print(f"基准 CAGR {cagr*100:.2f}% | 年化波动 {ann_vol*100:.2f}% | 达百万约 {yrs_to_target:.1f} 年")
    print(f"上证对比序列: {'OK' if sh_ok else '跳过'} ({len(sh_ratio)} 点)")
    print(f"已写出 {OUT_PATH}")

if __name__ == "__main__":
    main()
