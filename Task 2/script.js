/**
 * SYNAPSE OS — MASTER CLIENT LOGIC & INTERACTION ENGINE
 * Built with Vanilla JavaScript (Zero External Framework Dependencies)
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ==========================================================================
  // 1. TOAST NOTIFICATION SYSTEM
  // ==========================================================================
  const toastContainer = document.getElementById('toast-container');
  
  function showToast(message, type = 'info', duration = 3500) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = '⚡';
    if (type === 'success') icon = '✓';
    if (type === 'error') icon = '✕';
    if (type === 'copied') icon = '📋';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // ==========================================================================
  // 2. AMBIENT PARTICLES & NEON GLOW CANVAS
  // ==========================================================================
  const canvas = document.getElementById('ambient-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particleCount = Math.min(width > 768 ? 45 : 20, 60);
    const particles = [];

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = Math.random() * 1.8 + 0.5;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.alpha = Math.random() * 0.5 + 0.1;
        this.color = Math.random() > 0.5 ? '#00f0ff' : '#7928ca';
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
          this.reset();
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let animationFrameId;
    function animateParticles() {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        // Draw subtle connection lines between close particles
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  // ==========================================================================
  // 3. ANNOUNCEMENT DISMISS
  // ==========================================================================
  const closeAnnouncementBtn = document.getElementById('close-announcement');
  const announcementBar = document.querySelector('.announcement-bar');
  if (closeAnnouncementBtn && announcementBar) {
    closeAnnouncementBtn.addEventListener('click', () => {
      announcementBar.style.display = 'none';
    });
  }

  // ==========================================================================
  // 4. HEADER SCROLL EFFECT & ACTIVE NAVIGATION OBSERVER
  // ==========================================================================
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }, { passive: true });

  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(sec => navObserver.observe(sec));

  // ==========================================================================
  // 5. MOBILE DRAWER NAVIGATION
  // ==========================================================================
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerClose = document.getElementById('drawer-close');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  function toggleDrawer(open) {
    if (!mobileDrawer) return;
    if (open) {
      mobileDrawer.classList.add('open');
      mobileDrawer.setAttribute('aria-hidden', 'false');
      mobileToggle?.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    } else {
      mobileDrawer.classList.remove('open');
      mobileDrawer.setAttribute('aria-hidden', 'true');
      mobileToggle?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  }

  mobileToggle?.addEventListener('click', () => toggleDrawer(true));
  drawerClose?.addEventListener('click', () => toggleDrawer(false));
  drawerBackdrop?.addEventListener('click', () => toggleDrawer(false));
  drawerLinks.forEach(link => {
    link.addEventListener('click', () => toggleDrawer(false));
  });

  // ==========================================================================
  // 6. THEME SWITCHER (DARK / LIGHT PERSISTENCE)
  // ==========================================================================
  const themeToggle = document.getElementById('theme-toggle');
  const htmlRoot = document.documentElement;
  
  const savedTheme = localStorage.getItem('synapse-theme') || 'dark';
  htmlRoot.setAttribute('data-theme', savedTheme);

  themeToggle?.addEventListener('click', () => {
    const currentTheme = htmlRoot.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlRoot.setAttribute('data-theme', newTheme);
    localStorage.setItem('synapse-theme', newTheme);
    showToast(`Switched to ${newTheme.toUpperCase()} mode`, 'info');
  });

  // ==========================================================================
  // 7. COPY INSTALL COMMAND
  // ==========================================================================
  const copyInstallBtn = document.getElementById('copy-install-btn');
  if (copyInstallBtn) {
    copyInstallBtn.addEventListener('click', async () => {
      const code = 'curl -fsSL https://synapse.sh/install | bash';
      try {
        await navigator.clipboard.writeText(code);
        showToast('Install command copied to clipboard!', 'copied');
      } catch (err) {
        showToast('Copied: ' + code, 'copied');
      }
    });
  }

  // ==========================================================================
  // 8. 3D PERSPECTIVE TILT CARDS
  // ==========================================================================
  const tiltCards = document.querySelectorAll('[data-tilt]');
  
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 768) return; // Disable tilt on mobile for performance
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });

  // ==========================================================================
  // 9. ANIMATED STATS NUMERICAL COUNTERS
  // ==========================================================================
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsCounted = false;

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsCounted) {
        statsCounted = true;
        statNumbers.forEach(stat => {
          const target = parseFloat(stat.getAttribute('data-target'));
          const isDecimal = target % 1 !== 0;
          const duration = 1800;
          const frameRate = 1000 / 60;
          const totalFrames = Math.round(duration / frameRate);
          let frame = 0;

          const counter = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            // Ease out cubic
            const currentVal = target * (1 - Math.pow(1 - progress, 3));
            
            stat.textContent = isDecimal ? currentVal.toFixed(2) : Math.floor(currentVal);

            if (frame >= totalFrames) {
              stat.textContent = isDecimal ? target.toFixed(2) : target;
              clearInterval(counter);
            }
          }, frameRate);
        });
      }
    });
  }, { threshold: 0.4 });

  const statsSection = document.getElementById('stats');
  if (statsSection) statsObserver.observe(statsSection);

  // ==========================================================================
  // 10. INTERACTIVE SANDBOX ENGINE PLAYGROUND
  // ==========================================================================
  const scenarioSelect = document.getElementById('scenario-select');
  const agentSlider = document.getElementById('agent-slider');
  const agentCountVal = document.getElementById('agent-count-val');
  const tempSlider = document.getElementById('temperature-slider');
  const tempVal = document.getElementById('temp-val');
  const modeBtns = document.querySelectorAll('.mode-btn');
  const executeSimBtn = document.getElementById('execute-sim-btn');
  const simSpinner = document.getElementById('sim-spinner');
  const btnSimText = document.getElementById('btn-sim-text');
  const simStatus = document.getElementById('sim-status');
  const terminalOutput = document.getElementById('sandbox-terminal-output');
  const tabPills = document.querySelectorAll('.tab-pill');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const topoGrid = document.getElementById('topo-grid');

  // Slider Reactivity
  agentSlider?.addEventListener('input', (e) => {
    agentCountVal.textContent = `${e.target.value} Nodes`;
    updateTopoGrid(parseInt(e.target.value, 10));
  });

  tempSlider?.addEventListener('input', (e) => {
    tempVal.textContent = parseFloat(e.target.value).toFixed(2);
  });

  // Mode Toggles
  let activeMode = 'speculative';
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeMode = btn.getAttribute('data-mode');
      showToast(`Switched execution kernel to: ${activeMode.toUpperCase()}`, 'info');
    });
  });

  // Tab Switching
  tabPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const targetTab = pill.getAttribute('data-tab');
      tabPills.forEach(p => p.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));
      
      pill.classList.add('active');
      document.getElementById(`tab-${targetTab}`)?.classList.add('active');
    });
  });

  // Populate Topology Grid
  function updateTopoGrid(count) {
    if (!topoGrid) return;
    topoGrid.innerHTML = '';
    const names = ['Sensor_0', 'WasmVM_', 'Tensor_', 'Planner_'];
    for (let i = 0; i < Math.min(count, 16); i++) {
      const node = document.createElement('div');
      node.className = 'topo-node';
      node.innerHTML = `<strong>${names[i % names.length]}${i + 1}</strong><br><small>State: IDLE</small>`;
      topoGrid.appendChild(node);
    }
  }
  updateTopoGrid(16);

  // Run Simulation
  let isSimRunning = false;
  const scenariosData = {
    'code-refactor': [
      'AST tree decomposed into 1,240 symbol sub-graphs.',
      'Vector shard allocation dispatched to 16 parallel microVMs.',
      'Speculative type inference verified across 48 modules.',
      'Cyclomatic complexity reduced by 34.2%. Static verification passed in 14.8ms.'
    ],
    'swarm-finance': [
      'Ingesting 84,000 order-book updates per millisecond.',
      'Raft consensus reached across distributed pricing nodes.',
      'Zero-knowledge risk boundary validation confirmed.',
      'Autonomous hedging execution completed with zero slippage.'
    ],
    'spatial-3d': [
      'LiDAR point-cloud parsed: 4,200,000 voxels loaded in GPU ring.',
      'Neural Radiance Field (NeRF) geometry compiled with FP8 tensor cores.',
      '6DoF camera trajectory rendered at 120 FPS frame latency.',
      'Spatial mesh output stream locked to WebRTC bus.'
    ],
    'cyber-defense': [
      'Anomaly detection threshold reached on ingress port 443.',
      'Autonomous honeypot instantiated in ephemeral WASM sandbox.',
      'Payload memory signature isolated and counter-measured.',
      'Zero-day vulnerability neutralized in 0.42ms.'
    ]
  };

  executeSimBtn?.addEventListener('click', () => {
    if (isSimRunning) return;
    isSimRunning = true;
    
    // UI state
    btnSimText.textContent = 'Executing Kernel...';
    simSpinner.style.display = 'inline-block';
    simStatus.textContent = 'COMPUTING';
    simStatus.className = 'badge-status accent';

    const selectedScenario = scenarioSelect.value;
    const lines = scenariosData[selectedScenario] || scenariosData['code-refactor'];
    
    // Clear terminal
    terminalOutput.innerHTML = `
      <p class="t-line dim">// Initializing SYNAPSE OS Autonomous Execution...</p>
      <p class="t-line highlight">> Preset: ${scenarioSelect.options[scenarioSelect.selectedIndex].text}</p>
      <p class="t-line dim">> Mode: ${activeMode.toUpperCase()} | Workers: ${agentSlider.value} | Temp: ${tempSlider.value}</p>
    `;

    // Highlight topo nodes
    const nodes = document.querySelectorAll('.topo-node');
    nodes.forEach(n => {
      n.classList.add('running');
      n.querySelector('small').textContent = 'State: BUSY';
    });

    let lineIndex = 0;
    const interval = setInterval(() => {
      if (lineIndex < lines.length) {
        const p = document.createElement('p');
        p.className = 't-line step';
        p.textContent = `[${new Date().toLocaleTimeString()}] ${lines[lineIndex]}`;
        terminalOutput.appendChild(p);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
        lineIndex++;
      } else {
        clearInterval(interval);
        
        // Final success line
        const finalP = document.createElement('p');
        finalP.className = 't-line success';
        finalP.textContent = `✓ Execution converged successfully in ${(Math.random() * 20 + 8).toFixed(2)}ms. State verified.`;
        terminalOutput.appendChild(finalP);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;

        // Reset UI
        isSimRunning = false;
        btnSimText.textContent = 'Run Neural Execution';
        simSpinner.style.display = 'none';
        simStatus.textContent = 'CONVERGED';
        simStatus.className = 'badge-status online';

        nodes.forEach(n => {
          n.classList.remove('running');
          n.querySelector('small').textContent = 'State: IDLE';
        });

        showToast('Autonomous execution simulation completed!', 'success');
      }
    }, 600);
  });

  // ==========================================================================
  // 11. ARCHITECTURE ACCORDION
  // ==========================================================================
  const archItems = document.querySelectorAll('.arch-accordion .accordion-item');
  archItems.forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    trigger?.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      archItems.forEach(i => {
        i.classList.remove('active');
        i.querySelector('.accordion-trigger')?.setAttribute('aria-expanded', 'false');
      });
      if (!isActive) {
        item.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ==========================================================================
  // 12. REAL-TIME ROI & INFRASTRUCTURE CALCULATOR
  // ==========================================================================
  const calcEngineers = document.getElementById('calc-engineers');
  const calcTokens = document.getElementById('calc-tokens');
  const calcSpend = document.getElementById('calc-gpu');
  
  const valEngineers = document.getElementById('val-engineers');
  const valTokens = document.getElementById('val-tokens');
  const valSpend = document.getElementById('val-spend');

  const resSavings = document.getElementById('res-savings');
  const resHours = document.getElementById('res-hours');
  const resSpeedup = document.getElementById('res-speedup');

  function calculateROI() {
    if (!calcEngineers || !calcTokens || !calcSpend) return;
    
    const engineers = parseInt(calcEngineers.value, 10);
    const tokens = parseInt(calcTokens.value, 10);
    const spend = parseInt(calcSpend.value, 10);

    // Update labels
    valEngineers.textContent = `${engineers} Engineers`;
    valTokens.textContent = `${tokens}M Tokens`;
    valSpend.textContent = `$${spend.toLocaleString()} / mo`;

    // Math estimation
    const cloudSavingsAnnual = (spend * 12) * 0.65;
    const tokenEfficiencySavings = (tokens * 12 * 80) * 0.45;
    const totalSavings = Math.round(cloudSavingsAnnual + tokenEfficiencySavings);
    
    const hoursUnlocked = Math.round(engineers * 74);
    const speedMultiplier = (3.2 + (engineers / 60)).toFixed(1);

    resSavings.textContent = `$${totalSavings.toLocaleString()}`;
    resHours.textContent = `${hoursUnlocked.toLocaleString()} hrs`;
    resSpeedup.textContent = `${speedMultiplier}x`;
  }

  calcEngineers?.addEventListener('input', calculateROI);
  calcTokens?.addEventListener('input', calculateROI);
  calcSpend?.addEventListener('input', calculateROI);
  calculateROI();

  // ==========================================================================
  // 13. TESTIMONIALS CAROUSEL
  // ==========================================================================
  const track = document.getElementById('carousel-track');
  const slides = Array.from(document.querySelectorAll('.carousel-slide'));
  const nextBtn = document.getElementById('carousel-next');
  const prevBtn = document.getElementById('carousel-prev');
  const dotsNav = document.getElementById('carousel-dots');
  const dots = Array.from(document.querySelectorAll('.dot-indicator'));

  let currentSlideIndex = 0;

  function moveToSlide(targetIndex) {
    if (!track || slides.length === 0) return;
    if (targetIndex < 0) targetIndex = slides.length - 1;
    if (targetIndex >= slides.length) targetIndex = 0;

    track.style.transform = `translateX(-${targetIndex * 100}%)`;
    slides.forEach((s, idx) => s.classList.toggle('current-slide', idx === targetIndex));
    dots.forEach((d, idx) => d.classList.toggle('active', idx === targetIndex));
    currentSlideIndex = targetIndex;
  }

  nextBtn?.addEventListener('click', () => moveToSlide(currentSlideIndex + 1));
  prevBtn?.addEventListener('click', () => moveToSlide(currentSlideIndex - 1));

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => moveToSlide(index));
  });

  // Auto-advance carousel
  let carouselInterval = setInterval(() => {
    moveToSlide(currentSlideIndex + 1);
  }, 6000);

  const carouselElem = document.getElementById('testimonial-carousel');
  carouselElem?.addEventListener('mouseenter', () => clearInterval(carouselInterval));
  carouselElem?.addEventListener('mouseleave', () => {
    clearInterval(carouselInterval);
    carouselInterval = setInterval(() => moveToSlide(currentSlideIndex + 1), 6000);
  });

  // Touch Swipe for Mobile
  let touchStartX = 0;
  let touchEndX = 0;
  track?.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track?.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 50) moveToSlide(currentSlideIndex + 1);
    if (touchEndX - touchStartX > 50) moveToSlide(currentSlideIndex - 1);
  }, { passive: true });

  // ==========================================================================
  // 14. PRICING BILLING CYCLE SWITCHER
  // ==========================================================================
  const billingToggle = document.getElementById('billing-toggle');
  const priceAmounts = document.querySelectorAll('.price-amount');
  let isAnnual = false;

  billingToggle?.addEventListener('click', () => {
    isAnnual = !isAnnual;
    billingToggle.setAttribute('aria-checked', isAnnual.toString());

    priceAmounts.forEach(price => {
      const monthly = price.getAttribute('data-monthly');
      const annual = price.getAttribute('data-annual');
      price.textContent = isAnnual ? annual : monthly;
    });

    showToast(`Pricing updated to ${isAnnual ? 'ANNUAL (25% off)' : 'MONTHLY'} billing`, 'info');
  });

  // Pricing Card CTA Buttons
  const pricingCtas = document.querySelectorAll('.pricing-cta');
  pricingCtas.forEach(btn => {
    btn.addEventListener('click', () => {
      const tier = btn.getAttribute('data-tier');
      showToast(`Selected plan: ${tier}. Redirecting to secure provisioning...`, 'success');
    });
  });

  // ==========================================================================
  // 15. FAQ ACCORDION
  // ==========================================================================
  const faqCards = document.querySelectorAll('.faq-card');
  faqCards.forEach(card => {
    const questionBtn = card.querySelector('.faq-question');
    questionBtn?.addEventListener('click', () => {
      const isOpen = card.classList.contains('open');
      faqCards.forEach(c => {
        c.classList.remove('open');
        c.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        card.classList.add('open');
        questionBtn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ==========================================================================
  // 16. NEWSLETTER SUBSCRIPTION FORM
  // ==========================================================================
  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterEmail = document.getElementById('newsletter-email');
  const newsletterFeedback = document.getElementById('newsletter-feedback');

  newsletterForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = newsletterEmail?.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
      newsletterFeedback.textContent = 'Please enter a valid developer email address.';
      newsletterFeedback.className = 'form-feedback error';
      newsletterEmail?.focus();
      return;
    }

    newsletterFeedback.textContent = '✓ Subscribed successfully! Welcome to the SYNAPSE engineering collective.';
    newsletterFeedback.className = 'form-feedback success';
    newsletterEmail.value = '';
    showToast('Subscription confirmed! Check your inbox.', 'success');
  });

  // ==========================================================================
  // 17. COMMAND PALETTE MODAL (CTRL+K / CMD+K)
  // ==========================================================================
  const cmdModal = document.getElementById('cmd-modal');
  const cmdTrigger = document.getElementById('cmd-trigger');
  const cmdBackdrop = document.getElementById('cmd-backdrop');
  const cmdSearchInput = document.getElementById('cmd-search-input');
  const cmdItems = Array.from(document.querySelectorAll('.cmd-item'));

  function openCommandPalette() {
    cmdModal?.classList.add('open');
    cmdModal?.setAttribute('aria-hidden', 'false');
    cmdSearchInput?.focus();
    if (cmdSearchInput) cmdSearchInput.value = '';
    filterCommandItems('');
  }

  function closeCommandPalette() {
    cmdModal?.classList.remove('open');
    cmdModal?.setAttribute('aria-hidden', 'true');
  }

  cmdTrigger?.addEventListener('click', openCommandPalette);
  cmdBackdrop?.addEventListener('click', closeCommandPalette);

  // Global Keyboard Shortcut (Ctrl+K or Cmd+K & Escape)
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (cmdModal?.classList.contains('open')) {
        closeCommandPalette();
      } else {
        openCommandPalette();
      }
    }
    if (e.key === 'Escape' && cmdModal?.classList.contains('open')) {
      closeCommandPalette();
    }
  });

  function filterCommandItems(query) {
    const q = query.toLowerCase().trim();
    cmdItems.forEach(item => {
      const text = item.textContent.toLowerCase();
      if (text.includes(q)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  }

  cmdSearchInput?.addEventListener('input', (e) => {
    filterCommandItems(e.target.value);
  });

  cmdItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetSelector = item.getAttribute('data-target');
      closeCommandPalette();
      const targetElement = document.querySelector(targetSelector);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Hero CTA quick smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
