interface Point {
  label: string;
  percent: number;
}

/** Simple accessible bar chart of scores (0-100%). A visually hidden table gives the same data. */
export default function BarChart({ data }: { data: Point[] }) {
  const w = 480;
  const h = 180;
  const pad = { l: 32, r: 8, t: 12, b: 24 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const slot = innerW / Math.max(data.length, 1);
  const barW = Math.min(36, slot * 0.7);

  return (
    <figure>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label={`Bar chart of your last ${data.length} scores`}
        className="w-full"
      >
        {[0, 50, 100].map((t) => {
          const y = pad.t + innerH - (t / 100) * innerH;
          return (
            <g key={t}>
              <line x1={pad.l} x2={w - pad.r} y1={y} y2={y} className="stroke-slate-200" />
              <text x={pad.l - 4} y={y + 4} textAnchor="end" className="fill-slate-500 text-[10px]">
                {t}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const bh = (d.percent / 100) * innerH;
          const x = pad.l + i * slot + (slot - barW) / 2;
          return (
            <g key={i}>
              <rect
                x={x}
                y={pad.t + innerH - bh}
                width={barW}
                height={Math.max(bh, 1)}
                rx={3}
                className="fill-indigo-500"
              />
              <text
                x={x + barW / 2}
                y={pad.t + innerH - bh - 3}
                textAnchor="middle"
                className="fill-slate-700 text-[10px]"
              >
                {d.percent}
              </text>
              <text
                x={x + barW / 2}
                y={h - 8}
                textAnchor="middle"
                className="fill-slate-500 text-[10px]"
              >
                {i + 1}
              </text>
            </g>
          );
        })}
      </svg>
      <table className="sr-only">
        <caption>Last scores</caption>
        <tbody>
          {data.map((d, i) => (
            <tr key={i}>
              <td>{d.label}</td>
              <td>{d.percent}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
