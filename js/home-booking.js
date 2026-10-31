(() => {
  const link = document.querySelector('.home-booking');
  if (!link) return;
  let loading, opening = false;

  function loadCalendar() {
    if (loading) return loading;
    loading = new Promise((resolve, reject) => {
      // Cal's embed processes this instruction queue when its script is ready.
      if (!window.Cal) {
        const cal = (...args) => cal.q.push(args);
        cal.q = [];
        cal.ns = {};
        window.Cal = cal;
        cal('init', {calOrigin: 'https://app.cal.com'});
      }
      const script = document.createElement('script');
      script.src = 'https://app.cal.com/embed/embed.js';
      script.async = true;
      script.onload = () => resolve(window.Cal);
      script.onerror = () => {
        loading = null;
        script.remove();
        reject(new Error('Booking calendar could not load'));
      };
      document.head.appendChild(script);
    });
    return loading;
  }

  // Warm up the embed near the footer, while keeping the regular link as fallback.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      loadCalendar().catch(() => {});
    }, {rootMargin: '400px'});
    observer.observe(link);
  }

  link.addEventListener('click', async (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (opening) return;
    opening = true;
    link.setAttribute('aria-busy', 'true');
    try {
      const cal = await loadCalendar();
      cal('modal', {
        calLink: 'cadara/intro',
        config: {theme: 'light', layout: 'month_view'},
      });
    } catch {
      location.assign(link.href);
    } finally {
      opening = false;
      link.removeAttribute('aria-busy');
    }
  });
})();
