// ─── Theme Tokens ───
export const lightTheme = {
  bg: "#F7F5F2", card: "#FFFFFF", surface: "#EDEAE5", border: "#DDD9D1",
  rule: "#C8C2B8", ink: "#1A1A1A", text: "#2A2A2A", dim: "#8A8377",
  accent: "#7A2E2E", accentSoft: "#F3E8E8", overlay: "rgba(26,26,26,0.45)",
  panelBg: "#FFFFFF", skeleton: "#E8E4DD", skeletonShine: "#F5F2ED",
};

export const darkTheme = {
  bg: "#141312", card: "#1C1B19", surface: "#222120", border: "#333130",
  rule: "#4A4745", ink: "#E8E4DD", text: "#D4CFC7", dim: "#8A8377",
  accent: "#C46A6A", accentSoft: "#2E1F1F", overlay: "rgba(0,0,0,0.6)",
  panelBg: "#1C1B19", skeleton: "#2A2826", skeletonShine: "#333130",
};

// Default export for backwards compat during migration
export const theme = lightTheme;

export const f = {
  display: "'Gambarino', 'Georgia', serif",
  body: "'Sentient', 'Georgia', serif",
  sans: "'General Sans', -apple-system, sans-serif",
};

// ─── Languages ───
export const languages = [
  { code: "en", name: "English", native: "English" },
  { code: "es", name: "Spanish", native: "Español" },
  { code: "fr", name: "French", native: "Français" },
  { code: "de", name: "German", native: "Deutsch" },
  { code: "pt", name: "Portuguese", native: "Português" },
  { code: "ar", name: "Arabic", native: "العربية" },
  { code: "zh", name: "Chinese", native: "中文" },
  { code: "ja", name: "Japanese", native: "日本語" },
  { code: "ko", name: "Korean", native: "한국어" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "id", name: "Indonesian", native: "Bahasa Indonesia" },
  { code: "tr", name: "Turkish", native: "Türkçe" },
  { code: "it", name: "Italian", native: "Italiano" },
  { code: "pl", name: "Polish", native: "Polski" },
  { code: "uk", name: "Ukrainian", native: "Українська" },
  { code: "sw", name: "Swahili", native: "Kiswahili" },
  { code: "tl", name: "Filipino", native: "Filipino" },
  { code: "ru", name: "Russian", native: "Русский" },
  { code: "nl", name: "Dutch", native: "Nederlands" },
  { code: "sv", name: "Swedish", native: "Svenska" },
  { code: "no", name: "Norwegian", native: "Norsk" },
  { code: "da", name: "Danish", native: "Dansk" },
  { code: "fi", name: "Finnish", native: "Suomi" },
  { code: "el", name: "Greek", native: "Ελληνικά" },
  { code: "cs", name: "Czech", native: "Čeština" },
  { code: "ro", name: "Romanian", native: "Română" },
  { code: "hu", name: "Hungarian", native: "Magyar" },
  { code: "th", name: "Thai", native: "ไทย" },
  { code: "vi", name: "Vietnamese", native: "Tiếng Việt" },
  { code: "ms", name: "Malay", native: "Bahasa Melayu" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "ur", name: "Urdu", native: "اردو" },
  { code: "fa", name: "Persian", native: "فارسی" },
  { code: "he", name: "Hebrew", native: "עברית" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "my", name: "Burmese", native: "မြန်မာ" },
  { code: "km", name: "Khmer", native: "ខ្មែរ" },
  { code: "am", name: "Amharic", native: "አማርኛ" },
  { code: "sr", name: "Serbian", native: "Српски" },
  { code: "hr", name: "Croatian", native: "Hrvatski" },
  { code: "bg", name: "Bulgarian", native: "Български" },
  { code: "sk", name: "Slovak", native: "Slovenčina" },
  { code: "lt", name: "Lithuanian", native: "Lietuvių" },
  { code: "lv", name: "Latvian", native: "Latviešu" },
  { code: "et", name: "Estonian", native: "Eesti" },
  { code: "ka", name: "Georgian", native: "ქართული" },
  { code: "az", name: "Azerbaijani", native: "Azərbaycan" },
  { code: "uz", name: "Uzbek", native: "O'zbek" },
  { code: "ne", name: "Nepali", native: "नेपाली" },
  { code: "si", name: "Sinhala", native: "සිංහල" },
];

