import React from "react";

export default function ExamLauncher({ onStart }) {
  return (
    <div className="text-center">
      <div className="bg-white rounded-lg shadow-2xl p-12 w-[640px]">
        <h1 className="text-2xl font-semibold mb-6">
          TCS iON NQT Practice — Mock
        </h1>
        <p className="text-gray-600 mb-6">
          This mock simulates the official iON exam window in a centered modal.
        </p>
        <button
          onClick={() => onStart()}
          className="px-6 py-3 bg-[#0077C8] text-white rounded-lg shadow hover:opacity-95"
        >
          Start Test (Enters Fullscreen)
        </button>
        <p className="text-xs text-gray-500 mt-4">
          Press Alt+N (Next), Alt+P (Previous), Alt+M (Mark), Alt+C (Calculator)
        </p>
      </div>
    </div>
  );
}
