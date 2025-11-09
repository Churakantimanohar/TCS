import React from "react";

function bubbleClass(status, idx, current) {
  if (idx === current) return "palette-current";
  if (!status || status === "not-visited") return "palette-not-visited";
  if (status === "answered") return "palette-answered";
  if (status === "marked") return "palette-mark-review";
  if (status === "answered-review") return "palette-answered-review";
  if (status === "visited") return "palette-not-visited";
  return "palette-not-visited";
}

export default function Sidebar({
  count = 30,
  current = 0,
  statuses = {},
  onSelect,
}) {
  const items = Array.from({ length: count }).map((_, i) => i);
  return (
    <aside className="w-[280px] bg-gray-50 border-r p-4">
      <div className="grid grid-cols-5 gap-3">
        {items.map((i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`w-9 h-9 rounded-full flex items-center justify-center ${bubbleClass(
              statuses[i],
              i,
              current
            )}`}
            title={`Question ${i + 1}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </aside>
  );
}