export const uiStrings = {
  en: { trending: "Trending", selectCountry: "Select country", search: "Search articles…", readMore: "Read", readFull: "Read full article at", noResults: "No articles found", tryAgain: "Try selecting a different country", poweredBy: "Free & open global news", liveLabel: "LIVE", language: "Language", loading: "Fetching latest news…", refresh: "Refresh", sources: "Sources", loadMore: "Load more", showing: "Showing", close: "Close", nightEdition: "Night edition", dayEdition: "Day edition", backToFeed: "Back to feed", moreFrom: "More from", articleNotFound: "Article not available", articleExpired: "This article may have expired from the feed.", returnHome: "Return to The Atlas Report", loadingArticle: "Loading full article from", contentFallback: "Full article couldn't be loaded. Showing summary instead.", publishedOn: "Originally published on", translating: "Translating…", showOriginal: "Original", showTranslated: "Translated", translateArticle: "Translate article" },
  es: { trending: "Tendencia", selectCountry: "Seleccionar país", search: "Buscar…", readMore: "Leer", readFull: "Leer artículo completo en", noResults: "No se encontraron artículos", tryAgain: "Intenta seleccionar otro país", poweredBy: "Noticias globales gratuitas", liveLabel: "EN VIVO", language: "Idioma", loading: "Obteniendo noticias…", refresh: "Actualizar", sources: "Fuentes", loadMore: "Más noticias", showing: "Mostrando", close: "Cerrar", nightEdition: "Edición nocturna", dayEdition: "Edición diurna", backToFeed: "Volver al feed", moreFrom: "Más de", articleNotFound: "Artículo no disponible", articleExpired: "Este artículo puede haber expirado del feed.", returnHome: "Volver a The Atlas Report", loadingArticle: "Cargando artículo completo de", contentFallback: "No se pudo cargar el artículo completo. Mostrando resumen.", publishedOn: "Publicado originalmente en" },
  fr: { trending: "Tendance", selectCountry: "Sélectionner un pays", search: "Rechercher…", readMore: "Lire", readFull: "Lire l'article complet sur", noResults: "Aucun article trouvé", tryAgain: "Essayez un autre pays", poweredBy: "Actualités mondiales gratuites", liveLabel: "EN DIRECT", language: "Langue", loading: "Chargement…", refresh: "Actualiser", sources: "Sources", loadMore: "Plus d'articles", showing: "Affichage", close: "Fermer", nightEdition: "Édition de nuit", dayEdition: "Édition de jour", backToFeed: "Retour au fil", moreFrom: "Plus de", articleNotFound: "Article non disponible", articleExpired: "Cet article a peut-être expiré du fil.", returnHome: "Retour à The Atlas Report", loadingArticle: "Chargement de l'article depuis", contentFallback: "L'article complet n'a pas pu être chargé. Affichage du résumé.", publishedOn: "Publié à l'origine sur" },
  de: { trending: "Trend", selectCountry: "Land auswählen", search: "Suchen…", readMore: "Lesen", readFull: "Vollständigen Artikel lesen bei", noResults: "Keine Artikel gefunden", tryAgain: "Versuchen Sie ein anderes Land", poweredBy: "Kostenlose globale Nachrichten", liveLabel: "LIVE", language: "Sprache", loading: "Laden…", refresh: "Aktualisieren", sources: "Quellen", loadMore: "Mehr laden", showing: "Anzeige", close: "Schließen", nightEdition: "Nachtausgabe", dayEdition: "Tagesausgabe", backToFeed: "Zurück zum Feed", moreFrom: "Mehr von", articleNotFound: "Artikel nicht verfügbar", articleExpired: "Dieser Artikel ist möglicherweise aus dem Feed abgelaufen.", returnHome: "Zurück zu The Atlas Report", loadingArticle: "Vollständigen Artikel laden von", contentFallback: "Der vollständige Artikel konnte nicht geladen werden. Zusammenfassung wird angezeigt.", publishedOn: "Ursprünglich veröffentlicht auf" },
  pt: { trending: "Tendência", selectCountry: "Selecionar país", search: "Pesquisar…", readMore: "Ler", readFull: "Ler artigo completo em", noResults: "Nenhum artigo encontrado", tryAgain: "Tente outro país", poweredBy: "Notícias globais gratuitas", liveLabel: "AO VIVO", language: "Idioma", loading: "Carregando…", refresh: "Atualizar", sources: "Fontes", loadMore: "Mais notícias", showing: "Mostrando", close: "Fechar", nightEdition: "Edição noturna", dayEdition: "Edição diurna", backToFeed: "Voltar ao feed", moreFrom: "Mais de", articleNotFound: "Artigo não disponível", articleExpired: "Este artigo pode ter expirado do feed.", returnHome: "Voltar ao The Atlas Report", loadingArticle: "Carregando artigo completo de", contentFallback: "Não foi possível carregar o artigo completo. Mostrando resumo.", publishedOn: "Publicado originalmente em" },
  ar: { trending: "رائج", selectCountry: "اختر دولة", search: "بحث…", readMore: "اقرأ", readFull: "اقرأ المقال كاملاً في", noResults: "لم يتم العثور على مقالات", tryAgain: "حاول اختيار دولة أخرى", poweredBy: "أخبار عالمية مجانية", liveLabel: "مباشر", language: "اللغة", loading: "جاري التحميل…", refresh: "تحديث", sources: "المصادر", loadMore: "المزيد", showing: "عرض", close: "إغلاق", nightEdition: "النسخة الليلية", dayEdition: "النسخة النهارية", backToFeed: "العودة", moreFrom: "المزيد من", articleNotFound: "المقال غير متوفر", articleExpired: "ربما انتهت صلاحية هذا المقال.", returnHome: "العودة إلى The Atlas Report", loadingArticle: "جاري تحميل المقال الكامل من", contentFallback: "تعذر تحميل المقال الكامل. يتم عرض الملخص بدلاً من ذلك.", publishedOn: "نُشر في الأصل على" },
  zh: { trending: "热门", selectCountry: "选择国家", search: "搜索…", readMore: "阅读", readFull: "阅读完整文章", noResults: "未找到文章", tryAgain: "请选择其他国家", poweredBy: "免费全球新闻", liveLabel: "直播", language: "语言", loading: "加载中…", refresh: "刷新", sources: "来源", loadMore: "加载更多", showing: "显示", close: "关闭", nightEdition: "夜间版", dayEdition: "日间版", backToFeed: "返回", moreFrom: "更多来自", articleNotFound: "文章不可用", articleExpired: "此文章可能已从信息流中过期。", returnHome: "返回 The Atlas Report", loadingArticle: "正在从以下来源加载完整文章", contentFallback: "无法加载完整文章。显示摘要。", publishedOn: "最初发表于" },
  ja: { trending: "トレンド", selectCountry: "国を選択", search: "検索…", readMore: "読む", readFull: "全文を読む", noResults: "記事なし", tryAgain: "別の国を選択", poweredBy: "無料グローバルニュース", liveLabel: "ライブ", language: "言語", loading: "読み込み中…", refresh: "更新", sources: "ソース", loadMore: "もっと見る", showing: "表示", close: "閉じる", nightEdition: "夜版", dayEdition: "日版", backToFeed: "フィードに戻る", moreFrom: "他の記事", articleNotFound: "記事が見つかりません", articleExpired: "この記事はフィードから期限切れの可能性があります。", returnHome: "The Atlas Reportに戻る", loadingArticle: "記事全文を読み込み中", contentFallback: "全文を読み込めませんでした。要約を表示しています。", publishedOn: "元の掲載先" },
  ko: { trending: "트렌드", selectCountry: "국가 선택", search: "검색…", readMore: "읽기", readFull: "전체 기사 읽기", noResults: "기사 없음", tryAgain: "다른 국가를 선택해 보세요", poweredBy: "무료 글로벌 뉴스", liveLabel: "라이브", language: "언어", loading: "로딩 중…", refresh: "새로고침", sources: "출처", loadMore: "더 보기", showing: "표시", close: "닫기", nightEdition: "야간판", dayEdition: "주간판", backToFeed: "피드로 돌아가기", moreFrom: "더 보기", articleNotFound: "기사를 찾을 수 없습니다", articleExpired: "이 기사는 피드에서 만료되었을 수 있습니다.", returnHome: "The Atlas Report로 돌아가기", loadingArticle: "전체 기사 로딩 중", contentFallback: "전체 기사를 로드할 수 없습니다. 요약을 표시합니다.", publishedOn: "원래 게시처" },
  hi: { trending: "ट्रेंडिंग", selectCountry: "देश चुनें", search: "खोजें…", readMore: "पढ़ें", readFull: "पूरा लेख पढ़ें", noResults: "कोई लेख नहीं", tryAgain: "किसी अन्य देश का चयन करें", poweredBy: "मुफ्त वैश्विक समाचार", liveLabel: "लाइव", language: "भाषा", loading: "लोड हो रहा है…", refresh: "रीफ्रेश", sources: "स्रोत", loadMore: "और लोड करें", showing: "दिखा रहा है", close: "बंद करें", nightEdition: "रात्रि संस्करण", dayEdition: "दिन संस्करण", backToFeed: "फ़ीड पर वापस", moreFrom: "और अधिक", articleNotFound: "लेख उपलब्ध नहीं", articleExpired: "यह लेख फ़ीड से समाप्त हो सकता है।", returnHome: "The Atlas Report पर वापस जाएं", loadingArticle: "पूरा लेख लोड हो रहा है", contentFallback: "पूरा लेख लोड नहीं हो सका। सारांश दिखाया जा रहा है।", publishedOn: "मूल रूप से प्रकाशित" },
  id: { trending: "Trending", selectCountry: "Pilih negara", search: "Cari…", readMore: "Baca", readFull: "Baca artikel lengkap di", noResults: "Tidak ditemukan", tryAgain: "Coba pilih negara lain", poweredBy: "Berita global gratis", liveLabel: "LANGSUNG", language: "Bahasa", loading: "Memuat…", refresh: "Segarkan", sources: "Sumber", loadMore: "Muat lagi", showing: "Menampilkan", close: "Tutup", nightEdition: "Edisi malam", dayEdition: "Edisi siang", backToFeed: "Kembali ke feed", moreFrom: "Lebih banyak dari", articleNotFound: "Artikel tidak tersedia", articleExpired: "Artikel ini mungkin telah kedaluwarsa dari feed.", returnHome: "Kembali ke The Atlas Report", loadingArticle: "Memuat artikel lengkap dari", contentFallback: "Artikel lengkap tidak dapat dimuat. Menampilkan ringkasan.", publishedOn: "Awalnya diterbitkan di" },
  tr: { trending: "Gündem", selectCountry: "Ülke seçin", search: "Ara…", readMore: "Oku", readFull: "Tam makaleyi oku", noResults: "Makale bulunamadı", tryAgain: "Farklı bir ülke seçin", poweredBy: "Ücretsiz küresel haberler", liveLabel: "CANLI", language: "Dil", loading: "Yükleniyor…", refresh: "Yenile", sources: "Kaynaklar", loadMore: "Daha fazla", showing: "Gösteriliyor", close: "Kapat", nightEdition: "Gece baskısı", dayEdition: "Gündüz baskısı", backToFeed: "Akışa dön", moreFrom: "Daha fazla", articleNotFound: "Makale bulunamadı", articleExpired: "Bu makale akıştan süresi dolmuş olabilir.", returnHome: "The Atlas Report'e dön", loadingArticle: "Tam makale yükleniyor", contentFallback: "Tam makale yüklenemedi. Özet gösteriliyor.", publishedOn: "İlk yayınlandığı yer" },
  it: { trending: "Tendenza", selectCountry: "Seleziona paese", search: "Cerca…", readMore: "Leggi", readFull: "Leggi l'articolo completo su", noResults: "Nessun articolo", tryAgain: "Prova un altro paese", poweredBy: "Notizie globali gratuite", liveLabel: "IN DIRETTA", language: "Lingua", loading: "Caricamento…", refresh: "Aggiorna", sources: "Fonti", loadMore: "Carica altro", showing: "Mostrando", close: "Chiudi", nightEdition: "Edizione notturna", dayEdition: "Edizione diurna", backToFeed: "Torna al feed", moreFrom: "Altro da", articleNotFound: "Articolo non disponibile", articleExpired: "Questo articolo potrebbe essere scaduto dal feed.", returnHome: "Torna a The Atlas Report", loadingArticle: "Caricamento articolo completo da", contentFallback: "Impossibile caricare l'articolo completo. Mostrando il riepilogo.", publishedOn: "Pubblicato originariamente su" },
  pl: { trending: "Popularne", selectCountry: "Wybierz kraj", search: "Szukaj…", readMore: "Czytaj", readFull: "Czytaj pełny artykuł na", noResults: "Brak artykułów", tryAgain: "Spróbuj wybrać inny kraj", poweredBy: "Darmowe wiadomości globalne", liveLabel: "NA ŻYWO", language: "Język", loading: "Ładowanie…", refresh: "Odśwież", sources: "Źródła", loadMore: "Więcej", showing: "Wyświetlanie", close: "Zamknij", nightEdition: "Wydanie nocne", dayEdition: "Wydanie dzienne", backToFeed: "Powrót do kanału", moreFrom: "Więcej od", articleNotFound: "Artykuł niedostępny", articleExpired: "Ten artykuł mógł wygasnąć z kanału.", returnHome: "Powrót do The Atlas Report", loadingArticle: "Ładowanie pełnego artykułu z", contentFallback: "Nie udało się załadować pełnego artykułu. Wyświetlanie podsumowania.", publishedOn: "Pierwotnie opublikowany na" },
  uk: { trending: "Тренди", selectCountry: "Оберіть країну", search: "Шукати…", readMore: "Читати", readFull: "Читати повну статтю на", noResults: "Статей не знайдено", tryAgain: "Спробуйте іншу країну", poweredBy: "Безкоштовні глобальні новини", liveLabel: "НАЖИВО", language: "Мова", loading: "Завантаження…", refresh: "Оновити", sources: "Джерела", loadMore: "Більше", showing: "Показано", close: "Закрити", nightEdition: "Нічне видання", dayEdition: "Денне видання", backToFeed: "Назад до стрічки", moreFrom: "Більше від", articleNotFound: "Стаття недоступна", articleExpired: "Ця стаття могла закінчитися в стрічці.", returnHome: "Повернутися до The Atlas Report", loadingArticle: "Завантаження повної статті з", contentFallback: "Не вдалося завантажити повну статтю. Показано резюме.", publishedOn: "Спочатку опубліковано на" },
  sw: { trending: "Mwenendo", selectCountry: "Chagua nchi", search: "Tafuta…", readMore: "Soma", readFull: "Soma makala kamili kwenye", noResults: "Hakuna makala", tryAgain: "Jaribu nchi nyingine", poweredBy: "Habari za kimataifa bila malipo", liveLabel: "MOJA KWA MOJA", language: "Lugha", loading: "Inapakia…", refresh: "Onyesha upya", sources: "Vyanzo", loadMore: "Zaidi", showing: "Inaonyesha", close: "Funga", nightEdition: "Toleo la usiku", dayEdition: "Toleo la mchana", backToFeed: "Rudi kwenye feed", moreFrom: "Zaidi kutoka", articleNotFound: "Makala haipatikani", articleExpired: "Makala hii inaweza kuwa imeisha muda wake.", returnHome: "Rudi kwa The Atlas Report", loadingArticle: "Inapakia makala kamili kutoka", contentFallback: "Makala kamili haikuweza kupakiwa. Inaonyesha muhtasari.", publishedOn: "Ilichapishwa awali kwenye" },
  tl: { trending: "Trending", selectCountry: "Pumili ng bansa", search: "Maghanap…", readMore: "Basahin", readFull: "Basahin ang buong artikulo sa", noResults: "Walang artikulo", tryAgain: "Subukan pumili ng ibang bansa", poweredBy: "Libreng pandaigdigang balita", liveLabel: "LIVE", language: "Wika", loading: "Naglo-load…", refresh: "I-refresh", sources: "Pinagmulan", loadMore: "Higit pa", showing: "Ipinapakita", close: "Isara", nightEdition: "Gabing edisyon", dayEdition: "Araw na edisyon", backToFeed: "Bumalik sa feed", moreFrom: "Higit pa mula sa", articleNotFound: "Hindi available ang artikulo", articleExpired: "Maaaring nag-expire na ang artikulong ito mula sa feed.", returnHome: "Bumalik sa The Atlas Report", loadingArticle: "Nilo-load ang buong artikulo mula sa", contentFallback: "Hindi ma-load ang buong artikulo. Ipinapakita ang buod.", publishedOn: "Unang na-publish sa" },
};

