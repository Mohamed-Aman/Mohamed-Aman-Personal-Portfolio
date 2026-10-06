/**
 * Portfolio Interactive Systems & Theme Engine for Mohamed Aman
 * Clean Modern Dual-Theme (Light / Dark), Project Showcase, Modal Case Studies
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeEngine();
  initBackgroundParticles();
  initNavbarScroll();
  initProjectsShowcase();
  initProjectModal();
  initContactForm();
  initEmailCopy();
  initSmoothScroll();
});

/* ==========================================================================
   1. CLEAN DUAL-THEME ENGINE (Dark / Light Mode)
   ========================================================================== */
function initThemeEngine() {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const metaColorScheme = document.querySelector('meta[name="color-scheme"]');

  // Determine initial theme: localStorage -> system preference -> fallback dark
  const storedTheme = localStorage.getItem('portfolio-theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let currentTheme = storedTheme || (systemPrefersDark ? 'dark' : 'light');

  applyTheme(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('portfolio-theme', currentTheme);
      applyTheme(currentTheme);
    });
  }

  // Listen to OS system preference changes if no manual preference stored
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('portfolio-theme')) {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      applyTheme(newSystemTheme);
    }
  });

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (metaColorScheme) {
      metaColorScheme.content = theme;
    }

    if (themeToggleBtn) {
      if (theme === 'dark') {
        themeToggleBtn.innerHTML = '☀️';
        themeToggleBtn.setAttribute('title', 'Switch to Clean Light Mode');
        themeToggleBtn.setAttribute('aria-label', 'Switch to Clean Light Mode');
      } else {
        themeToggleBtn.innerHTML = '🌙';
        themeToggleBtn.setAttribute('title', 'Switch to Dark Mode');
        themeToggleBtn.setAttribute('aria-label', 'Switch to Dark Mode');
      }
    }

    // Notify canvas of theme change if active
    if (window.onPortfolioThemeChange) {
      window.onPortfolioThemeChange(theme);
    }
  }
}

/* ==========================================================================
   2. SUBTLE BACKGROUND PARTICLES
   ========================================================================== */
function initBackgroundParticles() {
  const canvas = document.getElementById('bg-particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const particles = [];
  const particleCount = Math.min(Math.floor((width * height) / 24000), 45);

  let currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.15
    });
  }

  window.onPortfolioThemeChange = (newTheme) => {
    currentTheme = newTheme;
  };

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  function render() {
    ctx.clearRect(0, 0, width, height);

    const baseColor = currentTheme === 'light' ? '2, 132, 199' : '56, 189, 248';

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${baseColor}, ${p.alpha})`;
      ctx.fill();

      // Connect nearby particles lightly
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(${baseColor}, ${(1 - dist / 100) * 0.08})`;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(render);
  }

  render();
}

/* ==========================================================================
   3. NAVBAR SCROLL & MOBILE MENU
   ========================================================================== */
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  const navLinks = document.getElementById('nav-links');
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const links = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Scroll spy
    let currentId = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    links.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });

  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-active');
      mobileBtn.innerHTML = navLinks.classList.contains('mobile-active') ? '✕' : '☰';
    });

    // Close menu when clicking link
    links.forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-active');
        mobileBtn.innerHTML = '☰';
      });
    });
  }
}

/* ==========================================================================
   4. DYNAMIC PROJECTS SHOWCASE & FILTERING
   ========================================================================== */
