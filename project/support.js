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
