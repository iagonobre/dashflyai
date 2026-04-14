"use client";

import { useEffect, useState } from "react";

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

/**
 * Number input that avoids the controlled-input "forced 0" bug.
 * Keeps a string internally so the user can freely type/clear.
 * Commits the parsed number to onChange only on blur (or if valid while typing).
 */
export default function NumberInput({ value, onChange, min = 1, max, className }: NumberInputProps) {
  const [str, setStr] = useState(String(value));

  // Sync if parent changes the value (e.g. reset after save)
  useEffect(() => {
    setStr(String(value));
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setStr(e.target.value);
    // Only propagate while typing if clearly valid (no leading zeros, no empty)
    const n = parseInt(e.target.value, 10);
    if (!isNaN(n) && e.target.value === String(n)) {
      const clamped = max !== undefined ? Math.min(n, max) : n;
      if (clamped >= min) onChange(clamped);
    }
  }

  function handleBlur() {
    const n = parseInt(str, 10);
    if (isNaN(n) || n < min) {
      // Revert to last valid value
      setStr(String(value));
    } else {
      const clamped = max !== undefined ? Math.min(n, max) : n;
      setStr(String(clamped));
      onChange(clamped);
    }
  }

  return (
    <input
      type="number"
      min={min}
      max={max}
      value={str}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
    />
  );
}
