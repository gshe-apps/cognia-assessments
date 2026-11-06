/* ============================================================
   COGNIA COMPONENTS, PLAIN HTML BEHAVIOUR
   The behaviour that shadcn's React components provide and plain HTML
   lacks, for the classes in components.css. Load a copy on any screen
   that uses these components. Do not edit a project's copy; change this
   file in the plugin and re-copy.

   Dropdown menu (components.md, Dropdown Menu), as Radix/shadcn does it:
     <div class="dropdown">
       <button class="btn" aria-haspopup="menu" aria-expanded="false">...</button>
       <div class="menu" role="menu" hidden>
         <a class="menu-item" role="menuitem" tabindex="-1" href="...">...</a>
       </div>
     </div>
   - Click, Enter, Space or Arrow Down opens it and focuses the first item;
     Arrow Up opens it on the last item.
   - Arrow Up and Down move between items and wrap; Home and End jump.
   - Escape closes it and returns focus to the trigger. Tab, choosing an
     item or clicking outside closes it.
   - Works for menus that scripts add later, so it needs no setup call.
   ============================================================ */
(() => {
  if (window.cogniaComponents) return;
  window.cogniaComponents = true;

  const TRIGGER = '.dropdown > [aria-haspopup="menu"]';
  const OPEN_MENU = '.dropdown > [role="menu"]:not([hidden])';

  const partsOf = (el) => {
    const dropdown = el && el.closest('.dropdown');
    if (!dropdown) return null;
    const trigger = dropdown.querySelector(':scope > [aria-haspopup="menu"]');
    const menu = dropdown.querySelector(':scope > [role="menu"]');
    return trigger && menu ? { dropdown, trigger, menu } : null;
  };
  const itemsOf = (menu) => [...menu.querySelectorAll('[role="menuitem"]:not([aria-disabled="true"])')];

  const close = (parts, returnFocus) => {
    if (!parts || parts.menu.hidden) return;
    parts.menu.hidden = true;
    parts.trigger.setAttribute('aria-expanded', 'false');
    if (returnFocus) parts.trigger.focus();
  };
  const closeAll = (except) => {
    document.querySelectorAll(OPEN_MENU).forEach((menu) => {
      if (menu !== except) close(partsOf(menu));
    });
  };
  const open = (parts, at) => {
    closeAll(parts.menu);
    parts.menu.hidden = false;
    parts.trigger.setAttribute('aria-expanded', 'true');
    const items = itemsOf(parts.menu);
    const item = at === 'last' ? items[items.length - 1] : items[0];
    if (item) item.focus();
  };

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest(TRIGGER);
    if (trigger) {
      const parts = partsOf(trigger);
      if (parts.menu.hidden) open(parts); else close(parts);
      return;
    }
    const item = event.target.closest('.dropdown [role="menuitem"]');
    if (item && !item.matches('[aria-disabled="true"]')) {
      close(partsOf(item), true);
      return;
    }
    document.querySelectorAll(OPEN_MENU).forEach((menu) => {
      if (!menu.parentElement.contains(event.target)) close(partsOf(menu));
    });
  });

  document.addEventListener('keydown', (event) => {
    if (!(event.target instanceof Element)) return;
    const trigger = event.target.closest(TRIGGER);
    if (trigger && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault();
      open(partsOf(trigger), event.key === 'ArrowUp' ? 'last' : 'first');
      return;
    }
    const menu = event.target.closest('.dropdown > [role="menu"]');
    if (!menu) return;
    const parts = partsOf(menu);
    const items = itemsOf(menu);
    const index = items.indexOf(document.activeElement);
    const focusAt = (i) => {
      event.preventDefault();
      if (items.length) items[(i + items.length) % items.length].focus();
    };
    switch (event.key) {
      case 'ArrowDown': focusAt(index + 1); break;
      case 'ArrowUp': focusAt(index < 0 ? items.length - 1 : index - 1); break;
      case 'Home': focusAt(0); break;
      case 'End': focusAt(items.length - 1); break;
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        close(parts, true);
        break;
      case 'Tab':
        close(parts, true);
        break;
      case ' ':
        if (document.activeElement.matches('a[role="menuitem"]')) {
          event.preventDefault();
          document.activeElement.click();
        }
        break;
      default:
    }
  });

  window.addEventListener('pageshow', () => closeAll());
})();
