import React from "react";

export default function LoginPage({ onContinue }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-[480px]">
        <h1 className="text-xl font-semibold mb-4">Login (Optional)</h1>
        <p className="text-sm text-gray-600 mb-6">
          This demo runs without login. Click continue to proceed.
        </p>
        <button
          onClick={onContinue}
          className="px-4 py-2 bg-[#0077C8] text-white rounded"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
