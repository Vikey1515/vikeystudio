document.addEventListener('DOMContentLoaded', () => {

    /* --- DARK/LIGHT THEME SWITCHER --- */
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Check saved preference or system preference fallback
    let savedTheme = null;
    try {
        savedTheme = localStorage.getItem('theme');
    } catch (e) {
        console.warn('LocalStorage is blocked (likely due to file:// protocol):', e);
    }

    if (savedTheme === 'light' || (!savedTheme && window.matchMedia('(prefers-color-scheme: light)').matches)) {
        body.classList.add('light-mode');
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('light-mode');
        try {
            localStorage.setItem('theme', body.classList.contains('light-mode') ? 'light' : 'dark');
        } catch (e) {
            console.warn('LocalStorage is blocked (likely due to file:// protocol):', e);
        }
    });

    /* --- CURSOR GLOW MOVEMENT --- */
    const cursorGlow = document.getElementById('cursor-glow');
    document.addEventListener('mousemove', (e) => {
        // Use transform to avoid layout thrashing and leverage GPU compositing
        // Keep the centering offset from CSS by applying translate(-50%,-50%) as well
        cursorGlow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
    });

    /* --- NAVIGATION SCROLL EFFECT & ACTIVE LINKS --- */
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section');
    const projectsActions = document.querySelector('#projects .projects-actions');

    function updateScrollState() {
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
    const hoverPlayVideos = document.querySelectorAll('.hover-play-video');
    hoverPlayVideos.forEach(video => {
        video.addEventListener('mouseenter', () => {
            video.play().catch(() => {});
        });

        video.addEventListener('mouseleave', () => {
            video.pause();
            // Optional: reset to beginning on hover out
            // video.currentTime = 0; 
        });
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

            // Dynamically update view more button href
            if (viewMoreBtn) {
                if (filterValue === 'editing') {
                    viewMoreBtn.href = 'editing.html';
                } else if (filterValue === 'ai-commercial') {
                    viewMoreBtn.href = 'ai-commercial.html';
                }
            }
        });
    });

    // Trigger initial filter on page load
    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab) activeTab.click();

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

        // Close on clicking overlay background
        coursesModal.addEventListener('click', (e) => {
            if (e.target === coursesModal) {
                closeModal();
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
});

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
