"use client";

import { Switch } from "@headlessui/react";
import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
}

export default function Toggle({
  checked,
  onChange,
  disabled = false,
  label,
  description,
  className,
}: ToggleProps) {
  return (
    <Switch.Group as="div" className={cn("flex items-center justify-between gap-4", className)}>
      {(label || description) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <Switch.Label className="text-textLight text-sm font-medium cursor-pointer">
              {label}
            </Switch.Label>
          )}
          {description && (
            <Switch.Description className="text-darkText text-xs">
              {description}
            </Switch.Description>
          )}
        </div>
      )}

      <Switch
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primaryStroke",
          checked
            ? "bg-primary border-primaryStroke/50"
            : "bg-container border-border",
          disabled && "opacity-40 cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200",
            checked ? "translate-x-[18px]" : "translate-x-[3px]"
          )}
        />
      </Switch>
    </Switch.Group>
  );
}
