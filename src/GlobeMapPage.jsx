import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Globe, Sun, Moon, ArrowLeft, X, Clock, ExternalLink, RefreshCw } from "lucide-react";
import { f, countries, uiStrings } from "./shared/theme";
import { fetchAllFeeds, formatTime, getCachedAllFeeds, cacheArticles } from "./shared/utils";
import { SkeletonRows } from "./shared/components";
import { useTheme } from "./shared/ThemeContext";
import GlobeHero from "./shared/GlobeHero";

// ─── Panel article row ───
function PanelArticleRow({ article, rank, theme }) {
  return (
    <Link
      to={`/article/${article.id}`}
      state={{ article }}
      style={{ textDecoration: "none", color: "inherit", display: "block" }}
    >
      <article style={{
        display: "flex", gap: 12, padding: "14px 0",
        borderBottom: `1px solid ${theme.border}`,
        transition: "opacity 0.15s ease-out",
      }}
        onMouseEnter={e => e.currentTarget.style.opacity = "0.65"}
        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
      >
        <div style={{ width: 24, flexShrink: 0, paddingTop: 2, textAlign: "right" }}>
          <span style={{
            fontFamily: f.display,
            fontSize: rank >= 10 ? 16 : 20,
            lineHeight: 1,
            color: rank <= 3 ? theme.accent : theme.rule,
          }}>{rank}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontFamily: f.display, fontSize: 15, fontWeight: 400,
            color: theme.ink, lineHeight: 1.35, marginBottom: 5, letterSpacing: -0.1,
          }}>{article.title}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
            <span style={{
              fontFamily: f.sans, fontSize: 9, fontWeight: 600,
              color: theme.dim, textTransform: "uppercase", letterSpacing: 1.2,
            }}>{article.source}</span>
            {article.pubDate && (
              <>
                <span style={{ color: theme.rule }}>·</span>
                <span style={{
                  fontFamily: f.sans, fontSize: 10, color: theme.dim,
                  display: "inline-flex", alignItems: "center", gap: 3,
                }}>
                  <Clock size={9} strokeWidth={1.5} />
                  {formatTime(article.pubDate)}
                </span>
              </>
            )}
            <span style={{
              fontFamily: f.sans, fontSize: 10, color: theme.accent,
              display: "inline-flex", alignItems: "center", gap: 3,
              marginLeft: "auto", fontWeight: 500,
            }}>
              Read <ExternalLink size={8} strokeWidth={1.5} />
            </span>
          </div>
        </div>
        {article.image && (
          <div style={{
            width: 64, height: 48, flexShrink: 0, overflow: "hidden",
            background: theme.surface, borderRadius: 2,
          }}>
            <img src={article.image} alt="" loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "saturate(0.7) contrast(1.05)" }}
              onError={e => { e.target.parentElement.style.display = "none"; }} />
          </div>
        )}
      </article>
    </Link>
  );
}

