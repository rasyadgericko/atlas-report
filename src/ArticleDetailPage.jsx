import { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Clock, Globe, Loader, Languages, Search } from "lucide-react";
import { f, uiStrings } from "./shared/theme";
import { formatFullDate, formatTime, getCachedArticle, getCachedArticles, fetchArticleContent, translateText, translateHtml } from "./shared/utils";
import { useTheme } from "./shared/ThemeContext";

// ─── Reading Progress Bar ───
function ReadingProgress({ theme }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) { setProgress(0); return; }
      setProgress(Math.min((window.scrollY / docHeight) * 100, 100));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: 3,
      zIndex: 100, background: "transparent",
    }}>
      <div style={{
        height: "100%", width: `${progress}%`,
        background: theme.accent,
        transition: "width 0.1s linear",
      }} />
    </div>
  );
}

// ─── Content Loading Skeleton ───
function ContentSkeleton({ theme }) {
  return (
    <div style={{ padding: "8px 0" }} aria-busy="true" aria-label="Loading article content">
      {[100, 95, 88, 70, 98, 82, 60, 96, 75, 90, 45].map((w, i) => (
        <div key={i} style={{
          height: 16, borderRadius: 2, marginBottom: 14,
          width: `${w}%`, background: theme.skeleton,
          animation: `shimmer 1.5s ${i * 0.08}s infinite`,
        }} />
      ))}
    </div>
  );
}

// ─── Slim Header ───
function SlimHeader({ t, theme }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "20px 0", borderBottom: `1px solid ${theme.ink}`,
    }}>
      <Link to="/" style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontFamily: f.sans, fontSize: 12, fontWeight: 500,
        color: theme.dim, textDecoration: "none",
        transition: "color 0.15s ease-out",
      }}
        onMouseEnter={e => e.currentTarget.style.color = theme.ink}
        onMouseLeave={e => e.currentTarget.style.color = theme.dim}>
        <ArrowLeft size={14} strokeWidth={1.5} /> {t.backToFeed}
      </Link>
      <Link to="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
        <Globe size={16} strokeWidth={1.3} color={theme.ink} />
        <span style={{ fontFamily: f.display, fontSize: 18, color: theme.ink }}>The Atlas Report</span>
      </Link>
    </div>
  );
}

