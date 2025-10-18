'use client';

import * as React from 'react';
import Image from 'next/image';

export function BetaBanner(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center w-full pt-4 gap-2">
      <div className="px-4 py-1 rounded-full bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 text-zinc-300 text-sm font-medium shadow-lg flex items-center gap-2">
        <span className="flex size-2">
          <span className="animate-ping absolute inline-flex size-2 rounded-full bg-zinc-400 opacity-75" />
          <span className="relative inline-flex rounded-full size-2 bg-zinc-300" />
        </span>
        SOLACE BETA
      </div>
      <div className="flex flex-col items-center mt-1">
        <span className="text-gray-300 text-xs mb-0.5">Sponsored by</span>
        <Image
          src="/images/demo-thumbnail.png"
          alt="XYZ Logo"
          width={40}
          height={40}
          className="object-contain max-w-xs max-h-10"
          priority
        />
      </div>
    </div>
  );
}
