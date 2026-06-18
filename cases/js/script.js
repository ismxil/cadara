
// Get DOM elements
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const overlay = document.getElementById('overlay');
const mobileMenuLinks = document.querySelectorAll('.mobile-menu a');

// Toggle menu function
function toggleMenu() {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('active');
  overlay.classList.toggle('active');
  
  // Prevent body scrolling when menu is open
  if (mobileMenu.classList.contains('active')) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }
}

// Close menu function
function closeMenu() {
  hamburger.classList.remove('active');
  mobileMenu.classList.remove('active');
  overlay.classList.remove('active');
  document.body.style.overflow = 'auto';
}

// Event listeners
hamburger.addEventListener('click', toggleMenu);
overlay.addEventListener('click', closeMenu);

// Close menu when clicking on a link
mobileMenuLinks.forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Close menu when pressing Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
    closeMenu();
  }
});

// Handle window resize
window.addEventListener('resize', () => {
  if (window.innerWidth > 768 && mobileMenu.classList.contains('active')) {
    closeMenu();
  }
});

// Heading scroll animation
(function () {
  const headings = document.querySelectorAll('h3, h2, .section-heading');
  const vp = window.innerHeight;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      const el = entry.target;
      if (entry.isIntersecting) {
        el.classList.add('h-in');
        el.classList.remove('h-below', 'h-past');
      } else if (entry.boundingClientRect.top < 0) {
        el.classList.add('h-past');
        el.classList.remove('h-in', 'h-below');
      } else {
        el.classList.add('h-below');
        el.classList.remove('h-in', 'h-past');
      }
    });
  }, { threshold: 0.15 });

  headings.forEach(function (el) {
    const rect = el.getBoundingClientRect();
    if (rect.top < vp && rect.bottom > 0) {
      el.classList.add('h-in');
    }
    observer.observe(el);
  });
})();

// Smooth scrolling for anchor links (optional enhancement)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});



// // Toggle mobile menu
// document.addEventListener('DOMContentLoaded', function () {
//   const toggleButton = document.querySelector('.nav .mobile-menu-toggle');
//   const mobileMenu = document.querySelector('.nav .mobile-menu-items');

//   toggleButton.addEventListener('click', function () {
//     mobileMenu.classList.toggle('active');
//   });
  
// });