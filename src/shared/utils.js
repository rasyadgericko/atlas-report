// ─── Reading time ───
export function estimateReadingTime(text) {
  if (!text) return 1;
  const words = text.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// ─── Articles-read-today counter ───
function todayKey() {
  return `atlas-read-${new Date().toISOString().slice(0, 10)}`;
}
export function trackArticleRead() {
  try {
    const n = parseInt(localStorage.getItem(todayKey()) || "0", 10);
    localStorage.setItem(todayKey(), String(n + 1));
  } catch { /* quota */ }
}
export function getArticlesReadToday() {
  try { return parseInt(localStorage.getItem(todayKey()) || "0", 10); }
  catch { return 0; }
}

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
// ─── CORS proxy system with remembered-winner to minimize failed requests ───
const PROXY_CONFIGS = [
  { id: "allorigins-raw", make: (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`, parse: null },
  { id: "codetabs", make: (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`, parse: null },
  { id: "allorigins-get", make: (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, parse: (text) => { const j = JSON.parse(text); if (j.contents) return j.contents; throw new Error("No contents"); } },
];

// Remember which proxy worked last to try it first (avoids extra failed requests)
let lastWorkingProxy = 0;

async function fetchViaProxy(feedUrl, idx) {
  const cfg = PROXY_CONFIGS[idx];
  const res = await fetch(cfg.make(feedUrl), { signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  let text = await res.text();
  if (cfg.parse) text = cfg.parse(text);
  return text;
}

// Try last-known-good proxy first, then fall back sequentially
async function fetchWithProxyFallback(url) {
  // Try the last working proxy first
  try {
    const text = await fetchViaProxy(url, lastWorkingProxy);
    return text;
  } catch { /* fall through */ }

  // Try remaining proxies sequentially (minimal console noise)
  for (let i = 0; i < PROXY_CONFIGS.length; i++) {
    if (i === lastWorkingProxy) continue;
    try {
      const text = await fetchViaProxy(url, i);
      lastWorkingProxy = i; // remember this one for next time
      return text;
    } catch { /* try next */ }
  }
  throw new Error("All proxies failed");
}

// ─── Feed cache (stale-while-revalidate) ───
const FEED_CACHE_KEY = "atlas_feed_cache";
const FEED_CACHE_FRESH = 2 * 60 * 1000; // 2 min = fresh, skip network
const FEED_CACHE_STALE = 30 * 60 * 1000; // 30 min = stale but usable

function getCachedFeed(feedUrl) {
  try {
    const cache = JSON.parse(sessionStorage.getItem(FEED_CACHE_KEY) || "{}");
    const entry = cache[feedUrl];
    if (!entry) return null;
    const age = Date.now() - entry.ts;
    if (age < FEED_CACHE_FRESH) return { data: entry.data, fresh: true };
    if (age < FEED_CACHE_STALE) return { data: entry.data, fresh: false };
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

// Aggregated feed cache for instant back-navigation
const ALL_FEEDS_CACHE_KEY = "atlas_all_feeds_cache";

export function getCachedAllFeeds(countryCode) {
  try {
    const cache = JSON.parse(sessionStorage.getItem(ALL_FEEDS_CACHE_KEY) || "{}");
    const entry = cache[countryCode];
    if (entry && Date.now() - entry.ts < FEED_CACHE_STALE) return entry.data;
  } catch { /* ignore */ }
  return null;
}

function setCachedAllFeeds(countryCode, data) {
  try {
    const cache = JSON.parse(sessionStorage.getItem(ALL_FEEDS_CACHE_KEY) || "{}");
    cache[countryCode] = { data, ts: Date.now() };
    sessionStorage.setItem(ALL_FEEDS_CACHE_KEY, JSON.stringify(cache));
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
  // Return fresh cached feed instantly
  const cached = getCachedFeed(feedUrl);
  if (cached?.fresh) return cached.data;

  try {
    const xmlText = await fetchWithProxyFallback(feedUrl);
    const result = parseRSSItems(xmlText, feedName);
    setCachedFeed(feedUrl, result);
    return result;
  } catch {
    // Fall back to stale cache if network fails
    return cached?.data || [];
  }
}

// Country keywords for filtering regional feeds (name, capital, major cities, demonyms)
const COUNTRY_KEYWORDS = {
  AF: ["afghanistan","afghan","kabul","kandahar"],
  DZ: ["algeria","algerian","algiers","oran"],
  AR: ["argentina","argentine","buenos aires","mendoza"],
  AT: ["austria","austrian","vienna","salzburg"],
  AU: ["australia","australian","sydney","melbourne","canberra"],
  AZ: ["azerbaijan","azerbaijani","baku"],
  BD: ["bangladesh","bangladeshi","dhaka","chittagong"],
  BE: ["belgium","belgian","brussels","antwerp"],
  BR: ["brazil","brazilian","brasilia","sao paulo","rio de janeiro"],
  KH: ["cambodia","cambodian","phnom penh"],
  CM: ["cameroon","cameroonian","yaounde","douala"],
  CA: ["canada","canadian","ottawa","toronto","vancouver","montreal"],
  CL: ["chile","chilean","santiago","valparaiso"],
  CN: ["china","chinese","beijing","shanghai","hong kong","shenzhen"],
  CO: ["colombia","colombian","bogota","medellin"],
  CD: ["congo","congolese","kinshasa","drc"],
  HR: ["croatia","croatian","zagreb"],
  CU: ["cuba","cuban","havana"],
  CZ: ["czech","czechia","prague","brno"],
  DK: ["denmark","danish","copenhagen"],
  EC: ["ecuador","ecuadorian","quito","guayaquil"],
  EG: ["egypt","egyptian","cairo","alexandria"],
  ET: ["ethiopia","ethiopian","addis ababa"],
  FI: ["finland","finnish","helsinki"],
  FR: ["france","french","paris","marseille","lyon"],
  GE: ["georgia","georgian","tbilisi"],
  DE: ["germany","german","berlin","munich","frankfurt"],
  GH: ["ghana","ghanaian","accra","kumasi"],
  GR: ["greece","greek","athens","thessaloniki"],
  HU: ["hungary","hungarian","budapest"],
  IN: ["india","indian","delhi","mumbai","bangalore","kolkata"],
  ID: ["indonesia","indonesian","jakarta","surabaya","bali"],
  IQ: ["iraq","iraqi","baghdad","mosul","basra"],
  IE: ["ireland","irish","dublin","cork"],
  IL: ["israel","israeli","jerusalem","tel aviv","gaza"],
  IT: ["italy","italian","rome","milan","naples"],
  JP: ["japan","japanese","tokyo","osaka","kyoto"],
  JO: ["jordan","jordanian","amman"],
  KZ: ["kazakhstan","kazakh","astana","almaty"],
  KE: ["kenya","kenyan","nairobi","mombasa"],
  KW: ["kuwait","kuwaiti"],
  LB: ["lebanon","lebanese","beirut"],
  LY: ["libya","libyan","tripoli","benghazi"],
  MY: ["malaysia","malaysian","kuala lumpur","penang"],
  MA: ["morocco","moroccan","rabat","casablanca","marrakech"],
  MX: ["mexico","mexican","mexico city","guadalajara"],
  MM: ["myanmar","burmese","yangon","naypyidaw"],
  NP: ["nepal","nepalese","nepali","kathmandu"],
  NL: ["netherlands","dutch","amsterdam","rotterdam","hague"],
  NZ: ["new zealand","zealand","auckland","wellington"],
  NG: ["nigeria","nigerian","lagos","abuja"],
  NO: ["norway","norwegian","oslo","bergen"],
  OM: ["oman","omani","muscat"],
  PK: ["pakistan","pakistani","islamabad","karachi","lahore"],
  PE: ["peru","peruvian","lima","cusco"],
  PH: ["philippines","filipino","manila","cebu","davao"],
  PL: ["poland","polish","warsaw","krakow"],
  PT: ["portugal","portuguese","lisbon","porto"],
  QA: ["qatar","qatari","doha"],
  RO: ["romania","romanian","bucharest"],
  RU: ["russia","russian","moscow","putin","kremlin","st petersburg"],
  SA: ["saudi","arabia","riyadh","jeddah","mecca"],
  RS: ["serbia","serbian","belgrade"],
  SG: ["singapore","singaporean"],
  ZA: ["south africa","african","johannesburg","cape town","pretoria"],
  KR: ["south korea","korean","seoul","busan"],
  ES: ["spain","spanish","madrid","barcelona","seville"],
  LK: ["sri lanka","lankan","colombo"],
  SD: ["sudan","sudanese","khartoum"],
  SE: ["sweden","swedish","stockholm","gothenburg"],
  CH: ["switzerland","swiss","zurich","geneva","bern"],
  SY: ["syria","syrian","damascus","aleppo"],
  TW: ["taiwan","taiwanese","taipei"],
  TZ: ["tanzania","tanzanian","dar es salaam","dodoma"],
  TH: ["thailand","thai","bangkok","phuket","chiang mai"],
  TN: ["tunisia","tunisian","tunis"],
  TR: ["turkey","turkish","ankara","istanbul","erdogan"],
  UG: ["uganda","ugandan","kampala"],
  AE: ["uae","emirates","emirati","dubai","abu dhabi"],
  UA: ["ukraine","ukrainian","kyiv","zelensky","odesa"],
  GB: ["uk","britain","british","london","england","scotland","wales"],
  US: ["us","usa","united states","american","washington","new york","trump","biden"],
  UZ: ["uzbekistan","uzbek","tashkent"],
  VE: ["venezuela","venezuelan","caracas","maduro"],
  VN: ["vietnam","vietnamese","hanoi","ho chi minh"],
  YE: ["yemen","yemeni","sanaa","aden"],
  ZW: ["zimbabwe","zimbabwean","harare"],
};

// Check if any feeds are regional (BBC regional, Al Jazeera, DW) vs local
function hasLocalFeed(feedList) {
  const regional = ["bbc","al jazeera","dw news"];
  return feedList.some(fd => !regional.some(r => fd.name.toLowerCase().includes(r)));
}

// Score how relevant an article is to a country
function countryRelevance(article, countryCode) {
  const keywords = COUNTRY_KEYWORDS[countryCode];
  if (!keywords) return 1; // no keywords = don't filter
  const text = `${article.title} ${article.description || ""}`.toLowerCase();
  for (const kw of keywords) {
    if (text.includes(kw)) return 1;
  }
  return 0;
}

export async function fetchAllFeeds(feedList, countryCode) {
  const results = await Promise.allSettled(feedList.map(fd => fetchRSSFeed(fd.url, fd.name)));
  const all = results.filter(r => r.status === "fulfilled").flatMap(r => r.value);
  const seen = new Set();
  const deduped = all.filter(a => {
    const key = a.title.toLowerCase().slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // For countries with only regional feeds, filter articles by country relevance
  let filtered = deduped;
  if (countryCode && countryCode !== "ALL" && !hasLocalFeed(feedList)) {
    const relevant = deduped.filter(a => countryRelevance(a, countryCode) > 0);
    // Only apply filter if we get enough results; fall back to all articles otherwise
    if (relevant.length >= 3) filtered = relevant;
  }

  const ranked = rankArticles(filtered, all);
  if (countryCode) setCachedAllFeeds(countryCode, ranked);
  return ranked;
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

  const html = await fetchWithProxyFallback(url);
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
      ALLOWED_TAGS: ["p", "h2", "h3", "h4", "h5", "h6", "br", "strong", "em", "b", "i", "u", "a", "ul", "ol", "li", "blockquote", "figure", "figcaption", "img", "span", "div", "table", "thead", "tbody", "tr", "th", "td", "pre", "code", "sub", "sup"],
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
