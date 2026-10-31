const rail = document.querySelector(".project-rail");
const stories = [...document.querySelectorAll(".project-story")];
const projectLinks = [...document.querySelectorAll("[data-project-link]")];
const desktop = matchMedia("(min-width: 721px)");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const behavior = () => (reducedMotion.matches ? "instant" : "smooth");
if (rail && stories.length) {
  let activeStory;
  function select(story, updateUrl = true) {
    if (activeStory === story) return;
    activeStory = story;
    projectLinks.forEach((link) =>
      link.setAttribute(
        "aria-current",
        String(link.dataset.projectLink === story.dataset.project),
      ),
    );
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
  projectLinks.forEach((link) =>
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

const dock = document.querySelector(".project-dock");
if (dock) {
  const icons = [...dock.querySelectorAll(".project-dock-link")];
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  function resetMagnifier() {
    icons.forEach((icon) => icon.style.removeProperty("--dock-scale"));
  }
  function magnify(clientX) {
    if (reducedMotion.matches) return resetMagnifier();
    const rect = dock.getBoundingClientRect();
    const style = getComputedStyle(dock);
    const size = parseFloat(style.getPropertyValue("--dock-icon-size"));
    const gap = parseFloat(style.columnGap);
    icons.forEach((icon, index) => {
      const center =
        rect.left +
        rect.width / 2 +
        (index - (icons.length - 1) / 2) * (size + gap);
      const influence = Math.max(0, 1 - Math.abs(clientX - center) / 120);
      icon.style.setProperty(
        "--dock-scale",
        String(1 + 0.65 * influence * influence),
      );
    });
  }
  dock.addEventListener("pointermove", (event) => {
    if (finePointer.matches && event.pointerType !== "touch")
      magnify(event.clientX);
  });
  dock.addEventListener("pointerleave", () => {
    const focused = icons.find((icon) => icon === document.activeElement);
    if (focused) {
      const rect = focused.getBoundingClientRect();
      magnify(rect.left + rect.width / 2);
    } else resetMagnifier();
  });
  icons.forEach((icon) =>
    icon.addEventListener("focus", () => {
      if (!finePointer.matches) return;
      const rect = icon.getBoundingClientRect();
      magnify(rect.left + rect.width / 2);
    }),
  );
  dock.addEventListener("focusout", (event) => {
    if (!dock.contains(event.relatedTarget)) resetMagnifier();
  });
  reducedMotion.addEventListener("change", resetMagnifier);
  finePointer.addEventListener("change", resetMagnifier);
}
