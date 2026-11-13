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

   Clickable table row (components.md, Table):
     <tr class="row-link"><td><a href="...">Name</a></td>...</tr>
   - A click anywhere on the row follows the row's first link or button
     (or the element marked data-row-target). Clicks on other links,
     buttons and fields in the row keep their own behaviour.
   - Keyboard users reach the row through that link, so the row itself
     is not focusable.

   Search input (components.md, Search input):
     <div class="search" role="search"> icon, input.input.search-input, .search-clear </div>
   - The clear button and Escape empty the field, fire an input event so the
     screen's own filtering runs again, and put focus back in the field.

   Dialog, Alert Dialog, Sheet and Drawer (components.md, Dialog):
   - .dialog-close closes its <dialog>.
   - A click on the backdrop closes a dialog, except role="alertdialog".

   Popover, Combobox, Date Picker (components.md):
     <div class="popover-wrap"> button[aria-haspopup="dialog"] + .popover[hidden] </div>
   - Click toggles it; Escape, a click outside or opening another closes it.
   - In a .combobox, choosing a .command-item writes its text into the
     trigger, marks it aria-selected and closes the popover.

   Command (components.md, Command): typing in .command-input hides items
   that do not match and shows .command-empty when nothing does.

   Context Menu: right click or Shift+F10 inside [data-context-menu] opens
   its .menu at the pointer. Items, keys and closing work as Dropdown menu.

   Carousel: .carousel-prev and .carousel-next scroll one item.

   Input OTP: typing a character moves to the next .input-otp-slot,
   Backspace on an empty slot moves back, and pasting fills every slot.

   Resizable: drag a .resizable-handle, or use the arrow keys on it.
   ============================================================ */
