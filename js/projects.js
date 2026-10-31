const rail = document.querySelector(".project-rail");
const stories = [...document.querySelectorAll(".project-story")];
const menuLinks = [...document.querySelectorAll("[data-project-link]")];
const desktop = matchMedia("(min-width: 721px)");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const behavior = () => (reducedMotion.matches ? "instant" : "smooth");
if (rail && stories.length) {
  let activeStory;
  function select(story, updateUrl = true) {
    if (activeStory === story) return;
    activeStory = story;
    menuLinks.forEach((link) =>
      link.setAttribute(
        "aria-current",
        String(link.dataset.projectLink === story.dataset.project),
      ),
    );
    document.querySelector(".project-position").textContent =
      `${story.querySelector("h1").textContent.replace("↗", "").trim()} / ${stories.indexOf(story) + 1} of ${stories.length}`;
    if (updateUrl) {
      const url = new URL(location.href);
      url.searchParams.set("project", story.dataset.project);
      url.hash = "";
      history.replaceState(null, "", url);
    }
  }
  function goTo(story) {
    if (desktop.matches)
      rail.scrollTo({
        left: story.offsetLeft - parseFloat(getComputedStyle(rail).paddingLeft),
        behavior: "instant",
      });
    else story.scrollIntoView({ behavior: "instant", block: "start" });
    select(story);
    [...story.querySelectorAll("img")].slice(0, 2).forEach((image) => {
      image.loading = "eager";
    });
  }
  const initial =
    new URL(location.href).searchParams.get("project") ||
    location.hash.replace("#project-", "");
  goTo(
    stories.find((story) => story.dataset.project === initial) || stories[0],
  );
  menuLinks.forEach((link) =>
    link.addEventListener("click", (event) => {
      const story = stories.find(
        (story) => story.dataset.project === link.dataset.projectLink,
      );
      if (story) {
        event.preventDefault();
        goTo(story);
      }
    }),
  );
  rail.addEventListener(
    "wheel",
    (event) => {
      if (
        !desktop.matches ||
        event.ctrlKey ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
      )
        return;
      const copy = event.target.closest(".project-copy");
      if (
        copy &&
        copy.scrollHeight > copy.clientHeight + 1 &&
        ((event.deltaY > 0 &&
          copy.scrollTop + copy.clientHeight < copy.scrollHeight - 1) ||
          (event.deltaY < 0 && copy.scrollTop > 0))
      )
        return;
      const delta =
        event.deltaY *
        (event.deltaMode === 1
          ? 20
          : event.deltaMode === 2
            ? rail.clientWidth
            : 1);
      rail.scrollLeft += delta;
      event.preventDefault();
    },
    { passive: false },
  );
  function step(direction) {
    if (desktop.matches)
      rail.scrollBy({
        left: direction * Math.min(innerWidth * 0.65, 800),
        behavior: behavior(),
      });
  }
  document.querySelector(".project-navigation").hidden = false;
  document
    .querySelectorAll("[data-direction]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        step(Number(button.dataset.direction)),
      ),
    );
  rail.addEventListener("keydown", (event) => {
    if (event.target !== rail) return;
    if (["ArrowRight", "ArrowLeft"].includes(event.key)) {
      event.preventDefault();
      step(event.key === "ArrowRight" ? 1 : -1);
    }
  });
  let timer;
  function trackProject() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const position = desktop.matches
        ? rail.scrollLeft + innerWidth * 0.4
        : window.scrollY + innerHeight * 0.3;
      const current =
        [...stories]
          .reverse()
          .find(
            (story) =>
              (desktop.matches ? story.offsetLeft : story.offsetTop) <=
              position,
          ) || stories[0];
      select(current);
    }, 150);
  }
  rail.addEventListener("scroll", trackProject, { passive: true });
  window.addEventListener(
    "scroll",
    () => {
      if (!desktop.matches) trackProject();
    },
    { passive: true },
  );
  desktop.addEventListener("change", () =>
    goTo(
      stories.find(
        (story) =>
          story.dataset.project ===
          new URL(location.href).searchParams.get("project"),
      ) || stories[0],
    ),
  );
}
