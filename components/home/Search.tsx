"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Search,
  MapPin,
  Briefcase,
  ChevronRight,
  Loader2,
  X,
  Tag,
} from "lucide-react";

const POPULAR_TAGS = ["Remote", "Full-time", "Senior", "Frontend"];

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

interface Filters {
  titles: string[];
  locations: string[];
}

export function SearchSelect() {
  const router = useRouter();

  // Field state
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [keyword, setKeyword] = useState(""); // raw keyword input (no debounce)
  const [loading, setLoading] = useState(false);

  // Autocomplete state
  const [filters, setFilters] = useState<Filters>({
    titles: [],
    locations: [],
  });
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [showTitleDrop, setShowTitleDrop] = useState(false);
  const [showLocationDrop, setShowLocationDrop] = useState(false);

  // Debounced values for autocomplete API only
  const debouncedTitle = useDebounce(title, 300);
  const debouncedLocation = useDebounce(location, 300);

  // Refs for click-outside detection
  const titleRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  // Fetch autocomplete filters (debounced)
  useEffect(() => {
    const q = debouncedTitle || debouncedLocation;
    setFiltersLoading(true);
    fetch(`/api/job/filters?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data) => setFilters(data))
      .catch(() => {})
      .finally(() => setFiltersLoading(false));
  }, [debouncedTitle, debouncedLocation]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (titleRef.current && !titleRef.current.contains(e.target as Node))
        setShowTitleDrop(false);
      if (
        locationRef.current &&
        !locationRef.current.contains(e.target as Node)
      )
        setShowLocationDrop(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = useCallback(
    async (overrideTitle?: string, overrideKeyword?: string) => {
      const params = new URLSearchParams();

      // title field (from input or popular tag override)
      const resolvedTitle = overrideTitle ?? title;
      if (resolvedTitle) params.set("title", resolvedTitle);

      // location field
      if (location) params.set("location", location);

      // keyword — not debounced, sent as-is at search time
      const resolvedKeyword = overrideKeyword ?? keyword;
      if (resolvedKeyword) params.set("search", resolvedKeyword);

      // always reset to page 1
      params.set("page", "1");

      setShowTitleDrop(false);
      setShowLocationDrop(false);
      setLoading(true);
      try {
        await fetch(`/api/job?${params.toString()}`);
        router.push(`/jobs?${params.toString()}`);
      } finally {
        setLoading(false);
      }
    },
    [title, location, keyword, router],
  );

  const handleTagClick = (tag: string) => {
    setKeyword(tag);
    handleSearch(undefined, tag);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
      {/* Main bar */}
      <div className="glass-card rounded-2xl sm:rounded-full p-2 sm:p-3 flex flex-col sm:flex-row items-center gap-3 shadow-2xl glow-indigo border-white/10">
        {/* ── Title / Company ── */}
        <div ref={titleRef} className="relative flex-1 w-full group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-indigo-400 transition-colors pointer-events-none z-10">
            {filtersLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
          </div>
          <Input
            id="search-title"
            placeholder="Job title or company (optional)"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setShowTitleDrop(true);
            }}
            onFocus={() => setShowTitleDrop(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
              if (e.key === "Escape") setShowTitleDrop(false);
            }}
            className="w-full bg-transparent border-none h-11 pl-11 pr-9 focus-visible:ring-0 text-white placeholder:text-white/30 text-sm sm:text-base"
          />
          {title && (
            <button
              onClick={() => {
                setTitle("");
                setShowTitleDrop(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
            >
              <X className="size-3.5" />
            </button>
          )}

          {/* Title dropdown */}
          {showTitleDrop && filters.titles.length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-full z-200 bg-gray-950 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
              <p className="px-3 py-1.5 text-[10px] font-semibold text-white/30 uppercase tracking-wider border-b border-white/5">
                Job Titles
              </p>
              {filters.titles.map((t) => (
                <button
                  key={t}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setTitle(t);
                    setShowTitleDrop(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-white/80 hover:bg-indigo-500/15 hover:text-white transition-colors text-left"
                >
                  <Briefcase className="size-3.5 text-indigo-400 shrink-0" />
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="hidden sm:block w-px h-8 bg-white/10 shrink-0" />

        {/* ── Location ── */}
        <div
          ref={locationRef}
          className="relative w-full sm:w-auto min-w-[170px] group"
        >
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-indigo-400 transition-colors pointer-events-none z-10">
            <MapPin className="size-4" />
          </div>
          <Input
            id="search-location"
            placeholder="Location (optional)"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setShowLocationDrop(true);
            }}
            onFocus={() => setShowLocationDrop(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
              if (e.key === "Escape") setShowLocationDrop(false);
            }}
            className="w-full bg-transparent border-none h-11 pl-10 pr-9 focus-visible:ring-0 text-white placeholder:text-white/30 text-sm sm:text-base"
          />
          {location && (
            <button
              onClick={() => {
                setLocation("");
                setShowLocationDrop(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
            >
              <X className="size-3.5" />
            </button>
          )}

          {/* Location dropdown */}
          {showLocationDrop && filters.locations.length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-full z-200 bg-gray-950 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
              <p className="px-3 py-1.5 text-[10px] font-semibold text-white/30 uppercase tracking-wider border-b border-white/5">
                Locations
              </p>
              {filters.locations.map((loc) => (
                <button
                  key={loc}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setLocation(loc);
                    setShowLocationDrop(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-white/80 hover:bg-indigo-500/15 hover:text-white transition-colors text-left"
                >
                  <MapPin className="size-3.5 text-violet-400 shrink-0" />
                  {loc}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="hidden sm:block w-px h-8 bg-white/10 shrink-0" />

        {/* ── Keyword (no debounce) ── */}
        <div className="relative w-full sm:w-auto min-w-[160px] group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-indigo-400 transition-colors pointer-events-none z-10">
            <Tag className="size-4" />
          </div>
          <Input
            id="search-keyword"
            placeholder="Keywords (optional)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            className="w-full bg-transparent border-none h-11 pl-10 pr-9 focus-visible:ring-0 text-white placeholder:text-white/30 text-sm sm:text-base"
          />
          {keyword && (
            <button
              onClick={() => setKeyword("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* ── Search Button ── */}
        <Button
          id="search-submit"
          onClick={() => handleSearch()}
          disabled={loading}
          className="w-full sm:w-auto h-11 px-8 rounded-xl sm:rounded-full brand-gradient text-white font-bold hover:scale-[1.02] transition-all shadow-lg shadow-indigo-500/25 gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 shrink-0"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              Find Jobs
              <ChevronRight className="size-4" />
            </>
          )}
        </Button>
      </div>

      {/* Popular Tags */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-white/40">
        <span>Popular:</span>
        {POPULAR_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            className="px-2 py-1 rounded-md bg-white/5 border border-white/5 hover:border-white/20 hover:text-white/70 transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
