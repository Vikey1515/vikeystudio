function init() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    /* --- DARK/LIGHT THEME SWITCHER --- */
    let savedTheme = null;
    try {
        savedTheme = localStorage.getItem('theme');
    } catch (e) {
        console.warn('LocalStorage is blocked (likely due to file:// protocol):', e);
    }

    if (savedTheme === 'light' || (!savedTheme && window.matchMedia('(prefers-color-scheme: light)').matches)) {
        body.classList.add('light-mode');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('light-mode');
            try {
                localStorage.setItem('theme', body.classList.contains('light-mode') ? 'light' : 'dark');
            } catch (e) {
                console.warn('LocalStorage is blocked (likely due to file:// protocol):', e);
            }
        });
    }

    /* --- CURSOR GLOW MOVEMENT --- */
    const cursorGlow = document.getElementById('cursor-glow');
    if (cursorGlow) {
        document.addEventListener('mousemove', (e) => {
            // Use transform to avoid layout thrashing and leverage GPU compositing
            // Keep the centering offset from CSS by applying translate(-50%,-50%) as well
            cursorGlow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
        });
    }

    /* --- NAVIGATION SCROLL EFFECT & ACTIVE LINKS --- */
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section');
    const projectsActions = document.querySelector('#projects .projects-actions');

    function updateScrollState() {
        if (!navbar) return;
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active Nav Indicator based on Scroll Position
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${currentSectionId}` || (currentSectionId === 'home' && (href === '#' || href === 'index.html'))) {
                link.classList.add('active');
            }
        });

        // Show/hide sticky button when projects section is active
        if (projectsActions) {
            if (currentSectionId === 'projects') {
                projectsActions.classList.add('show-sticky');
            } else {
                projectsActions.classList.remove('show-sticky');
            }
        }
    }

    window.addEventListener('scroll', updateScrollState);
    updateScrollState(); // Trigger once on load

    /* --- MOBILE NAV TOGGLE --- */
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-links');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
            // Add full mobile navigation styling on demand
            if (navMenu.style.display === 'flex') {
                navMenu.style.position = 'absolute';
                navMenu.style.top = '80px';
                navMenu.style.left = '0';
                navMenu.style.width = '100%';
                navMenu.style.flexDirection = 'column';
                navMenu.style.background = 'rgba(10, 10, 10, 0.95)';
                navMenu.style.backdropFilter = 'blur(10px)';
                navMenu.style.padding = '30px';
                navMenu.style.borderRadius = '20px';
                navMenu.style.border = '1px solid rgba(255, 255, 255, 0.08)';
                navMenu.style.gap = '20px';
                navMenu.style.textAlign = 'center';
            }
        });
    }

    // Close mobile nav when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 992) {
                navMenu.style.display = 'none';
            }
        });
    });

    /* --- HERO VIDEO CAROUSEL & PREVIEW SELECTOR --- */
    const videoSources = [
        {
            src: "Assets/Videos/Preview 1.webm",
            title: "Where Imagination<br><span class=\"glow-text\">Meets Realism.</span>",
            desc: "Custom showcase editing preview"
        },
        {
            src: "Assets/Videos/Preview 2.webm",
            title: "Next-Generation<br><span class=\"glow-text\">Visual Formulation.</span>",
            desc: "Precision workflow and narrative color treatment"
        },
        {
            src: "Assets/Videos/Preview 3.webm",
            title: "Real World Quality,<br><span class=\"glow-text\">Powered by AI.</span>",
            desc: "High-octane commercial rendering and visual effects"
        },
        {
            src: "Assets/Videos/Preview 4.webm",
            title: "High-End AI Videos,<br><span class=\"glow-text\">Zero Shoot Hassles.</span>",
            desc: "Concept design to dynamic rendering workflows"
        }
    ];

    let currentHeroIndex = 0;
    const heroBgVideo = document.getElementById('hero-bg-video');
    const heroTitle = document.querySelector('.hero-text-area h1');
    const indicatorBars = document.querySelectorAll('.indicator-bar');

    const AUTO_CYCLE_MS = 4000; // keep in sync with autoCycle timer

    function preloadVideoAt(index) {
        try {
            const src = videoSources[index].src;
            const v = document.createElement('video');
            v.preload = 'auto';
            v.src = src;
        } catch (e) {
            // noop if preload fails
        }
    }

    function updateHeroVideos(targetIndex) {
        if (!heroBgVideo) return;
        currentHeroIndex = targetIndex;
        
        // Update main video background src
        heroBgVideo.src = videoSources[currentHeroIndex].src;
        heroBgVideo.load();
        heroBgVideo.play().catch(() => {});

        // Update main hero title
        if (heroTitle) {
            heroTitle.innerHTML = videoSources[currentHeroIndex].title;
        }

        // Update active indicator bar and (re)start its fill animation
        indicatorBars.forEach((bar, idx) => {
            const fill = bar.querySelector('.indicator-fill');
            // Reset any running animation
            if (fill) {
                fill.style.animation = 'none';
                fill.style.width = '0%';
            }

            if (idx === currentHeroIndex) {
                bar.classList.add('active');
                if (fill) {
                    // Force reflow to allow restarting animation
                    void fill.offsetWidth;
                    fill.style.animation = `indicatorProgress ${AUTO_CYCLE_MS}ms linear forwards`;
                }
            } else {
                bar.classList.remove('active');
            }
        });

        // Preload the next video to reduce loading lag
        preloadVideoAt((currentHeroIndex + 1) % videoSources.length);
    }

    // Indicator bar clicks
    indicatorBars.forEach(bar => {
        bar.addEventListener('click', () => {
            const index = parseInt(bar.getAttribute('data-index'));
            updateHeroVideos(index);
            resetAutoCycle();
        });
    });

    // Auto switch video every 4 seconds if hero element is present
    let autoCycleTimer;
    if (heroBgVideo) {
        autoCycleTimer = setInterval(() => {
            const nextIndex = (currentHeroIndex + 1) % videoSources.length;
            updateHeroVideos(nextIndex);
        }, 4000);
    }

    function resetAutoCycle() {
        if (!heroBgVideo) return;
        clearInterval(autoCycleTimer);
        autoCycleTimer = setInterval(() => {
            const nextIndex = (currentHeroIndex + 1) % videoSources.length;
            updateHeroVideos(nextIndex);
        }, 4000);
    }

    /* --- HOVER TO PLAY SNIPPETS ON PORTFOLIO GRID --- */
    // Helper to send messages to YouTube iFrame Player API
    function controlYTPlayer(iframe, action) {
        if (!iframe || !iframe.contentWindow) return;
        const command = action === 'play' ? 'playVideo' : 'pauseVideo';
        try {
            iframe.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func: command,
                args: ''
            }), '*');
        } catch (e) {}
    }

    // Toggle playing class for HTML5 videos on play/pause
    const html5Videos = document.querySelectorAll('.hover-play-video');
    html5Videos.forEach(v => {
        const item = v.closest('.project-item');
        if (item) {
            v.addEventListener('play', () => item.classList.add('playing'));
            v.addEventListener('playing', () => item.classList.add('playing'));
            v.addEventListener('pause', () => item.classList.remove('playing'));
            v.addEventListener('ended', () => item.classList.remove('playing'));
        }
    });

    const projectItems = document.querySelectorAll('.project-item');
    const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;

    const pauseAllMediaExcept = (currentItem) => {
        document.querySelectorAll('.hover-play-video').forEach(v => {
            if (v.closest('.project-item') !== currentItem) v.pause();
        });
        document.querySelectorAll('.youtube-short-iframe').forEach(y => {
            if (y.closest('.project-item') !== currentItem) {
                controlYTPlayer(y, 'pause');
                const otherItem = y.closest('.project-item');
                if (otherItem) otherItem.classList.remove('playing');
            }
        });
        if (window.Wistia) {
            try {
                Wistia.api.all().forEach(w => {
                    const otherContainer = w.container.closest('.project-item');
                    if (otherContainer && otherContainer !== currentItem) {
                        w.pause();
                        otherContainer.classList.remove('playing');
                    }
                });
            } catch (e) {}
        }
    };

    const showProgressControls = (card) => {
        const progressContainer = card.querySelector('.video-progress-container');
        if (progressContainer) {
            progressContainer.classList.remove('hidden');
        }
    };

    const hideProgressControls = (card) => {
        const progressContainer = card.querySelector('.video-progress-container');
        if (progressContainer) {
            progressContainer.classList.add('hidden');
        }
    };

    const clearHideProgressTimer = (card) => {
        if (card._progressHideTimer) {
            clearTimeout(card._progressHideTimer);
            card._progressHideTimer = null;
        }
    };

    const scheduleHideProgress = (card) => {
        clearHideProgressTimer(card);
        card._progressHideTimer = setTimeout(() => {
            if (card.classList.contains('playing')) {
                hideProgressControls(card);
            }
        }, 1000);
    };

    projectItems.forEach(item => {
        const video = item.querySelector('.hover-play-video');
        const ytIframe = item.querySelector('.youtube-short-iframe');
        
        let touchStartX = 0;
        let touchStartY = 0;
        let touchCancelled = false;

        item.addEventListener('touchstart', (e) => {
            if (!isTouchDevice || e.touches.length > 1) return;
            const targetIsControl = e.target.closest('.custom-video-controls, .big-play-btn, .expand-btn, .youtube-short-iframe');
            if (targetIsControl) return;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchCancelled = false;
        });

        item.addEventListener('touchmove', (e) => {
            if (!isTouchDevice || touchCancelled || e.touches.length > 1) return;
            const dx = Math.abs(e.touches[0].clientX - touchStartX);
            const dy = Math.abs(e.touches[0].clientY - touchStartY);
            if (dx > 10 || dy > 10) touchCancelled = true;
        });

        item.addEventListener('touchend', (e) => {
            if (!isTouchDevice || touchCancelled) return;
            if (e.target.closest('.custom-video-controls, .expand-btn')) return;
            e.preventDefault();
            e.stopPropagation();

            const isPlaying = item.classList.contains('playing');
            if (video) {
                if (!video.paused) {
                    video.pause();
                    item.classList.remove('playing');
                    showProgressControls(item);
                    clearHideProgressTimer(item);
                } else {
                    pauseAllMediaExcept(item);
                    video.play().catch(() => {});
                    item.classList.add('playing');
                    showProgressControls(item);
                    scheduleHideProgress(item);
                }
                return;
            }

            if (ytIframe) {
                if (isPlaying) {
                    controlYTPlayer(ytIframe, 'pause');
                    item.classList.remove('playing');
                    showProgressControls(item);
                    clearHideProgressTimer(item);
                } else {
                    pauseAllMediaExcept(item);
                    controlYTPlayer(ytIframe, 'play');
                    item.classList.add('playing');
                    showProgressControls(item);
                    scheduleHideProgress(item);
                }
            }
        });

        item.addEventListener('mouseenter', () => {
            // 1. Pause all other HTML5 videos
            const otherHTML5Videos = document.querySelectorAll('.hover-play-video');
            otherHTML5Videos.forEach(otherVideo => {
                if (otherVideo !== video) {
                    otherVideo.pause();
                }
            });

            // 2. Pause all other YouTube videos
            const otherYTIframes = document.querySelectorAll('.youtube-short-iframe');
            otherYTIframes.forEach(otherIframe => {
                if (otherIframe !== ytIframe) {
                    controlYTPlayer(otherIframe, 'pause');
                    const otherItem = otherIframe.closest('.project-item');
                    if (otherItem) {
                        otherItem.classList.remove('playing');
                    }
                }
            });

            // 3. Pause any active Wistia video players
            if (window.Wistia) {
                try {
                    const allWistiaVideos = Wistia.api.all();
                    allWistiaVideos.forEach(w => {
                        w.pause();
                        const otherContainer = w.container.closest('.project-item');
                        if (otherContainer) {
                            otherContainer.classList.remove('playing');
                        }
                    });
                } catch (e) {}
            }

            // 4. Play the current video/iframe
            if (video) {
                video.play().catch(() => {});
            }
            if (ytIframe) {
                controlYTPlayer(ytIframe, 'play');
                item.classList.add('playing');
            }
        });

        // mouseleave pause behavior removed to keep the video playing until another card is pointed
    });

    /* --- WISTIA EMBEDDED VIDEOS MUTUAL EXCLUSION --- */
    window._wq = window._wq || [];
    _wq.push({
        id: "_all",
        onReady: function(video) {
            video.bind("play", function() {
                // Add playing class to the container project-item
                const container = video.container.closest('.project-item');
                if (container) {
                    container.classList.add('playing');
                }

                // Pause all HTML5 hover-play videos
                const hoverVideos = document.querySelectorAll('.hover-play-video');
                hoverVideos.forEach(v => v.pause());

                // Pause all YouTube short iframes
                const ytIframes = document.querySelectorAll('.youtube-short-iframe');
                ytIframes.forEach(y => {
                    controlYTPlayer(y, 'pause');
                    const item = y.closest('.project-item');
                    if (item) {
                        item.classList.remove('playing');
                    }
                });

                // Pause all other Wistia embeds
                if (window.Wistia) {
                    try {
                        const allWistiaVideos = Wistia.api.all();
                        allWistiaVideos.forEach(w => {
                            if (w.hashedId() !== video.hashedId()) {
                                w.pause();
                                const otherContainer = w.container.closest('.project-item');
                                if (otherContainer) {
                                    otherContainer.classList.remove('playing');
                                }
                            }
                        });
                    } catch (e) {}
                }
            });

            video.bind("pause", function() {
                const container = video.container.closest('.project-item');
                if (container) {
                    container.classList.remove('playing');
                }
            });

            video.bind("end", function() {
                const container = video.container.closest('.project-item');
                if (container) {
                    container.classList.remove('playing');
                }
            });
        }
    });

    /* --- PORTFOLIO CATEGORY FILTER --- */
    const tabButtons = document.querySelectorAll('.tab-btn');
    const projectGrid = document.getElementById('project-grid');
    const viewMoreBtn = document.getElementById('view-more-btn');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active tab buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            // Update grid classes for layout and filtering
            if (projectGrid) {
                projectGrid.className = `project-grid show-${filterValue}`;
                if (filterValue === 'ai-commercial') {
                    projectGrid.classList.add('grid-2x2');
                }
            }

            // Update View More link to pass selected tab parameter
            if (viewMoreBtn) {
                viewMoreBtn.href = `projects.html?tab=${filterValue}`;
            }
        });
    });

    // Trigger initial filter on page load
    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab) activeTab.click();

    /* --- PAUSE VIDEOS SCROLLED OUT OF VIEWPORT --- */
    const viewportObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                const item = entry.target;
                if (item.classList.contains('playing')) {
                    const video = item.querySelector('.hover-play-video');
                    const ytIframe = item.querySelector('.youtube-short-iframe');
                    
                    if (video) {
                        video.pause();
                    }
                    if (ytIframe) {
                        controlYTPlayer(ytIframe, 'pause');
                    }
                    if (window.Wistia) {
                        try {
                            const allWistiaVideos = Wistia.api.all();
                            allWistiaVideos.forEach(w => {
                                if (w.container && item.contains(w.container)) {
                                    w.pause();
                                }
                            });
                        } catch (e) {}
                    }
                    item.classList.remove('playing');
                }
            }
        });
    }, { root: null, threshold: 0 });

    document.querySelectorAll('.project-item').forEach(item => {
        viewportObserver.observe(item);
    });

    /* --- CONTACT FORM --- */
    // Handled natively via HTML POST to FormSubmit.co for reliable cross-origin delivery.

    // Set initial thumbnail video source
    if (heroBgVideo) {
        updateHeroVideos(0);
    }

    /* --- COURSES POPUP MODAL ANIMATION --- */
    const teachingSoonBtn = document.querySelector('.teaching-soon-badge');
    const coursesModal = document.getElementById('courses-modal');
    const modalClose = document.getElementById('modal-close');
    const modalWordsContainer = document.getElementById('modal-words-container');

    const messageText = "Thank you for your interest! Our courses will be launching soon. Stay tuned!";

    if (teachingSoonBtn && coursesModal && modalWordsContainer) {
        teachingSoonBtn.addEventListener('click', () => {
            // Clear previous words
            modalWordsContainer.innerHTML = '';
            
            // Open modal
            coursesModal.classList.add('active');

            // Split message into words
            const words = messageText.split(' ');

            // Inject words with staggered animation delays
            words.forEach((word, idx) => {
                const span = document.createElement('span');
                span.innerText = word;
                span.classList.add('popup-word');
                // Stagger delay: 0.1s per word for smoother pacing
                span.style.animationDelay = `${idx * 0.1}s`;
                modalWordsContainer.appendChild(span);
            });
        });

        const closeModal = () => {
            coursesModal.classList.remove('active');
            // Clear contents after transition to reset state
            setTimeout(() => {
                modalWordsContainer.innerHTML = '';
            }, 500);
        };

        if (modalClose) {
            modalClose.addEventListener('click', closeModal);
        }

        coursesModal.addEventListener('click', (e) => {
            if (e.target === coursesModal) {
                closeModal();
            }
        });
    }

    /* --- CONTACT MODAL POPUP --- */
    const aboutCtaContactBtn = document.getElementById('about-cta-contact-btn');
    const contactModal = document.getElementById('contact-modal');
    const contactModalClose = document.getElementById('contact-modal-close');

    if (aboutCtaContactBtn && contactModal) {
        aboutCtaContactBtn.addEventListener('click', (e) => {
            e.preventDefault();
            contactModal.classList.add('active');
        });

        const closeContactModal = () => {
            contactModal.classList.remove('active');
        };

        if (contactModalClose) {
            contactModalClose.addEventListener('click', closeContactModal);
        }

        contactModal.addEventListener('click', (e) => {
            if (e.target === contactModal) {
                closeContactModal();
            }
        });
    }

    /* --- SCROLL REVEAL OBSERVER --- */
    const projectsSectionEl = document.getElementById('projects');
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    if (projectsSectionEl && revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    revealElements.forEach(el => el.classList.add('revealed'));
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1, // trigger when 10% of projects section is visible
            rootMargin: "0px 0px -20px 0px"
        });

        revealObserver.observe(projectsSectionEl);
    }

    /* --- CUSTOM DROPDOWN SELECT --- */
    const customDropdown = document.getElementById('custom-service-select');
    if (customDropdown) {
        const trigger = customDropdown.querySelector('.dropdown-trigger');
        const optionsList = customDropdown.querySelectorAll('.dropdown-option');
        const hiddenInput = document.getElementById('service-interest-input');
        const selectedText = document.getElementById('selected-service-text');

        // Toggle open/close
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            customDropdown.classList.toggle('active');
        });

        // Option click selection
        optionsList.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Remove selected from all options
                optionsList.forEach(opt => opt.classList.remove('selected'));
                
                // Add selected to clicked option
                option.classList.add('selected');
                
                const val = option.getAttribute('data-value');
                const text = option.textContent;
                
                selectedText.textContent = text;
                hiddenInput.value = val;
                
                customDropdown.classList.remove('active');
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            customDropdown.classList.remove('active');
        });
    }

    /* --- SETUP CUSTOM VIDEO CONTROLS FOR AI COMMERCIAL CARDS --- */
    const aiCommercialCards = document.querySelectorAll('.project-item[data-category="ai-commercial"]');
    aiCommercialCards.forEach(card => {
        const video = card.querySelector('.hover-play-video');
        if (!video) return;

        const controls = card.querySelector('.custom-video-controls');
        if (!controls) return;

        const playPauseBtn = controls.querySelector('.play-pause-btn');
        const playIcon = playPauseBtn.querySelector('.play-icon');
        const pauseIcon = playPauseBtn.querySelector('.pause-icon');
        const progressBar = controls.querySelector('.video-progress-bar');
        const progressContainer = controls.querySelector('.video-progress-container');
        const expandBtn = controls.querySelector('.expand-btn');

        // Play/Pause toggle click
        playPauseBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent card hover play/pause toggles triggering
            if (video.paused) {
                // Pause all other html5 videos
                document.querySelectorAll('.hover-play-video').forEach(v => {
                    if (v !== video) v.pause();
                });
                // Pause YouTube
                document.querySelectorAll('.youtube-short-iframe').forEach(y => {
                    controlYTPlayer(y, 'pause');
                    const item = y.closest('.project-item');
                    if (item) item.classList.remove('playing');
                });
                // Pause Wistia
                if (window.Wistia) {
                    try { Wistia.api.all().forEach(w => w.pause()); } catch(err) {}
                }

                video.play().catch(() => {});
                card.classList.add('playing');
            } else {
                video.pause();
                card.classList.remove('playing');
            }
        });

        // Toggle button states based on video state
        video.addEventListener('play', () => {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            if (isTouchDevice) {
                showProgressControls(card);
                scheduleHideProgress(card);
            }
        });
        video.addEventListener('pause', () => {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            if (isTouchDevice) {
                showProgressControls(card);
                clearHideProgressTimer(card);
            }
        });

        const hoverLine = controls.querySelector('.video-progress-hover-line');
        const progressKnob = controls.querySelector('.video-progress-knob');
        const timeTooltip = controls.querySelector('.video-time-tooltip');

        // Seekbar progress updating
        video.addEventListener('timeupdate', () => {
            if (video.duration && !isScrubbing) {
                const percentage = (video.currentTime / video.duration) * 100;
                progressBar.style.width = `${percentage}%`;
                progressKnob.style.left = `${percentage}%`;
            }
        });

        // Hover position time tooltip and preview line
        progressContainer.addEventListener('mousemove', (e) => {
            const rect = progressContainer.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const width = rect.width;
            const percentage = Math.max(0, Math.min(1, clickX / width));
            
            hoverLine.style.width = `${percentage * 100}%`;
            timeTooltip.style.left = `${percentage * 100}%`;
            
            if (video.duration && !isNaN(video.duration)) {
                const hoverTime = percentage * video.duration;
                const mins = Math.floor(hoverTime / 60);
                const secs = Math.floor(hoverTime % 60);
                timeTooltip.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }
        });

        // Seeker clicking and dragging (scrubbing)
        let isScrubbing = false;
        let isDragging = false;
        let startX = 0;

        function scrub(e) {
            const rect = progressContainer.getBoundingClientRect();
            let clientX = e.clientX;
            if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
            } else if (e.changedTouches && e.changedTouches.length > 0) {
                clientX = e.changedTouches[0].clientX;
            }
            const clickX = clientX - rect.left;
            const width = rect.width;
            const percentage = Math.max(0, Math.min(1, clickX / width));
            
            progressBar.style.width = `${percentage * 100}%`;
            progressKnob.style.left = `${percentage * 100}%`;
            if (video.duration && !isNaN(video.duration)) {
                video.currentTime = percentage * video.duration;
            }
        }

        progressContainer.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            isScrubbing = true;
            isDragging = false;
            startX = e.clientX;
        });

        progressContainer.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            isScrubbing = true;
            isDragging = false;
            startX = e.touches[0].clientX;
            scrub(e); // scrub instantly on touch start
        });

        window.addEventListener('mousemove', (e) => {
            if (isScrubbing) {
                if (!isDragging && Math.abs(e.clientX - startX) > 4) {
                    isDragging = true;
                    video.pause(); // pause only when actively dragging
                    progressContainer.classList.add('scrubbing');
                    card.classList.add('scrubbing');
                }
                scrub(e);
            }
        });

        window.addEventListener('touchmove', (e) => {
            if (isScrubbing) {
                if (!isDragging && Math.abs(e.touches[0].clientX - startX) > 4) {
                    isDragging = true;
                    video.pause(); // pause only when actively dragging
                    progressContainer.classList.add('scrubbing');
                    card.classList.add('scrubbing');
                }
                scrub(e);
            }
        });

        // Click-to-Jump (Native Click Handler)
        progressContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!isDragging) {
                scrub(e); // seek to position
                
                // Mute other HTML5 videos, YouTube and Wistia
                document.querySelectorAll('.hover-play-video').forEach(v => {
                    if (v !== video) v.pause();
                });
                document.querySelectorAll('.youtube-short-iframe').forEach(y => {
                    controlYTPlayer(y, 'pause');
                    const item = y.closest('.project-item');
                    if (item) item.classList.remove('playing');
                });
                if (window.Wistia) {
                    try { Wistia.api.all().forEach(w => w.pause()); } catch(err) {}
                }

                // Play from the clicked spot
                video.play().catch(() => {});
                card.classList.add('playing');
            }
        });

        // Drag release handler (Mouse)
        window.addEventListener('mouseup', (e) => {
            if (isScrubbing) {
                const wasDragging = isDragging;
                isScrubbing = false;
                progressContainer.classList.remove('scrubbing');
                card.classList.remove('scrubbing');
                
                if (wasDragging) {
                    // Mute other HTML5 videos, YouTube and Wistia
                    document.querySelectorAll('.hover-play-video').forEach(v => {
                        if (v !== video) v.pause();
                    });
                    document.querySelectorAll('.youtube-short-iframe').forEach(y => {
                        controlYTPlayer(y, 'pause');
                        const item = y.closest('.project-item');
                        if (item) item.classList.remove('playing');
                    });
                    if (window.Wistia) {
                        try { Wistia.api.all().forEach(w => w.pause()); } catch(err) {}
                    }

                    // Play from the released spot
                    video.play().catch(() => {});
                    card.classList.add('playing');
                }
            }
        });

        // Drag release handler (Touch)
        window.addEventListener('touchend', (e) => {
            if (isScrubbing) {
                const wasDragging = isDragging;
                isScrubbing = false;
                progressContainer.classList.remove('scrubbing');
                card.classList.remove('scrubbing');
                
                // On touch release, if they didn't drag it's a tap-to-jump!
                if (!wasDragging) {
                    // Since touch clientX isn't available on touchend, touchstart already scrubbed to the point.
                    // We just need to resume playback!
                    // Mute other HTML5 videos, YouTube and Wistia
                    document.querySelectorAll('.hover-play-video').forEach(v => {
                        if (v !== video) v.pause();
                    });
                    document.querySelectorAll('.youtube-short-iframe').forEach(y => {
                        controlYTPlayer(y, 'pause');
                        const item = y.closest('.project-item');
                        if (item) item.classList.remove('playing');
                    });
                    if (window.Wistia) {
                        try { Wistia.api.all().forEach(w => w.pause()); } catch(err) {}
                    }

                    // Play from the tapped spot
                    video.play().catch(() => {});
                    card.classList.add('playing');
                } else {
                    // If they dragged, play from the released spot
                    // Mute other HTML5 videos, YouTube and Wistia
                    document.querySelectorAll('.hover-play-video').forEach(v => {
                        if (v !== video) v.pause();
                    });
                    document.querySelectorAll('.youtube-short-iframe').forEach(y => {
                        controlYTPlayer(y, 'pause');
                        const item = y.closest('.project-item');
                        if (item) item.classList.remove('playing');
                    });
                    if (window.Wistia) {
                        try { Wistia.api.all().forEach(w => w.pause()); } catch(err) {}
                    }

                    // Play from the released spot
                    video.play().catch(() => {});
                    card.classList.add('playing');
                }
            }
        });

        // Fullscreen Toggle
        expandBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (video.requestFullscreen) {
                video.requestFullscreen();
            } else if (video.webkitRequestFullscreen) {
                video.webkitRequestFullscreen();
            } else if (video.msRequestFullscreen) {
                video.msRequestFullscreen();
            }
        });

        // Centered Big Play Button Click handling
        const bigPlayBtn = card.querySelector('.big-play-btn');
        if (bigPlayBtn) {
            bigPlayBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                playPauseBtn.click(); // trigger the main playPauseBtn logic
            });
        }

        // Make the video element itself clickable to play/pause
        video.addEventListener('click', (e) => {
            e.stopPropagation();
            playPauseBtn.click();
        });
    });

    // Disable context menu on all video elements to prevent download option
    document.querySelectorAll('video').forEach(v => {
        v.addEventListener('contextmenu', e => e.preventDefault());
        v.setAttribute('controlsList', 'nodownload');
    });
}

// Safe DOM initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}


/* --- YOUTUBE IFRAME API PLAYER INTEGRATION --- */
let playerLeft, playerRight;
let player; // active/default player reference

window.onYouTubeIframeAPIReady = function() {
    if (document.getElementById('preview-player-left')) {
        playerLeft = new YT.Player('preview-player-left', {
            events: {
                'onReady': () => {
                    player = playerLeft; // default pointer
                }
            }
        });
    }
    if (document.getElementById('preview-player-right')) {
        playerRight = new YT.Player('preview-player-right');
    }
};

// Triggered when a user clicks your custom play button
window.playVideo = function() {
    if (player && typeof player.playVideo === 'function') {
        player.playVideo(); // Native API call to resume the YouTube frame
    }
};

// Triggered when a user clicks your custom pause button
window.pauseVideo = function() {
    if (player && typeof player.pauseVideo === 'function') {
        player.pauseVideo(); // Native API call to pause
    }
};
