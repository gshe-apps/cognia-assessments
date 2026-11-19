// Local compatibility runtime for the exported Design Canvas templates.
window.DCLogic = class {
  state = {};
  props = {};
  setState(patch) {
    Object.assign(this.state, typeof patch === 'function' ? patch(this.state) : patch);
    this.update();
  }
};
// Keep the raw template (with its dialogs and menus) out of sight until the first render, so no modal flashes on load.
(() => {
  const hide = document.createElement('style');
  hide.textContent = 'x-dc:not([data-rendered]){visibility:hidden}';
  document.head.append(hide);
  // Never leave a page blank if rendering fails.
  setTimeout(() => document.querySelectorAll('x-dc').forEach(el => el.setAttribute('data-rendered', '')), 3000);
})();
document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('x-dc');
  const script = document.querySelector('script[data-dc-script]');
  if (!root || !script) return;
  const style = document.createElement('style');
  style.textContent = 'x-dc,sc-if,sc-for{display:contents} [hidden]{display:none!important}';
  document.head.append(style);
  const template = root.cloneNode(true);
  const Component = new Function(script.textContent + '\nreturn Component;')();
  const instance = new Component();
  const defs = JSON.parse(script.getAttribute('data-props') || '{}');
  instance.props = Object.fromEntries(Object.entries(defs).map(([key,v]) => [key, v.default ?? v]));
  const evaluate = (expression, vals) => {
    try { return new Function('v', 'with(v){return (' + expression + ')}')(vals); }
    catch { return undefined; }
  };
  const interpolate = (text, vals) => text.replace(/{{([\s\S]*?)}}/g, (_, expr) => evaluate(expr, vals) ?? '');
  function bind(node, vals) {
    if (node.nodeType === 3) { node.textContent = interpolate(node.textContent, vals); return; }
    if (node.nodeType !== 1) return;
    if (node.localName === 'sc-for') {
      const expr = (node.getAttribute('list') || '').replace(/^{{|}}$/g, '');
      const list = evaluate(expr, vals) || [];
      const name = node.getAttribute('as') || 'item';
      const children = [...node.childNodes];
      node.replaceChildren();
      list.forEach((item, index) => children.forEach(child => {
        const copy = child.cloneNode(true);
        bind(copy, {...vals, [name]: item, $index: index}); node.append(copy);
      }));
      return;
    }
    if (node.localName === 'sc-if') {
      const expr = (node.getAttribute('value') || '').replace(/^{{|}}$/g, '');
      if (!evaluate(expr, vals)) { node.remove(); return; }
    }
    for (const attr of [...node.attributes]) {
      if (!attr.value.includes('{{')) continue;
      if (attr.name.startsWith('on')) {
        const fn = evaluate(attr.value.replace(/^{{|}}$/g, ''), vals);
        node.removeAttribute(attr.name);
        if (typeof fn === 'function') { const type = attr.name.slice(2).toLowerCase(); node.addEventListener(type, fn); (node.__dcH = node.__dcH || []).push([type, fn]); }
      } else if (['checked','disabled','selected','hidden'].includes(attr.name)) {
        const value = evaluate(attr.value.replace(/^{{|}}$/g, ''), vals);
        node.toggleAttribute(attr.name, !!value); node[attr.name] = !!value;
      } else {
        const value = interpolate(attr.value, vals); node.setAttribute(attr.name, value);
        if (attr.name === 'value') node.value = value;
      }
    }
    [...node.childNodes].forEach(child => bind(child, vals));
  }
  const same = (a, b) => a.nodeType === b.nodeType && (a.nodeType !== 1 || a.localName === b.localName);
  function morphNode(from, to) {
    if (from.nodeType !== 1) { if (from.nodeValue !== to.nodeValue) from.nodeValue = to.nodeValue; return; }
    for (const a of [...from.attributes]) if (!to.hasAttribute(a.name)) from.removeAttribute(a.name);
    for (const a of [...to.attributes]) if (from.getAttribute(a.name) !== a.value) from.setAttribute(a.name, a.value);
    for (const prop of ['value', 'checked', 'disabled', 'selected']) if (prop in to && from[prop] !== to[prop]) from[prop] = to[prop];
    (from.__dcH || []).forEach(([type, fn]) => from.removeEventListener(type, fn));
    (to.__dcH || []).forEach(([type, fn]) => from.addEventListener(type, fn));
    from.__dcH = to.__dcH || [];
    morphChildren(from, to);
  }
  function morphChildren(from, to) {
    const before = [...from.childNodes], after = [...to.childNodes];
    after.forEach((next, i) => {
      const prev = before[i];
      if (prev && same(prev, next)) morphNode(prev, next);
      else if (prev) from.replaceChild(next, prev);
      else from.appendChild(next);
    });
    before.slice(after.length).forEach(node => node.remove());
  }
  instance.update = () => {
    const active = document.activeElement;
    const id = active?.id;
    const selection = active?.selectionStart;
    const copy = template.cloneNode(true);
    bind(copy, instance.renderVals?.() || {});
    // Screens marked data-morph keep their existing elements and only patch what changed, so CSS
    // transitions (sliding cards, crossfading rooms, opening rows) can run between states.
    if (root.hasAttribute('data-morph') && root.__dcRendered) morphChildren(root, copy);
    else root.replaceChildren(...copy.childNodes);
    root.__dcRendered = true;
    if (id) {
      const next = document.getElementById(id);
      next?.focus({preventScroll:true});
      try { if (selection != null) next.setSelectionRange(selection, selection); } catch {}
    }
  };
  instance.update();
  root.setAttribute('data-rendered', '');
  window.cogniaPreview = instance;
});