// ─── Main page ───
export default function GlobeMapPage() {
  const { theme, isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const t = uiStrings.en;

  const [selectedCode, setSelectedCode] = useState(null);
  const [panelOpen, setPanelOpen]       = useState(false);
  const [articles, setArticles]         = useState([]);
  const [loading, setLoading]           = useState(false);

  const selectedCountry = countries.find(c => c.code === selectedCode);

  function handleSelectCountry(code) {
    setSelectedCode(code);
    setPanelOpen(true);
    setLoading(true);
    setArticles([]);

    const country = countries.find(c => c.code === code);
    if (!country) return;

    const cached = getCachedAllFeeds(code);
    if (cached?.length) {
      setArticles(cached);
      setLoading(false);
      fetchAllFeeds(country.feeds, code).then(fresh => {
        if (fresh.length) { setArticles(fresh); cacheArticles(fresh); }
      });
    } else {
      fetchAllFeeds(country.feeds, code).then(data => {
        setArticles(data);
        cacheArticles(data);
        setLoading(false);
      });
    }
  }

  function handleClosePanel() {
    setPanelOpen(false);
    setTimeout(() => { setSelectedCode(null); setArticles([]); }, 450);
  }

  function handleRefresh() {
    if (!selectedCode) return;
    const country = countries.find(c => c.code === selectedCode);
    if (!country) return;
    setLoading(true);
    fetchAllFeeds(country.feeds, selectedCode).then(data => {
      setArticles(data);
      cacheArticles(data);
      setLoading(false);
    });
  }

  const PANEL_WIDTH = 400;

  return (
    <div style={{
      background: theme.bg,
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      transition: "background 0.3s ease",
    }}>

      {/* ─── Navbar ─── */}
      <header style={{
        background: theme.bg,
        borderBottom: `1px solid ${theme.ink}`,
        flexShrink: 0,
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "14px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              onClick={() => navigate("/")}
              aria-label="Back to feed"
              style={{
                display: "flex", alignItems: "center", gap: 5, padding: "4px 8px",
                border: `1px solid ${theme.border}`, background: "transparent",
                cursor: "pointer", fontFamily: f.sans, fontSize: 10, fontWeight: 500,
                color: theme.dim, transition: "all 0.15s ease-out",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = theme.ink; e.currentTarget.style.color = theme.ink; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.dim; }}
            >
              <ArrowLeft size={10} strokeWidth={1.5} /> Back
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Globe size={20} strokeWidth={1.3} color={theme.ink} />
              <h1 style={{
                fontFamily: f.display, fontSize: 26, fontWeight: 400,
                color: theme.ink, lineHeight: 1, letterSpacing: -0.4,
              }}>The Atlas Report</h1>
            </div>

            <span style={{
              fontFamily: f.sans, fontSize: 9, fontWeight: 500,
              color: theme.dim, letterSpacing: 2, textTransform: "uppercase",
            }}>Globe Map</span>
          </div>

          <button
            onClick={toggleTheme}
            aria-label={isDark ? t.dayEdition : t.nightEdition}
            style={{
              display: "flex", alignItems: "center", gap: 4, padding: "4px 8px",
              border: `1px solid ${theme.border}`, background: "transparent",
              cursor: "pointer", fontFamily: f.sans, fontSize: 10, fontWeight: 500,
              color: theme.dim, transition: "all 0.15s ease-out",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = theme.ink; e.currentTarget.style.color = theme.ink; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.dim; }}
          >
            {isDark ? <Sun size={10} strokeWidth={1.5} /> : <Moon size={10} strokeWidth={1.5} />}
            {isDark ? t.dayEdition : t.nightEdition}
          </button>
        </div>
      </header>

      {/* ─── Instruction bar ─── */}
      <div style={{ borderBottom: `1px solid ${theme.border}`, flexShrink: 0, background: theme.bg }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "10px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {selectedCountry ? (
            <span style={{
              fontFamily: f.sans, fontSize: 11, color: theme.ink, fontWeight: 500,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ fontSize: 14 }}>{selectedCountry.flag}</span>
              {selectedCountry.name}
              {!loading && articles.length > 0 && (
                <span style={{ color: theme.dim, fontWeight: 400 }}>· {articles.length} articles</span>
              )}
            </span>
          ) : (
            <span style={{ fontFamily: f.sans, fontSize: 11, color: theme.dim, fontWeight: 500 }}>
              Click a country pin to view its news
            </span>
          )}
          <span style={{
            fontFamily: f.sans, fontSize: 10, color: theme.rule,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span>Drag to rotate</span>
            <span style={{ color: theme.border }}>·</span>
            <span>Scroll to zoom</span>
            <span style={{ color: theme.border }}>·</span>
            <span>Click a pin</span>
          </span>
        </div>
      </div>

      {/* ─── Globe + Panel ─── */}
      <div style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>

        {/* Globe — shrinks left when panel opens */}
        <div style={{
          flex: 1,
          minWidth: 0,
          transition: "flex 0.45s ease-out",
        }}>
          <GlobeHero
            countries={countries}
            selectedCountry={selectedCode || "ALL"}
            onSelectCountry={handleSelectCountry}
            theme={theme}
            isDark={isDark}
            hideHint
            panelOpen={panelOpen}
          />
        </div>

        {/* Side panel — slides in from right */}
        <div style={{
          width: panelOpen ? PANEL_WIDTH : 0,
          flexShrink: 0,
          overflow: "hidden",
          borderLeft: `1px solid ${theme.border}`,
          transition: "width 0.45s ease-out",
          background: theme.bg,
        }}>
          {/* Inner fixed-width container so content never squishes */}
          <div style={{
            width: PANEL_WIDTH,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}>

            {/* Panel header */}
            <div style={{
              padding: "16px 20px 14px",
              borderBottom: `2px solid ${theme.ink}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexShrink: 0,
            }}>
              <div>
                {selectedCountry && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 20 }}>{selectedCountry.flag}</span>
                    <h2 style={{
                      fontFamily: f.display, fontSize: 22, fontWeight: 400,
                      color: theme.ink, letterSpacing: -0.3,
                    }}>{selectedCountry.name}</h2>
                  </div>
                )}
                <p style={{
                  fontFamily: f.sans, fontSize: 9, color: theme.dim,
                  textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600,
                }}>
                  {loading ? "Loading…" : `${articles.length} articles`}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  onClick={handleRefresh}
                  aria-label="Refresh"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 28, height: 28,
                    border: `1px solid ${theme.border}`, background: "transparent",
                    cursor: "pointer", color: theme.dim,
                    transition: "all 0.15s ease-out",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = theme.ink; e.currentTarget.style.color = theme.ink; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.dim; }}
                >
                  <RefreshCw size={11} strokeWidth={1.5} />
                </button>
                <button
                  onClick={handleClosePanel}
                  aria-label="Close panel"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 28, height: 28,
                    border: `1px solid ${theme.border}`, background: "transparent",
                    cursor: "pointer", color: theme.dim,
                    transition: "all 0.15s ease-out",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = theme.ink; e.currentTarget.style.color = theme.ink; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.dim; }}
                >
                  <X size={12} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Article list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
              {loading ? (
                <SkeletonRows theme={theme} />
              ) : articles.length === 0 ? (
                <div style={{ padding: "48px 0", textAlign: "center" }}>
                  <p style={{ fontFamily: f.display, fontSize: 16, color: theme.ink, marginBottom: 6 }}>
                    No articles found
                  </p>
                  <p style={{ fontFamily: f.body, fontSize: 13, color: theme.dim }}>
                    Try refreshing or selecting another country
                  </p>
                </div>
              ) : (
                articles.map((article, i) => (
                  <PanelArticleRow
                    key={article.id}
                    article={article}
                    rank={i + 1}
                    theme={theme}
                  />
                ))
              )}

              {/* CTA: open full feed */}
              {!loading && articles.length > 0 && selectedCode && (
                <div style={{ padding: "20px 0 28px", textAlign: "center" }}>
                  <button
                    onClick={() => {
                      const p = new URLSearchParams();
                      p.set("country", selectedCode);
                      navigate(`/?${p.toString()}`);
                    }}
                    style={{
                      fontFamily: f.sans, fontSize: 11, fontWeight: 500,
                      padding: "9px 22px",
                      border: `1px solid ${theme.ink}`,
                      background: "transparent", color: theme.ink,
                      cursor: "pointer", letterSpacing: 0.3, textTransform: "uppercase",
                      transition: "all 0.15s ease-out",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = theme.ink; e.currentTarget.style.color = theme.bg; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = theme.ink; }}
                  >
                    Open full feed for {selectedCountry?.name}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
