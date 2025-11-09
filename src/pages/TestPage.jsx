import React from "react";
import TestModal from "../components/TestModal";

export default function TestPage({ onClose, onFinish }) {
  return <TestModal onClose={onClose} onFinish={onFinish} />;
}