function initProjectsShowcase() {
  const grid = document.getElementById('projects-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');

  if (!grid || typeof portfolioProjects === 'undefined') return;

  function renderProjects(filter = 'all') {
    grid.innerHTML = '';

    const filtered = filter === 'all'
      ? portfolioProjects
      : portfolioProjects.filter((p) => p.category === filter);

    filtered.forEach((p) => {
      const card = document.createElement('article');
      card.className = 'project-card';
      card.setAttribute('data-id', p.id);

      const tagsHtml = p.tags
        .slice(0, 4)
        .map((tag) => `<span class="project-tag">${tag}</span>`)
        .join('');

      let livePlayBtn = '';
      if (p.links && p.links.playUrl) {
        livePlayBtn = `
          <a href="${p.links.playUrl}" target="_blank" rel="noopener" class="btn-card-link" title="Play Game Live">
            <span>Play</span> ↗
          </a>`;
      }

      card.innerHTML = `
        <div class="project-media-wrapper">
          <img src="${p.thumbnail}" alt="${p.title} Preview" class="project-thumbnail" loading="lazy" />
          <span class="project-badge-pill">${p.badge}</span>
        </div>
        <div class="project-body">
          <h3 class="project-title">${p.title}</h3>
          <div class="project-subtitle">${p.subtitle}</div>
          <p class="project-desc">${p.shortDesc}</p>
          <div class="project-tags">${tagsHtml}</div>
          <div class="project-actions">
            <button class="btn-card-primary" onclick="openProjectModal('${p.id}')">
              <span>View Case Study</span> →
            </button>
            ${livePlayBtn}
          </div>
        </div>
      `;

      grid.appendChild(card);
    });
  }

  // Initial render
  renderProjects('all');

  // Filter button click events
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderProjects(btn.getAttribute('data-filter'));
    });
  });
}

/* ==========================================================================
   5. CASE STUDY MODAL SYSTEM
   ========================================================================== */
function initProjectModal() {
  const modal = document.getElementById('project-modal');
  const closeBtn = document.getElementById('modal-close-btn');

  if (!modal) return;

  // Global open helper
  window.openProjectModal = function (projectId) {
    if (typeof portfolioProjects === 'undefined') return;
    const project = portfolioProjects.find((p) => p.id === projectId);
    if (!project) return;

    document.getElementById('modal-title').textContent = project.title;
    document.getElementById('modal-subtitle').textContent = project.subtitle;
    document.getElementById('modal-role').textContent = project.role;
    document.getElementById('modal-team').textContent = project.teamSize;
    document.getElementById('modal-duration').textContent = project.duration;
    document.getElementById('modal-overview').textContent = project.overview;

    // Highlights list
    const highlightsUl = document.getElementById('modal-highlights');
    highlightsUl.innerHTML = project.highlights
      .map((item) => `<li>${item}</li>`)
      .join('');

    // Technical deep dive
    const deepdiveSection = document.getElementById('modal-deepdive-section');
    if (project.technicalDeepDive) {
      deepdiveSection.style.display = 'block';
      document.getElementById('modal-deepdive-heading').textContent = project.technicalDeepDive.heading;
      document.getElementById('modal-deepdive-text').textContent = project.technicalDeepDive.explanation;
      document.getElementById('modal-code-snippet').textContent = project.technicalDeepDive.codeSnippet;
    } else {
      deepdiveSection.style.display = 'none';
    }

    // Modal Action Links
    const linksGroup = document.getElementById('modal-links-group');
    linksGroup.innerHTML = '';

    if (project.links) {
      if (project.links.playUrl) {
        linksGroup.innerHTML += `
          <a href="${project.links.playUrl}" target="_blank" rel="noopener" class="btn btn-primary">
            <span>Play Online Now</span> ↗
          </a>`;
      }
      if (project.links.github) {
        linksGroup.innerHTML += `
          <a href="${project.links.github}" target="_blank" rel="noopener" class="btn btn-secondary">
            <span>Source Code</span> 🐙
          </a>`;
      }
      if (project.links.itch) {
        linksGroup.innerHTML += `
          <a href="${project.links.itch}" target="_blank" rel="noopener" class="btn btn-secondary">
            <span>Itch.io Page</span> 👾
          </a>`;
      }
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // Light dismiss: Close on clicking backdrop
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   6. CONTACT FORM & DIRECT COPY
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    submitBtn.innerHTML = '<span>Message Sent! ✓</span>';
    submitBtn.style.backgroundColor = '#10b981';
    submitBtn.disabled = true;

    setTimeout(() => {
      form.reset();
      submitBtn.innerHTML = originalText;
      submitBtn.style.backgroundColor = '';
      submitBtn.disabled = false;
    }, 3000);
  });
}

function initEmailCopy() {
  const copyBtn = document.getElementById('copy-email-btn');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', () => {
    const email = 'amanami8339@gmail.com';
    navigator.clipboard.writeText(email).then(() => {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copied! ✓';
      copyBtn.style.backgroundColor = '#10b981';

      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.backgroundColor = '';
      }, 2000);
    });
  });
}

/* ==========================================================================
   7. SMOOTH SCROLL HELPER
   ========================================================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}
