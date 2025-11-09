import React from "react";

export default function HeaderBar({
  sectionName,
  partName,
  timeLeft,
  globalElapsed,
  candidateId,
  onToggleCalc,
}) {
  return (
    <header className="bg-[#0077C8] text-white px-4 py-2 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-[#0077C8] font-bold">
          TCS
        </div>
        <div className="font-semibold">{sectionName}</div>
        {partName && (
          <div className="text-[11px] bg-white/20 px-2 py-1 rounded">
            {partName}
          </div>
        )}
      </div>
      <div className="flex gap-6 items-center">
        <button
          onClick={onToggleCalc}
          className="bg-white text-[#0077C8] px-3 py-1 rounded text-sm"
        >
          Calculator
        </button>
        <div className="text-xs text-right leading-tight">
          <div>
            Section Left: <span className="font-mono">{timeLeft}</span>
          </div>
          <div>
            Elapsed: <span className="font-mono">{globalElapsed}</span>
          </div>
        </div>
        <div className="text-sm">
          Candidate ID:{" "}
          <span className="font-semibold ml-1">{candidateId}</span>
        </div>
      </div>
    </header>
  );
}