export default function ArticleDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const lang = new URLSearchParams(location.search).get("lang") || "en";
  const t = { ...uiStrings.en, ...(uiStrings[lang] || {}) };

  const article = location.state?.article || getCachedArticle(id);

  const [content, setContent] = useState({ status: "idle", data: null });
  const [showTranslated, setShowTranslated] = useState(lang !== "en");
  const [translatedTitle, setTranslatedTitle] = useState(null);
  const [translatedContent, setTranslatedContent] = useState(null);
  const [translatedDesc, setTranslatedDesc] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // Scroll to top on every article navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [id]);

  // Keyboard: Escape goes back
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && e.target.tagName !== "INPUT") {
        navigate("/");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  // Fetch full article content
  useEffect(() => {
    if (!article?.link || article.link === "#") return;
    let cancelled = false;

    setContent({ status: "loading", data: null }); // eslint-disable-line react-hooks/set-state-in-effect
    fetchArticleContent(article.link)
      .then(result => { if (!cancelled) setContent({ status: "done", data: result }); })
      .catch(() => { if (!cancelled) setContent({ status: "error", data: null }); });

    return () => { cancelled = true; };
  }, [article?.link]);

  const fullContent = content.data;
  const contentLoading = content.status === "loading";
  const contentError = content.status === "error";

  // Translate article
  useEffect(() => {
    if (lang === "en" || !showTranslated) {
      setTranslatedTitle(null); // eslint-disable-line react-hooks/set-state-in-effect
      setTranslatedContent(null);
      setTranslatedDesc(null);
      return;
    }

    let cancelled = false;
    setIsTranslating(true);

    (async () => {
      if (article?.title) {
        const trTitle = await translateText(article.title, lang);
        if (!cancelled) setTranslatedTitle(trTitle);
      }
      if (article?.description) {
        const trDesc = await translateText(article.description, lang);
        if (!cancelled) setTranslatedDesc(trDesc);
      }
      if (fullContent?.content) {
        const trHtml = await translateHtml(fullContent.content, lang);
        if (!cancelled) setTranslatedContent(trHtml);
      }
      if (!cancelled) setIsTranslating(false);
    })();

    return () => { cancelled = true; };
  }, [lang, showTranslated, article?.title, article?.description, fullContent?.content]);

  // Related articles from same source
  const relatedArticles = useMemo(() => {
    if (!article) return [];
    const cached = getCachedArticles();
    return Object.values(cached)
      .filter(a => a.source === article.source && a.id !== article.id)
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
      .slice(0, 3);
  }, [article]);

  const hostname = useMemo(() => {
    if (!article) return "";
    try { return new URL(article.link).hostname.replace("www.", ""); } catch { return article.source; }
  }, [article]);

  // ─── Not Found / Direct Link State ───
  if (!article) {
    return (
      <div style={{ background: theme.bg, minHeight: "100vh", fontFamily: f.body, transition: "background 0.3s ease" }}>
        <div className="article-page-container" style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
          <SlimHeader t={t} theme={theme} />
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <Globe size={48} strokeWidth={0.8} color={theme.rule} style={{ marginBottom: 24 }} />
            <h2 style={{
              fontFamily: f.display, fontSize: 28, fontWeight: 400,
              color: theme.ink, marginBottom: 12,
            }}>{t.articleNotFound}</h2>
            <p style={{
              fontFamily: f.body, fontSize: 15, color: theme.dim,
              fontStyle: "normal", marginBottom: 12, maxWidth: 400, margin: "0 auto 32px",
              lineHeight: 1.6,
            }}>{t.articleExpired}</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 24px", background: theme.ink, color: theme.bg,
                fontFamily: f.sans, fontSize: 13, fontWeight: 600,
                textDecoration: "none", letterSpacing: 0.3, transition: "opacity 0.15s ease-out",
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                <Search size={14} strokeWidth={2} /> {t.returnHome}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Article Detail ───
  return (
    <div style={{ background: theme.bg, minHeight: "100vh", fontFamily: f.body, transition: "background 0.3s ease" }}>
      <ReadingProgress theme={theme} />

      <div className="article-page-container" style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
        <SlimHeader t={t} theme={theme} />

        {/* ─── Article Meta ─── */}
        <div style={{ padding: "32px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <span style={{
              fontFamily: f.sans, fontSize: 11, fontWeight: 600, color: theme.dim,
              textTransform: "uppercase", letterSpacing: 1.5,
            }}>{article.source}</span>
            {fullContent?.byline && (
              <>
                <span style={{ color: theme.rule }} aria-hidden="true">·</span>
                <span style={{
                  fontFamily: f.sans, fontSize: 11, color: theme.dim, fontWeight: 500,
                }}>{fullContent.byline}</span>
              </>
            )}
            {article.pubDate && (
              <>
                <span style={{ color: theme.rule }} aria-hidden="true">·</span>
                <time dateTime={new Date(article.pubDate).toISOString()} style={{
                  fontFamily: f.sans, fontSize: 11, color: theme.dim, fontWeight: 500,
                }}>{formatFullDate(article.pubDate)}</time>
              </>
            )}
          </div>

          {/* Category tags */}
          {article.categories?.length > 0 && (
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
              {article.categories.map(cat => (
                <span key={cat} style={{
                  fontFamily: f.sans, fontSize: 10, fontWeight: 500,
                  color: theme.accent, letterSpacing: 0.3,
                  padding: "3px 8px", background: theme.accentSoft,
                  borderRadius: 2, textTransform: "lowercase",
                }}>{cat}</span>
              ))}
            </div>
          )}

          {/* ─── Title ─── */}
          <h1 style={{
            fontFamily: f.display, fontSize: "clamp(26px, 5vw, 36px)", fontWeight: 400,
            color: theme.ink, lineHeight: 1.25, letterSpacing: -0.5,
            marginBottom: 16,
          }}>{showTranslated && translatedTitle ? translatedTitle : article.title}</h1>

          {/* ─── Translate Toggle ─── */}
          {lang !== "en" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
              <button
                onClick={() => setShowTranslated(v => !v)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "5px 12px", border: `1px solid ${theme.border}`,
                  background: showTranslated ? theme.surface : "transparent",
                  cursor: "pointer", fontFamily: f.sans, fontSize: 11,
                  fontWeight: 500, color: theme.dim, transition: "all 0.15s ease-out",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = theme.ink; e.currentTarget.style.color = theme.ink; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.dim; }}>
                <Languages size={12} strokeWidth={1.5} />
                {showTranslated ? (t.showOriginal || "Original") : (t.translateArticle || "Translate article")}
              </button>
              {isTranslating && (
                <span style={{
                  fontFamily: f.sans, fontSize: 11, color: theme.accent,
                  display: "inline-flex", alignItems: "center", gap: 4,
                }}>
                  <Loader size={11} strokeWidth={1.5} style={{ animation: "spin 1s linear infinite" }} />
                  {t.translating || "Translating…"}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ─── Hero Image ─── */}
        {article.image && (
          <div style={{
            width: "100%", aspectRatio: "16 / 9", maxHeight: 400, overflow: "hidden",
            background: theme.surface, marginBottom: 32, borderRadius: 3,
          }}>
            <img src={article.image} alt=""
              style={{
                width: "100%", height: "100%", objectFit: "cover", display: "block",
                filter: "saturate(0.7) contrast(1.05)",
              }}
              onError={e => { e.target.parentElement.style.display = "none"; }} />
          </div>
        )}

        {/* ─── Full Article Content ─── */}
        {contentLoading ? (
          <div>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 20,
              padding: "12px 16px", background: theme.surface,
            }}>
              <Loader size={14} strokeWidth={1.5} color={theme.dim} style={{ animation: "spin 1s linear infinite" }} />
              <span style={{ fontFamily: f.sans, fontSize: 12, color: theme.dim, fontWeight: 500 }}>
                {t.loadingArticle} {hostname}...
              </span>
            </div>
            <ContentSkeleton theme={theme} />
          </div>
        ) : fullContent ? (
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: showTranslated && translatedContent ? translatedContent : fullContent.content }}
            style={{
              fontFamily: f.body, fontSize: 17, color: theme.text,
              lineHeight: 1.8, marginBottom: 36,
            }}
          />
        ) : (
          article.description && (
            <div>
              {contentError && (
                <div style={{
                  padding: "10px 16px", background: theme.accentSoft, marginBottom: 20,
                  display: "flex", alignItems: "center", gap: 8,
                }} role="status">
                  <span style={{ fontFamily: f.sans, fontSize: 12, color: theme.accent, fontWeight: 500 }}>
                    {t.contentFallback}
                  </span>
                </div>
              )}
              <p style={{
                fontFamily: f.body, fontSize: 17, color: theme.text,
                lineHeight: 1.8, marginBottom: 36,
              }}>{showTranslated && translatedDesc ? translatedDesc : article.description}</p>
            </div>
          )
        )}

        {/* ─── Source Attribution ─── */}
        <div style={{
          padding: "16px 20px", background: theme.surface, marginBottom: 24,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <Globe size={13} strokeWidth={1.5} color={theme.dim} />
          <span style={{ fontFamily: f.sans, fontSize: 12, color: theme.dim }}>
            {t.publishedOn} <strong style={{ color: theme.text, fontWeight: 600 }}>{hostname}</strong>
          </span>
        </div>

        {/* ─── CTA Button ─── */}
        <a href={article.link} target="_blank" rel="noopener noreferrer" style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          width: "100%", padding: "16px 24px", background: theme.ink, color: theme.bg,
          fontFamily: f.sans, fontSize: 14, fontWeight: 600,
          textDecoration: "none", transition: "opacity 0.15s ease-out",
          letterSpacing: 0.3,
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
          {t.readFull} {hostname} <ArrowUpRight size={16} strokeWidth={2} />
        </a>

        {/* ─── Related Articles ─── */}
        {relatedArticles.length > 0 && (
          <section style={{ marginTop: 48 }}>
            <div style={{
              borderTop: `1px solid ${theme.rule}`, paddingTop: 24, marginBottom: 16,
            }}>
              <h3 style={{
                fontFamily: f.sans, fontSize: 11, fontWeight: 600, color: theme.dim,
                textTransform: "uppercase", letterSpacing: 1.5,
              }}>{t.moreFrom} {article.source}</h3>
            </div>

            {relatedArticles.map(related => (
              <Link
                key={related.id}
                to={`/article/${related.id}`}
                state={{ article: related }}
                style={{ textDecoration: "none", color: "inherit", display: "block" }}
              >
                <div style={{
                  padding: "14px 0",
                  borderBottom: `1px solid ${theme.border}`,
                  transition: "opacity 0.15s ease-out",
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                  <h4 style={{
                    fontFamily: f.display, fontSize: 16, fontWeight: 400,
                    color: theme.ink, lineHeight: 1.35, marginBottom: 4,
                  }}>{related.title}</h4>
                  {related.pubDate && (
                    <span style={{
                      fontFamily: f.sans, fontSize: 10, color: theme.dim,
                      display: "inline-flex", alignItems: "center", gap: 3,
                    }}>
                      <Clock size={9} strokeWidth={1.5} /> {formatTime(related.pubDate)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </section>
        )}

        {/* ─── Keyboard hint ─── */}
        <div style={{
          textAlign: "center", padding: "24px 0 8px",
          fontFamily: f.sans, fontSize: 10, color: theme.rule,
        }}>
          <kbd style={{ padding: "1px 4px", background: theme.surface, borderRadius: 2, fontSize: 9 }}>Esc</kbd>
          {" back to feed"}
        </div>

        {/* ─── Footer ─── */}
        <footer style={{ borderTop: `1px solid ${theme.ink}`, padding: "16px 0", marginTop: 48 }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontFamily: f.display, fontSize: 15, color: theme.ink, display: "flex", alignItems: "center", gap: 6 }}>
              <Globe size={14} strokeWidth={1.3} color={theme.ink} />
              The Atlas Report
            </span>
            <a href="https://rycworks.com" target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: f.sans, fontSize: 10, color: theme.dim, fontWeight: 500, textDecoration: "none", transition: "color 0.15s ease-out" }}
              onMouseEnter={e => e.currentTarget.style.color = theme.ink}
              onMouseLeave={e => e.currentTarget.style.color = theme.dim}>
              Built by RYC
            </a>
          </div>
        </footer>

        <div style={{ height: 24 }} />
      </div>

      {/* ─── Article Content Styles ─── */}
      <style>{`
        .article-content p {
          margin-bottom: 1.4em;
        }
        .article-content h1,
        .article-content h2,
        .article-content h3,
        .article-content h4 {
          font-family: ${f.display};
          font-weight: 400;
          color: ${theme.ink};
          margin-top: 1.8em;
          margin-bottom: 0.6em;
          line-height: 1.3;
        }
        .article-content h2 { font-size: 26px; letter-spacing: -0.3px; }
        .article-content h3 { font-size: 22px; }
        .article-content h4 { font-size: 18px; }
        .article-content a {
          color: ${theme.accent};
          text-decoration: underline;
          text-underline-offset: 3px;
          text-decoration-color: ${theme.accentSoft};
          transition: text-decoration-color 0.15s ease-out;
        }
        .article-content a:hover {
          text-decoration-color: ${theme.accent};
        }
        .article-content img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 1.5em 0;
          filter: saturate(0.7) contrast(1.05);
          border-radius: 3px;
        }
        .article-content blockquote {
          border-left: 3px solid ${theme.accent};
          margin: 1.5em 0;
          padding: 0.5em 0 0.5em 1.2em;
          color: ${theme.dim};
          font-style: italic;
        }
        .article-content ul,
        .article-content ol {
          padding-left: 1.5em;
          margin-bottom: 1.4em;
        }
        .article-content li {
          margin-bottom: 0.4em;
        }
        .article-content figure {
          margin: 1.5em 0;
        }
        .article-content figcaption {
          font-family: ${f.sans};
          font-size: 12px;
          color: ${theme.dim};
          margin-top: 8px;
          font-style: italic;
        }
        .article-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5em 0;
          font-size: 15px;
        }
        .article-content th,
        .article-content td {
          padding: 8px 12px;
          border-bottom: 1px solid ${theme.border};
          text-align: left;
        }
        .article-content th {
          font-family: ${f.sans};
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: ${theme.dim};
        }
        .article-content pre {
          background: ${theme.surface};
          padding: 16px;
          overflow-x: auto;
          margin: 1.5em 0;
          font-size: 14px;
        }
        .article-content code {
          background: ${theme.surface};
          padding: 2px 5px;
          font-size: 0.9em;
        }
      `}</style>
    </div>
  );
}
