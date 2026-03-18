// ─── Stable Article ID ───
export function generateArticleId(title, link) {
  const str = `${title}|${link}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

// ─── RSS Utilities ───
export function stripHtml(html) {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

export function extractImageFromItem(item) {
  const mediaThumbnail = item.querySelector("thumbnail");
  if (mediaThumbnail) return mediaThumbnail.getAttribute("url");
  const mediaContent = item.querySelector("content[url]");
  if (mediaContent) {
    const url = mediaContent.getAttribute("url");
    if (url && (url.includes(".jpg") || url.includes(".png") || url.includes(".webp") || url.includes("image"))) return url;
  }
  const enclosure = item.querySelector("enclosure");
  if (enclosure && enclosure.getAttribute("type")?.startsWith("image")) return enclosure.getAttribute("url");
  const desc = item.querySelector("description")?.textContent || "";
  const imgMatch = desc.match(/<img[^>]+src=["']([^"']+)["']/);
  if (imgMatch) return imgMatch[1];
  return null;
}

// ─── Translation via Google Translate (free tier) ───
const TRANSLATE_CACHE_KEY = "atlas_translations";

function getTranslateCache() {
  try { return JSON.parse(sessionStorage.getItem(TRANSLATE_CACHE_KEY) || "{}"); }
  catch { return {}; }
}

function setTranslateCache(key, value) {
  try {
    const cache = getTranslateCache();
    cache[key] = value;
    // Keep cache under ~2MB by pruning oldest entries
    const keys = Object.keys(cache);
    if (keys.length > 500) {
      keys.slice(0, 200).forEach(k => delete cache[k]);
    }
    sessionStorage.setItem(TRANSLATE_CACHE_KEY, JSON.stringify(cache));
  } catch { /* quota exceeded */ }
}

/**
 * Translate a single text string to the target language.
 * Uses Google Translate's free endpoint (no API key).
 */
export async function translateText(text, targetLang) {
  if (!text || targetLang === "en") return text;

  const cacheKey = `${targetLang}:${text.slice(0, 100)}`;
  const cached = getTranslateCache()[cacheKey];
  if (cached) return cached;

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const translated = data[0]?.map(s => s[0]).join("") || text;
    setTranslateCache(cacheKey, translated);
    return translated;
  } catch {
    return text; // fail silently, return original
  }
}

/**
 * Translate multiple texts in a single batch (concatenate with separator, then split).
 * More efficient than individual calls for article lists.
 */
export async function translateBatch(texts, targetLang) {
  if (!texts.length || targetLang === "en") return texts;

  // Check which texts need translation
  const cache = getTranslateCache();
  const results = new Array(texts.length);
  const toTranslate = [];
  const toTranslateIdx = [];

  texts.forEach((text, i) => {
    if (!text) { results[i] = text; return; }
    const cacheKey = `${targetLang}:${text.slice(0, 100)}`;
    if (cache[cacheKey]) { results[i] = cache[cacheKey]; }
    else { toTranslate.push(text); toTranslateIdx.push(i); }
  });

  if (!toTranslate.length) return results;

  // Batch in chunks of ~10 to avoid URL length limits
  const CHUNK = 10;
  for (let c = 0; c < toTranslate.length; c += CHUNK) {
    const chunk = toTranslate.slice(c, c + CHUNK);
    const separator = " ||| ";
    const joined = chunk.join(separator);

    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(joined)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const fullTranslation = data[0]?.map(s => s[0]).join("") || joined;
      const parts = fullTranslation.split(/\s*\|\|\|\s*/);

      chunk.forEach((original, j) => {
        const idx = toTranslateIdx[c + j];
        const translated = parts[j]?.trim() || original;
        results[idx] = translated;
        setTranslateCache(`${targetLang}:${original.slice(0, 100)}`, translated);
      });
    } catch {
      // On failure, fill with originals
      chunk.forEach((original, j) => {
        results[toTranslateIdx[c + j]] = original;
      });
    }
  }

  return results;
}

/**
 * Translate HTML content (for full article body).
 * Strips HTML, translates text, but we actually translate the raw HTML
 * since Google Translate preserves basic HTML tags.
 */
export async function translateHtml(html, targetLang) {
  if (!html || targetLang === "en") return html;

  const cacheKey = `${targetLang}:html:${html.slice(0, 80)}`;
  const cached = getTranslateCache()[cacheKey];
  if (cached) return cached;

  // Split HTML into manageable chunks (~4000 chars each)
  const LIMIT = 4000;
  const chunks = [];
  let remaining = html;
  while (remaining.length > 0) {
    if (remaining.length <= LIMIT) { chunks.push(remaining); break; }
    // Try to split at a tag boundary
    let splitAt = remaining.lastIndexOf(">", LIMIT);
    if (splitAt < LIMIT * 0.5) splitAt = LIMIT;
    chunks.push(remaining.slice(0, splitAt + 1));
    remaining = remaining.slice(splitAt + 1);
  }

  const translated = await Promise.all(chunks.map(async (chunk) => {
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(chunk)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
      if (!res.ok) return chunk;
      const data = await res.json();
      return data[0]?.map(s => s[0]).join("") || chunk;
    } catch { return chunk; }
  }));

  const result = translated.join("");
  setTranslateCache(cacheKey, result);
  return result;
}

// ─── Multi-proxy fetcher ───
const PROXIES = [
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
];

async function fetchViaProxy(feedUrl, idx) {
  const res = await fetch(PROXIES[idx](feedUrl), { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  let text = await res.text();
  if (idx === 2) {
    const json = JSON.parse(text);
    if (json.contents) text = json.contents;
    else throw new Error("No contents");
  }
  return text;
}

// Fetch raw HTML — race all proxies in parallel for speed
async function fetchHtmlViaProxy(url) {
  const result = await Promise.any(
    PROXIES.map((_, i) =>
      fetchViaProxy(url, i).catch(err => {
        // proxy failed, try next
        throw err;
      })
    )
  );
  return result;
}

// ─── Feed cache (show stale data instantly, refresh in background) ───
const FEED_CACHE_KEY = "atlas_feed_cache";
const FEED_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedFeed(feedUrl) {
  try {
    const cache = JSON.parse(sessionStorage.getItem(FEED_CACHE_KEY) || "{}");
    const entry = cache[feedUrl];
    if (entry && Date.now() - entry.ts < FEED_CACHE_TTL) return entry.data;
  } catch { /* ignore */ }
  return null;
}

function setCachedFeed(feedUrl, data) {
  try {
    const cache = JSON.parse(sessionStorage.getItem(FEED_CACHE_KEY) || "{}");
    cache[feedUrl] = { data, ts: Date.now() };
    sessionStorage.setItem(FEED_CACHE_KEY, JSON.stringify(cache));
  } catch { /* quota exceeded */ }
}

function parseRSSItems(xmlText, feedName) {
  if (xmlText.trim().startsWith("<!DOCTYPE") || xmlText.trim().startsWith("<html")) throw new Error("HTML response");
  const xml = new DOMParser().parseFromString(xmlText, "text/xml");
  if (xml.querySelector("parsererror")) throw new Error("XML parse error");
  return Array.from(xml.querySelectorAll("item")).map((item) => {
    const title = item.querySelector("title")?.textContent?.trim() || "";
    const link = item.querySelector("link")?.textContent?.trim() || item.querySelector("link")?.getAttribute("href") || "#";
    const categories = Array.from(item.querySelectorAll("category"))
      .map(c => c.textContent?.trim())
      .filter(Boolean)
      .slice(0, 3);

    return {
      title,
      description: stripHtml(item.querySelector("description")?.textContent || "").trim().slice(0, 300),
      link,
      pubDate: item.querySelector("pubDate")?.textContent || item.querySelector("date")?.textContent || "",
      image: extractImageFromItem(item),
      source: feedName,
      categories,
      id: generateArticleId(title, link),
    };
  }).filter(a => a.title);
}

export async function fetchRSSFeed(feedUrl, feedName) {
  // Return cached feed instantly if available
  const cached = getCachedFeed(feedUrl);
  if (cached) return cached;

  // Race all proxies in parallel — first valid response wins
  try {
    const result = await Promise.any(
      PROXIES.map((_, i) =>
        fetchViaProxy(feedUrl, i).then(xmlText => parseRSSItems(xmlText, feedName))
      )
    );
    setCachedFeed(feedUrl, result);
    return result;
  } catch {
    return [];
  }
}

export async function fetchAllFeeds(feedList) {
  const results = await Promise.allSettled(feedList.map(fd => fetchRSSFeed(fd.url, fd.name)));
  const all = results.filter(r => r.status === "fulfilled").flatMap(r => r.value);
  const seen = new Set();
  const deduped = all.filter(a => {
    const key = a.title.toLowerCase().slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return rankArticles(deduped, all);
}

// ─── Trending algorithm: cross-source topic weighting ───
export function rankArticles(deduped, allRaw) {
  const titleWords = (t) => t.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(w => w.length > 3);

  const scored = deduped.map(article => {
    const words = new Set(titleWords(article.title));
    let crossSourceCount = 0;
    const matchedSources = new Set();
    matchedSources.add(article.source);

    for (const other of allRaw) {
      if (other.source === article.source) continue;
      if (matchedSources.has(other.source)) continue;
      const otherWords = titleWords(other.title);
      const overlap = otherWords.filter(w => words.has(w)).length;
      if (overlap >= 2 && overlap / Math.max(words.size, 1) > 0.3) {
        crossSourceCount++;
        matchedSources.add(other.source);
      }
    }

    const recency = article.pubDate ? Math.max(0, 1 - (Date.now() - new Date(article.pubDate)) / (86400000 * 2)) : 0.3;
    const score = (crossSourceCount * 3) + recency;
    return { ...article, trendScore: score, sourceCount: matchedSources.size };
  });

  return scored.sort((a, b) => b.trendScore - a.trendScore || new Date(b.pubDate) - new Date(a.pubDate));
}

// ─── Time formatting ───
export function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 0) return "";
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

export function formatFullDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ─── Full Article Extraction (with sessionStorage cache) ───
const CONTENT_CACHE_KEY = "atlas_article_content";

function getCachedContent(url) {
  try {
    const cache = JSON.parse(sessionStorage.getItem(CONTENT_CACHE_KEY) || "{}");
    return cache[url] || null;
  } catch { return null; }
}

function setCachedContent(url, content) {
  try {
    const cache = JSON.parse(sessionStorage.getItem(CONTENT_CACHE_KEY) || "{}");
    cache[url] = content;
    sessionStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(cache));
  } catch { /* quota exceeded, ignore */ }
}

export async function fetchArticleContent(url) {
  // Return cached content instantly if available
  const cached = getCachedContent(url);
  if (cached) return cached;

  const { Readability } = await import("@mozilla/readability");
  const DOMPurify = (await import("dompurify")).default;

  const html = await fetchHtmlViaProxy(url);
  const doc = new DOMParser().parseFromString(html, "text/html");

  // Set the base URL so relative links/images resolve correctly
  const base = doc.createElement("base");
  base.href = url;
  doc.head.prepend(base);

  // Strip navigation, header, footer, sidebar elements before Readability
  const junkSelectors = "nav, header, footer, aside, [role='navigation'], [role='banner'], [role='complementary'], .nav, .navigation, .menu, .sidebar, .skip-links, .social-share, .share-buttons, .related-articles, .ad, .advertisement, [class*='cookie'], [class*='popup'], [id*='nav'], [id*='menu']";
  doc.querySelectorAll(junkSelectors).forEach(el => el.remove());

  const reader = new Readability(doc, { charThreshold: 100 });
  const parsed = reader.parse();
  if (!parsed || !parsed.content) throw new Error("Could not extract article content");

  const result = {
    title: parsed.title || "",
    content: DOMPurify.sanitize(parsed.content, {
      ALLOWED_TAGS: ["p", "h1", "h2", "h3", "h4", "h5", "h6", "br", "strong", "em", "b", "i", "u", "a", "ul", "ol", "li", "blockquote", "figure", "figcaption", "img", "span", "div", "table", "thead", "tbody", "tr", "th", "td", "pre", "code", "sub", "sup"],
      ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel", "class"],
      ADD_ATTR: ["target"],
    }),
    excerpt: parsed.excerpt || "",
    siteName: parsed.siteName || "",
    byline: parsed.byline || "",
    length: parsed.length || 0,
  };

  setCachedContent(url, result);
  return result;
}

// ─── SessionStorage helpers ───
export function cacheArticles(articles) {
  try {
    const map = {};
    articles.forEach(a => { map[a.id] = a; });
    sessionStorage.setItem("atlas_articles", JSON.stringify(map));
  } catch { /* quota exceeded, ignore */ }
}

export function getCachedArticle(id) {
  try {
    const cached = JSON.parse(sessionStorage.getItem("atlas_articles") || "{}");
    return cached[id] || null;
  } catch { return null; }
}

export function getCachedArticles() {
  try {
    return JSON.parse(sessionStorage.getItem("atlas_articles") || "{}");
  } catch { return {}; }
}
