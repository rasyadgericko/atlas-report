import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Clock, ExternalLink, X, RefreshCw, Globe, Languages } from "lucide-react";
import { theme, f, languages, uiStrings, countries, geoCountryMap } from "./shared/theme";
import { fetchAllFeeds, formatTime, cacheArticles, translateBatch } from "./shared/utils";
import { Select, SkeletonRows } from "./shared/components";

// ─── Article Row ───
function ArticleRow({ article, rank, t, translated }) {
  const displayTitle = translated?.title || article.title;
  const displayDesc = translated?.description || article.description;
  const isTranslated = !!translated?.title;

  return (
    <Link to={`/article/${article.id}`} state={{ article }} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      <article style={{
        display: "flex", gap: 14, padding: "20px 0",
        borderBottom: `1px solid ${theme.border}`,
        transition: "opacity 0.15s ease-out",
      }}
        onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
        onMouseLeave={e => e.currentTarget.style.opacity = "1"}>

        <div style={{ width: 26, flexShrink: 0, paddingTop: 4, textAlign: "right" }}>
          <span style={{
            fontFamily: f.display, fontSize: 26, lineHeight: 1,
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
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
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
        </div>

        {article.image && (
          <div style={{
            width: 88, height: 88, flexShrink: 0, overflow: "hidden",
            background: theme.surface, filter: "saturate(0.7) contrast(1.05)",
          }}>
            <img src={article.image} alt={article.title}
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
  const [translations, setTranslations] = useState({}); // { [articleId]: { title, description } }
  const [translating, setTranslating] = useState(false);
  const translationRef = useRef({ lang: "en", ids: "" });

  const t = { ...uiStrings.en, ...(uiStrings[selectedLanguage] || {}) };

  // Translate visible articles when language changes
  useEffect(() => {
    if (selectedLanguage === "en" || loading || !articles.length) {
      setTranslations({});
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTranslations(prev => ({ ...prev, ...map }));
      setTranslating(false);
    })();

    return () => { cancelled = true; };
  }, [selectedLanguage, articles, visibleCount, loading]);

  // Auto-detect country on first load (only if no URL preference)
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

  // Sync URL search params when preferences change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCountry !== "ALL") params.set("country", selectedCountry);
    if (selectedLanguage !== "en") params.set("lang", selectedLanguage);
    setSearchParams(params, { replace: true });
  }, [selectedCountry, selectedLanguage, setSearchParams]);

  const fetchNews = useCallback(async (countryCode) => {
    const code = countryCode || selectedCountry;
    setLoading(true);
    setVisibleCount(10);
    const country = countries.find(ct => ct.code === code);
    if (!country) return;
    setFeedSources(country.feeds.map(fd => fd.name));
    const data = await fetchAllFeeds(country.feeds);
    setArticles(data);
    cacheArticles(data);
    setLoading(false);
  }, [selectedCountry]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchNews(); }, [fetchNews]);

  const filteredArticles = searchQuery
    ? articles.filter(a => {
        const q = searchQuery.toLowerCase();
        return a.title.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q) || a.source.toLowerCase().includes(q);
      })
    : articles;

  const countryData = countries.find(ct => ct.code === selectedCountry);

  return (
    <div style={{ background: theme.bg, minHeight: "100vh", fontFamily: f.body }}>

      {/* ─── Masthead ─── */}
      <header style={{
        background: theme.bg, position: "sticky", top: 0, zIndex: 50,
        borderBottom: `1px solid ${theme.ink}`,
      }}>
        <div style={{
          maxWidth: 720, margin: "0 auto", padding: "24px 24px 12px",
          display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        }}>
          <div>
            <h1 style={{
              fontFamily: f.display, fontSize: 32, fontWeight: 400,
              color: theme.ink, lineHeight: 1, letterSpacing: -0.5,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <Globe size={24} strokeWidth={1.3} color={theme.ink} />
              The Atlas Report
            </h1>
            <p style={{
              fontFamily: f.sans, fontSize: 10, fontWeight: 500,
              color: theme.dim, letterSpacing: 2, textTransform: "uppercase", marginTop: 4,
              paddingLeft: 34,
            }}>Worldwide news, one report at a time</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 2 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "3px 8px", border: `1px solid ${theme.accent}`,
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
            <button onClick={fetchNews} aria-label={t.refresh} style={{
              display: "flex", alignItems: "center", gap: 4, padding: "3px 8px",
              border: `1px solid ${theme.border}`, background: "transparent",
              cursor: "pointer", fontFamily: f.sans, fontSize: 10,
              fontWeight: 500, color: theme.dim, transition: "all 0.15s ease-out",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = theme.ink; e.currentTarget.style.color = theme.ink; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.dim; }}>
              <RefreshCw size={10} strokeWidth={1.5} /> {t.refresh}
            </button>
          </div>
        </div>
      </header>

      {/* ─── Toolbar ─── */}
      <nav style={{
        background: theme.bg, borderBottom: `1px solid ${theme.border}`,
        position: "sticky", top: 84, zIndex: 40,
      }}>
        <div style={{
          maxWidth: 720, margin: "0 auto", padding: "10px 24px",
          display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
        }}>
          <Select value={selectedCountry} onChange={setSelectedCountry}
            options={countries} label={t.selectCountry} width={190} theme={theme}
            renderOption={(o) => (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 14 }}>{o?.flag}</span>
                <span>{o?.name}</span>
              </span>
            )} />
          <Select value={selectedLanguage} onChange={setSelectedLanguage}
            options={languages.map(l => ({ ...l, id: l.code }))}
            label={t.language} width={160} theme={theme}
            renderOption={(o) => (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span>{o?.native}</span>
                {o?.name !== o?.native && <span style={{ color: theme.dim, fontSize: 11 }}>({o?.name})</span>}
              </span>
            )} />
          <div style={{ flex: 1, position: "relative", minWidth: 120 }}>
            <Search size={13} strokeWidth={1.5} color={theme.dim}
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input type="text" placeholder={t.search} value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setVisibleCount(10); }}
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
              <button onClick={() => setSearchQuery("")} aria-label={t.close} style={{
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
