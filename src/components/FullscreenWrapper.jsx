import React, { useEffect } from "react";

export default function FullscreenWrapper({ children, onExit }) {
  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement && onExit) onExit();
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, [onExit]);

  return children;
}
