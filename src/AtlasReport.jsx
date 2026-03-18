import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Search, Clock, ExternalLink, X, RefreshCw, Globe, Languages, Sun, Moon } from "lucide-react";
import { f, languages, uiStrings, countries, geoCountryMap } from "./shared/theme";
import { fetchAllFeeds, formatTime, cacheArticles, translateBatch, getCachedAllFeeds } from "./shared/utils";
import { Select, SkeletonRows } from "./shared/components";
import { useTheme } from "./shared/ThemeContext";

// ─── Debounce Hook ───
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// ─── Article Row ───
function ArticleRow({ article, rank, t, translated, theme, focused }) {
  const displayTitle = translated?.title || article.title;
  const displayDesc = translated?.description || article.description;
  const isTranslated = !!translated?.title;

  return (
    <Link to={`/article/${article.id}`} state={{ article }} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      <article
        data-article-rank={rank}
        className="article-row"
        style={{
          display: "flex", gap: 14, padding: "20px 0",
          borderBottom: `1px solid ${theme.border}`,
          transition: "opacity 0.15s ease-out, background 0.15s ease-out",
          background: focused ? theme.surface : "transparent",
          marginLeft: -12, marginRight: -12, paddingLeft: 12, paddingRight: 12,
          borderRadius: focused ? 4 : 0,
        }}>

        <div style={{ width: 30, flexShrink: 0, paddingTop: 4, textAlign: "right" }}>
          <span style={{
            fontFamily: f.display, fontSize: rank >= 10 ? 20 : 26, lineHeight: 1,
            color: rank <= 3 ? theme.accent : theme.rule,
          }}>{rank}</span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontFamily: f.display, fontSize: 19, fontWeight: 400,
            color: theme.ink, lineHeight: 1.35, marginBottom: 5, letterSpacing: -0.1,
          }}>{displayTitle}</h3>
          {displayDesc && (
            <p style={{
              fontFamily: f.body, fontSize: 14, color: theme.dim, lineHeight: 1.6,
              marginBottom: 8, display: "-webkit-box",
              WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>{displayDesc}</p>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{
              fontFamily: f.sans, fontSize: 10, fontWeight: 600, color: theme.dim,
              textTransform: "uppercase", letterSpacing: 1.2,
            }}>{article.source}</span>
            {isTranslated && (
              <>
                <span style={{ color: theme.rule }} aria-hidden="true">·</span>
                <span style={{
                  fontFamily: f.sans, fontSize: 9, fontWeight: 600,
                  color: theme.accent, letterSpacing: 0.5,
                  display: "inline-flex", alignItems: "center", gap: 3,
                }}>
                  <Languages size={9} strokeWidth={1.5} /> {t.showTranslated || "Translated"}
                </span>
              </>
            )}
            {article.sourceCount > 1 && (
              <>
                <span style={{ color: theme.rule }} aria-hidden="true">·</span>
                <span style={{
                  fontFamily: f.sans, fontSize: 10, fontWeight: 600,
                  color: theme.accent, letterSpacing: 0.5,
                }}>{article.sourceCount} sources</span>
              </>
            )}
            {article.pubDate && (
              <>
                <span style={{ color: theme.rule }} aria-hidden="true">·</span>
                <span style={{
                  fontFamily: f.sans, fontSize: 11, color: theme.dim,
                  display: "inline-flex", alignItems: "center", gap: 3,
                }}>
                  <Clock size={10} strokeWidth={1.5} /> {formatTime(article.pubDate)}
                </span>
              </>
            )}
            <span style={{
              fontFamily: f.sans, fontSize: 11, color: theme.accent,
              display: "inline-flex", alignItems: "center", gap: 3,
              marginLeft: "auto", fontWeight: 500,
            }}>
              {t.readMore} <ExternalLink size={9} strokeWidth={1.5} />
            </span>
          </div>
          {article.categories?.length > 0 && (
            <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
              {article.categories.map(cat => (
                <span key={cat} style={{
                  fontFamily: f.sans, fontSize: 9, fontWeight: 500,
                  color: theme.accent, letterSpacing: 0.3,
                  padding: "2px 6px", background: theme.accentSoft,
                  borderRadius: 2, textTransform: "lowercase",
                }}>{cat}</span>
              ))}
            </div>
          )}
        </div>

        {article.image && (
          <div style={{
            width: 120, height: 88, flexShrink: 0, overflow: "hidden",
            background: theme.surface, filter: "saturate(0.7) contrast(1.05)",
            borderRadius: 3,
          }}>
            <img src={article.image} alt={article.title}
              loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onError={e => { e.target.parentElement.style.display = "none"; }} />
          </div>
        )}
      </article>
    </Link>
  );
}

// ─── Main ───
export default function AtlasReport() {
  const { theme, isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCountry = searchParams.get("country") || "ALL";
  const initialLang = searchParams.get("lang") || "en";

  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [selectedLanguage, setSelectedLanguage] = useState(initialLang);
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedSources, setFeedSources] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [geoDetected, setGeoDetected] = useState(false);
  const [translations, setTranslations] = useState({});
  const [translating, setTranslating] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const translationRef = useRef({ lang: "en", ids: "" });
  const searchInputRef = useRef(null);

  const t = { ...uiStrings.en, ...(uiStrings[selectedLanguage] || {}) };

  // Scroll to top on mount (back navigation)
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, []);

  // Debounced search
  const debouncedSearch = useDebounce(searchQuery, 200);

  // ─── Collapsing header on scroll ───
  useEffect(() => {
    let lastY = window.scrollY;
    let accumulated = 0;
    const THRESHOLD = 40; // px of consistent scroll direction before toggling

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;

      // Near top: always show full header
      if (y < 100) { accumulated = 0; setHeaderCollapsed(false); return; }

      // Accumulate scroll in one direction; reset if direction changes
      if ((accumulated > 0 && delta < 0) || (accumulated < 0 && delta > 0)) {
        accumulated = delta;
      } else {
        accumulated += delta;
      }

      if (accumulated > THRESHOLD) setHeaderCollapsed(true);
      else if (accumulated < -THRESHOLD) setHeaderCollapsed(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Translate visible articles when language changes
  useEffect(() => {
    if (selectedLanguage === "en" || loading || !articles.length) {
      setTranslations({}); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }

    const visible = articles.slice(0, visibleCount);
    const refKey = `${selectedLanguage}:${visible.map(a => a.id).join(",")}`;
    if (translationRef.current.lang === selectedLanguage && translationRef.current.ids === refKey) return;
    translationRef.current = { lang: selectedLanguage, ids: refKey };

    let cancelled = false;
    setTranslating(true);

    (async () => {
      const titles = visible.map(a => a.title);
      const descs = visible.map(a => a.description || "");
      const [trTitles, trDescs] = await Promise.all([
        translateBatch(titles, selectedLanguage),
        translateBatch(descs, selectedLanguage),
      ]);

      if (cancelled) return;
      const map = {};
      visible.forEach((a, i) => {
        map[a.id] = { title: trTitles[i], description: trDescs[i] };
      });
      setTranslations(prev => ({ ...prev, ...map }));
      setTranslating(false);
    })();

    return () => { cancelled = true; };
  }, [selectedLanguage, articles, visibleCount, loading]);

  // Auto-detect country on first load
  useEffect(() => {
    if (searchParams.get("country") || geoDetected) return;
    (async () => {
      try {
        const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(4000) });
        const data = await res.json();
        const code = data.country_code;
        if (code && geoCountryMap[code]) {
          setSelectedCountry(geoCountryMap[code]);
        }
      } catch { /* silently fall back to ALL */ }
      setGeoDetected(true);
    })();
  }, [searchParams, geoDetected]);

  // Sync URL search params
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCountry !== "ALL") params.set("country", selectedCountry);
    if (selectedLanguage !== "en") params.set("lang", selectedLanguage);
    setSearchParams(params, { replace: true });
  }, [selectedCountry, selectedLanguage, setSearchParams]);

  const fetchNews = useCallback(async (countryCode, forceRefresh = false) => {
    const code = countryCode || selectedCountry;
    setVisibleCount(10);
    setFocusedIdx(-1);
    const country = countries.find(ct => ct.code === code);
    if (!country) return;
    setFeedSources(country.feeds.map(fd => fd.name));

    // Show cached data instantly (no skeleton flash)
    const cached = !forceRefresh && getCachedAllFeeds(code);
    if (cached && cached.length > 0) {
      setArticles(cached);
      cacheArticles(cached);
      setLoading(false);
      // Refresh in background silently
      fetchAllFeeds(country.feeds, code).then(fresh => {
        if (fresh.length > 0) {
          setArticles(fresh);
          cacheArticles(fresh);
        }
      });
    } else {
      setLoading(true);
      const data = await fetchAllFeeds(country.feeds, code);
      setArticles(data);
      cacheArticles(data);
      setLoading(false);
    }
  }, [selectedCountry]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchNews(); }, [fetchNews]);

  const filteredArticles = useMemo(() => {
    if (!debouncedSearch) return articles;
    const q = debouncedSearch.toLowerCase();
    return articles.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q) ||
      a.source.toLowerCase().includes(q) ||
      a.categories?.some(c => c.toLowerCase().includes(q))
    );
  }, [articles, debouncedSearch]);

  // ─── Keyboard shortcuts ───
  useEffect(() => {
    const onKey = (e) => {
      // Don't capture when typing in input
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        if (e.key === "Escape") {
          e.target.blur();
          setFocusedIdx(-1);
        }
        return;
      }

      const max = Math.min(visibleCount, filteredArticles.length) - 1;

      switch (e.key) {
        case "j":
          e.preventDefault();
          setFocusedIdx(prev => {
            const next = Math.min(prev + 1, max);
            // Scroll focused article into view
            setTimeout(() => {
              const el = document.querySelector(`[data-article-rank="${next + 1}"]`);
              el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
            }, 10);
            return next;
          });
          break;
        case "k":
          e.preventDefault();
          setFocusedIdx(prev => {
            const next = Math.max(prev - 1, 0);
            setTimeout(() => {
              const el = document.querySelector(`[data-article-rank="${next + 1}"]`);
              el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
            }, 10);
            return next;
          });
          break;
        case "Enter":
          if (focusedIdx >= 0 && focusedIdx <= max) {
            e.preventDefault();
            const article = filteredArticles[focusedIdx];
            navigate(`/article/${article.id}`, { state: { article } });
          }
          break;
        case "/":
          e.preventDefault();
          searchInputRef.current?.focus();
          break;
        case "Escape":
          setFocusedIdx(-1);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filteredArticles, visibleCount, focusedIdx, navigate]);

  const countryData = countries.find(ct => ct.code === selectedCountry);

  return (
    <div style={{ background: theme.bg, minHeight: "100vh", fontFamily: f.body, transition: "background 0.3s ease" }}>

      {/* ─── Masthead ─── */}
      <header style={{
        background: theme.bg, position: "sticky", top: 0, zIndex: 50,
        borderBottom: `1px solid ${theme.ink}`,
        transition: "all 0.25s ease-out",
      }}>
        <div style={{
          maxWidth: 720, margin: "0 auto",
          padding: headerCollapsed ? "10px 24px" : "20px 24px 14px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 12, flexWrap: "wrap",
          transition: "padding 0.25s ease-out",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <Globe size={headerCollapsed ? 18 : 24} strokeWidth={1.3} color={theme.ink}
              style={{ flexShrink: 0, transition: "all 0.25s ease-out" }} />
            <div style={{ minWidth: 0 }}>
              <h1 style={{
                fontFamily: f.display,
                fontSize: headerCollapsed ? 20 : 32,
                fontWeight: 400,
                color: theme.ink, lineHeight: 1, letterSpacing: -0.5,
                transition: "font-size 0.25s ease-out",
                whiteSpace: "nowrap",
              }}>
                The Atlas Report
              </h1>
              {!headerCollapsed && (
                <p style={{
                  fontFamily: f.sans, fontSize: 10, fontWeight: 500,
                  color: theme.dim, letterSpacing: 2, textTransform: "uppercase", marginTop: 6,
                }}>Worldwide news, one report at a time</p>
              )}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            {/* Day/Night toggle */}
            <button onClick={toggleTheme} aria-label={isDark ? t.dayEdition : t.nightEdition} style={{
              display: "flex", alignItems: "center", gap: 4, padding: "4px 8px",
              border: `1px solid ${theme.border}`, background: "transparent",
              cursor: "pointer", fontFamily: f.sans, fontSize: 10,
              fontWeight: 500, color: theme.dim, transition: "all 0.15s ease-out",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = theme.ink; e.currentTarget.style.color = theme.ink; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.dim; }}>
              {isDark ? <Sun size={10} strokeWidth={1.5} /> : <Moon size={10} strokeWidth={1.5} />}
              <span className="header-btn-label">{isDark ? t.dayEdition : t.nightEdition}</span>
            </button>
            <div style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "4px 8px", border: `1px solid ${theme.accent}`,
            }}>
              <div style={{
                width: 5, height: 5, borderRadius: "50%",
                background: theme.accent, animation: "pulse 2s infinite",
              }} />
              <span style={{
                fontFamily: f.sans, fontSize: 9, fontWeight: 600,
                color: theme.accent, letterSpacing: 1.5,
              }}>{t.liveLabel}</span>
            </div>
            <button onClick={() => fetchNews(undefined, true)} aria-label={t.refresh} style={{
              display: "flex", alignItems: "center", gap: 4, padding: "4px 8px",
              border: `1px solid ${theme.border}`, background: "transparent",
              cursor: "pointer", fontFamily: f.sans, fontSize: 10,
              fontWeight: 500, color: theme.dim, transition: "all 0.15s ease-out",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = theme.ink; e.currentTarget.style.color = theme.ink; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.dim; }}>
              <RefreshCw size={10} strokeWidth={1.5} /> <span className="header-btn-label">{t.refresh}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── Toolbar ─── */}
      <nav style={{
        background: theme.bg, borderBottom: `1px solid ${theme.border}`,
      }}>
        <div style={{
          maxWidth: 720, margin: "0 auto", padding: "10px 24px",
          display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
        }}>
          <Select value={selectedCountry} onChange={v => { setSelectedCountry(v); setFocusedIdx(-1); }}
            options={countries} label={t.selectCountry} theme={theme}
            renderOption={(o) => (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 14 }}>{o?.flag}</span>
                <span>{o?.name}</span>
              </span>
            )} />
          <Select value={selectedLanguage} onChange={setSelectedLanguage}
            options={languages.map(l => ({ ...l, id: l.code }))}
            label={t.language} theme={theme}
            renderOption={(o) => (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span>{o?.native}</span>
                {o?.name !== o?.native && <span style={{ color: theme.dim, fontSize: 11 }}>({o?.name})</span>}
              </span>
            )} />
          <div style={{ flex: 1, position: "relative", minWidth: 100 }}>
            <Search size={13} strokeWidth={1.5} color={theme.dim}
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input ref={searchInputRef} type="text" placeholder={`${t.search} ( / )`} value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setVisibleCount(10); setFocusedIdx(-1); }}
              aria-label={t.search}
              style={{
                width: "100%", padding: "7px 28px 7px 30px",
                border: `1px solid ${theme.border}`, background: "transparent",
                fontFamily: f.sans, fontSize: 13, color: theme.text, outline: "none",
                transition: "border-color 0.15s ease-out",
              }}
              onFocus={e => e.target.style.borderColor = theme.ink}
              onBlur={e => e.target.style.borderColor = theme.border} />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(""); setFocusedIdx(-1); }} aria-label={t.close} style={{
                position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", padding: 4,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "opacity 0.15s ease-out",
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.6"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                <X size={12} color={theme.dim} strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Content ─── */}
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ padding: "28px 0 0" }}>
          <div style={{
            display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap",
            paddingBottom: 12, borderBottom: `2px solid ${theme.ink}`,
          }}>
            <h2 style={{
              fontFamily: f.display, fontSize: 24, fontWeight: 400,
              color: theme.ink, letterSpacing: -0.2,
            }}>{t.trending}</h2>
            {selectedCountry !== "ALL" && (
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontFamily: f.body, color: theme.dim, fontStyle: "italic", fontSize: 16 }}>in</span>
                <span style={{ fontSize: 16 }}>{countryData?.flag}</span>
                <span style={{ fontFamily: f.display, fontSize: 20, color: theme.ink }}>{countryData?.name}</span>
              </span>
            )}
            {!loading && (
              <span style={{
                fontFamily: f.sans, fontSize: 11, color: theme.dim,
                marginLeft: "auto", fontWeight: 500,
                display: "inline-flex", alignItems: "center", gap: 6,
              }}>
                {translating && (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    color: theme.accent,
                  }}>
                    <Languages size={11} strokeWidth={1.5} style={{ animation: "pulse 1.5s infinite" }} />
                    {t.translating || "Translating…"}
                  </span>
                )}
                {filteredArticles.length} articles
              </span>
            )}
          </div>

          {feedSources.length > 0 && !loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 0", flexWrap: "wrap" }}>
              <span style={{
                fontFamily: f.sans, fontSize: 10, color: theme.dim,
                fontWeight: 600, textTransform: "uppercase", letterSpacing: 1,
              }}>{t.sources}:</span>
              {feedSources.map((s, i) => (
                <span key={s} style={{
                  fontFamily: f.sans, fontSize: 10, color: theme.dim,
                  fontWeight: 400, fontStyle: "italic",
                }}>{s}{i < feedSources.length - 1 ? "," : ""}</span>
              ))}
            </div>
          )}
        </div>

        {/* Articles or skeleton */}
        {loading ? (
          <SkeletonRows theme={theme} />
        ) : filteredArticles.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontFamily: f.display, fontSize: 20, color: theme.ink, marginBottom: 6 }}>{t.noResults}</p>
            <p style={{ fontFamily: f.body, fontSize: 14, color: theme.dim, fontStyle: "italic" }}>{t.tryAgain}</p>
          </div>
        ) : (
          <div>
            {filteredArticles.slice(0, visibleCount).map((article, i) => (
              <ArticleRow key={article.id} article={article} rank={i + 1} t={t}
                theme={theme} focused={i === focusedIdx}
                translated={selectedLanguage !== "en" ? translations[article.id] : null} />
            ))}

            {visibleCount < filteredArticles.length && (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <button onClick={() => setVisibleCount(prev => prev + 10)} style={{
                  fontFamily: f.sans, fontSize: 12, fontWeight: 500,
                  padding: "9px 24px", border: `1px solid ${theme.ink}`,
                  background: "transparent", color: theme.ink,
                  cursor: "pointer", transition: "all 0.15s ease-out",
                  letterSpacing: 0.3, textTransform: "uppercase",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = theme.ink; e.currentTarget.style.color = theme.bg; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = theme.ink; }}>
                  {t.loadMore}
                </button>
                <p style={{
                  fontFamily: f.sans, fontSize: 10, color: theme.dim,
                  marginTop: 8, fontWeight: 500,
                }}>{t.showing} {Math.min(visibleCount, filteredArticles.length)} / {filteredArticles.length}</p>
              </div>
            )}

            {visibleCount >= filteredArticles.length && filteredArticles.length > 0 && (
              <div style={{ textAlign: "center", padding: "28px 0" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 1, background: theme.rule }} />
                  <span style={{ fontFamily: f.sans, fontSize: 10, color: theme.dim, fontWeight: 500 }}>
                    {filteredArticles.length} articles
                  </span>
                  <div style={{ width: 32, height: 1, background: theme.rule }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Keyboard shortcuts hint */}
        {!loading && filteredArticles.length > 0 && (
          <div style={{
            textAlign: "center", padding: "8px 0 24px",
            fontFamily: f.sans, fontSize: 10, color: theme.rule,
          }}>
            <kbd style={{ padding: "1px 4px", background: theme.surface, borderRadius: 2, fontSize: 9 }}>j</kbd>
            {" / "}
            <kbd style={{ padding: "1px 4px", background: theme.surface, borderRadius: 2, fontSize: 9 }}>k</kbd>
            {" navigate · "}
            <kbd style={{ padding: "1px 4px", background: theme.surface, borderRadius: 2, fontSize: 9 }}>Enter</kbd>
            {" open · "}
            <kbd style={{ padding: "1px 4px", background: theme.surface, borderRadius: 2, fontSize: 9 }}>/</kbd>
            {" search"}
          </div>
        )}
      </main>

      {/* ─── Footer ─── */}
      <footer style={{ borderTop: `1px solid ${theme.ink}`, padding: "16px 24px", marginTop: 48 }}>
        <div style={{
          maxWidth: 720, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontFamily: f.display, fontSize: 15, color: theme.ink, display: "flex", alignItems: "center", gap: 6 }}>
            <Globe size={14} strokeWidth={1.3} color={theme.ink} />
            The Atlas Report
          </span>
          <a href="https://rycworks.com" target="_blank" rel="noopener noreferrer" style={{ fontFamily: f.sans, fontSize: 10, color: theme.dim, fontWeight: 500, textDecoration: "none", transition: "color 0.15s ease-out" }} onMouseEnter={e => e.currentTarget.style.color = theme.ink} onMouseLeave={e => e.currentTarget.style.color = theme.dim}>Built by RYC</a>
        </div>
      </footer>
    </div>
  );
}