// 19 Nov: the "·" to grey "|" swap is gone. The plugin forbids dot or pipe separators between content, so
// screens use badges, right-aligned values, subtext above the title or separate lines instead.
(() => {
  // 12 Nov: the educator flow says "learner", not "student". Screens that load educator.css swap the word
  // (case kept) in rendered text and in placeholder, aria-label, title and data-tip. The role switcher and
  // the hub window keep "Student", since they name the student persona and match the admin flow.
  let LEARNERS = false;   // set once the page's stylesheets are known (support.js loads before them)
  const KEEP = 'script,style,textarea,[contenteditable],.rolemodal,.rolelist,.appdlg,.appmodal';
  const WORD = /\b([Ss])tudent(s?)\b/g;
  const learner = (t) => t.replace(WORD, (m, s1, pl) => (s1 === 'S' ? 'L' : 'l') + 'earner' + pl);
  const ATTRS = ['placeholder', 'aria-label', 'title', 'data-tip'];
  const fixAttrs = (el) => {
    if (!LEARNERS || el.nodeType !== 1 || el.closest(KEEP)) return;
    ATTRS.forEach((a) => { const v = el.getAttribute(a); if (v && WORD.test(v)) { WORD.lastIndex = 0; el.setAttribute(a, learner(v)); } WORD.lastIndex = 0; });
  };
  const fix = (node) => {
    if (LEARNERS && node.nodeValue && /[Ss]tudent/.test(node.nodeValue) && node.parentElement && !node.parentElement.closest(KEEP)) {
      const next = learner(node.nodeValue);
      if (next !== node.nodeValue) node.nodeValue = next;
    }
  };
  const scan = (root) => {
    if (root.nodeType === 3) { fix(root); return; }
    if (root.nodeType !== 1) return;
    if (LEARNERS) { fixAttrs(root); root.querySelectorAll('[placeholder],[aria-label],[title],[data-tip]').forEach(fixAttrs); }
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (LEARNERS && /[Ss]tudent/.test(n.nodeValue)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT });
    const found = []; while (walk.nextNode()) found.push(walk.currentNode);
    found.forEach(fix);
  };
  const start = () => {
    LEARNERS = !!document.querySelector('link[href*="educator.css"]');
    scan(document.body);
    new MutationObserver((list) => list.forEach((m) => {
      if (m.type === 'characterData') fix(m.target);
      else if (m.type === 'attributes') fixAttrs(m.target);
      else m.addedNodes.forEach(scan);
    })).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: LEARNERS, attributeFilter: LEARNERS ? ATTRS : undefined });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
