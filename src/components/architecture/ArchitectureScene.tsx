"use client";

import { useEffect, useRef, useState } from "react";
import type { ProjectArchitecture } from "@/types/api";

// A CSS/SVG animated architecture diagram: a stacked flow with a packet
// travelling down the connectors. Deliberately not Three.js here — a 2D
// vertical flow reads more clearly for "understandable within a few
// seconds" than a 3D scene would, per the brief's own emphasis on clarity
// over spectacle for this element.
export default function ArchitectureScene({
  architecture,
}: {
  architecture: ProjectArchitecture;
}) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // One-time read of a browser-only API on mount; there is no SSR-safe way
    // to know this before the client renders, so this is not a case the
    // "derive during render" rule applies to.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const nodes = [...architecture.nodes].sort((a, b) => a.order - b.order);
  const rowHeight = 90;
  const width = 320;
  const height = nodes.length * rowHeight;

  return (
    <div className="border border-border p-6">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="mx-auto w-full max-w-xs"
        role="img"
        aria-label={`Architecture diagram: ${nodes.map((n) => n.label).join(" to ")}`}
      >
        {nodes.slice(0, -1).map((_, i) => {
          const y1 = i * rowHeight + 24;
          const y2 = (i + 1) * rowHeight + 24;
          return (
            <line
              key={`line-${i}`}
              x1={width / 2}
              y1={y1}
              x2={width / 2}
              y2={y2}
              stroke="#1c1c20"
              strokeWidth={2}
            />
          );
        })}

        {!reduceMotion &&
          nodes.slice(0, -1).map((_, i) => {
            const y1 = i * rowHeight + 24;
            const y2 = (i + 1) * rowHeight + 24;
            return (
              <circle key={`packet-${i}`} r={3.5} fill="#5eead4">
                <animate
                  attributeName="cy"
                  values={`${y1};${y2}`}
                  dur="1.6s"
                  begin={`${i * 0.35}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="cx"
                  values={`${width / 2};${width / 2}`}
                  dur="1.6s"
                  repeatCount="indefinite"
                />
              </circle>
            );
          })}

        {nodes.map((node, i) => {
          const y = i * rowHeight + 24;
          return (
            <g key={node.id}>
              <rect
                x={width / 2 - 70}
                y={y - 16}
                width={140}
                height={32}
                fill="#0a0a0e"
                stroke="#1c1c20"
              />
              <text
                x={width / 2}
                y={y + 5}
                textAnchor="middle"
                fontFamily="var(--font-mono), monospace"
                fontSize="11"
                fill="#f2f2ee"
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
