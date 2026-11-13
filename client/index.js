/**
 * dsh-sidebar-dock — browser half.
 *
 * The shell renders the global panel list as the column of labelled rows between
 * the New Session button and the workspace region. There is no slot for the
 * space immediately right of New Session, so this plugin works on the rendered
 * sidebar the same way dsh-panel-layout does: it tags the shell's own nodes,
 * hides the original panel list, and mirrors every live `sidebar.panellist`
 * registration into a dropdown anchored beside a split New Session row.
 *
 * The original New Session button is never moved or cloned with its React
 * handlers missing: a visual clone forwards its click to the real button, which
 * remains mounted but hidden.
 */
window.__ModuleLoader__.load({
  id: '@local/dsh-sidebar-dock',
  factory(require) {
    const NS = 'dsh-sidebar-dock';

    const en = {
      trigger: 'Panel menu',
      more: 'More',
      browse: 'Browse more plugins',
      create: 'Create your plugin',
      empty: 'No panels',
      createPrompt: 'Create a DSH plugin with a left sidebar entry.',
      pinOn: 'Show in sidebar',
      pinOff: 'Hide from sidebar',
    };

    const zh = {
      trigger: '面板菜单',
      more: '更多',
      browse: '浏览更多插件',
      create: '创建你的插件',
      empty: '暂无面板',
      createPrompt: '创建一个带左侧栏入口的 DSH 插件。',
      pinOn: '在边栏显示',
      pinOff: '从边栏收起',
    };

    const CSS = `
      [data-dsh-sidebar-dock-root] {
        position: relative;
      }

      [data-dsh-sidebar-dock-root] > .hHd-Xa_panelList {
        display: none !important;
      }

      [data-dsh-sidebar-dock-root][data-dsh-sidebar-dock-has-pinned] > .hHd-Xa_panelList {
        display: flex !important;
      }

      [data-dsh-sidebar-dock-root] > .hHd-Xa_panelList > button.hHd-Xa_panelRow,
      [data-dsh-sidebar-dock-root] > .hHd-Xa_panelList > .hHd-Xa_moreAnchor {
        display: none !important;
      }

      [data-dsh-sidebar-dock-root][data-dsh-sidebar-dock-has-pinned] > .hHd-Xa_panelList > button.hHd-Xa_panelRow[data-dsh-sidebar-dock-pinned] {
        display: flex !important;
      }

      [data-dsh-sidebar-dock-root][data-dsh-sidebar-dock-has-pinned] > .hHd-Xa_panelList > .hHd-Xa_moreAnchor[data-dsh-sidebar-dock-pinned] {
        display: flex !important;
      }

      /* Hide the original by structure as well: if React replaces the button,
         the replacement must never paint for even one frame. */
      [data-dsh-sidebar-dock-root] > button.hHd-Xa_newSession:not(.dsh-sidebar-dock-new) {
        display: none !important;
      }

      [data-dsh-sidebar-dock-hidden] {
        display: none !important;
      }

      .dsh-sidebar-dock-row {
        display: flex;
        flex: none;
        align-items: stretch;
        gap: 8px;
        margin: 0 calc(var(--dsh-sidebar-paint-inset, 3px) + 1px) 10px;
        box-sizing: border-box;
        min-width: 0;
      }

      .dsh-sidebar-dock-new {
        flex: 1 1 auto !important;
        width: auto !important;
        min-width: 0 !important;
        height: 38px !important;
        margin: 0 !important;
      }

      .dsh-sidebar-dock-trigger {
        flex: 0 0 38px;
        width: 38px;
        height: 38px;
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
        border-radius: 12px;
        background: var(--dsw-alias-bg-layer-1, #fff);
        color: var(--dsw-alias-label-primary, #0f1115);
        cursor: pointer;
        transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
      }

      .dsh-sidebar-dock-trigger:hover,
      .dsh-sidebar-dock-trigger:focus-visible {
        background: var(--dsw-alias-interactive-bg-hover, rgba(38, 49, 72, 0.06));
        outline: none;
      }

      .dsh-sidebar-dock-trigger[aria-expanded="true"] {
        border-color: var(--dsw-alias-brand-primary, #0f1115);
        color: var(--dsw-alias-brand-primary, #0f1115);
      }

      [data-dsh-sidebar-dock-railed] .dsh-sidebar-dock-row {
        flex-direction: column;
        gap: 6px;
        width: 100%;
        margin: 0 0 10px;
      }

      [data-dsh-sidebar-dock-railed] .dsh-sidebar-dock-new {
        display: none !important;
      }

      [data-dsh-sidebar-dock-railed] .dsh-sidebar-dock-trigger {
        flex: 0 0 34px;
        width: 34px !important;
        min-width: 34px;
        margin: 0 auto;
      }

      .dsh-sidebar-dock-popover {
        position: fixed;
        z-index: 2147483000;
        box-sizing: border-box;
        width: 288px;
        max-width: calc(100vw - 16px);
        max-height: calc(100vh - 16px);
        overflow-y: auto;
        padding: 4px;
        border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.04));
        border-radius: 16px;
        background: color-mix(in srgb, var(--dsw-alias-bg-layer-1, #fff) 72%, transparent);
        -webkit-backdrop-filter: blur(40px) saturate(1.5);
        backdrop-filter: blur(40px) saturate(1.5);
        box-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.04), 0 3px 8px rgba(0, 0, 0, 0.04), 0 0 20px rgba(0, 0, 0, 0.05);
        color: var(--dsw-alias-label-primary, #0f1115);
        opacity: 0;
        transform: translateY(-4px) scale(0.98);
        transform-origin: top left;
        pointer-events: none;
        transition: opacity 120ms ease, transform 120ms ease;
      }

      .dsh-sidebar-dock-popover[data-open] {
        opacity: 1;
        transform: none;
        pointer-events: auto;
      }

      .dsh-sidebar-dock-item {
        box-sizing: border-box;
        width: 100%;
        min-height: 34px;
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        padding: 6px 8px;
        border: 0;
        border-radius: 12px;
        background: transparent;
        color: inherit;
        font: inherit;
        font-size: 13px;
        font-weight: 450;
        line-height: 20px;
        text-align: left;
        cursor: pointer;
      }

      .dsh-sidebar-dock-item:hover,
      .dsh-sidebar-dock-item:focus-visible {
        background: var(--dsw-alias-interactive-bg-hover, rgba(38, 49, 72, 0.06));
        outline: none;
      }

      .dsh-sidebar-dock-item-row {
        display: flex;
        align-items: center;
        gap: 2px;
        border-radius: 12px;
      }

      .dsh-sidebar-dock-item-row > .dsh-sidebar-dock-item {
        flex: 1 1 auto;
        min-width: 0;
        width: auto;
      }

      .dsh-sidebar-dock-pin {
        flex: none;
        width: 28px;
        height: 28px;
        margin-right: 4px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: 0;
        border-radius: 8px;
        background: transparent;
        color: var(--dsw-alias-label-secondary, #61666b);
        opacity: 0.45;
        cursor: pointer;
        transition: opacity 120ms ease, background 120ms ease, color 120ms ease;
      }

      .dsh-sidebar-dock-item-row:hover .dsh-sidebar-dock-pin,
      .dsh-sidebar-dock-pin:focus-visible,
      .dsh-sidebar-dock-pin.is-pinned {
        opacity: 1;
      }

      .dsh-sidebar-dock-pin:hover,
      .dsh-sidebar-dock-pin:focus-visible,
      .dsh-sidebar-dock-pin.is-pinned {
        background: var(--dsw-alias-interactive-bg-hover, rgba(38, 49, 72, 0.06));
        color: var(--dsw-alias-brand-primary, #0f1115);
        outline: none;
      }

      .dsh-sidebar-dock-icon {
        flex: none;
        width: 18px;
        height: 18px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--dsw-alias-menu-icon, var(--dsw-alias-label-secondary, #61666b));
      }

      .dsh-sidebar-dock-icon > svg {
        display: block;
        flex: none;
      }

      .dsh-sidebar-dock-label {
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .dsh-sidebar-dock-check {
        flex: none;
        width: 16px;
        height: 16px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--dsw-alias-brand-primary, #0f1115);
      }

      .dsh-sidebar-dock-chevron {
        flex: none;
        width: 16px;
        height: 16px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--dsw-alias-label-secondary, #61666b);
        transition: transform 120ms ease;
      }

      .dsh-sidebar-dock-item[aria-expanded="true"] .dsh-sidebar-dock-chevron {
        transform: rotate(90deg);
      }

      .dsh-sidebar-dock-separator {
        height: 1px;
        margin: 4px 8px;
        background: var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.04));
      }

      .dsh-sidebar-dock-sub {
        display: flex;
        flex-direction: column;
      }

      .dsh-sidebar-dock-sub[hidden] {
        display: none;
      }

      .dsh-sidebar-dock-sub .dsh-sidebar-dock-item {
        padding-left: 34px;
      }

      .dsh-sidebar-dock-empty {
        padding: 8px;
        color: var(--dsw-alias-label-secondary, #61666b);
        font-size: 13px;
      }
    `;

    const tFallback = (key) => (document.documentElement.lang || '').toLowerCase().startsWith('zh')
      ? (zh[key] ?? key)
      : (en[key] ?? key);

    const GENERIC_GLYPH = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2" y="2" width="5" height="5" rx="1.2" stroke="currentColor" stroke-width="1.2"/><rect x="9" y="2" width="5" height="5" rx="1.2" stroke="currentColor" stroke-width="1.2"/><rect x="2" y="9" width="5" height="5" rx="1.2" stroke="currentColor" stroke-width="1.2"/><rect x="9" y="9" width="5" height="5" rx="1.2" stroke="currentColor" stroke-width="1.2"/></svg>';
    const MENU_GLYPH = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2.5 4.25h11M2.5 8h11M2.5 11.75h11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
    const CHEVRON_GLYPH = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M5.25 3.5 8.75 7l-3.5 3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const CHECK_GLYPH = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="m3 7.25 2.5 2.5L11 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const PIN_GLYPH = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M1.75 8s2.25-4.25 6.25-4.25S14.25 8 14.25 8 12 12.25 8 12.25 1.75 8 1.75 8Z" stroke="currentColor" stroke-width="1.25" stroke-linejoin="round"/><circle cx="8" cy="8" r="1.75" stroke="currentColor" stroke-width="1.25"/></svg>';
    const BROWSE_GLYPH = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1.75v2.1M8 12.15v2.1M1.75 8h2.1M12.15 8h2.1M3.58 3.58l1.48 1.48M10.94 10.94l1.48 1.48M12.42 3.58l-1.48 1.48M5.06 10.94l-1.48 1.48" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="8" cy="8" r="2.05" stroke="currentColor" stroke-width="1.3"/></svg>';
    const CREATE_GLYPH = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 3.25v9.5M3.25 8h9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';

    /** Resolve a slot registration label (string or thunk). */
    function labelOf(options, fallback) {
      const label = options && options.label;
      if (typeof label === 'function') {
        try { return String(label()); } catch { return fallback; }
      }
      return typeof label === 'string' && label !== '' ? label : fallback;
    }

    /** Read the live panel registrations in shell order. */
    function panelEntries(ctx) {
      let raw = [];
      try {
        if (typeof ctx.slots.entriesOfSlot === 'function') raw = ctx.slots.entriesOfSlot('sidebar.panellist');
      } catch {
        raw = [];
      }
      const entries = [];
      const seen = new Set();
      for (const entry of raw) {
        const options = entry && entry.options;
        if (!options || typeof options.id !== 'string' || seen.has(options.id)) continue;
        seen.add(options.id);
        entries.push({
          id: options.id,
          label: labelOf(options, options.id),
          order: typeof options.order === 'number' ? options.order : 0,
        });
      }
      return entries.sort((a, b) => a.order - b.order);
    }

    /** The shell's row for one panel entry. */
    function panelRowFor(label) {
      const rows = Array.from(document.querySelectorAll('button.hHd-Xa_panelRow'));
      return rows.find((row) => row.getAttribute('aria-haspopup') !== 'menu' && (row.getAttribute('aria-label') || '') === label) || null;
    }

    /** Copy a live panel row's glyph (including plugin-authored SVG markup). */
    function glyphFor(row) {
      if (!row) return GENERIC_GLYPH;
      const cell = row.querySelector('.hHd-Xa_panelGlyph');
      if (!cell) return GENERIC_GLYPH;
      const markup = cell.innerHTML.trim();
      return markup === '' ? GENERIC_GLYPH : markup;
    }

    /** Is this panel currently selected? The shell marks its row. */
    function isActive(row) {
      if (!row) return false;
      return row.getAttribute('aria-current') === 'page' || String(row.className).includes('panelActive');
    }

    function plugin(ctx) {
      return {
        name: 'dsh-sidebar-dock',
        inject: ['slots', 'locale', 'layout', 'uiWorkspace'],
        apply(ctx) {
          // Hot reload can evaluate a newer copy before the old one is disposed.
          // Keep exactly one live instance so their observers/wrappers cannot fight.
          const previousDispose = window.__DSH_SIDEBAR_DOCK_DISPOSE__;
          if (typeof previousDispose === 'function') {
            try { previousDispose(); } catch (error) { console.warn('[dsh-sidebar-dock] previous instance cleanup failed:', error); }
          }
          for (const node of document.querySelectorAll('.dsh-sidebar-dock-row, .dsh-sidebar-dock-popover')) node.remove();
          for (const node of document.querySelectorAll('[data-dsh-sidebar-dock-root]')) {
            node.removeAttribute('data-dsh-sidebar-dock-root');
            node.removeAttribute('data-dsh-sidebar-dock-railed');
            node.classList.remove('dsh-sidebar-dock-root');
          }
          for (const node of document.querySelectorAll('[data-dsh-sidebar-dock-hidden]')) {
            node.removeAttribute('data-dsh-sidebar-dock-hidden');
          }

          ctx.effect(() => {
            ctx.locale.register(NS, { en, zh });
          }, 'dsh-sidebar-dock: dictionaries');

          ctx.effect(() => {
            const style = document.createElement('style');
            style.setAttribute('data-dsh-sidebar-dock', '');
            style.textContent = CSS;
            document.head.appendChild(style);
            return () => { style.remove(); };
          }, 'dsh-sidebar-dock: styles');

          const t = ctx.locale.bind(NS);
          let root = null;
          let originalNewSession = null;
          let wrapper = null;
          let clone = null;
          let trigger = null;
          let menu = null;
          let moreSub = null;
          let moreToggle = null;
          let open = false;
          let scheduled = false;
          const PIN_KEY = 'dsh-sidebar-dock:pinned';
          const MORE_ID = '__more__';
          let pinned = new Set();
          try {
            const stored = JSON.parse(window.localStorage.getItem(PIN_KEY) || '[]');
            if (Array.isArray(stored)) pinned = new Set(stored.filter((id) => typeof id === 'string'));
          } catch {}
          const savePinned = () => {
            try { window.localStorage.setItem(PIN_KEY, JSON.stringify([...pinned])); } catch {}
          };
          let resizeObserver = null;
          let rootObserver = null;
          let slotDispose = null;
          let menuWasFocused = null;

          const isChinese = () => (document.documentElement.lang || '').toLowerCase().startsWith('zh');
          const tr = (key) => {
            try {
              const value = t(key);
              return value && value !== key ? value : tFallback(key);
            } catch {
              return tFallback(key);
            }
          };

              /** Mark host rows so only the user-pinned ones appear under New Session. */
              function applyPinnedRows() {
                if (!root) return;
                const rows = Array.from(root.querySelectorAll('.hHd-Xa_panelList button.hHd-Xa_panelRow'));
                const entries = panelEntries(ctx);
                let any = false;
                const matched = new Set();
                for (const entry of entries) {
                  const row = rows.find((candidate) => candidate.getAttribute('aria-haspopup') !== 'menu' && (candidate.getAttribute('aria-label') || '') === entry.label);
                  if (!row) continue;
                  row.setAttribute('data-dsh-sidebar-dock-panel-id', entry.id);
                  const visible = pinned.has(entry.id);
                  row.toggleAttribute('data-dsh-sidebar-dock-pinned', visible);
                  matched.add(row);
                  if (visible) any = true;
                }
                const moreRow = rows.find((candidate) => candidate.getAttribute('aria-haspopup') === 'menu');
                const moreAnchor = moreRow && moreRow.closest('.hHd-Xa_moreAnchor');
                if (moreRow && moreAnchor) {
                  const visible = pinned.has(MORE_ID);
                  moreAnchor.toggleAttribute('data-dsh-sidebar-dock-more-row', true);
                  moreAnchor.toggleAttribute('data-dsh-sidebar-dock-pinned', visible);
                  if (visible) any = true;
                }
                for (const row of rows) {
                  if (!matched.has(row) && row !== moreRow) {
                    row.removeAttribute('data-dsh-sidebar-dock-panel-id');
                    row.removeAttribute('data-dsh-sidebar-dock-pinned');
                  }
                }
                root.toggleAttribute('data-dsh-sidebar-dock-has-pinned', any);
              }

          function closeMenu() {
            if (!open) return;
            open = false;
            if (menu) {
              menu.removeAttribute('data-open');
              menu.hidden = true;
            }
            if (trigger) trigger.setAttribute('aria-expanded', 'false');
            if (moreSub) moreSub.hidden = true;
            if (moreToggle) moreToggle.setAttribute('aria-expanded', 'false');
            if (menuWasFocused && trigger) trigger.focus({ preventScroll: true });
            menuWasFocused = null;
          }

          function positionMenu() {
            if (!menu || !trigger) return;
            const rect = trigger.getBoundingClientRect();
            const gap = 8;
            const width = Math.min(288, Math.max(220, window.innerWidth - 16));
            menu.style.width = width + 'px';
            let left = rect.right + gap;
            if (left + width > window.innerWidth - 8) left = Math.max(8, rect.right - width);
            let top = rect.bottom + 6;
            const height = Math.min(menu.scrollHeight || menu.offsetHeight || 0, window.innerHeight - 16);
            if (top + height > window.innerHeight - 8) top = Math.max(8, rect.top - height - 6);
            menu.style.left = Math.round(left) + 'px';
            menu.style.top = Math.round(top) + 'px';
          }

          function createPinButton(id) {
            const pin = document.createElement('button');
            pin.type = 'button';
            pin.className = 'dsh-sidebar-dock-pin';
            pin.setAttribute('role', 'menuitemcheckbox');
            pin.innerHTML = PIN_GLYPH;
            const sync = () => {
              const on = pinned.has(id);
              pin.classList.toggle('is-pinned', on);
              pin.setAttribute('aria-checked', String(on));
              pin.setAttribute('aria-label', tr(on ? 'pinOff' : 'pinOn'));
              pin.title = tr(on ? 'pinOff' : 'pinOn');
            };
            sync();
            pin.addEventListener('click', (event) => {
              event.preventDefault();
              event.stopPropagation();
              if (pinned.has(id)) pinned.delete(id);
              else pinned.add(id);
              savePinned();
              sync();
              applyPinnedRows();
            });
            return pin;
          }

          function createPanelItem(entry) {
            const row = panelRowFor(entry.label);
            const itemRow = document.createElement('div');
            itemRow.className = 'dsh-sidebar-dock-item-row';
            itemRow.setAttribute('role', 'none');
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'dsh-sidebar-dock-item';
            button.setAttribute('role', 'menuitem');
            button.dataset.panelId = entry.id;
            if (isActive(row)) button.setAttribute('aria-current', 'page');

            const icon = document.createElement('span');
            icon.className = 'dsh-sidebar-dock-icon';
            icon.setAttribute('aria-hidden', 'true');
            icon.innerHTML = glyphFor(row);
            button.appendChild(icon);

            const label = document.createElement('span');
            label.className = 'dsh-sidebar-dock-label';
            label.textContent = entry.label;
            button.appendChild(label);

            if (isActive(row)) {
              const check = document.createElement('span');
              check.className = 'dsh-sidebar-dock-check';
              check.setAttribute('aria-hidden', 'true');
              check.innerHTML = CHECK_GLYPH;
              button.appendChild(check);
            }

            button.addEventListener('click', () => {
              closeMenu();
              try {
                if (row && row.isConnected) row.click();
                else if (ctx.layout && typeof ctx.layout.selectPanel === 'function') ctx.layout.selectPanel(entry.id);
              } catch (error) {
                console.error('[dsh-sidebar-dock] could not open panel:', entry.id, error);
              }
            });
            itemRow.append(button, createPinButton(entry.id));
            return itemRow;
          }

          function createActionItem(glyph, label, run) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'dsh-sidebar-dock-item';
            button.setAttribute('role', 'menuitem');
            const icon = document.createElement('span');
            icon.className = 'dsh-sidebar-dock-icon';
            icon.setAttribute('aria-hidden', 'true');
            icon.innerHTML = glyph;
            button.appendChild(icon);
            const text = document.createElement('span');
            text.className = 'dsh-sidebar-dock-label';
            text.textContent = label;
            button.appendChild(text);
            button.addEventListener('click', () => {
              closeMenu();
              try { run(); } catch (error) { console.error('[dsh-sidebar-dock] action failed:', error); }
            });
            return button;
          }

          function buildMenu() {
            if (!menu) return;
            menu.replaceChildren();

            const entries = panelEntries(ctx);
            if (entries.length === 0) {
              const empty = document.createElement('div');
              empty.className = 'dsh-sidebar-dock-empty';
              empty.textContent = tr('empty');
              menu.appendChild(empty);
            } else {
              for (const entry of entries) menu.appendChild(createPanelItem(entry));
            }

            const separator = document.createElement('div');
            separator.className = 'dsh-sidebar-dock-separator';
            separator.setAttribute('role', 'separator');
            menu.appendChild(separator);

            const moreRow = document.querySelector('button.hHd-Xa_panelRow[aria-haspopup="menu"]');
            moreToggle = document.createElement('button');
            moreToggle.type = 'button';
            moreToggle.className = 'dsh-sidebar-dock-item';
            moreToggle.setAttribute('role', 'menuitem');
            moreToggle.setAttribute('aria-haspopup', 'true');
            moreToggle.setAttribute('aria-expanded', 'false');
            const moreIcon = document.createElement('span');
            moreIcon.className = 'dsh-sidebar-dock-icon';
            moreIcon.setAttribute('aria-hidden', 'true');
            const moreGlyphCell = moreRow && moreRow.querySelector('.hHd-Xa_panelGlyph');
            moreIcon.innerHTML = moreGlyphCell && moreGlyphCell.innerHTML.trim() ? moreGlyphCell.innerHTML : MENU_GLYPH;
            const moreLabel = document.createElement('span');
            moreLabel.className = 'dsh-sidebar-dock-label';
            moreLabel.textContent = tr('more');
            const chevron = document.createElement('span');
            chevron.className = 'dsh-sidebar-dock-chevron';
            chevron.setAttribute('aria-hidden', 'true');
            chevron.innerHTML = CHEVRON_GLYPH;
            moreToggle.append(moreIcon, moreLabel, chevron);
            const moreItemRow = document.createElement('div');
            moreItemRow.className = 'dsh-sidebar-dock-item-row';
            moreItemRow.setAttribute('role', 'none');
            moreItemRow.append(moreToggle, createPinButton(MORE_ID));
            menu.appendChild(moreItemRow);

            moreSub = document.createElement('div');
            moreSub.className = 'dsh-sidebar-dock-sub';
            moreSub.hidden = true;

            const browse = createActionItem(BROWSE_GLYPH, tr('browse'), () => {
              const nav = ctx.get && ctx.get('pluginNavigation');
              if (nav && typeof nav.openList === 'function') nav.openList();
            });
            const create = createActionItem(CREATE_GLYPH, tr('create'), () => {
              if (!ctx.uiWorkspace || typeof ctx.uiWorkspace.startSession !== 'function') return;
              ctx.uiWorkspace.startSession(undefined, {
                agentPreset: 'cordis',
                prompt: tr('createPrompt'),
                whenDraftExists: 'append',
              });
            });
            moreSub.append(browse, create);
            menu.appendChild(moreSub);

            moreToggle.addEventListener('click', () => {
              const next = moreSub.hidden;
              moreSub.hidden = !next;
              moreToggle.setAttribute('aria-expanded', String(next));
              if (next) {
                const first = moreSub.querySelector('button');
                if (first) first.focus({ preventScroll: true });
                requestAnimationFrame(positionMenu);
              }
            });
          }

          function openMenu() {
            if (open) return;
            buildMenu();
            applyPinnedRows();
            open = true;
            menu.hidden = false;
            menu.setAttribute('data-open', 'true');
            trigger.setAttribute('aria-expanded', 'true');
            menuWasFocused = trigger;
            positionMenu();
            const first = menu.querySelector('button[role="menuitem"]');
            if (first) requestAnimationFrame(() => first.focus({ preventScroll: true }));
          }

          function toggleMenu() {
            if (open) closeMenu();
            else openMenu();
          }

          function onDocumentPointerDown(event) {
            if (!open) return;
            const target = event.target;
            if (!(target instanceof Node)) return;
            if ((menu && menu.contains(target)) || (trigger && trigger.contains(target))) return;
            closeMenu();
          }

          function onDocumentKeyDown(event) {
            if (!open) return;
            if (event.key === 'Escape') {
              event.preventDefault();
              closeMenu();
              return;
            }
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
            const items = Array.from(menu.querySelectorAll('button[role="menuitem"]')).filter((item) => !item.closest('[hidden]'));
            if (items.length === 0) return;
            const index = items.indexOf(document.activeElement);
            const next = event.key === 'ArrowDown'
              ? (index < 0 ? 0 : (index + 1) % items.length)
              : (index <= 0 ? items.length - 1 : index - 1);
            event.preventDefault();
            items[next].focus();
          }

          function createMenu() {
            if (menu) return;
            menu = document.createElement('div');
            menu.className = 'dsh-sidebar-dock-popover';
            menu.setAttribute('role', 'menu');
            menu.setAttribute('aria-label', tr('trigger'));
            menu.hidden = true;
            menu.addEventListener('pointerdown', (event) => event.stopPropagation());
            document.body.appendChild(menu);
          }

          function createTrigger() {
            if (trigger) return;
            trigger = document.createElement('button');
            trigger.type = 'button';
            trigger.className = 'dsh-sidebar-dock-trigger';
            trigger.setAttribute('aria-label', tr('trigger'));
            trigger.setAttribute('title', tr('trigger'));
            trigger.setAttribute('aria-haspopup', 'menu');
            trigger.setAttribute('aria-expanded', 'false');
            trigger.innerHTML = MENU_GLYPH;
            trigger.addEventListener('click', (event) => {
              event.preventDefault();
              event.stopPropagation();
              toggleMenu();
            });
          }

          function makeWrapper() {
            wrapper = document.createElement('div');
            wrapper.className = 'dsh-sidebar-dock-row';
            wrapper.setAttribute('data-dsh-sidebar-dock-row', '');
            clone = document.createElement('button');
            clone.type = 'button';
            clone.className = 'dsh-sidebar-dock-new';
            wrapper.appendChild(clone);
            createTrigger();
            wrapper.appendChild(trigger);
          }

          let lastButtonSignature = '';

          function copyButton() {
            if (!clone || !originalNewSession) return;
            const signature = originalNewSession.className + '\u0000' + originalNewSession.innerHTML;
            if (signature === lastButtonSignature && clone.isConnected) return;
            lastButtonSignature = signature;
            const styles = clone.getAttribute('style') || '';
            clone.className = originalNewSession.className + ' dsh-sidebar-dock-new';
            for (const attr of Array.from(originalNewSession.attributes)) {
              if (attr.name === 'class' || attr.name === 'data-dsh-sidebar-dock-hidden') continue;
              try { clone.setAttribute(attr.name, attr.value); } catch {}
            }
            clone.innerHTML = originalNewSession.innerHTML;
            clone.setAttribute('style', styles + ';flex:1 1 auto;width:auto;min-width:0;height:38px;margin:0;');
            clone.onclick = () => {
              try { originalNewSession.click(); } catch (error) { console.error('[dsh-sidebar-dock] could not start a session:', error); }
            };
          }

          function install() {
            const candidates = Array.from(document.querySelectorAll('button.hHd-Xa_newSession:not(.dsh-sidebar-dock-new)'));
            const candidate = candidates.find((button) => button.closest('.hHd-Xa_root'))
              || candidates.find((button) => button.parentElement && !button.parentElement.classList.contains('dsh-sidebar-dock-row'))
              || candidates[0];
            if (!candidate || !candidate.parentElement) return false;
            const nextRoot = candidate.closest('.hHd-Xa_root') || candidate.parentElement;
            if (nextRoot !== root) {
              cleanupRoot();
              root = nextRoot;
              originalNewSession = candidate;
              root.setAttribute('data-dsh-sidebar-dock-root', '');
              root.classList.add('dsh-sidebar-dock-root');
              createMenu();
              makeWrapper();
              root.insertBefore(wrapper, originalNewSession);
              originalNewSession.setAttribute('data-dsh-sidebar-dock-hidden', '');
              resizeObserver = new ResizeObserver(() => schedule());
              resizeObserver.observe(root);
              syncRail();
            } else if (!wrapper || !wrapper.isConnected || wrapper.parentElement !== root) {
              if (!wrapper) makeWrapper();
              root.insertBefore(wrapper, originalNewSession || candidate);
              originalNewSession = candidate;
              originalNewSession.setAttribute('data-dsh-sidebar-dock-hidden', '');
            }
            if (originalNewSession !== candidate) {
              originalNewSession = candidate;
              originalNewSession.setAttribute('data-dsh-sidebar-dock-hidden', '');
              lastButtonSignature = '';
            }
            copyButton();
            createTrigger();
            applyPinnedRows();
            if (trigger.parentElement !== wrapper) wrapper.appendChild(trigger);
            if (clone.parentElement !== wrapper) wrapper.insertBefore(clone, trigger);
            if (root && candidate.parentElement === root) {
              originalNewSession = candidate;
              candidate.setAttribute('data-dsh-sidebar-dock-hidden', '');
              if (wrapper.nextElementSibling !== candidate) root.insertBefore(wrapper, candidate);
            }
            syncRail();
            return true;
          }

          function syncRail() {
            if (!root || !trigger) return;
            const railed = root.getBoundingClientRect().width < 150;
            if (railed) root.setAttribute('data-dsh-sidebar-dock-railed', '');
            else root.removeAttribute('data-dsh-sidebar-dock-railed');
          }

          function cleanupRoot() {
            closeMenu();
            if (rootObserver) { rootObserver.disconnect(); rootObserver = null; }
            if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null; }
            if (wrapper) wrapper.remove();
            if (menu) menu.remove();
            wrapper = null; clone = null; trigger = null; menu = null; moreSub = null; moreToggle = null;
            lastButtonSignature = '';
            if (root) {
              root.removeAttribute('data-dsh-sidebar-dock-root');
              root.removeAttribute('data-dsh-sidebar-dock-railed');
              root.classList.remove('dsh-sidebar-dock-root');
            }
            if (originalNewSession) originalNewSession.removeAttribute('data-dsh-sidebar-dock-hidden');
            originalNewSession = null;
            root = null;
          }

          function schedule() {
            if (scheduled) return;
            scheduled = true;
            const run = () => {
              scheduled = false;
              try {
                install();
              } catch (error) {
                console.error('[dsh-sidebar-dock] reconcile failed:', error);
              }
            };
            if (typeof window.requestAnimationFrame === 'function') window.requestAnimationFrame(run);
            else window.setTimeout(run, 0);
          }

          const observer = new MutationObserver((records) => {
            let relevant = !root;
            if (!relevant) {
              for (const record of records) {
                const target = record.target;
                if (target instanceof Element && target.closest('.hHd-Xa_root')) { relevant = true; break; }
                for (const node of record.addedNodes || []) {
                  if (node instanceof Element && (node.matches('.hHd-Xa_root') || node.querySelector('.hHd-Xa_root'))) { relevant = true; break; }
                }
                if (relevant) break;
              }
            }
            if (relevant) schedule();
          });
          observer.observe(document.body, { childList: true, subtree: true });
          document.addEventListener('pointerdown', onDocumentPointerDown, true);
          document.addEventListener('keydown', onDocumentKeyDown, true);
          window.addEventListener('resize', schedule);
          try {
            if (typeof ctx.slots.subscribe === 'function') {
              slotDispose = ctx.slots.subscribe('sidebar.panellist', () => schedule());
            }
          } catch {}
          schedule();

          const dispose = () => {
            observer.disconnect();
            document.removeEventListener('pointerdown', onDocumentPointerDown, true);
            document.removeEventListener('keydown', onDocumentKeyDown, true);
            window.removeEventListener('resize', schedule);
            if (typeof slotDispose === 'function') slotDispose();
            cleanupRoot();
            if (window.__DSH_SIDEBAR_DOCK_DISPOSE__ === dispose) delete window.__DSH_SIDEBAR_DOCK_DISPOSE__;
          };
          window.__DSH_SIDEBAR_DOCK_DISPOSE__ = dispose;
          return dispose;
        },
      };
    }

    return plugin();
  },
});
