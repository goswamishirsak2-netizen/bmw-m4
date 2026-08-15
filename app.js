/**
 * BMW PREMIUM MOTORSPORT ONE-PAGE INTERACTIVE ENGINE
 * Manages canvas frame looping, telemetry updates, smooth scrolls,
 * GSAP ScrollTrigger animations, design hotspots, tech dashboard widgets,
 * ambient lighting modulators, car configuration pricing, and Web Audio exhaust synthesis.
 */

(function () {
  'use strict';

  // --- GLOBAL STATE CONFIGURATION ---
  const TOTAL_FRAMES = 270;
  const FRAME_BASE_PATH = 'frames/ezgif-frame-';
  const FRAME_EXT = '.png';

  const state = {
    images: [],
    loadedCount: 0,
    isLoaded: false,
    currentFrame: 0,
    targetFrame: 0,
    playbackSpeed: 1,
    isAutoPlaying: true,
    soundEnabled: false,
    speedUnit: 'MPH',
    currentRpm: 1250,
    currentSpeed: 0,
    currentGear: 1,
    currentGForce: 0.12,
    currentBoost: 2.4,
    commercialLoopId: null,
    
    // Configurator state
    config: {
      color: 'frozen-grey',
      colorName: 'Frozen Deep Grey Metallic (Matte)',
      basePrice: 83200,
      optionsPrice: 0
    }
  };

  // --- DOM ELEMENT CACHE ---
  let el = {};

  function cacheElements() {
    el = {
      // Preloader
      preloader: document.getElementById('preloader'),
      loadingProgress: document.getElementById('loadingProgress'),
      loadingPercent: document.getElementById('loadingPercent'),
      loadedFramesCount: document.getElementById('loadedFramesCount'),
      startExperienceBtn: document.getElementById('startExperienceBtn'),

      // Navigation & Modal
      navbar: document.getElementById('navbar'),
      navLinks: document.querySelectorAll('.nav-links a'),
      testDriveModal: document.getElementById('testDriveModal'),
      closeModalBtn: document.getElementById('closeModalBtn'),
      testDriveForm: document.getElementById('testDriveForm'),
      vipPass: document.getElementById('vipPass'),

      // Canvas Viewport
      canvas: document.getElementById('carCanvas'),
      ambientGlow: document.getElementById('ambientGlow'),
      ambientVignette: document.querySelector('.ambient-vignette'),

      // Hero Overlay & Text Elements
      heroOverlay: document.querySelector('.home-hero-text-overlay'),
      heroBadge: document.querySelector('.home-hero-text-overlay .page-hero-badge'),
      heroTitle: document.querySelector('.home-main-title'),
      heroDesc: document.querySelector('.home-main-desc'),
      heroActions: document.querySelector('.home-main-actions'),

      // Global Controls
      autoPlayBtn: document.getElementById('autoPlayBtn'),
      playIcon: document.getElementById('playIcon'),
      pauseIcon: document.getElementById('pauseIcon'),
      autoPlayLabel: document.getElementById('autoPlayLabel'),
      soundToggleBtn: document.getElementById('soundToggleBtn'),
      soundIconOn: document.getElementById('soundIconOn'),
      soundIconOff: document.getElementById('soundIconOff'),
      soundLabel: document.getElementById('soundLabel'),

      // Section 1: Machine
      machineSection: document.getElementById('machine'),
      machineStats: document.querySelectorAll('#machine [data-count]'),

      // Section 2: Performance
      perfSection: document.getElementById('performance'),
      perfCards: document.querySelectorAll('.perf-card-interactive'),

      // Section 3: Design Hotspots
      designSection: document.getElementById('design'),
      hotspots: document.querySelectorAll('.design-hotspot'),
      hotspotCard: document.getElementById('hotspotCard'),
      hotspotCardTitle: document.getElementById('hotspotCardTitle'),
      hotspotCardDesc: document.getElementById('hotspotCardDesc'),

      // Section 4: Technology Specifications
      techSection: document.getElementById('technology'),
      techInputs: document.querySelectorAll('.tech-spec-editor-table input'),
      widgetEngineMap: document.getElementById('widgetEngineMap'),
      widgetVoiceStatus: document.getElementById('widgetVoiceStatus'),
      widgetSteerSens: document.getElementById('widgetSteerSens'),
      widgetSuspension: document.getElementById('widgetSuspension'),

      // Section 5: Interior Ambient Lighting
      interiorSection: document.getElementById('interior'),
      ambientSwatches: document.querySelectorAll('.ambient-color-swatch'),
      interiorAmbientOverlay: document.getElementById('interiorAmbientOverlay'),
      activeColorLabel: document.getElementById('activeColorLabel'),

      // Section 6: BMW M Division
      mSection: document.getElementById('m-division'),
      mExploreBtns: document.querySelectorAll('.m-card .btn-explore-model'),

      // Section 7: Models Portfolio
      modelsSection: document.getElementById('models'),
      openTestDriveBtns: document.querySelectorAll('.btn-open-test-drive'),

      // Section 8: Configurator
      configSection: document.getElementById('configure'),
      configCarImg: document.getElementById('configuratorCarImg'),
      colorFilterOverlay: document.getElementById('colorFilterOverlay'),
      previewColorBadge: document.getElementById('previewColorBadge'),
      colorSwatches: document.querySelectorAll('.color-swatch'),
      totalPrice: document.getElementById('totalPrice'),
      optionPills: document.querySelectorAll('.option-pill input'),
      checkboxPills: document.querySelectorAll('.checkbox-pill input'),
      modalConfigSummary: document.getElementById('modalConfigSummary'),
      btnOpenVIPModalDirect: document.getElementById('btnOpenVIPModalDirect'),
      modalConfigSummaryDetails: document.getElementById('modalConfigSummaryDetails'),

      // Sound Graph / Audio Visualizer Widget
      audioVisualizer: document.getElementById('audioVisualizer'),
      soundGraphWidget: document.getElementById('soundGraphWidget'),
      soundGraphState: document.getElementById('soundGraphState'),
      btnEngineStart: document.getElementById('btnEngineStart'),
      btnRev4k: document.getElementById('btnRev4k'),
      btnRedline: document.getElementById('btnRedline'),
      throttleSlider: document.getElementById('throttleSlider'),
      throttlePercent: document.getElementById('throttlePercent'),
      dynoValve: document.getElementById('dynoValve'),
      dynoFreq: document.getElementById('dynoFreq'),
      dynoBoost: document.getElementById('dynoBoost')
    };
  }

  // --- SMOOTH SCROLLING & ACTIVE SECTION HIGHLIGHTS ---
  function initSmoothScroll() {
    // Intercept navbar and CTA scroll clicks
    document.addEventListener('click', function (e) {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const targetEl = document.getElementById(href.substring(1));
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });

    // Register GSAP ScrollTrigger active states for navbar links
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      const sections = ['hero', 'machine', 'performance', 'design', 'technology', 'interior', 'm-division', 'models', 'configure', 'final-section'];
      
      sections.forEach(id => {
        const secEl = document.getElementById(id);
        if (!secEl) return;
        ScrollTrigger.create({
          trigger: secEl,
          start: 'top 40%',
          end: 'bottom 40%',
          onEnter: () => updateActiveNavLink(`#${id}`),
          onEnterBack: () => updateActiveNavLink(`#${id}`)
        });
      });
    }

    // Mobile navigation toggle
    const toggleBtn = document.getElementById('navToggleBtn');
    const navLinksContainer = document.querySelector('.nav-links');
    if (toggleBtn && navLinksContainer) {
      toggleBtn.onclick = () => {
        toggleBtn.classList.toggle('active');
        navLinksContainer.classList.toggle('active');
      };

      // Close menu when clicking a nav link
      navLinksContainer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          toggleBtn.classList.remove('active');
          navLinksContainer.classList.remove('active');
        });
      });
    }
  }

  function updateActiveNavLink(hash) {
    if (!el.navLinks) return;
    el.navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === hash) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // --- GSAP ANIMATIONS ---
  function initGsapAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    // Stat numbers counting animation (Section 1: The Machine)
    if (el.machineSection) {
      ScrollTrigger.create({
        trigger: el.machineSection,
        start: 'top 60%',
        onEnter: () => {
          el.machineStats.forEach(stat => {
            const targetVal = parseFloat(stat.getAttribute('data-count'));
            if (isNaN(targetVal)) return;
            const decimals = parseInt(stat.getAttribute('data-decimals') || 0, 10);
            const explicitSuffix = stat.getAttribute('data-suffix');
            
            let suffix = '';
            if (explicitSuffix !== null) {
              suffix = explicitSuffix;
            } else if (stat.textContent.includes('HP')) {
              suffix = ' HP';
            } else if (stat.textContent.includes('SEC') || stat.textContent.includes('s')) {
              suffix = ' s';
            } else if (stat.textContent.includes('KM/H')) {
              suffix = ' KM/H';
            } else if (stat.textContent.includes('NM')) {
              suffix = ' NM';
            }
            
            const obj = { value: 0 };
            gsap.to(obj, {
              value: targetVal,
              duration: 2.0,
              ease: 'power2.out',
              onUpdate: () => {
                stat.textContent = obj.value.toFixed(decimals) + suffix;
              }
            });
          });
        }
      });
    }

    // Performance bar animations (Section 2: Performance)
    const perfObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const barFill = entry.target.querySelector('.bar-fill-animate');
          if (barFill) {
            const widthPct = barFill.getAttribute('data-width') || '100%';
            barFill.style.width = widthPct;
          }
        }
      });
    }, { threshold: 0.15 });

    if (el.perfCards) {
      el.perfCards.forEach(card => perfObserver.observe(card));
    }

    // Section 3: Design with Purpose Editorial Animation
    const designSec = document.getElementById('design');
    if (designSec) {
      const eyebrow = designSec.querySelector('.design-eyebrow');
      const headingLines = designSec.querySelectorAll('.design-heading-line');
      const desc = designSec.querySelector('.design-description');
      const sublabel = designSec.querySelector('.design-sublabel');
      const imageFrame = designSec.querySelector('.design-image-frame');

      // Set initial states for subtle reveal
      if (eyebrow) gsap.set(eyebrow, { opacity: 0, y: 15 });
      if (headingLines.length) gsap.set(headingLines, { opacity: 0, y: 28 });
      if (desc) gsap.set(desc, { opacity: 0, y: 18 });
      if (sublabel) gsap.set(sublabel, { opacity: 0, y: 14 });
      if (imageFrame) gsap.set(imageFrame, { opacity: 0, scale: 0.96, y: 22 });

      const designTl = gsap.timeline({
        scrollTrigger: {
          trigger: designSec,
          start: 'top 75%',
          toggleActions: 'play none none none'
        }
      });

      if (eyebrow) {
        designTl.to(eyebrow, {
          opacity: 1,
          y: 0,
          duration: 0.65,
          ease: 'power3.out'
        });
      }

      if (headingLines.length) {
        designTl.to(headingLines, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out'
        }, '-=0.4');
      }

      if (desc) {
        designTl.to(desc, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out'
        }, '-=0.5');
      }

      if (sublabel) {
        designTl.to(sublabel, {
          opacity: 1,
          y: 0,
          duration: 0.65,
          ease: 'power3.out'
        }, '-=0.45');
      }

      if (imageFrame) {
        designTl.to(imageFrame, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1.0,
          ease: 'power2.out'
        }, '-=0.85');

        // Subtle, expensive scroll parallax scrub on continuous scrolling
        gsap.to(imageFrame, {
          y: -16,
          ease: 'none',
          scrollTrigger: {
            trigger: designSec,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2
          }
        });
      }
    }
  }

  // --- DESIGN SECTION HOTSPOTS ---
  function initDesignHotspots() {
    if (!el.hotspots || !el.hotspotCard) return;

    el.hotspots.forEach(hotspot => {
      const showCard = (e) => {
        const title = hotspot.getAttribute('data-title');
        const desc = hotspot.getAttribute('data-desc');

        if (el.hotspotCardTitle) el.hotspotCardTitle.textContent = title;
        if (el.hotspotCardDesc) el.hotspotCardDesc.textContent = desc;

        // Position popover relative to the hotspot dot coordinates
        const rect = hotspot.getBoundingClientRect();
        const containerRect = hotspot.parentElement.getBoundingClientRect();
        
        // Calculate offsets relative to the parent image container
        const left = rect.left - containerRect.left;
        const top = rect.top - containerRect.top;

        // Adjust position dynamically so it doesn't run off-screen
        let popLeft = left + 40;
        let popTop = top - 30;

        if (popLeft + 280 > containerRect.width) {
          popLeft = left - 300; // Position on left of node
        }

        el.hotspotCard.style.left = `${popLeft}px`;
        el.hotspotCard.style.top = `${popTop}px`;
        el.hotspotCard.classList.remove('hidden');
        el.hotspotCard.style.opacity = '1';
      };

      const hideCard = () => {
        el.hotspotCard.classList.add('hidden');
        el.hotspotCard.style.opacity = '0';
      };

      hotspot.addEventListener('mouseenter', showCard);
      hotspot.addEventListener('mouseleave', hideCard);
      hotspot.addEventListener('click', (e) => {
        e.stopPropagation();
        showCard(e);
      });
    });

    // Close card when clicking anywhere else
    document.addEventListener('click', () => {
      if (el.hotspotCard) {
        el.hotspotCard.classList.add('hidden');
        el.hotspotCard.style.opacity = '0';
      }
    });
  }

  // --- TECHNOLOGY COCKPIT EDITOR ---
  function initTechnologyEditor() {
    if (!el.techInputs) return;

    el.techInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        const specName = input.getAttribute('data-spec');
        const val = e.target.value;

        // Sync values to Adjacent glowing cockpit HUD widgets in real time
        if (specName === 'engine-map' && el.widgetEngineMap) {
          el.widgetEngineMap.textContent = val.toUpperCase();
          triggerWidgetFlash(el.widgetEngineMap);
        }
        if (specName === 'assistant' && el.widgetVoiceStatus) {
          el.widgetVoiceStatus.textContent = val.toUpperCase();
          triggerWidgetFlash(el.widgetVoiceStatus);
        }
        if (specName === 'steering' && el.widgetSteerSens) {
          el.widgetSteerSens.textContent = val.toUpperCase();
          triggerWidgetFlash(el.widgetSteerSens);
        }
        if (specName === 'damping' && el.widgetSuspension) {
          el.widgetSuspension.textContent = val.toUpperCase();
          triggerWidgetFlash(el.widgetSuspension);
        }
      });
    });
  }

  function triggerWidgetFlash(element) {
    const parentWidget = element.closest('.tech-screen-widget');
    if (parentWidget) {
      parentWidget.style.borderColor = 'var(--m-cyan)';
      parentWidget.style.boxShadow = '0 0 15px rgba(0, 240, 255, 0.25)';
      setTimeout(() => {
        parentWidget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
        parentWidget.style.boxShadow = 'none';
      }, 500);
    }
  }

  // --- INTERIOR AMBIENT COCKPIT MODULATOR ---
  function initInteriorModulator() {
    if (!el.ambientSwatches) return;

    el.ambientSwatches.forEach(swatch => {
      swatch.onclick = () => {
        el.ambientSwatches.forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');

        const colorHex = swatch.getAttribute('data-color');
        const colorName = swatch.getAttribute('data-name');

        if (el.interiorAmbientOverlay) {
          el.interiorAmbientOverlay.style.backgroundColor = colorHex;
        }
        if (el.activeColorLabel) {
          el.activeColorLabel.textContent = colorName.toUpperCase();
          el.activeColorLabel.style.color = colorHex;
        }
      };
    });
  }

  // --- CONFIGURATOR BUILDER ---
  function initConfigurator() {
    if (!el.colorSwatches) return;

    // Paint selector
    el.colorSwatches.forEach(swatch => {
      swatch.onclick = () => {
        el.colorSwatches.forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');

        const colorId = swatch.getAttribute('data-color');
        const colorName = swatch.getAttribute('data-name');
        const colorHex = swatch.getAttribute('data-hex');

        state.config.color = colorId;
        state.config.colorName = colorName;

        if (el.previewColorBadge) el.previewColorBadge.textContent = colorName.toUpperCase();

        if (colorId === 'frozen-grey') {
          if (el.colorFilterOverlay) el.colorFilterOverlay.style.opacity = '0';
          if (el.configCarImg) el.configCarImg.style.filter = 'none';
        } else {
          if (el.colorFilterOverlay) {
            el.colorFilterOverlay.style.backgroundColor = colorHex;
            el.colorFilterOverlay.style.opacity = '0.55';
          }
          if (el.configCarImg) el.configCarImg.style.filter = 'contrast(1.15) brightness(0.95)';
        }

        if (el.ambientGlow) {
          el.ambientGlow.style.background = `radial-gradient(ellipse at bottom, ${colorHex}33 0%, transparent 70%)`;
        }

        updateConfigPrice();
      };
    });

    // Radios
    if (el.optionPills) {
      el.optionPills.forEach(radio => {
        radio.onclick = () => {
          const parentGroup = radio.closest('.option-pills');
          parentGroup.querySelectorAll('.option-pill').forEach(p => p.classList.remove('active'));
          radio.closest('.option-pill').classList.add('active');
          updateConfigPrice();
        };
      });
    }

    // Checkboxes
    if (el.checkboxPills) {
      el.checkboxPills.forEach(cb => {
        cb.onclick = () => {
          const pill = cb.closest('.checkbox-pill');
          if (cb.checked) pill.classList.add('active');
          else pill.classList.remove('active');
          updateConfigPrice();
        };
      });
    }

    // Hook configure reserve build CTA
    if (el.btnOpenVIPModalDirect) {
      el.btnOpenVIPModalDirect.addEventListener('click', (e) => {
        e.preventDefault();
        // pre-fill reservation card details
        if (el.modalConfigSummaryDetails && el.modalConfigSummary) {
          el.modalConfigSummaryDetails.textContent = el.modalConfigSummary.textContent;
        }
        
        const expSelect = document.getElementById('userExperience');
        if (expSelect) expSelect.value = 'showroom';

        const openBtn = document.getElementById('openTestDriveBtn');
        if (openBtn) openBtn.click();
      });
    }

    updateConfigPrice();
  }

  function updateConfigPrice() {
    let optionsTotal = 0;

    const selectedDrivetrain = document.querySelector('input[name="drivetrain"]:checked');
    if (selectedDrivetrain) {
      optionsTotal += parseInt(selectedDrivetrain.closest('.option-pill').getAttribute('data-price') || 0, 10);
    }

    const selectedWheels = document.querySelector('input[name="wheels"]:checked');
    if (selectedWheels) {
      optionsTotal += parseInt(selectedWheels.closest('.option-pill').getAttribute('data-price') || 0, 10);
    }

    const selectedBrakes = document.querySelector('input[name="brakes"]:checked');
    if (selectedBrakes) {
      optionsTotal += parseInt(selectedBrakes.closest('.option-pill').getAttribute('data-price') || 0, 10);
    }

    if (el.checkboxPills) {
      el.checkboxPills.forEach(cb => {
        if (cb.checked) {
          optionsTotal += parseInt(cb.closest('.checkbox-pill').getAttribute('data-price') || 0, 10);
        }
      });
    }

    state.config.optionsPrice = optionsTotal;
    const grandTotal = state.config.basePrice + optionsTotal;
    
    if (el.totalPrice) el.totalPrice.textContent = `$${grandTotal.toLocaleString()}`;
    if (el.modalConfigSummary) {
      el.modalConfigSummary.textContent = `BMW M4 Competition (${state.config.colorName}) — $${grandTotal.toLocaleString()}`;
    }
  }

  // --- HOME VIEW 3D CANVAS LOOP ---
  let canvasCtx = null;

  function initHeroCanvas() {
    if (!el.canvas) return;
    canvasCtx = el.canvas.getContext('2d', { alpha: false });

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    if (el.soundToggleBtn) el.soundToggleBtn.addEventListener('click', toggleSound);
    if (el.autoPlayBtn) el.autoPlayBtn.addEventListener('click', toggleAutoPlay);

    if (el.startExperienceBtn) {
      el.startExperienceBtn.onclick = () => {
        if (el.preloader) el.preloader.classList.add('fade-out');
        state.isAutoPlaying = true;
        toggleSound();
      };
    }

    if (state.images.length === 0) {
      preloadImages();
    } else {
      if (el.preloader) el.preloader.classList.add('fade-out');
      state.isAutoPlaying = true;
      drawFrame(state.currentFrame);
    }

    state.isAutoPlaying = true;
    lastTimestamp = 0;
    state.commercialLoopId = requestAnimationFrame(commercialLoop);
  }

  function preloadImages() {
    state.loadedCount = 0;
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameNum = padZero(i, 3);
      img.src = `${FRAME_BASE_PATH}${frameNum}${FRAME_EXT}`;

      img.onload = () => {
        state.loadedCount++;
        const percent = Math.floor((state.loadedCount / TOTAL_FRAMES) * 100);

        if (el.loadingProgress) el.loadingProgress.style.width = `${percent}%`;
        if (el.loadingPercent) el.loadingPercent.textContent = `${percent}%`;
        if (el.loadedFramesCount) el.loadedFramesCount.textContent = `${state.loadedCount} / ${TOTAL_FRAMES} FRAMES`;

        if (state.loadedCount === 1) {
          drawFrame(0);
        }

        if (state.loadedCount >= TOTAL_FRAMES) {
          state.isLoaded = true;
          if (el.startExperienceBtn) el.startExperienceBtn.classList.remove('hidden');
          setTimeout(() => {
            if (el.preloader) el.preloader.classList.add('fade-out');
            state.isAutoPlaying = true;
          }, 300);
        }
      };

      img.onerror = () => {
        state.loadedCount++;
      };

      state.images.push(img);
    }
  }

  function resizeCanvas() {
    if (!el.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = el.canvas.getBoundingClientRect();
    el.canvas.width = rect.width * dpr;
    el.canvas.height = rect.height * dpr;
    drawFrame(Math.round(state.currentFrame));
  }

  function drawFrame(frameIndex) {
    if (!el.canvas || !canvasCtx) return;
    const idx = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(frameIndex)));
    const img = state.images[idx];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cWidth = el.canvas.width;
    const cHeight = el.canvas.height;
    if (cWidth === 0 || cHeight === 0) return;

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = cWidth / cHeight;
    let renderW, renderH, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
      renderW = cWidth;
      renderH = cWidth / imgRatio;
      offsetX = 0;
      offsetY = (cHeight - renderH) / 2;
    } else {
      renderH = cHeight;
      renderW = cHeight * imgRatio;
      offsetX = (cWidth - renderW) / 2;
      offsetY = 0;
    }

    // Subtle cinematic scale-in for the BMW logo resolve moment (frames 215 to 270)
    let scale = 1.0;
    if (idx >= 215) {
      const logoT = (idx - 215) / (TOTAL_FRAMES - 1 - 215); // 0 to 1
      const easeZoom = Math.sin(logoT * Math.PI * 0.5);
      scale = 1.0 + 0.035 * easeZoom; // gentle 3.5% cinematic scale-in
    }

    if (scale !== 1.0) {
      const scaledW = renderW * scale;
      const scaledH = renderH * scale;
      const scaledX = offsetX - (scaledW - renderW) / 2;
      const scaledY = offsetY - (scaledH - renderH) / 2;
      canvasCtx.drawImage(img, scaledX, scaledY, scaledW, scaledH);
    } else {
      canvasCtx.drawImage(img, offsetX, offsetY, renderW, renderH);
    }
  }

  let lastTimestamp = 0;
  const COMMERCIAL_SPEED = 24;

  function commercialLoop(timestamp) {
    if (!state.isAutoPlaying) return;
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    state.targetFrame += delta * COMMERCIAL_SPEED * state.playbackSpeed;

    if (state.targetFrame >= TOTAL_FRAMES) {
      state.targetFrame = 0;
      state.currentFrame = 0;
    }

    const prevFrame = state.currentFrame;
    state.currentFrame += (state.targetFrame - state.currentFrame) * 0.2;

    if (Math.round(prevFrame) !== Math.round(state.currentFrame)) {
      drawFrame(state.currentFrame);
    }

    const effectiveProgress = state.currentFrame / (TOTAL_FRAMES - 1);
    updateEngineAudio(effectiveProgress);
    updateHeroTextTransition(effectiveProgress);

    state.commercialLoopId = requestAnimationFrame(commercialLoop);
  }

  // --- CINEMATIC HERO TEXT-TO-LOGO TRANSITION ---
  function updateHeroTextTransition(progress) {
    if (!el.heroTitle) return;

    // Smooth cubic Hermite curve for luxury commercial easing
    const hermite = (t) => t * t * (3 - 2 * t);

    // --- 1. HEADLINE & EYEBROW FADE-OUT (Progress ~0.74 to ~0.85) ---
    // Remains clearly visible for first 74% of the video.
    // Smoothly fades out between 74% and 85% with subtle upward motion.
    // Smoothly reappears on loop wrap-around between 0.00 and 0.08.
    let titleOpacity = 1;
    let titleY = 0;

    if (progress < 0.08) {
      const t = progress / 0.08;
      const ease = hermite(t);
      titleOpacity = ease;
      titleY = 14 * (1 - ease);
    } else if (progress < 0.74) {
      titleOpacity = 1;
      titleY = 0;
    } else if (progress < 0.85) {
      const t = (progress - 0.74) / 0.11;
      const ease = hermite(t);
      titleOpacity = 1 - ease;
      titleY = -18 * ease; // smooth upward drift
    } else {
      titleOpacity = 0;
      titleY = -18;
    }

    el.heroTitle.style.opacity = titleOpacity.toFixed(3);
    el.heroTitle.style.transform = `translateY(${titleY.toFixed(1)}px)`;

    if (el.heroBadge) {
      el.heroBadge.style.opacity = titleOpacity.toFixed(3);
      el.heroBadge.style.transform = `translateY(${(titleY * 0.75).toFixed(1)}px)`;
    }

    // --- 2. DESCRIPTION & CTA FADE-OUT (Progress ~0.80 to ~0.91) ---
    // Remains visible slightly longer than headline, then dissolves cleanly before logo focus.
    let descOpacity = 1;
    let descY = 0;

    if (progress < 0.11) {
      if (progress < 0.02) {
        descOpacity = 0;
        descY = 14;
      } else {
        const t = (progress - 0.02) / 0.09;
        const ease = hermite(t);
        descOpacity = ease;
        descY = 14 * (1 - ease);
      }
    } else if (progress < 0.80) {
      descOpacity = 1;
      descY = 0;
    } else if (progress < 0.91) {
      const t = (progress - 0.80) / 0.11;
      const ease = hermite(t);
      descOpacity = 1 - ease;
      descY = -14 * ease;
    } else {
      descOpacity = 0;
      descY = -14;
    }

    if (el.heroDesc) {
      el.heroDesc.style.opacity = descOpacity.toFixed(3);
      el.heroDesc.style.transform = `translateY(${descY.toFixed(1)}px)`;
    }

    if (el.heroActions) {
      el.heroActions.style.opacity = descOpacity.toFixed(3);
      el.heroActions.style.transform = `translateY(${descY.toFixed(1)}px)`;
      el.heroActions.style.pointerEvents = descOpacity < 0.05 ? 'none' : 'auto';
    }

    // --- 3. AMBIENT VIGNETTE ADAPTATION FOR BMW LOGO ---
    // Softens the left gradient as logo takes over so the centered BMW logo is unmasked & crisp
    if (el.ambientVignette) {
      if (progress >= 0.80 && progress < 0.92) {
        const t = (progress - 0.80) / 0.12;
        const ease = hermite(t);
        el.ambientVignette.style.opacity = (1 - 0.65 * ease).toFixed(3);
      } else if (progress >= 0.92) {
        el.ambientVignette.style.opacity = '0.35';
      } else if (progress < 0.08) {
        const t = progress / 0.08;
        const ease = hermite(t);
        el.ambientVignette.style.opacity = (0.35 + 0.65 * ease).toFixed(3);
      } else {
        el.ambientVignette.style.opacity = '1';
      }
    }

    // --- 4. SUBTLE LOGO GLOW AMBIENCE (Progress ~0.85 to ~0.99) ---
    if (el.ambientGlow) {
      if (progress >= 0.85 && progress <= 0.99) {
        const glowT = Math.sin(((progress - 0.85) / 0.14) * Math.PI);
        el.ambientGlow.style.opacity = (0.2 + glowT * 0.45).toFixed(3);
      } else {
        el.ambientGlow.style.opacity = '0.18';
      }
    }
  }

  function updateEngineAudio(progress) {
    if (!state.soundEnabled) return;
    let rpmBase = 1200;
    if (progress < 0.15) {
      rpmBase = 1800 + (progress / 0.15) * 5200;
    } else if (progress < 0.35) {
      rpmBase = 4000 + ((progress - 0.15) / 0.20) * 3100;
    } else if (progress < 0.60) {
      rpmBase = 4400 + ((progress - 0.35) / 0.25) * 2800;
    } else if (progress < 0.85) {
      rpmBase = 4800 + ((progress - 0.60) / 0.25) * 2350;
    } else {
      rpmBase = 5300 + ((progress - 0.85) / 0.15) * 1850;
    }

    state.currentRpm += (rpmBase - state.currentRpm) * 0.10;
    setEngineAcoustics(state.currentRpm, 0.4);
  }  function toggleSound() {
    initAudio();
    state.soundEnabled = !state.soundEnabled;

    if (state.soundEnabled) {
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
      if (el.soundIconOn) el.soundIconOn.classList.remove('hidden');
      if (el.soundIconOff) el.soundIconOff.classList.add('hidden');
      if (el.soundLabel) el.soundLabel.textContent = 'SOUND: ON';
      if (el.soundToggleBtn) el.soundToggleBtn.classList.add('active');
      if (el.soundGraphWidget) el.soundGraphWidget.classList.add('sound-active');
      if (el.soundGraphState) el.soundGraphState.textContent = 'LIVE ACTIVE';
      setEngineAcoustics(state.currentRpm, 0.2);
    } else {
      if (engineGain && audioCtx) {
        engineGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
      }
      if (el.soundIconOn) el.soundIconOn.classList.add('hidden');
      if (el.soundIconOff) el.soundIconOff.classList.remove('hidden');
      if (el.soundLabel) el.soundLabel.textContent = 'SOUND: OFF';
      if (el.soundToggleBtn) el.soundToggleBtn.classList.remove('active');
      if (el.soundGraphWidget) el.soundGraphWidget.classList.remove('sound-active');
      if (el.soundGraphState) el.soundGraphState.textContent = 'STANDBY';
    }
  }

  function toggleAutoPlay() {
    state.isAutoPlaying = !state.isAutoPlaying;
    if (state.isAutoPlaying) {
      if (el.playIcon) el.playIcon.classList.add('hidden');
      if (el.pauseIcon) el.pauseIcon.classList.remove('hidden');
      if (el.autoPlayLabel) el.autoPlayLabel.textContent = 'PAUSE';
      if (el.autoPlayBtn) el.autoPlayBtn.classList.add('active');
      if (!state.soundEnabled) toggleSound();
    } else {
      if (el.playIcon) el.playIcon.classList.remove('hidden');
      if (el.pauseIcon) el.pauseIcon.classList.add('hidden');
      if (el.autoPlayLabel) el.autoPlayLabel.textContent = 'CRUISE';
      if (el.autoPlayBtn) el.autoPlayBtn.classList.remove('active');
    }
  }

  function padZero(num, size) {
    let s = num + '';
    while (s.length < size) s = '0' + s;
    return s;
  }

  // --- AUDIO SYNTHESIS DYNOMETER ENGINE ---
  let audioCtx = null;
  let engineGain = null;
  let osc1 = null;
  let osc2 = null;
  let filter = null;
  let noiseNode = null;
  let noiseGain = null;
  let analyser = null;
  let visualizerAnimId = null;

  function initAudio() {
    if (audioCtx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();

      engineGain = audioCtx.createGain();
      engineGain.gain.setValueAtTime(0, audioCtx.currentTime);

      osc1 = audioCtx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(55, audioCtx.currentTime);

      osc2 = audioCtx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(110, audioCtx.currentTime);

      filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, audioCtx.currentTime);
      filter.Q.setValueAtTime(4, audioCtx.currentTime);

      const bufferSize = audioCtx.sampleRate * 2;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      noiseNode = audioCtx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;

      noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.015, audioCtx.currentTime);

      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;

      osc1.connect(filter);
      osc2.connect(filter);
      noiseNode.connect(noiseGain);
      noiseGain.connect(filter);
      filter.connect(engineGain);
      engineGain.connect(analyser);
      analyser.connect(audioCtx.destination);

      osc1.start();
      osc2.start();
      noiseNode.start();
    } catch (e) {
      console.warn('Web Audio synthesis initialization failed:', e);
    }
  }

  function setEngineAcoustics(rpm, load) {
    if (!audioCtx || !state.soundEnabled) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;
    const baseFreq = 40 + (rpm / 7200) * 240;
    const filterFreq = 300 + (rpm / 7200) * 2200 + (load * 600);

    osc1.frequency.setTargetAtTime(baseFreq, now, 0.05);
    osc2.frequency.setTargetAtTime(baseFreq * 1.5, now, 0.05);
    filter.frequency.setTargetAtTime(filterFreq, now, 0.05);

    const gainVol = Math.min(0.35, 0.05 + (rpm / 7200) * 0.25 + (load * 0.1));
    engineGain.gain.setTargetAtTime(gainVol, now, 0.05);
  }

  function startVisualizer() {
    if (!el.audioVisualizer) return;
    const canvas = el.audioVisualizer;
    const vCtx = canvas.getContext('2d');

    function resizeCanvas() {
      const parent = canvas.parentElement;
      canvas.width = parent ? parent.clientWidth : (canvas.clientWidth || 960);
      canvas.height = parent ? parent.clientHeight : (canvas.clientHeight || 220);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    if (el.soundGraphWidget) {
      el.soundGraphWidget.onclick = () => {
        toggleSound();
      };
    }

    function renderVisualizer() {
      visualizerAnimId = requestAnimationFrame(renderVisualizer);
      const width = canvas.width;
      const height = canvas.height;
      vCtx.clearRect(0, 0, width, height);

      if (!analyser || !state.soundEnabled) {
        // Dual-layered subtle cyan & deep blue luminous oscilloscope waveform
        const time = Date.now() * 0.002;
        
        // Primary Cyan Sine Harmonic
        vCtx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
        vCtx.lineWidth = 2;
        vCtx.shadowColor = 'rgba(0, 240, 255, 0.6)';
        vCtx.shadowBlur = 10;
        vCtx.beginPath();
        for (let px = 0; px < width; px += 3) {
          const py = height / 2 + Math.sin(px * 0.015 + time) * 14 + Math.sin(px * 0.038 - time * 1.5) * 6;
          if (px === 0) vCtx.moveTo(px, py);
          else vCtx.lineTo(px, py);
        }
        vCtx.stroke();

        // Secondary Blue Harmonic
        vCtx.strokeStyle = 'rgba(0, 102, 177, 0.35)';
        vCtx.lineWidth = 1.5;
        vCtx.shadowBlur = 0;
        vCtx.beginPath();
        for (let px = 0; px < width; px += 3) {
          const py = height / 2 + Math.sin(px * 0.022 - time * 0.8) * 8 + Math.cos(px * 0.04 + time) * 4;
          if (px === 0) vCtx.moveTo(px, py);
          else vCtx.lineTo(px, py);
        }
        vCtx.stroke();
        return;
      }

      // Active Real-Time Frequency Telemetry Spectrum
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      const barCount = Math.min(48, Math.floor(width / 14));
      const totalSpacing = 4;
      const barWidth = Math.max(3, (width - (barCount - 1) * totalSpacing) / barCount);

      vCtx.shadowBlur = 12;
      vCtx.shadowColor = 'rgba(0, 240, 255, 0.4)';

      for (let i = 0; i < barCount; i++) {
        const idx = Math.floor((i / barCount) * bufferLength);
        const val = dataArray[idx] || 0;
        const barHeight = Math.max(4, (val / 255) * (height * 0.82));
        const x = i * (barWidth + totalSpacing);
        const y = height - barHeight;

        // BMW M Tri-Color Gradient (M Blue -> M Cyan -> M Red Peak)
        const grad = vCtx.createLinearGradient(0, height, 0, y);
        grad.addColorStop(0, 'rgba(0, 102, 177, 0.7)');
        grad.addColorStop(0.55, 'rgba(0, 240, 255, 0.95)');
        grad.addColorStop(1, 'rgba(224, 0, 27, 1)');

        vCtx.fillStyle = grad;
        vCtx.fillRect(x, y, barWidth, barHeight);

        // Glowing Cap Marker
        vCtx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        vCtx.fillRect(x, y, barWidth, 2);
      }

      // Top Continuous Acoustic Contour Line
      vCtx.strokeStyle = 'rgba(0, 240, 255, 0.85)';
      vCtx.lineWidth = 2;
      vCtx.beginPath();
      for (let i = 0; i < barCount; i++) {
        const idx = Math.floor((i / barCount) * bufferLength);
        const val = dataArray[idx] || 0;
        const barHeight = Math.max(4, (val / 255) * (height * 0.82));
        const x = i * (barWidth + totalSpacing) + barWidth / 2;
        const y = height - barHeight - 2;

        if (i === 0) vCtx.moveTo(x, y);
        else vCtx.lineTo(x, y);
      }
      vCtx.stroke();
      vCtx.shadowBlur = 0;
    }
    renderVisualizer();
  }

  function setupAcousticDyno() {
    function triggerDynoPreset(targetRpm, label, duration) {
      if (!state.soundEnabled) toggleSound();
      state.currentRpm = targetRpm;
      if (el.dynoValve) el.dynoValve.textContent = label;

      setEngineAcoustics(targetRpm, 0.8);
      setTimeout(() => {
        state.currentRpm = 1200;
        if (el.dynoValve) el.dynoValve.textContent = 'SPORT ACTIVE';
        setEngineAcoustics(1200, 0.1);
      }, duration);
    }

    if (el.btnEngineStart) {
      el.btnEngineStart.onclick = () => {
        el.btnEngineStart.classList.add('active-dyno');
        triggerDynoPreset(2400, 'COLD START CRANK', 1800);
        setTimeout(() => el.btnEngineStart.classList.remove('active-dyno'), 1800);
      };
    }

    if (el.btnRev4k) {
      el.btnRev4k.onclick = () => {
        el.btnRev4k.classList.add('active-dyno');
        triggerDynoPreset(4200, 'TURBO SPOOL BURBLE', 2200);
        setTimeout(() => el.btnRev4k.classList.remove('active-dyno'), 2200);
      };
    }

    if (el.btnRedline) {
      el.btnRedline.onclick = () => {
        el.btnRedline.classList.add('active-dyno');
        triggerDynoPreset(7200, 'LAUNCH CONTROL REDLINE', 2600);
        setTimeout(() => el.btnRedline.classList.remove('active-dyno'), 2600);
      };
    }

    if (el.throttleSlider) {
      el.throttleSlider.oninput = (e) => {
        const val = parseInt(e.target.value, 10);
        if (el.throttlePercent) el.throttlePercent.textContent = `${val}%`;

        if (val > 0 && !state.soundEnabled) toggleSound();

        const rpm = 1000 + (val / 100) * 6200;
        state.currentRpm = rpm;
        setEngineAcoustics(rpm, val / 100);
      };

      el.throttleSlider.onchange = () => {
        setTimeout(() => {
          if (el.throttleSlider) el.throttleSlider.value = 0;
          if (el.throttlePercent) el.throttlePercent.textContent = '0%';
          state.currentRpm = 1200;
          setEngineAcoustics(1200, 0.1);
        }, 500);
      };
    }
  }

  // --- VIP TEST DRIVE MODAL CORE ---
  function setupTestDriveModal() {
    const openModal = (modelName = 'BMW M4 Competition') => {
      if (el.testDriveModal) {
        el.testDriveModal.classList.remove('hidden');
        el.testDriveForm.classList.remove('hidden');
        el.vipPass.classList.add('hidden');

        // Fill custom summary
        const summary = document.getElementById('modalConfigSummaryDetails');
        if (summary) {
          summary.textContent = modelName;
        }
      }
    };

    const closeModal = () => {
      if (el.testDriveModal) el.testDriveModal.classList.add('hidden');
    };

    if (el.openTestDriveBtns) {
      el.openTestDriveBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const spec = btn.getAttribute('data-model') || 'BMW Vehicle';
          openModal(spec);
        });
      });
    }

    if (el.mExploreBtns) {
      el.mExploreBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const mModel = btn.getAttribute('data-model-name') || 'BMW M Performance';
          openModal(`${mModel} — Custom Allocation`);
        });
      });
    }

    const cBtn = document.getElementById('openTestDriveBtn');
    if (cBtn) cBtn.onclick = (e) => { e.preventDefault(); openModal(); };

    if (el.closeModalBtn) el.closeModalBtn.onclick = closeModal;

    if (el.testDriveModal) {
      el.testDriveModal.onclick = (e) => {
        if (e.target === el.testDriveModal) closeModal();
      };
    }

    if (el.testDriveForm) {
      el.testDriveForm.onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('userName').value || 'BMW VIP Pilot';
        const expSelect = document.getElementById('userExperience');
        const expText = expSelect.options[expSelect.selectedIndex].text;

        const passName = document.getElementById('passName');
        const passExp = document.getElementById('passExp');
        const passId = document.getElementById('passId');

        if (passName) passName.textContent = name;
        if (passExp) passExp.textContent = expText;
        if (passId) passId.textContent = `M4-2026-${Math.floor(1000 + Math.random() * 9000)}-VIP`;

        el.testDriveForm.classList.add('hidden');
        el.vipPass.classList.remove('hidden');
      };
    }
  }

  // --- INITIALIZATION ENTRYPOINT ---
  function init() {
    cacheElements();
    initSmoothScroll();
    initGsapAnimations();
    initDesignHotspots();
    initTechnologyEditor();
    initInteriorModulator();
    initConfigurator();
    setupAcousticDyno();
    setupTestDriveModal();
    initHeroCanvas();
    startVisualizer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
