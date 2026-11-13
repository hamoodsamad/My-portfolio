import React, { useEffect, useState } from "react";
import { runTextRecreate } from "../utils/ui.js";

export default function RewriteText({
  text,
  trigger = 0,
  duration = 1150,
  className = "",
}) {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    setDisplayText(text);
  }, [text]);

  useEffect(() => {
    if (trigger <= 0) return undefined;
    const stop = runTextRecreate(text, setDisplayText, duration);
    return () => stop();
  }, [trigger, text, duration]);

  return (
    <span className={`rewrite-wrap ${className}`}>
      <span className="rewrite-sizer" aria-hidden="true">
        {text}
      </span>
      <span
        key={trigger}
        className={`rewrite-live ${trigger > 0 ? "service-recreate-title" : ""}`}
      >
        {displayText}
      </span>
    </span>
  );
}
