// Keep existing project links and bookmarks working with the vertical case studies.
const requestedProject = new URL(location.href).searchParams.get('project') || location.hash.replace('#project-', '');
const selectedProject = [...document.querySelectorAll('[data-project]')].find(story => story.dataset.project === requestedProject)
  || document.querySelector('[data-project]');
if (selectedProject) location.replace(`/cases/${encodeURIComponent(selectedProject.dataset.project)}`);
