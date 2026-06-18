'use client';

import React, { useState, useEffect } from 'react';

interface SafeDateProps {
  date: string | Date;
  showTime?: boolean;
  options?: Intl.DateTimeFormatOptions;
}

export function SafeDate({ date, showTime = false, options }: SafeDateProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return empty space or a placeholder with the same dimensions to avoid layout shifts
    return <span className="inline-block opacity-0">Date</span>;
  }

  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return <span>N/A</span>;
    }
    if (options) {
      return <span>{d.toLocaleDateString(undefined, options)}</span>;
    }
    if (showTime) {
      return <span>{d.toLocaleString()}</span>;
    }
    return <span>{d.toLocaleDateString()}</span>;
  } catch (e) {
    return <span>N/A</span>;
  }
}
