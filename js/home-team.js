document.querySelectorAll('.team-card').forEach(card => {
  const front = card.querySelector('.team-card-front');
  const back = card.querySelector('.team-card-back');
  const returnButton = card.querySelector('.team-card-return');
  const linkedin = card.querySelector('.team-linkedin');
  if (!front || !back || !returnButton) return;
  const flip = showValue => {
    card.classList.toggle('is-flipped', showValue);
    front.setAttribute('aria-expanded', String(showValue));
    front.setAttribute('aria-hidden', String(showValue));
    back.setAttribute('aria-hidden', String(!showValue));
    front.inert = showValue;
    back.inert = !showValue;
    if (linkedin) linkedin.hidden = showValue;
    (showValue ? returnButton : front).focus({preventScroll: true});
    card.dispatchEvent(new Event('teamflip'));
  };
  front.addEventListener('click', () => flip(true));
  returnButton.addEventListener('click', () => flip(false));
  card.addEventListener('keydown', event => {
    if (event.key === 'Escape' && card.classList.contains('is-flipped')) {
      event.preventDefault();
      flip(false);
    }
  });
});

// Start with Ahmad centered on mobile, and retain native swipe/scroll behavior.
const teamRail = document.querySelector('.home-team-panels');
if (teamRail) {
  const mobileTeam = matchMedia('(max-width: 720px)');
  const centerTeam = () => {
    if (!mobileTeam.matches) { teamRail.scrollLeft = 0; return; }
    const card = teamRail.children[1];
    if (card) teamRail.scrollLeft = card.offsetLeft - teamRail.offsetLeft - (teamRail.clientWidth - card.offsetWidth) / 2;
  };
  centerTeam();
  mobileTeam.addEventListener('change', centerTeam);
}
