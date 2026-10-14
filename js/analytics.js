// PostHog project key (phc_…) and region host. Analytics stays off until the key is set.
const POSTHOG_KEY = 'phc_Ae5J8ADcAUxcu2nuQzcZng8WCy2EDk4DrGdT24EJbmiu';
const POSTHOG_HOST = 'https://us.i.posthog.com';
// Only the production site is tracked, so previews and mirror deploys don't skew the data.
const TRACKED_HOSTS = ['cadarastudio.com', 'www.cadarastudio.com'];

function setupAnalytics() {
  if (!POSTHOG_KEY || !TRACKED_HOSTS.includes(window.location.hostname)) return;

  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],Object.defineProperty(u,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e}}),Object.defineProperty(u.people,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(){return u.toString(1)+".people (stub)"}}),o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
  window.posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    defaults: '2026-05-30',
    person_profiles: 'identified_only',
  });

  const page = window.location.pathname.replace(/\.html$/, '').replace(/\/index$/, '/') || '/';
  const caseMatch = page.match(/^\/cases\/([a-z0-9-]+)$/);
  const caseSlug = caseMatch && !['work', 'offer'].includes(caseMatch[1]) ? caseMatch[1] : null;

  // Named events for the questions autocapture can't answer cleanly.
  document.addEventListener('click', (event) => {
    const share = event.target.closest('[data-share]');
    if (share) {
      window.posthog.capture('insight_shared', { page, channel: share.dataset.share });
      return;
    }
    const link = event.target.closest('a[href], .case-card');
    if (!link) return;
    const href = link.getAttribute('href') || '';

    if (href.startsWith('mailto:')) {
      window.posthog.capture('contact_clicked', { page, location: link.closest('header, .mobile-menu-panel') ? 'nav' : link.closest('footer') ? 'footer' : 'page' });
    } else if (link.classList.contains('case-card')) {
      window.posthog.capture('case_card_clicked', { page, case: link.querySelector('.case-meta h3')?.textContent.trim(), coming_soon: link.classList.contains('case-card--soon') });
    } else if (link.classList.contains('insight-card')) {
      window.posthog.capture('insight_card_clicked', { page, insight: href.replace(/^\/insights\/|\.html$/g, ''), category: link.dataset.category });
    } else if (link.classList.contains('case-visit')) {
      window.posthog.capture('company_site_clicked', { case: caseSlug, url: href });
    }
  }, true);

  if (caseSlug) {
    const reached = new Set();
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const percent = (window.scrollY / scrollable) * 100;
      [25, 50, 75, 100].forEach((mark) => {
        if (percent >= mark - 1 && !reached.has(mark)) {
          reached.add(mark);
          window.posthog.capture('case_scroll_depth', { case: caseSlug, percent: mark });
        }
      });
      if (reached.size === 4) window.removeEventListener('scroll', onScroll);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }
}

setupAnalytics();
