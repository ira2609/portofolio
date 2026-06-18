document.addEventListener('DOMContentLoaded', () => {
  const GITHUB_USER = 'ira2609';

  // --- Custom Cursor ---
  const customCursor = document.getElementById('customCursor');
  const trails = [
    document.getElementById('trail1'),
    document.getElementById('trail2'),
    document.getElementById('trail3'),
    document.getElementById('trail4'),
    document.getElementById('trail5')
  ].filter(Boolean);

  if (customCursor) {
    let lastX = 0, lastY = 0, currentAngle = 0, targetAngle = 0;
    let rafId = null;
    let cx = 0, cy = 0;
    let tx = [0, 0, 0, 0, 0], ty = [0, 0, 0, 0, 0];
    let lastMoveTime = performance.now();
    let isIdle = false;
    let orbitAngle = 0;
    const IDLE_THRESHOLD = 300;

    const orbits = [
      { radius: 20, speed: 0.025, phase: 0 },
      { radius: 32, speed: -0.018, phase: 1.3 },
      { radius: 44, speed: 0.015, phase: 2.6 },
      { radius: 28, speed: -0.022, phase: 3.9 },
      { radius: 38, speed: 0.02, phase: 5.2 }
    ];

    customCursor.style.display = 'block';

    document.addEventListener('mousemove', (e) => {
      const deltaX = e.clientX - lastX;
      const deltaY = e.clientY - lastY;

      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        targetAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      }

      cx = e.clientX;
      cy = e.clientY;
      customCursor.style.left = cx + 'px';
      customCursor.style.top = cy + 'px';
      lastX = cx;
      lastY = cy;
      lastMoveTime = performance.now();
      if (isIdle) {
        isIdle = false;
        trails.forEach((t, i) => {
          if (!t) return;
          tx[i] = cx;
          ty[i] = cy;
        });
      }
      if (!rafId) rafId = requestAnimationFrame(tick);
    });

    function tick() {
      if (isIdle) {
        const idleDiff = (0 - currentAngle);
        const shortest = ((idleDiff % 360) + 540) % 360 - 180;
        currentAngle += shortest * 0.05;
        customCursor.style.transform = `translate(-50%, -50%) rotate(${currentAngle}deg)`;

        orbitAngle += 0.016;
        trails.forEach((t, i) => {
          if (!t) return;
          const o = orbits[i];
          const a = orbitAngle * o.speed + o.phase;
          tx[i] = cx + Math.cos(a) * o.radius;
          ty[i] = cy + Math.sin(a) * o.radius;
          t.style.left = tx[i] + 'px';
          t.style.top = ty[i] + 'px';
        });
      } else {
        let diff = targetAngle - currentAngle;
        diff = ((diff % 360) + 540) % 360 - 180;
        currentAngle += diff * 0.1;
        customCursor.style.transform = `translate(-50%, -50%) rotate(${currentAngle}deg)`;

        trails.forEach((t, i) => {
          if (!t) return;
          const targetX = i === 0 ? cx : tx[i - 1];
          const targetY = i === 0 ? cy : ty[i - 1];
          tx[i] += (targetX - tx[i]) * 0.12;
          ty[i] += (targetY - ty[i]) * 0.12;
          t.style.left = tx[i] + 'px';
          t.style.top = ty[i] + 'px';
        });
      }

      if (!isIdle && performance.now() - lastMoveTime > IDLE_THRESHOLD) {
        isIdle = true;
        orbitAngle = 0;
      }

      rafId = requestAnimationFrame(tick);
    }

    document.addEventListener('mouseleave', () => {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      customCursor.style.display = 'none';
      trails.forEach(t => { if (t) t.style.display = 'none'; });
    });

    document.addEventListener('mouseenter', () => {
      customCursor.style.display = 'block';
      trails.forEach((t, i) => {
        if (!t) return;
        t.style.display = 'block';
        tx[i] = cx;
        ty[i] = cy;
      });
    });
  }

  // --- Mobile Nav Toggle ---
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }

  // --- Navbar Active Link ---
  const sections = document.querySelectorAll('section[id]');
  const navLinkItems = document.querySelectorAll('.nav-link');

  function updateNavIndicator() {
    const indicator = document.getElementById('navIndicator');
    const activeLink = document.querySelector('.nav-link.active');
    const navLinks = document.getElementById('navLinks');
    if (!indicator || !activeLink || !navLinks || window.innerWidth < 769) return;

    const linkRect = activeLink.getBoundingClientRect();
    const containerRect = navLinks.getBoundingClientRect();

    indicator.style.width = linkRect.width + 'px';
    indicator.style.transform = `translateX(${linkRect.left - containerRect.left}px) translateY(-50%)`;
  }

  function updateActiveLink() {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 150;
      const bottom = top + section.offsetHeight;
      if (window.scrollY >= top && window.scrollY < bottom) {
        current = section.getAttribute('id');
      }
    });

    navLinkItems.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });

    updateNavIndicator();
  }

  // --- Navbar Background on Scroll ---
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateActiveLink();
  });

  window.addEventListener('resize', updateNavIndicator);
  updateNavIndicator();

  // --- Scroll Reveal Animations ---
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } else {
        entry.target.classList.remove('visible');
      }
    });
  }, {
    threshold: 0,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // --- Stat Counter Animation ---
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'));
    if (!target) return;
    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);

      if (el.id === 'projectCount') return;
      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(update);
  }

  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => statObserver.observe(el));

  // --- Skill Bar Animation ---
  const skillProgress = document.querySelectorAll('.skill-progress');
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const width = entry.target.getAttribute('data-width');
        entry.target.style.width = width + '%';
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  skillProgress.forEach(el => skillObserver.observe(el));

  // --- GitHub Projects ---
  let allRepos = [];
  let showingAll = false;

  function isMobile() {
    return window.innerWidth < 768;
  }

  function getInitialCount() {
    return isMobile() ? 4 : 6;
  }

  function createProjectCard(repo) {
    const card = document.createElement('div');
    card.className = 'project-card';

    const description = repo.description || 'No description';

    card.innerHTML = `
      <h3 class="project-name">${repo.name}</h3>
      <p class="project-desc">${description}</p>
      <div class="project-meta">
        ${repo.language ? `<span class="project-lang">● ${repo.language}</span>` : ''}
        <span class="project-stars">★ ${repo.stargazers_count}</span>
        <span class="project-forks">⑂ ${repo.forks_count}</span>
        <a href="${repo.html_url}" target="_blank" rel="noopener" class="project-link">View →</a>
      </div>
    `;

    return card;
  }

  function renderProjects(query = '') {
    const grid = document.getElementById('projectsGrid');
    const seeMoreBtn = document.getElementById('seeMoreBtn');
    if (!grid) return;

    const q = query.toLowerCase().trim();
    const filtered = q
      ? allRepos.filter(repo =>
          repo.name.toLowerCase().includes(q) ||
          (repo.description && repo.description.toLowerCase().includes(q))
        )
      : allRepos;

    grid.innerHTML = '';

    if (filtered.length === 0) {
      grid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center;">No projects match your search.</p>';
      seeMoreBtn.style.display = 'none';
      return;
    }

    const count = showingAll ? filtered.length : Math.min(filtered.length, getInitialCount());

    filtered.slice(0, count).forEach(repo => {
      grid.appendChild(createProjectCard(repo));
    });

    if (!showingAll && filtered.length > getInitialCount()) {
      seeMoreBtn.textContent = `See More (${filtered.length - getInitialCount()} more)`;
      seeMoreBtn.style.display = 'block';
    } else if (showingAll) {
      seeMoreBtn.textContent = 'Show Less';
      seeMoreBtn.style.display = 'block';
    } else {
      seeMoreBtn.style.display = 'none';
    }
  }

  async function fetchGitHubProjects() {
    const grid = document.getElementById('projectsGrid');
    const countEl = document.getElementById('projectCount');
    if (!grid) return;

    try {
      const response = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=50`);
      if (!response.ok) throw new Error('GitHub API error');

      const repos = await response.json();
      allRepos = repos.filter(r => !r.fork);

      if (countEl) countEl.textContent = allRepos.length;

      renderProjects();
    } catch (err) {
      console.error('Failed to fetch GitHub repos:', err);
      if (countEl) countEl.textContent = '0';
      if (grid) {
        grid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center;">Unable to load projects. Please check your connection.</p>';
      }
    }
  }
  fetchGitHubProjects();

  const searchInput = document.getElementById('projectSearch');
  const seeMoreBtn = document.getElementById('seeMoreBtn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      showingAll = false;
      renderProjects(e.target.value);
    });
  }

  if (seeMoreBtn) {
    seeMoreBtn.addEventListener('click', () => {
      showingAll = !showingAll;
      const query = searchInput ? searchInput.value : '';
      renderProjects(query);
    });
  }

  // --- Load Certificates ---
  function loadCertificates() {
    const grid = document.getElementById('certificatesGrid');
    if (!grid) return;

    const certFiles = [
      { file: 'sertifikat.jpeg', title: '1st Place — PMR Obstacle Course Competition, Jabodetabek Level' },
      { file: 'setifikat (2).png', title: 'Certificate of Participation — Virtual Company Indonesia Business Plan Competition 2025/2026' }
    ];

    certFiles.forEach(cert => {
      const path = `componen/sertifikat/${cert.file}`;
      const card = document.createElement('div');
      card.className = 'certificate-card';

      const img = new Image();
      img.onload = () => {
        card.innerHTML = `
          <img src="${path}" alt="${cert.title}" loading="lazy">
          <div class="cert-title">${cert.title}</div>
        `;

        card.addEventListener('click', () => {
          const lightbox = document.getElementById('lightbox');
          const lightboxImg = document.getElementById('lightboxImg');
          if (lightbox && lightboxImg) {
            lightboxImg.src = path;
            lightboxImg.alt = cert.title;
            lightbox.classList.add('open');
          }
        });
      };
      img.onerror = () => {
        card.innerHTML = `
          <div style="height:200px;display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:0.875rem;">
            Certificate image unavailable
          </div>
          <div class="cert-title">${cert.title}</div>
        `;
      };
      img.src = path;
      grid.appendChild(card);
    });

    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.getElementById('lightboxClose');
    if (lightbox && closeBtn) {
      closeBtn.addEventListener('click', () => lightbox.classList.remove('open'));
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) lightbox.classList.remove('open');
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') lightbox.classList.remove('open');
      });
    }
  }
  loadCertificates();
});