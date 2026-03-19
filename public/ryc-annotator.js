/**
 * RYC Tickets — Vite Dev Server Version
 *
 * Tickets are saved as .md files on disk via the Vite middleware.
 * Claude can read and update them directly from the tickets/ folder.
 */
(function () {
  'use strict';

  if (document.getElementById('ryc-ann-tab')) return; // already injected

  // ─── API (fetch-based, talks to Vite middleware) ──────────────────────────────
  async function apiLoadTickets() {
    try {
      const r = await fetch('/annotator/tickets');
      if (!r.ok) return [];
      const all = await r.json();
      return all.filter(t => t.status === 'open');
    } catch { return []; }
  }
  async function apiCreateTicket(data) {
    try {
      await fetch('/annotator/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (e) { console.error('RYC Tickets: create failed', e); }
  }
  async function apiUpdateTicket(id, updates) {
    try {
      await fetch(`/annotator/ticket/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (e) { console.error('RYC Tickets: update failed', e); }
  }
  async function apiClearAll() {
    try {
      await fetch('/annotator/tickets', { method: 'DELETE' });
    } catch (e) { console.error('RYC Tickets: clear failed', e); }
  }

  // ─── Constants ───────────────────────────────────────────────────────────────
  const EXCLUDED_CLASSES = new Set([
    'fade-up','is-visible','scrolled','mobile-open','active','gb-init',
    'page-transition','loader'
  ]);
  const EXCLUDED_PREFIXES = ['js-','is-','has-','state-'];

  // ─── State ───────────────────────────────────────────────────────────────────
  let pickMode = false;
  let overlay = null;
  let popup = null;
  let highlightBox = null;
  let trayOpen = false;

  // ─── Selector / path / CSS helpers ───────────────────────────────────────────
  function isUtilityClass(cls) {
    if (EXCLUDED_CLASSES.has(cls)) return true;
    return EXCLUDED_PREFIXES.some(p => cls.startsWith(p));
  }
  function stableClassesOf(el) {
    return Array.from(el.classList).filter(c => !isUtilityClass(c));
  }
  function getSelector(el) {
    if (el.id) return '#' + el.id;
    const ownClasses = stableClassesOf(el);
    if (ownClasses.length > 0) return '.' + ownClasses[0];
    const tag = el.tagName.toLowerCase();
    const parent = el.parentElement;
    if (!parent) return tag;
    const parentSel = parent.id ? '#' + parent.id
      : stableClassesOf(parent).length > 0 ? '.' + stableClassesOf(parent)[0] : null;
    const sameTagSiblings = Array.from(parent.children).filter(c => c.tagName === el.tagName);
    const idx = sameTagSiblings.indexOf(el) + 1;
    const nthSuffix = sameTagSiblings.length > 1 ? `:nth-of-type(${idx})` : '';
    if (parentSel) return `${parentSel} > ${tag}${nthSuffix}`;
    return `${getSelector(parent)} > ${tag}${nthSuffix}`;
  }
  function getPath(el) {
    const parts = [];
    let cur = el;
    while (cur && cur !== document.body && parts.length < 4) {
      const tag = cur.tagName.toLowerCase();
      const cls = stableClassesOf(cur)[0];
      parts.unshift(cls ? `${tag}.${cls}` : tag);
      cur = cur.parentElement;
    }
    return parts.join(' › ');
  }
  function getCSSContext(el) {
    const s = window.getComputedStyle(el);
    const lines = [];
    const fmt = v => v === '0px' ? '0' : v;
    const sides = (t, r, b, l) => {
      if (t === r && r === b && b === l) return fmt(t);
      if (t === b && r === l) return `${fmt(t)} ${fmt(r)}`;
      return `${fmt(t)} ${fmt(r)} ${fmt(b)} ${fmt(l)}`;
    };
    const mt = s.marginTop, mr = s.marginRight, mb = s.marginBottom, ml = s.marginLeft;
    if ([mt, mr, mb, ml].some(v => v !== '0px')) lines.push(`margin: ${sides(mt, mr, mb, ml)}`);
    const pt = s.paddingTop, pr = s.paddingRight, pb = s.paddingBottom, pl = s.paddingLeft;
    if ([pt, pr, pb, pl].some(v => v !== '0px')) lines.push(`padding: ${sides(pt, pr, pb, pl)}`);
    if (s.gap && s.gap !== 'normal') lines.push(`gap: ${s.gap}`);
    if (s.maxWidth && s.maxWidth !== 'none') lines.push(`max-width: ${s.maxWidth}`);
    if (s.fontSize) lines.push(`font-size: ${s.fontSize}`);
    return lines.join(' | ');
  }

  // ─── Styles ──────────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #ryc-ann-tab {
      position: fixed; right: 0; top: 50%; transform: translateY(-50%);
      z-index: 2147483647; width: 36px; height: 36px;
      background: #1a1a1a; border: 1px solid rgba(255,255,255,0.12);
      border-right: none; border-radius: 8px 0 0 8px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 15px; user-select: none;
      transition: background 0.15s;
    }
    #ryc-ann-tab:hover { background: #252525; }
    #ryc-ann-tab.active { background: rgba(34,197,94,0.15); border-color: #22c55e; }
    #ryc-ann-count-btn {
      position: fixed; right: 0; top: calc(50% + 24px); z-index: 2147483647;
      background: #1a1a1a; border: 1px solid rgba(255,255,255,0.12);
      border-right: none; border-radius: 8px 0 0 8px;
      width: 36px; padding: 7px 0;
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 3px;
      cursor: pointer; transition: background 0.15s; user-select: none;
    }
    #ryc-ann-count-btn:hover { background: #252525; }
    #ryc-ann-count-btn.has-tickets { border-color: rgba(34,197,94,0.35); }
    #ryc-ann-count-icon { width: 14px; height: 14px; opacity: 0.35; transition: opacity 0.15s; }
    #ryc-ann-count-btn.has-tickets #ryc-ann-count-icon { opacity: 1; color: #22c55e; }
    #ryc-ann-count-badge { font-size: 10px; font-weight: 700; font-family: system-ui, sans-serif; color: rgba(255,255,255,0.35); line-height: 1; transition: color 0.15s; }
    #ryc-ann-count-btn.has-tickets #ryc-ann-count-badge { color: #22c55e; }
    #ryc-ann-highlight { position: fixed; pointer-events: none; z-index: 2147483646; border: 2px solid #22c55e; border-radius: 3px; background: rgba(34,197,94,0.06); display: none; }
    #ryc-ann-overlay { position: fixed; inset: 0; z-index: 2147483645; cursor: crosshair; }
    #ryc-ann-popup {
      position: fixed; z-index: 2147483647; width: 280px;
      background: #0f0f0f; border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px; box-shadow: 0 8px 32px rgba(0,0,0,0.6);
      font-family: system-ui, sans-serif; color: #f1f1f1; overflow: hidden;
    }
    .ryc-pop-header { padding: 10px 12px 0; display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
    .ryc-pop-selector { font-size: 10px; font-weight: 600; letter-spacing: 0.05em; color: #22c55e; font-family: monospace; word-break: break-all; flex: 1; padding-top: 1px; }
    .ryc-pop-close { background: none; border: none; color: rgba(255,255,255,0.35); cursor: pointer; font-size: 16px; line-height: 1; padding: 0; }
    .ryc-pop-close:hover { color: rgba(255,255,255,0.8); }
    .ryc-pop-path { margin: 4px 12px 0; font-size: 9.5px; font-family: monospace; color: rgba(255,255,255,0.2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ryc-pop-text-preview { margin: 4px 12px 0; font-size: 11px; color: rgba(255,255,255,0.3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ryc-pop-css { margin: 3px 12px 0; font-size: 9.5px; font-family: monospace; color: rgba(34,197,94,0.45); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ryc-pop-divider { border: none; border-top: 1px solid rgba(255,255,255,0.07); margin: 10px 0 0; }
    .ryc-pop-body { padding: 10px 12px 12px; }
    .ryc-pop-textarea { width: 100%; height: 72px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #f1f1f1; font-family: inherit; font-size: 12px; padding: 8px 10px; resize: none; box-sizing: border-box; outline: none; transition: border-color 0.15s; }
    .ryc-pop-textarea:focus { border-color: rgba(255,255,255,0.28); }
    .ryc-pop-textarea::placeholder { color: rgba(255,255,255,0.22); }
    .ryc-pop-actions { display: flex; gap: 6px; margin-top: 8px; }
    .ryc-pop-save { flex: 1; padding: 7px 0; background: #f1f1f1; border: none; border-radius: 6px; color: #161616; font-family: inherit; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; transition: background 0.15s; }
    .ryc-pop-save:hover { background: #ddd; }
    .ryc-pop-save:disabled { opacity: 0.35; cursor: not-allowed; }
    .ryc-pop-cancel { padding: 7px 12px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; color: rgba(255,255,255,0.5); font-family: inherit; font-size: 11px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
    .ryc-pop-cancel:hover { background: rgba(255,255,255,0.1); color: #f1f1f1; }
    #ryc-ann-tray {
      position: fixed; right: 0; top: calc(50% - 18px); z-index: 2147483647;
      width: 300px; max-height: 420px;
      background: #0f0f0f; border: 1px solid rgba(255,255,255,0.1);
      border-right: none; border-radius: 10px 0 0 10px;
      box-shadow: -4px 0 24px rgba(0,0,0,0.4);
      font-family: system-ui, sans-serif;
      display: flex; flex-direction: column;
      transform: translateX(110%); transition: transform 0.25s cubic-bezier(0.16,1,0.3,1);
    }
    #ryc-ann-tray.open { transform: translateX(0); }
    .ryc-tray-header { padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.07); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
    .ryc-tray-title { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.4); }
    .ryc-tray-close { background: none; border: none; color: rgba(255,255,255,0.3); cursor: pointer; font-size: 16px; line-height: 1; padding: 0; }
    .ryc-tray-close:hover { color: rgba(255,255,255,0.8); }
    .ryc-tray-list { overflow-y: auto; flex: 1; padding: 8px; display: flex; flex-direction: column; gap: 6px; }
    .ryc-tray-empty { padding: 20px; text-align: center; font-size: 12px; color: rgba(255,255,255,0.2); }
    .ryc-tray-item { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 7px; padding: 9px 11px; cursor: default; transition: background 0.15s; }
    .ryc-tray-item:hover { background: rgba(255,255,255,0.07); }
    .ryc-tray-item-top { display: flex; align-items: flex-start; gap: 6px; }
    .ryc-tray-item-body { flex: 1; min-width: 0; }
    .ryc-tray-item-meta { font-size: 10px; color: rgba(255,255,255,0.28); margin-bottom: 3px; display: flex; gap: 6px; align-items: center; }
    .ryc-tray-item-selector { font-family: monospace; color: rgba(34,197,94,0.6); }
    .ryc-tray-item-note { font-size: 12px; color: rgba(255,255,255,0.65); line-height: 1.4; }
    .ryc-tray-item-edit-btn { flex-shrink: 0; background: none; border: none; color: rgba(255,255,255,0.2); cursor: pointer; padding: 1px 2px; line-height: 1; font-size: 12px; transition: color 0.15s; }
    .ryc-tray-item-edit-btn:hover { color: rgba(255,255,255,0.65); }
    .ryc-tray-item-textarea { width: 100%; height: 60px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.18); border-radius: 5px; color: #f1f1f1; font-family: inherit; font-size: 11.5px; padding: 6px 8px; resize: none; box-sizing: border-box; margin-top: 6px; outline: none; }
    .ryc-tray-item-edit-actions { display: flex; gap: 5px; margin-top: 5px; }
    .ryc-tray-item-save-btn { flex: 1; padding: 5px 0; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.15); border-radius: 5px; color: #f1f1f1; font-family: inherit; font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; }
    .ryc-tray-item-cancel-btn { padding: 5px 10px; background: none; border: 1px solid rgba(255,255,255,0.1); border-radius: 5px; color: rgba(255,255,255,0.4); font-family: inherit; font-size: 10px; cursor: pointer; }
    .ryc-tray-footer { padding: 10px; border-top: 1px solid rgba(255,255,255,0.07); flex-shrink: 0; }
    .ryc-tray-export {
      width: 100%; padding: 9px 0;
      background: linear-gradient(135deg, #1a1a1a, #111);
      border: 1px solid rgba(255,255,255,0.12); border-radius: 7px;
      color: rgba(255,255,255,0.7); font-family: system-ui, sans-serif;
      font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
      cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px;
      transition: background 0.15s, border-color 0.15s, color 0.15s;
    }
    .ryc-tray-export:hover { background: linear-gradient(135deg, #222, #181818); border-color: rgba(255,255,255,0.22); color: #f1f1f1; }
    .ryc-tray-export.copied { border-color: rgba(34,197,94,0.5); color: #22c55e; }
    .ryc-tray-export:disabled { opacity: 0.3; cursor: not-allowed; }
    .ryc-tray-clear { width: 100%; margin-top: 6px; padding: 7px 0; background: none; border: 1px solid rgba(255,255,255,0.07); border-radius: 7px; color: rgba(255,255,255,0.25); font-family: system-ui, sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: border-color 0.15s, color 0.15s; }
    .ryc-tray-clear:hover { border-color: rgba(239,68,68,0.4); color: rgba(239,68,68,0.7); }
    .ryc-tray-clear:disabled { opacity: 0.2; cursor: not-allowed; }
  `;
  document.head.appendChild(style);

  // ─── DOM ─────────────────────────────────────────────────────────────────────
  const tab = document.createElement('div');
  tab.id = 'ryc-ann-tab';
  tab.title = 'Click to annotate elements';
  tab.textContent = '✏️';

  const countBtn = document.createElement('div');
  countBtn.id = 'ryc-ann-count-btn';
  countBtn.title = 'View tickets';
  countBtn.innerHTML = `
    <svg id="ryc-ann-count-icon" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="1.5" y="2.5" width="11" height="9" rx="1.5"/>
      <line x1="4" y1="5.5" x2="10" y2="5.5"/>
      <line x1="4" y1="8" x2="8" y2="8"/>
    </svg>
    <span id="ryc-ann-count-badge">0</span>
  `;

  highlightBox = document.createElement('div');
  highlightBox.id = 'ryc-ann-highlight';

  const tray = document.createElement('div');
  tray.id = 'ryc-ann-tray';
  tray.innerHTML = `
    <div class="ryc-tray-header">
      <span class="ryc-tray-title">RYC Tickets</span>
      <button class="ryc-tray-close" aria-label="Close">×</button>
    </div>
    <div class="ryc-tray-list" id="ryc-ann-tray-list"></div>
    <div class="ryc-tray-footer">
      <button class="ryc-tray-export" id="ryc-ann-export-btn" disabled>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 6.5h10M7.5 2.5l4 4-4 4"/>
        </svg>
        Copy tickets as markdown
      </button>
      <button class="ryc-tray-clear" id="ryc-ann-clear-btn" disabled>Clear all</button>
    </div>
  `;

  document.body.appendChild(tab);
  document.body.appendChild(countBtn);
  document.body.appendChild(highlightBox);
  document.body.appendChild(tray);

  const countBadge = document.getElementById('ryc-ann-count-badge');
  const trayList = document.getElementById('ryc-ann-tray-list');
  const exportBtn = document.getElementById('ryc-ann-export-btn');
  const clearBtn = document.getElementById('ryc-ann-clear-btn');

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  function isAnnotatorEl(el) {
    return tab.contains(el) || countBtn.contains(el) || tray.contains(el) ||
           el === highlightBox || (popup && popup.contains(el));
  }
  function showHighlight(el) {
    const r = el.getBoundingClientRect();
    highlightBox.style.cssText = `display:block;top:${r.top}px;left:${r.left}px;width:${r.width}px;height:${r.height}px;`;
  }
  function hideHighlight() { highlightBox.style.display = 'none'; }

  function positionPopup(pop, rect) {
    const PW = 280, PAD = 12;
    const vw = window.innerWidth, vh = window.innerHeight;
    let left = rect.right + 12;
    if (left + PW > vw - PAD) left = rect.left - PW - 12;
    if (left < PAD) left = PAD;
    pop.style.left = left + 'px';
    let top = rect.top;
    pop.style.top = top + 'px';
    requestAnimationFrame(() => {
      const ph = pop.offsetHeight;
      if (top + ph > vh - PAD) top = Math.max(PAD, vh - ph - PAD);
      pop.style.top = top + 'px';
    });
  }

  // ─── Tray rendering ───────────────────────────────────────────────────────────
  async function renderTray() {
    const tickets = await apiLoadTickets();
    const count = tickets.length;
    countBadge.textContent = count;
    countBtn.classList.toggle('has-tickets', count > 0);
    exportBtn.disabled = count === 0;
    clearBtn.disabled = count === 0;

    trayList.innerHTML = '';
    if (count === 0) {
      trayList.innerHTML = '<div class="ryc-tray-empty">No open tickets</div>';
      return;
    }

    tickets.forEach(t => {
      const note = t.note || '';
      const item = document.createElement('div');
      item.className = 'ryc-tray-item';
      item.innerHTML = `
        <div class="ryc-tray-item-top">
          <div class="ryc-tray-item-body">
            <div class="ryc-tray-item-meta">
              <span>${t.page || location.pathname}</span>
              <span class="ryc-tray-item-selector">${t.element || ''}</span>
            </div>
            <div class="ryc-tray-item-note">${note.slice(0, 120)}${note.length > 120 ? '…' : ''}</div>
          </div>
          <button class="ryc-tray-item-edit-btn" title="Edit" aria-label="Edit">✎</button>
        </div>
      `;

      const editBtn = item.querySelector('.ryc-tray-item-edit-btn');
      const noteEl = item.querySelector('.ryc-tray-item-note');
      const topEl = item.querySelector('.ryc-tray-item-top');

      editBtn.addEventListener('click', e => {
        e.stopPropagation();
        if (item.querySelector('.ryc-tray-item-textarea')) return;
        noteEl.style.display = 'none';
        editBtn.style.display = 'none';

        const ta = document.createElement('textarea');
        ta.className = 'ryc-tray-item-textarea';
        ta.value = note;

        const actions = document.createElement('div');
        actions.className = 'ryc-tray-item-edit-actions';
        actions.innerHTML = `<button class="ryc-tray-item-save-btn">Save</button><button class="ryc-tray-item-cancel-btn">Cancel</button>`;

        topEl.after(ta);
        ta.after(actions);
        ta.focus();

        actions.querySelector('.ryc-tray-item-cancel-btn').addEventListener('click', () => {
          ta.remove(); actions.remove();
          noteEl.style.display = '';
          editBtn.style.display = '';
        });
        actions.querySelector('.ryc-tray-item-save-btn').addEventListener('click', async () => {
          const newNote = ta.value.trim();
          if (!newNote) return;
          await apiUpdateTicket(t.id, { note: newNote });
          renderTray();
        });
      });

      trayList.appendChild(item);
    });
  }

  // ─── Popup ───────────────────────────────────────────────────────────────────
  function closePopup() { if (popup) { popup.remove(); popup = null; } }

  function openPopup(el) {
    closePopup();
    const sel = getSelector(el);
    const path = getPath(el);
    const css = getCSSContext(el);
    const txt = (el.innerText || '').trim().slice(0, 80);
    const rect = el.getBoundingClientRect();

    popup = document.createElement('div');
    popup.id = 'ryc-ann-popup';
    popup.innerHTML = `
      <div class="ryc-pop-header">
        <span class="ryc-pop-selector">${sel}</span>
        <button class="ryc-pop-close">×</button>
      </div>
      <div class="ryc-pop-path">${path}</div>
      ${txt ? `<div class="ryc-pop-text-preview">"${txt}${txt.length === 80 ? '…' : ''}"</div>` : ''}
      ${css ? `<div class="ryc-pop-css">${css}</div>` : ''}
      <hr class="ryc-pop-divider">
      <div class="ryc-pop-body">
        <textarea class="ryc-pop-textarea" placeholder="What needs to change?"></textarea>
        <div class="ryc-pop-actions">
          <button class="ryc-pop-save" disabled>Save ticket</button>
          <button class="ryc-pop-cancel">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(popup);
    positionPopup(popup, rect);

    const textarea = popup.querySelector('.ryc-pop-textarea');
    const saveBtn = popup.querySelector('.ryc-pop-save');
    textarea.addEventListener('input', () => { saveBtn.disabled = textarea.value.trim().length === 0; });

    popup.querySelector('.ryc-pop-close').addEventListener('click', () => { closePopup(); hideHighlight(); });
    popup.querySelector('.ryc-pop-cancel').addEventListener('click', () => { closePopup(); hideHighlight(); });

    saveBtn.addEventListener('click', async () => {
      const note = textarea.value.trim();
      if (!note) return;
      saveBtn.disabled = true;
      await apiCreateTicket({ page: location.pathname, element: sel, path, text: txt, css, note });
      closePopup(); hideHighlight();
      renderTray();
    });

    setTimeout(() => textarea.focus(), 50);
  }

  // ─── Pick mode ────────────────────────────────────────────────────────────────
  function enterPickMode() {
    pickMode = true;
    tab.classList.add('active');
    overlay = document.createElement('div');
    overlay.id = 'ryc-ann-overlay';
    document.body.appendChild(overlay);
    overlay.addEventListener('mousemove', onMove);
    overlay.addEventListener('click', onClick);
  }
  function exitPickMode() {
    pickMode = false;
    tab.classList.remove('active');
    hideHighlight();
    if (overlay) { overlay.remove(); overlay = null; }
  }
  function onMove(e) {
    overlay.style.pointerEvents = 'none';
    const el = document.elementFromPoint(e.clientX, e.clientY);
    overlay.style.pointerEvents = '';
    if (!el || isAnnotatorEl(el)) return;
    showHighlight(el);
  }
  function onClick(e) {
    e.preventDefault(); e.stopPropagation();
    overlay.style.pointerEvents = 'none';
    const el = document.elementFromPoint(e.clientX, e.clientY);
    overlay.style.pointerEvents = '';
    if (!el || isAnnotatorEl(el)) return;
    exitPickMode(); showHighlight(el); openPopup(el);
  }

  tab.addEventListener('click', () => {
    closePopup();
    if (pickMode) exitPickMode(); else enterPickMode();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (popup) { closePopup(); hideHighlight(); return; }
      if (pickMode) exitPickMode();
    }
  });

  // ─── Tray controls ───────────────────────────────────────────────────────────
  countBtn.addEventListener('click', () => {
    trayOpen = !trayOpen;
    tray.classList.toggle('open', trayOpen);
    if (trayOpen) renderTray();
  });
  tray.querySelector('.ryc-tray-close').addEventListener('click', () => {
    trayOpen = false; tray.classList.remove('open');
  });

  // ─── Export / Copy ───────────────────────────────────────────────────────────
  exportBtn.addEventListener('click', async () => {
    const tickets = await apiLoadTickets();
    if (tickets.length === 0) return;
    const md = tickets.map(t => [
      '---',
      `id: ${t.id}`,
      `page: ${t.page || location.pathname}`,
      `element: ${t.element || ''}`,
      t.path  ? `path: "${t.path}"`  : null,
      t.css   ? `css: "${t.css}"`    : null,
      `text: "${(t.text || '').replace(/"/g, '\\"')}"`,
      `status: open`,
      '---',
      '',
      t.note || ''
    ].filter(Boolean).join('\n')).join('\n\n');

    const msg = `I've annotated ${tickets.length} change${tickets.length === 1 ? '' : 's'} on the site.\n\nTickets:\n\n${md}`;
    navigator.clipboard.writeText(msg).then(() => {
      exportBtn.classList.add('copied');
      exportBtn.textContent = '✓ Copied — paste into Claude';
      setTimeout(() => {
        exportBtn.classList.remove('copied');
        exportBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M1 6.5h10M7.5 2.5l4 4-4 4"/></svg> Copy tickets as markdown`;
      }, 2500);
    });
  });

  // ─── Clear all ───────────────────────────────────────────────────────────────
  clearBtn.addEventListener('click', async () => {
    const tickets = await apiLoadTickets();
    const count = tickets.length;
    if (count === 0) return;
    if (!confirm(`Clear all ${count} ticket${count === 1 ? '' : 's'}? This cannot be undone.`)) return;
    await apiClearAll();
    renderTray();
  });

  // ─── Init ────────────────────────────────────────────────────────────────────
  renderTray();
})();
