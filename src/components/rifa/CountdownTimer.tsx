"use client";

import { useEffect, useState } from "react";
import { getTimeRemaining } from "@/lib/utils";

interface CountdownTimerProps {
  targetDate: Date;
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [time, setTime] = useState(() => getTimeRemaining(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeRemaining(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (time.expired) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-center dark:bg-red-950">
        <p className="text-lg font-bold text-red-600 dark:text-red-400">
          ¡Sorteo finalizado!
        </p>
      </div>
    );
  }

  const units = [
    { value: time.days, label: "Días" },
    { value: time.hours, label: "Horas" },
    { value: time.minutes, label: "Minutos" },
    { value: time.seconds, label: "Segundos" },
  ];

  return (
    <div className="flex gap-3 justify-center">
      {units.map((unit) => (
        <div
          key={unit.label}
          className="flex flex-col items-center rounded-lg bg-primary px-3 py-2 text-primary-foreground min-w-[70px]"
        >
          <span className="text-2xl font-bold tabular-nums" suppressHydrationWarning>
            {String(unit.value).padStart(2, "0")}
          </span>
          <span className="text-xs opacity-80">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}
