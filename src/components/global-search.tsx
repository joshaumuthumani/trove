"use client";
/* Trove — keyboard-first global search (combobox/listbox). Ported from
   launchpad.jsx; queries /api/search with debounce. */
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cx } from "@/lib/cx";
import { Icon } from "@/components/ui/icon";
import { PosterTile } from "@/components/ui/poster";
import type { SearchResult } from "@/lib/queries";

const ROUTE_FOR = { movie: "movies", tv: "tv", game: "games" } as const;

export function GlobalSearch({ big }: { big?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [results, setResults] = useState<SearchResult[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    setActive(0);
    const s = q.trim();
    if (!s) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(s)}`, { signal: ctrl.signal });
        const data = (await res.json()) as { results: SearchResult[] };
        setResults(data.results || []);
      } catch {
        /* aborted / network */
      }
    }, 140);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  const go = useCallback(
    (r: SearchResult) => {
      setOpen(false);
      setQ("");
      // Mark in-app navigation so the detail "back" button uses history.back().
      try {
        sessionStorage.setItem("trove:inapp", "1");
      } catch {}
      router.push(`/${ROUTE_FOR[r.type]}/${r.id}`);
    },
    [router]
  );

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" && results.length) {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp" && results.length) {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      const r = results[active] || results[0];
      if (r) {
        e.preventDefault();
        go(r);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const listId = big ? "gsearch-list-big" : "gsearch-list";
  return (
    <div className={cx("gsearch", big && "gsearch--big")} ref={wrapRef}>
      <div className="gsearch-field">
        <Icon name="search" size={big ? 22 : 18} className="gsearch-icon" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder={big ? "Search everything you own…" : "Search your library…"}
          role="combobox"
          aria-expanded={open && !!q}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            open && results[active] ? `gsr-${results[active].type}-${results[active].id}` : undefined
          }
          aria-label="Search all catalogs"
        />
        {q && (
          <button
            className="gsearch-clear"
            onClick={() => {
              setQ("");
              setActive(0);
            }}
            aria-label="Clear search"
          >
            <Icon name="x" size={16} />
          </button>
        )}
      </div>
      {open && q && (
        <div className="gsearch-pop" id={listId} role="listbox" aria-label="Search results">
          {results.length === 0 ? (
            <div className="gsearch-empty">No owned titles match “{q}”.</div>
          ) : (
            results.map((r, i) => (
              <button
                key={r.type + r.id}
                id={`gsr-${r.type}-${r.id}`}
                role="option"
                aria-selected={i === active}
                className={cx("gsearch-row", i === active && "gsearch-row--active")}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(r)}
              >
                <PosterTile title={r.title} year={r.year} src={r.poster_url} size={34} rounded={6} kind={r.kind} />
                <span className="gsearch-row-title">{r.title}</span>
                <span className="gsearch-row-meta">{r.year}</span>
                <span className="gsearch-row-type">{ROUTE_FOR[r.type]}</span>
                <Icon name="chevronRight" size={15} className="gsearch-row-caret" />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
