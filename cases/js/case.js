function setupCaseNextCursor() {
  const blocks = document.querySelectorAll('.case-next');
  if (!blocks.length) return;

  const finePointer = window.matchMedia('(pointer: fine) and (min-width: 901px)');

  blocks.forEach((block) => {
    const label = block.querySelector('.case-next-link');
    if (!label) return;

    function moveLabel(event) {
      const rect = block.getBoundingClientRect();
      label.style.left = `${event.clientX - rect.left}px`;
      label.style.top = `${event.clientY - rect.top}px`;
    }

    function activate(event) {
      if (!finePointer.matches) return;
      block.classList.add('is-active');
      moveLabel(event);
    }

    function deactivate() {
      block.classList.remove('is-active');
    }

    block.addEventListener('mouseenter', activate);
    block.addEventListener('mousemove', moveLabel);
    block.addEventListener('mouseleave', deactivate);
  });
}

setupCaseNextCursor();
