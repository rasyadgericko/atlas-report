import { useState, useCallback } from "react";

const STORAGE_KEY = "atlas-bookmarks";

function loadBookmarks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(loadBookmarks);

  const toggle = useCallback((article) => {
    setBookmarks(prev => {
      const exists = prev.some(b => b.id === article.id);
      const next   = exists
        ? prev.filter(b => b.id !== article.id)
        : [article, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isBookmarked = useCallback(
    (id) => bookmarks.some(b => b.id === id),
    [bookmarks]
  );

  return { bookmarks, toggle, isBookmarked };
}