(() => {
  if (window.cogniaComponents) return;
  window.cogniaComponents = true;

  const TRIGGER = '.dropdown > [aria-haspopup="menu"]';
  const OPEN_MENU = ':is(.dropdown, [data-context-menu]) > [role="menu"]:not([hidden])';

  const partsOf = (el) => {
    const context = el && el.closest('[data-context-menu]');
    const dropdown = el && el.closest('.dropdown');
    if (context && (!dropdown || context.contains(dropdown) === false)) {
      const menu = context.querySelector(':scope > [role="menu"]');
      return menu ? { dropdown: context, trigger: context, menu } : null;
    }
    if (!dropdown) return null;
    const trigger = dropdown.querySelector(':scope > [aria-haspopup="menu"]');
    const menu = dropdown.querySelector(':scope > [role="menu"]');
    return trigger && menu ? { dropdown, trigger, menu } : null;
  };
  const itemsOf = (menu) => [...menu.querySelectorAll('[role="menuitem"]:not([aria-disabled="true"])')];

  const close = (parts, returnFocus) => {
    if (!parts || parts.menu.hidden) return;
    parts.menu.hidden = true;
    if (parts.trigger !== parts.dropdown || parts.trigger.matches('[aria-haspopup]')) parts.trigger.setAttribute('aria-expanded', 'false');
    if (returnFocus && parts.trigger.matches('button, a, [tabindex]')) parts.trigger.focus();
  };
  const closeAll = (except) => {
    document.querySelectorAll(OPEN_MENU).forEach((menu) => {
      if (menu !== except) close(partsOf(menu));
    });
  };
  const open = (parts, at) => {
    closeAll(parts.menu);
    parts.menu.hidden = false;
    if (parts.trigger !== parts.dropdown) parts.trigger.setAttribute('aria-expanded', 'true');
    const items = itemsOf(parts.menu);
    const item = at === 'last' ? items[items.length - 1] : items[0];
    if (item) item.focus();
  };

  const clearSearch = (input) => {
    if (!input) return;
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.focus();
  };

  const closePopover = (wrap, returnFocus) => {
    const pop = wrap && wrap.querySelector(':scope > .popover');
    const trigger = wrap && wrap.querySelector(':scope > [aria-haspopup="dialog"]');
    if (!pop || pop.hidden) return;
    pop.hidden = true;
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'false');
      if (returnFocus) trigger.focus();
    }
  };
  const openPopover = (wrap) => {
    document.querySelectorAll('.popover-wrap > .popover:not([hidden])').forEach((pop) => {
      if (pop.parentElement !== wrap && !pop.contains(wrap)) closePopover(pop.parentElement);
    });
    const pop = wrap.querySelector(':scope > .popover');
    pop.hidden = false;
    wrap.querySelector(':scope > [aria-haspopup="dialog"]').setAttribute('aria-expanded', 'true');
    const first = pop.querySelector('.command-input, input, button, a[href], [tabindex]:not([tabindex="-1"])');
    if (first) first.focus();
  };

  const filterCommand = (input) => {
    const command = input.closest('.command');
    if (!command) return;
    const q = input.value.trim().toLowerCase();
    let shown = 0;
    command.querySelectorAll('.command-item').forEach((item) => {
      const match = !q || item.textContent.toLowerCase().includes(q);
      item.hidden = !match;
      if (match) shown += 1;
    });
    command.querySelectorAll('.command-group').forEach((group) => {
      group.hidden = !group.querySelector('.command-item:not([hidden])');
    });
    const empty = command.querySelector('.command-empty');
    if (empty) empty.hidden = shown > 0;
  };
  document.addEventListener('input', (event) => {
    if (!(event.target instanceof Element)) return;
    if (event.target.matches('.command-input')) filterCommand(event.target);
    if (event.target.matches('.input-otp-slot') && event.target.value) {
      event.target.value = event.target.value.slice(-1);
      const next = event.target.nextElementSibling;
      const slot = next && (next.matches('.input-otp-slot') ? next : next.nextElementSibling);
      if (slot && slot.matches('.input-otp-slot')) slot.focus();
    }
  });
  document.addEventListener('paste', (event) => {
    if (!(event.target instanceof Element) || !event.target.matches('.input-otp-slot')) return;
    const text = (event.clipboardData || window.clipboardData).getData('text').replace(/\s/g, '');
    const slots = [...event.target.closest('.input-otp').querySelectorAll('.input-otp-slot')];
    if (!text) return;
    event.preventDefault();
    slots.forEach((slot, i) => { slot.value = text[i] || ''; });
    (slots[Math.min(text.length, slots.length) - 1] || slots[0]).focus();
  });

  document.addEventListener('contextmenu', (event) => {
    if (!(event.target instanceof Element)) return;
    const area = event.target.closest('[data-context-menu]');
    const menu = area && area.querySelector(':scope > [role="menu"]');
    if (!menu) return;
    event.preventDefault();
    const parts = { dropdown: area, trigger: area, menu };
    open(parts);
    const x = event.clientX || area.getBoundingClientRect().left;
    const y = event.clientY || area.getBoundingClientRect().top;
    menu.style.left = Math.min(x, window.innerWidth - menu.offsetWidth - 8) + 'px';
    menu.style.top = Math.min(y, window.innerHeight - menu.offsetHeight - 8) + 'px';
  });

  const resizeBy = (handle, delta) => {
    const prev = handle.previousElementSibling;
    const box = handle.parentElement.getBoundingClientRect();
    const vertical = handle.parentElement.matches('.resizable-vertical');
    const total = vertical ? box.height : box.width;
    const size = vertical ? prev.getBoundingClientRect().height : prev.getBoundingClientRect().width;
    const next = Math.max(10, Math.min(90, ((size + delta) / total) * 100));
    prev.style.flex = '0 0 ' + next + '%';
    handle.setAttribute('aria-valuenow', String(Math.round(next)));
  };
  document.addEventListener('pointerdown', (event) => {
    if (!(event.target instanceof Element)) return;
    const handle = event.target.closest('.resizable > .resizable-handle');
    if (!handle) return;
    event.preventDefault();
    const vertical = handle.parentElement.matches('.resizable-vertical');
    let last = vertical ? event.clientY : event.clientX;
    const move = (e) => {
      const now = vertical ? e.clientY : e.clientX;
      resizeBy(handle, now - last);
      last = now;
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  });

  const INTERACTIVE = 'a[href], button, input, select, textarea, label, summary, [role="menuitem"], [tabindex]:not([tabindex="-1"])';
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const row = event.target.closest('.table .row-link');
    if (row && !event.target.closest(INTERACTIVE)) {
      const target = row.querySelector('[data-row-target]') || row.querySelector('a[href], button');
      if (target) target.click();
    }
    const clear = event.target.closest('.search .search-clear button');
    if (clear) {
      clearSearch(clear.closest('.search').querySelector('.search-input'));
      return;
    }
    const closeBtn = event.target.closest('dialog .dialog-close');
    if (closeBtn) {
      closeBtn.closest('dialog').close();
      return;
    }
    if (event.target.matches('dialog.dialog[open]:not([role="alertdialog"])')) {
      const r = event.target.getBoundingClientRect();
      const inside = event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom;
      if (!inside && (event.clientX || event.clientY)) { event.target.close(); return; }
    }
    const carouselBtn = event.target.closest('.carousel-prev, .carousel-next');
    if (carouselBtn) {
      const viewport = carouselBtn.closest('.carousel').querySelector('.carousel-viewport');
      const item = viewport && viewport.querySelector('.carousel-item');
      if (viewport && item) {
        const step = item.getBoundingClientRect().width + parseFloat(getComputedStyle(viewport).columnGap || 0);
        viewport.scrollBy({ left: carouselBtn.matches('.carousel-prev') ? -step : step });
      }
      return;
    }
    const comboItem = event.target.closest('.combobox .command-item');
    if (comboItem) {
      const wrap = comboItem.closest('.combobox');
      wrap.querySelectorAll('.command-item[aria-selected="true"]').forEach((i) => i.setAttribute('aria-selected', 'false'));
      comboItem.setAttribute('aria-selected', 'true');
      const label = wrap.querySelector('.combobox-value');
      if (label) label.textContent = comboItem.textContent.trim();
      closePopover(wrap, true);
      return;
    }
    const popTrigger = event.target.closest('.popover-wrap > [aria-haspopup="dialog"]');
    if (popTrigger) {
      const wrap = popTrigger.parentElement;
      if (wrap.querySelector(':scope > .popover').hidden) openPopover(wrap); else closePopover(wrap);
      return;
    }
    document.querySelectorAll('.popover-wrap > .popover:not([hidden])').forEach((pop) => {
      if (!pop.parentElement.contains(event.target)) closePopover(pop.parentElement);
    });
    const trigger = event.target.closest(TRIGGER);
    if (trigger) {
      const parts = partsOf(trigger);
      if (parts.menu.hidden) open(parts); else close(parts);
      return;
    }
    const item = event.target.closest(':is(.dropdown, [data-context-menu]) [role="menuitem"]');
    if (item && !item.matches('[aria-disabled="true"]')) {
      close(partsOf(item), true);
      return;
    }
    document.querySelectorAll(OPEN_MENU).forEach((menu) => {
      const owner = menu.parentElement;
      const outside = owner.matches('[data-context-menu]') ? !menu.contains(event.target) : !owner.contains(event.target);
      if (outside) close(partsOf(menu));
    });
  });

  document.addEventListener('keydown', (event) => {
    if (!(event.target instanceof Element)) return;
    if (event.key === 'Escape' && event.target.matches('.search .search-input') && event.target.value) {
      event.preventDefault();
      clearSearch(event.target);
      return;
    }
    const openPop = event.target.closest('.popover-wrap > .popover:not([hidden])');
    if (event.key === 'Escape' && openPop) {
      event.preventDefault();
      event.stopPropagation();
      closePopover(openPop.parentElement, true);
      return;
    }
    if (event.key === 'Backspace' && event.target.matches('.input-otp-slot') && !event.target.value) {
      let prev = event.target.previousElementSibling;
      if (prev && !prev.matches('.input-otp-slot')) prev = prev.previousElementSibling;
      if (prev && prev.matches('.input-otp-slot')) { event.preventDefault(); prev.value = ''; prev.focus(); }
      return;
    }
    if (event.target.matches('.resizable > .resizable-handle') && /^Arrow/.test(event.key)) {
      event.preventDefault();
      resizeBy(event.target, /Left|Up/.test(event.key) ? -16 : 16);
      return;
    }
    if (event.key === 'F10' && event.shiftKey && event.target.closest('[data-context-menu]')) {
      event.preventDefault();
      event.target.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
      return;
    }
    const trigger = event.target.closest(TRIGGER);
    if (trigger && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault();
      open(partsOf(trigger), event.key === 'ArrowUp' ? 'last' : 'first');
      return;
    }
    const menu = event.target.closest(':is(.dropdown, [data-context-menu]) > [role="menu"]');
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

  window.addEventListener('pageshow', () => {
    closeAll();
    document.querySelectorAll('.popover-wrap > .popover:not([hidden])').forEach((pop) => closePopover(pop.parentElement));
  });
})();
