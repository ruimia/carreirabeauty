"use client";

import { useState } from "react";

interface DayCount {
  date: string; // YYYY-MM-DD
  count: number;
}

export default function DailySignupsChart({ data }: { data: DayCount[] }) {
  const [hover, setHover] = useState<number | null>(null);

  const max = Math.max(1, ...data.map((d) => d.count));
  const width = 700;
  const height = 160;
  const padTop = 8;
  const padBottom = 24;
  const barGap = 2;
  const barWidth = data.length ? width / data.length - barGap : 0;
  const plotHeight = height - padTop - padBottom;

  const total = data.reduce((s, d) => s + d.count, 0);

  function formatDate(dateStr: string) {
    const [, m, d] = dateStr.split("-");
    return `${d}/${m}`;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-700 text-sm">Cadastros por dia</h2>
        <span className="text-xs text-gray-400">{total} nos últimos {data.length} dias</span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ overflow: "visible" }}>
        {data.map((d, i) => {
          const barHeight = max > 0 ? (d.count / max) * plotHeight : 0;
          const x = i * (barWidth + barGap);
          const y = padTop + (plotHeight - barHeight);
          const isHover = hover === i;
          const showLabel = data.length <= 14 || i % Math.ceil(data.length / 10) === 0 || i === data.length - 1;

          return (
            <g key={d.date}>
              {/* Hit target — full column height, wider than the visual bar */}
              <rect
                x={x - barGap / 2}
                y={0}
                width={barWidth + barGap}
                height={height}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
              <rect
                x={x}
                y={y}
                width={Math.max(barWidth, 1)}
                height={Math.max(barHeight, d.count > 0 ? 3 : 0)}
                rx={3}
                fill={isHover ? "var(--color-brand-primary-hover, #ba00b9)" : "#dc00dc"}
                style={{ transition: "fill 100ms" }}
              />
              {showLabel && (
                <text
                  x={x + barWidth / 2}
                  y={height - 6}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#a1a1aa"
                >
                  {formatDate(d.date)}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {hover !== null && data[hover] && (
        <div className="mt-1 text-xs text-gray-600">
          <span className="font-semibold text-gray-800">{data[hover].count}</span> cadastro{data[hover].count === 1 ? "" : "s"} em{" "}
          <span className="font-medium">{formatDate(data[hover].date)}</span>
        </div>
      )}
    </div>
  );
}