// ─── Countries & Feeds ───
export const countries = [
  { code: "ALL", name: "All Countries", flag: "🌍", feeds: [
    { name: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "DW News", url: "https://rss.dw.com/rdf/rss-en-all" },
  ]},
  { code: "AF", name: "Afghanistan", flag: "🇦🇫", feeds: [
    { name: "BBC South Asia", url: "https://feeds.bbci.co.uk/news/world/asia/rss.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "Khaama Press", url: "https://www.khaama.com/feed/" },
  ]},
  { code: "DZ", name: "Algeria", flag: "🇩🇿", feeds: [
    { name: "BBC Africa", url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "DW News", url: "https://rss.dw.com/rdf/rss-en-all" },
  ]},
  { code: "AR", name: "Argentina", flag: "🇦🇷", feeds: [
    { name: "BBC Latin America", url: "https://feeds.bbci.co.uk/news/world/latin_america/rss.xml" },
    { name: "Buenos Aires Times", url: "https://www.batimes.com.ar/feed" },
  ]},
  { code: "AU", name: "Australia", flag: "🇦🇺", feeds: [
    { name: "BBC Asia", url: "https://feeds.bbci.co.uk/news/world/asia/rss.xml" },
    { name: "ABC News AU", url: "https://www.abc.net.au/news/feed/2942460/rss.xml" },
  ]},
  { code: "AT", name: "Austria", flag: "🇦🇹", feeds: [
    { name: "BBC Europe", url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml" },
    { name: "The Local AT", url: "https://feeds.thelocal.com/rss/at" },
  ]},
  { code: "AZ", name: "Azerbaijan", flag: "🇦🇿", feeds: [
    { name: "BBC Europe", url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "Trend News", url: "https://en.trend.az/rss" },
  ]},
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", feeds: [
    { name: "BBC South Asia", url: "https://feeds.bbci.co.uk/news/world/asia/rss.xml" },
    { name: "Daily Star BD", url: "https://www.thedailystar.net/frontpage/rss.xml" },
  ]},
  { code: "BE", name: "Belgium", flag: "🇧🇪", feeds: [
    { name: "BBC Europe", url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml" },
    { name: "Brussels Times", url: "https://www.brusselstimes.com/feed" },
  ]},
  { code: "BR", name: "Brazil", flag: "🇧🇷", feeds: [
    { name: "BBC Latin America", url: "https://feeds.bbci.co.uk/news/world/latin_america/rss.xml" },
    { name: "Folha de S.Paulo", url: "https://www1.folha.uol.com.br/internacional/en/rss091.xml" },
  ]},
  { code: "KH", name: "Cambodia", flag: "🇰🇭", feeds: [
    { name: "BBC Asia", url: "https://feeds.bbci.co.uk/news/world/asia/rss.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "Khmer Times", url: "https://www.khmertimeskh.com/feed/" },
  ]},
  { code: "CM", name: "Cameroon", flag: "🇨🇲", feeds: [
    { name: "BBC Africa", url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "Journal du Cameroun", url: "https://www.journalducameroun.com/en/feed/" },
  ]},
  { code: "CA", name: "Canada", flag: "🇨🇦", feeds: [
    { name: "BBC US & Canada", url: "https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml" },
    { name: "NPR News", url: "https://feeds.npr.org/1001/rss.xml" },
  ]},
  { code: "CL", name: "Chile", flag: "🇨🇱", feeds: [
    { name: "BBC Latin America", url: "https://feeds.bbci.co.uk/news/world/latin_america/rss.xml" },
    { name: "Santiago Times", url: "https://santiagotimes.com/feed/" },
  ]},
  { code: "CN", name: "China", flag: "🇨🇳", feeds: [
    { name: "BBC Asia", url: "https://feeds.bbci.co.uk/news/world/asia/rss.xml" },
    { name: "SCMP", url: "https://www.scmp.com/rss/91/feed" },
  ]},
  { code: "CO", name: "Colombia", flag: "🇨🇴", feeds: [
    { name: "BBC Latin America", url: "https://feeds.bbci.co.uk/news/world/latin_america/rss.xml" },
    { name: "Colombia Reports", url: "https://colombiareports.com/feed/" },
  ]},
  { code: "HR", name: "Croatia", flag: "🇭🇷", feeds: [
    { name: "BBC Europe", url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml" },
    { name: "DW News", url: "https://rss.dw.com/rdf/rss-en-all" },
    { name: "Total Croatia News", url: "https://www.total-croatia-news.com/feed" },
  ]},
  { code: "CU", name: "Cuba", flag: "🇨🇺", feeds: [
    { name: "BBC Latin America", url: "https://feeds.bbci.co.uk/news/world/latin_america/rss.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "Havana Times", url: "https://havanatimes.org/feed/" },
  ]},
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿", feeds: [
    { name: "BBC Europe", url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml" },
    { name: "Prague Monitor", url: "https://praguemonitor.com/feed/" },
  ]},
  { code: "DK", name: "Denmark", flag: "🇩🇰", feeds: [
    { name: "BBC Europe", url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml" },
    { name: "The Local DK", url: "https://feeds.thelocal.com/rss/dk" },
  ]},
  { code: "CD", name: "DR Congo", flag: "🇨🇩", feeds: [
    { name: "BBC Africa", url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "Radio Okapi", url: "https://www.radiookapi.net/feed" },
  ]},
  { code: "EC", name: "Ecuador", flag: "🇪🇨", feeds: [
    { name: "BBC Latin America", url: "https://feeds.bbci.co.uk/news/world/latin_america/rss.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "Ecuador Times", url: "https://www.ecuadortimes.net/feed/" },
  ]},
  { code: "EG", name: "Egypt", flag: "🇪🇬", feeds: [
    { name: "BBC Africa", url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml" },
    { name: "BBC Middle East", url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
  ]},
  { code: "ET", name: "Ethiopia", flag: "🇪🇹", feeds: [
    { name: "BBC Africa", url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "Fana BC", url: "https://www.fanabc.com/english/feed/" },
  ]},
  { code: "FI", name: "Finland", flag: "🇫🇮", feeds: [
    { name: "BBC Europe", url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml" },
    { name: "DW News", url: "https://rss.dw.com/rdf/rss-en-all" },
    { name: "Yle News", url: "https://feeds.yle.fi/uutiset/v1/recent.rss?publisherIds=YLE_NEWS" },
  ]},
  { code: "FR", name: "France", flag: "🇫🇷", feeds: [
    { name: "BBC Europe", url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml" },
    { name: "France 24", url: "https://www.france24.com/en/rss" },
    { name: "The Local FR", url: "https://feeds.thelocal.com/rss/fr" },
  ]},
  { code: "GE", name: "Georgia", flag: "🇬🇪", feeds: [
    { name: "BBC Europe", url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "Civil Georgia", url: "https://civil.ge/feed" },
  ]},
  { code: "DE", name: "Germany", flag: "🇩🇪", feeds: [
    { name: "BBC Europe", url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml" },
    { name: "DW News", url: "https://rss.dw.com/rdf/rss-en-all" },
    { name: "The Local DE", url: "https://feeds.thelocal.com/rss/de" },
  ]},
  { code: "GH", name: "Ghana", flag: "🇬🇭", feeds: [
    { name: "BBC Africa", url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml" },
    { name: "Ghana News Agency", url: "https://newsghana.com.gh/feed/" },
  ]},
  { code: "GR", name: "Greece", flag: "🇬🇷", feeds: [
    { name: "BBC Europe", url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml" },
    { name: "Greek Reporter", url: "https://greekreporter.com/feed/" },
  ]},
  { code: "HU", name: "Hungary", flag: "🇭🇺", feeds: [
    { name: "BBC Europe", url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml" },
    { name: "DW News", url: "https://rss.dw.com/rdf/rss-en-all" },
    { name: "Budapest Times", url: "https://www.budapesttimes.hu/feed/" },
  ]},
  { code: "IN", name: "India", flag: "🇮🇳", feeds: [
    { name: "BBC India", url: "https://feeds.bbci.co.uk/news/world/asia/rss.xml" },
    { name: "NDTV", url: "https://feeds.feedburner.com/ndtvnews-top-stories" },
  ]},
  { code: "ID", name: "Indonesia", flag: "🇮🇩", feeds: [
    { name: "BBC Asia", url: "https://feeds.bbci.co.uk/news/world/asia/rss.xml" },
    { name: "Antara News", url: "https://www.antaranews.com/rss/terkini" },
    { name: "Tempo.co", url: "https://rss.tempo.co/nasional" },
  ]},
  { code: "IQ", name: "Iraq", flag: "🇮🇶", feeds: [
    { name: "BBC Middle East", url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "Iraqi News", url: "https://www.iraqinews.com/feed/" },
  ]},
  { code: "IE", name: "Ireland", flag: "🇮🇪", feeds: [
    { name: "BBC Europe", url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml" },
    { name: "Irish Times", url: "https://www.irishtimes.com/cmlink/news-1.1319192" },
  ]},
  { code: "IL", name: "Israel", flag: "🇮🇱", feeds: [
    { name: "BBC Middle East", url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml" },
    { name: "Jerusalem Post", url: "https://www.jpost.com/rss/rssfeedsfrontpage.aspx" },
  ]},
  { code: "IT", name: "Italy", flag: "🇮🇹", feeds: [
    { name: "BBC Europe", url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml" },
    { name: "The Local IT", url: "https://feeds.thelocal.com/rss/it" },
  ]},
  { code: "JP", name: "Japan", flag: "🇯🇵", feeds: [
    { name: "BBC Asia", url: "https://feeds.bbci.co.uk/news/world/asia/rss.xml" },
    { name: "Japan Times", url: "https://www.japantimes.co.jp/feed/" },
  ]},
  { code: "JO", name: "Jordan", flag: "🇯🇴", feeds: [
    { name: "BBC Middle East", url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
  ]},
  { code: "KZ", name: "Kazakhstan", flag: "🇰🇿", feeds: [
    { name: "BBC Asia", url: "https://feeds.bbci.co.uk/news/world/asia/rss.xml" },
    { name: "DW News", url: "https://rss.dw.com/rdf/rss-en-all" },
    { name: "Astana Times", url: "https://astanatimes.com/feed/" },
  ]},
  { code: "KE", name: "Kenya", flag: "🇰🇪", feeds: [
    { name: "BBC Africa", url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml" },
    { name: "Standard Kenya", url: "https://www.standardmedia.co.ke/rss/headlines.php" },
  ]},
  { code: "KW", name: "Kuwait", flag: "🇰🇼", feeds: [
    { name: "BBC Middle East", url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "Arab Times", url: "https://www.arabtimesonline.com/feed/" },
  ]},
  { code: "LB", name: "Lebanon", flag: "🇱🇧", feeds: [
    { name: "BBC Middle East", url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "Naharnet", url: "https://www.naharnet.com/stories/rss" },
  ]},
  { code: "LY", name: "Libya", flag: "🇱🇾", feeds: [
    { name: "BBC Africa", url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "Libya Herald", url: "https://www.libyaherald.com/feed/" },
  ]},
  { code: "MY", name: "Malaysia", flag: "🇲🇾", feeds: [
    { name: "BBC Asia", url: "https://feeds.bbci.co.uk/news/world/asia/rss.xml" },
    { name: "Malay Mail", url: "https://www.malaymail.com/feed/rss/malaysia" },
  ]},
  { code: "MX", name: "Mexico", flag: "🇲🇽", feeds: [
    { name: "BBC Latin America", url: "https://feeds.bbci.co.uk/news/world/latin_america/rss.xml" },
    { name: "Mexico News Daily", url: "https://mexiconewsdaily.com/feed/" },
  ]},
  { code: "MA", name: "Morocco", flag: "🇲🇦", feeds: [
    { name: "BBC Africa", url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
  ]},
  { code: "MM", name: "Myanmar", flag: "🇲🇲", feeds: [
    { name: "BBC Asia", url: "https://feeds.bbci.co.uk/news/world/asia/rss.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "Myanmar Now", url: "https://myanmar-now.org/en/feed" },
  ]},
  { code: "NP", name: "Nepal", flag: "🇳🇵", feeds: [
    { name: "BBC South Asia", url: "https://feeds.bbci.co.uk/news/world/asia/rss.xml" },
    { name: "Kathmandu Post", url: "https://kathmandupost.com/feed" },
  ]},
  { code: "NL", name: "Netherlands", flag: "🇳🇱", feeds: [
    { name: "BBC Europe", url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml" },
    { name: "DutchNews.nl", url: "https://www.dutchnews.nl/feed/" },
  ]},
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", feeds: [
    { name: "BBC Asia", url: "https://feeds.bbci.co.uk/news/world/asia/rss.xml" },
    { name: "RNZ", url: "https://www.rnz.co.nz/rss/national.xml" },
  ]},
  { code: "NG", name: "Nigeria", flag: "🇳🇬", feeds: [
    { name: "BBC Africa", url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
  ]},
  { code: "NO", name: "Norway", flag: "🇳🇴", feeds: [
    { name: "BBC Europe", url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml" },
    { name: "The Local NO", url: "https://feeds.thelocal.com/rss/no" },
  ]},
  { code: "OM", name: "Oman", flag: "🇴🇲", feeds: [
    { name: "BBC Middle East", url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "Times of Oman", url: "https://timesofoman.com/feed" },
  ]},
  { code: "PK", name: "Pakistan", flag: "🇵🇰", feeds: [
    { name: "BBC South Asia", url: "https://feeds.bbci.co.uk/news/world/asia/rss.xml" },
    { name: "Dawn", url: "https://www.dawn.com/feed" },
  ]},
  { code: "PE", name: "Peru", flag: "🇵🇪", feeds: [
    { name: "BBC Latin America", url: "https://feeds.bbci.co.uk/news/world/latin_america/rss.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "Peru Reports", url: "https://perureports.com/feed/" },
  ]},
  { code: "PH", name: "Philippines", flag: "🇵🇭", feeds: [
    { name: "BBC Asia", url: "https://feeds.bbci.co.uk/news/world/asia/rss.xml" },
    { name: "Rappler", url: "https://www.rappler.com/feed/" },
    { name: "Inquirer", url: "https://newsinfo.inquirer.net/feed" },
  ]},
  { code: "PL", name: "Poland", flag: "🇵🇱", feeds: [
    { name: "BBC Europe", url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml" },
    { name: "Notes from Poland", url: "https://notesfrompoland.com/feed/" },
  ]},
  { code: "PT", name: "Portugal", flag: "🇵🇹", feeds: [
    { name: "BBC Europe", url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml" },
    { name: "Portugal Resident", url: "https://www.portugalresident.com/feed/" },
  ]},
  { code: "QA", name: "Qatar", flag: "🇶🇦", feeds: [
    { name: "BBC Middle East", url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "Gulf Times", url: "https://www.gulf-times.com/rss" },
  ]},
  { code: "RO", name: "Romania", flag: "🇷🇴", feeds: [
    { name: "BBC Europe", url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml" },
    { name: "Romania Insider", url: "https://www.romania-insider.com/feed" },
  ]},
  { code: "RU", name: "Russia", flag: "🇷🇺", feeds: [
    { name: "BBC Europe", url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml" },
    { name: "DW News", url: "https://rss.dw.com/rdf/rss-en-all" },
    { name: "Moscow Times", url: "https://www.themoscowtimes.com/rss/news" },
  ]},
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", feeds: [
    { name: "BBC Middle East", url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
  ]},
  { code: "RS", name: "Serbia", flag: "🇷🇸", feeds: [
    { name: "BBC Europe", url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml" },
    { name: "DW News", url: "https://rss.dw.com/rdf/rss-en-all" },
    { name: "Balkan Insight", url: "https://balkaninsight.com/feed/" },
  ]},
  { code: "SG", name: "Singapore", flag: "🇸🇬", feeds: [
    { name: "BBC Asia", url: "https://feeds.bbci.co.uk/news/world/asia/rss.xml" },
    { name: "CNA", url: "https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml" },
  ]},
  { code: "ZA", name: "South Africa", flag: "🇿🇦", feeds: [
    { name: "BBC Africa", url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml" },
    { name: "News24", url: "https://feeds.news24.com/articles/news24/TopStories/rss" },
  ]},
  { code: "KR", name: "South Korea", flag: "🇰🇷", feeds: [
    { name: "BBC Asia", url: "https://feeds.bbci.co.uk/news/world/asia/rss.xml" },
    { name: "Korea Times", url: "https://www.koreatimes.co.kr/www/rss/nation.xml" },
  ]},
  { code: "ES", name: "Spain", flag: "🇪🇸", feeds: [
    { name: "BBC Europe", url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml" },
    { name: "EL PAIS", url: "https://feeds.elpais.com/mrss-s/pages/ep/site/english.elpais.com/portada" },
    { name: "The Local ES", url: "https://feeds.thelocal.com/rss/es" },
  ]},
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰", feeds: [
    { name: "BBC South Asia", url: "https://feeds.bbci.co.uk/news/world/asia/rss.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "Colombo Page", url: "http://www.colombopage.com/archive_26A/rss.xml" },
  ]},
  { code: "SD", name: "Sudan", flag: "🇸🇩", feeds: [
    { name: "BBC Africa", url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "DW News", url: "https://rss.dw.com/rdf/rss-en-all" },
  ]},
  { code: "SE", name: "Sweden", flag: "🇸🇪", feeds: [
    { name: "BBC Europe", url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml" },
    { name: "The Local SE", url: "https://feeds.thelocal.com/rss/se" },
  ]},
  { code: "CH", name: "Switzerland", flag: "🇨🇭", feeds: [
    { name: "BBC Europe", url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml" },
    { name: "The Local CH", url: "https://feeds.thelocal.com/rss/ch" },
  ]},
  { code: "SY", name: "Syria", flag: "🇸🇾", feeds: [
    { name: "BBC Middle East", url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "Syria Direct", url: "https://syriadirect.org/feed/" },
  ]},
  { code: "TW", name: "Taiwan", flag: "🇹🇼", feeds: [
    { name: "BBC Asia", url: "https://feeds.bbci.co.uk/news/world/asia/rss.xml" },
    { name: "Focus Taiwan", url: "https://focustaiwan.tw/rss/latest" },
  ]},
  { code: "TZ", name: "Tanzania", flag: "🇹🇿", feeds: [
    { name: "BBC Africa", url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "Daily News TZ", url: "https://dailynews.co.tz/feed/" },
  ]},
  { code: "TH", name: "Thailand", flag: "🇹🇭", feeds: [
    { name: "BBC Asia", url: "https://feeds.bbci.co.uk/news/world/asia/rss.xml" },
    { name: "Bangkok Post", url: "https://www.bangkokpost.com/rss/data/topstories.xml" },
    { name: "The Nation Thailand", url: "https://www.nationthailand.com/rss" },
    { name: "Thaiger", url: "https://thethaiger.com/feed" },
  ]},
  { code: "TN", name: "Tunisia", flag: "🇹🇳", feeds: [
    { name: "BBC Africa", url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "Tunisia Live", url: "https://www.tunisia-live.net/feed/" },
  ]},
  { code: "TR", name: "Turkey", flag: "🇹🇷", feeds: [
    { name: "BBC Middle East", url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml" },
    { name: "Hurriyet Daily", url: "https://www.hurriyetdailynews.com/rss" },
    { name: "Daily Sabah", url: "https://www.dailysabah.com/rssFeed/Rss" },
  ]},
  { code: "AE", name: "UAE", flag: "🇦🇪", feeds: [
    { name: "BBC Middle East", url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
  ]},
  { code: "UG", name: "Uganda", flag: "🇺🇬", feeds: [
    { name: "BBC Africa", url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml" },
    { name: "New Vision", url: "https://www.newvision.co.ug/feed" },
  ]},
  { code: "UA", name: "Ukraine", flag: "🇺🇦", feeds: [
    { name: "BBC Europe", url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml" },
    { name: "Ukrinform", url: "https://www.ukrinform.net/rss/block-lastnews" },
  ]},
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", feeds: [
    { name: "BBC UK", url: "https://feeds.bbci.co.uk/news/uk/rss.xml" },
    { name: "The Guardian", url: "https://www.theguardian.com/uk-news/rss" },
  ]},
  { code: "US", name: "United States", flag: "🇺🇸", feeds: [
    { name: "BBC US & Canada", url: "https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml" },
    { name: "NPR News", url: "https://feeds.npr.org/1001/rss.xml" },
  ]},
  { code: "UZ", name: "Uzbekistan", flag: "🇺🇿", feeds: [
    { name: "BBC Asia", url: "https://feeds.bbci.co.uk/news/world/asia/rss.xml" },
    { name: "DW News", url: "https://rss.dw.com/rdf/rss-en-all" },
    { name: "Gazette.uz", url: "https://www.gazeta.uz/en/rss/" },
  ]},
  { code: "VE", name: "Venezuela", flag: "🇻🇪", feeds: [
    { name: "BBC Latin America", url: "https://feeds.bbci.co.uk/news/world/latin_america/rss.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "Caracas Chronicles", url: "https://www.caracaschronicles.com/feed/" },
  ]},
  { code: "VN", name: "Vietnam", flag: "🇻🇳", feeds: [
    { name: "BBC Asia", url: "https://feeds.bbci.co.uk/news/world/asia/rss.xml" },
    { name: "VnExpress", url: "https://e.vnexpress.net/rss/latest.rss" },
  ]},
  { code: "YE", name: "Yemen", flag: "🇾🇪", feeds: [
    { name: "BBC Middle East", url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
  ]},
  { code: "ZW", name: "Zimbabwe", flag: "🇿🇼", feeds: [
    { name: "BBC Africa", url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "ZimLive", url: "https://www.zimlive.com/feed/" },
  ]},
];

// ─── Country code → country code mapping for geolocation ───
export const geoCountryMap = {
  US: "US", GB: "GB", DE: "DE", FR: "FR", IT: "IT", ES: "ES",
  UA: "UA", PL: "PL", BR: "BR", MX: "MX", CA: "CA", AR: "AR",
  JP: "JP", CN: "CN", IN: "IN", KR: "KR", AU: "AU", ID: "ID",
  PH: "PH", SG: "SG", SA: "SA", AE: "AE", IL: "IL", TR: "TR",
  NG: "NG", ZA: "ZA", EG: "EG", KE: "KE",
  AF: "AF", DZ: "DZ", AT: "AT", AZ: "AZ", BD: "BD", BE: "BE",
  CL: "CL", CO: "CO", HR: "HR", CZ: "CZ", DK: "DK", EC: "EC",
  ET: "ET", FI: "FI", GE: "GE", GH: "GH", GR: "GR", HU: "HU",
  IQ: "IQ", IE: "IE", JO: "JO", KZ: "KZ", KW: "KW", LB: "LB",
  LY: "LY", MY: "MY", MA: "MA", MM: "MM", NP: "NP", NL: "NL",
  NZ: "NZ", NO: "NO", OM: "OM", PK: "PK", PE: "PE", PT: "PT",
  QA: "QA", RO: "RO", RU: "RU", RS: "RS", LK: "LK", SD: "SD",
  SE: "SE", CH: "CH", SY: "SY", TW: "TW", TZ: "TZ", TH: "TH",
  TN: "TN", UG: "UG", UZ: "UZ", VE: "VE", VN: "VN", YE: "YE",
  ZW: "ZW", KH: "KH", CM: "CM", CD: "CD", CU: "CU",
};
