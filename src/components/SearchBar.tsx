'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function SearchBar() {
  const params = useSearchParams();
  const router = useRouter();
  const [term, setTerm] = useState(params.get('q') ?? '');

  return (
    <div className="card">
      <div className="relative">
        <input
          className="input pr-10"
          placeholder="Search posts…"
          value={term}
          onChange={(e) => {
            const v = e.target.value;
            setTerm(v);
            const qs = new URLSearchParams(Array.from(params.entries()));
            if (v) qs.set('q', v); else qs.delete('q');
            router.replace('?' + qs.toString());
          }}
        />
        {term && (
          <button
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-foreground"
            onClick={() => {
              setTerm('');
              const qs = new URLSearchParams(Array.from(params.entries()));
              qs.delete('q');
              router.replace('?' + qs.toString());
            }}
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
