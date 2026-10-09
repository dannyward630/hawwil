/* Interaction effects: sticky glass header, scroll reveal, card tilt + spotlight, button ripple. */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

let io;
export function reveal(root = document) {
  const els = [...root.querySelectorAll('.rv:not(.in)')];
  if (reduce || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  io = io || new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  els.forEach(e => io.observe(e));
}

export function initFX() {
  const top = document.getElementById('top');
  const onScroll = () => top && top.classList.toggle('scrolled', scrollY > 6);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  if (!reduce && fine) {
    let raf = 0, cur = null;
    document.addEventListener('pointermove', e => {
      const el = e.target.closest && e.target.closest('[data-tilt]');
      if (cur && cur !== el) reset(cur);
      cur = el;
      if (!el) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        el.style.setProperty('--ry', ((x - 0.5) * 9).toFixed(2) + 'deg');
        el.style.setProperty('--rx', ((0.5 - y) * 9).toFixed(2) + 'deg');
        el.classList.add('tilting');
      });
    }, { passive: true });
    document.addEventListener('pointerleave', () => cur && reset(cur), true);
    function reset(el) { el.classList.remove('tilting'); el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); }
  }

  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('.btn:not(:disabled), .chip, .tabs button');
    if (!b || reduce) return;
    const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2;
    const s = document.createElement('span');
    s.className = 'ripple';
    s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
    b.append(s);
    setTimeout(() => s.remove(), 650);
  });
}
