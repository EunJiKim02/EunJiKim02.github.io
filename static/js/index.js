window.HELP_IMPROVE_VIDEOJS = false;

// More Works Dropdown Functionality
function toggleMoreWorks() {
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    } else {
        dropdown.classList.add('show');
        button.classList.add('active');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const container = document.querySelector('.more-works-container');
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (container && !container.contains(event.target)) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Close dropdown on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const dropdown = document.getElementById('moreWorksDropdown');
        const button = document.querySelector('.more-works-btn');
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Copy BibTeX to clipboard
function copyBibTeX() {
    const bibtexElement = document.getElementById('bibtex-code');
    const button = document.querySelector('.copy-bibtex-btn');
    const copyText = button.querySelector('.copy-text');
    
    if (bibtexElement) {
        navigator.clipboard.writeText(bibtexElement.textContent).then(function() {
            // Success feedback
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        }).catch(function(err) {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = bibtexElement.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        });
    }
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
window.addEventListener('scroll', function() {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (!scrollButton) {
        return;
    }
    if (window.pageYOffset > 300) {
        scrollButton.classList.add('visible');
    } else {
        scrollButton.classList.remove('visible');
    }
});

// Video carousel autoplay when in view
function setupVideoCarouselAutoplay() {
    const carouselVideos = document.querySelectorAll('.results-carousel video');
    
    if (carouselVideos.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                // Video is in view, play it
                video.play().catch(e => {
                    // Autoplay failed, probably due to browser policy
                    console.log('Autoplay prevented:', e);
                });
            } else {
                // Video is out of view, pause it
                video.pause();
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the video is visible
    });
    
    carouselVideos.forEach(video => {
        observer.observe(video);
    });
}

function setupPaperCarousels() {
    const carousels = document.querySelectorAll('.paper-carousel');

    carousels.forEach(function(carousel) {
        const viewport = carousel.querySelector('.paper-viewport');
        const track = carousel.querySelector('.paper-grid');
        const cards = Array.from(carousel.querySelectorAll('.paper-card'));
        const previousButton = carousel.querySelector('[data-carousel-button="prev"]');
        const nextButton = carousel.querySelector('[data-carousel-button="next"]');
        const indicators = carousel.querySelector('.paper-indicators');

        if (!viewport || !track || !previousButton || !nextButton || !indicators || cards.length === 0) {
            return;
        }

        let currentIndex = 0;
        let autoplayTimer = null;
        let indicatorButtons = [];
        const hasMultipleCards = cards.length > 1;

        // Do not remove buttons from the DOM; toggle a class so they remain accessible
        previousButton.classList.toggle('no-arrows', !hasMultipleCards);
        nextButton.classList.toggle('no-arrows', !hasMultipleCards);
        // Keep aria-hidden accurate for assistive tech
        previousButton.setAttribute('aria-hidden', String(!hasMultipleCards));
        nextButton.setAttribute('aria-hidden', String(!hasMultipleCards));

        function buildIndicators() {
            indicators.innerHTML = '';
            indicatorButtons = cards.map(function(_, index) {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'paper-indicator';
                button.setAttribute('aria-label', `Go to paper ${index + 1} of ${cards.length}`);
                button.addEventListener('click', function() {
                    moveToIndex(index, true);
                });
                indicators.appendChild(button);
                return button;
            });
        }

        function layoutCards() {
            const cardCount = cards.length;
            const cardWidth = 100 / cardCount;

            track.style.width = `${cardCount * 100}%`;
            cards.forEach(function(card) {
                card.style.flex = `0 0 ${cardWidth}%`;
                card.style.maxWidth = `${cardWidth}%`;
            });

            updatePosition(false);
        }

        function updatePosition(animate) {
            const cardCount = cards.length;
            const offset = viewport.clientWidth * currentIndex;

            track.style.transition = animate ? 'transform 320ms ease' : 'none';
            track.style.transform = `translate3d(-${offset}px, 0, 0)`;

            const canLoop = cardCount > 1;
            previousButton.disabled = !canLoop;
            nextButton.disabled = !canLoop;

            indicatorButtons.forEach(function(button, index) {
                button.classList.toggle('is-active', index === currentIndex);
            });
        }

        function moveToIndex(nextIndex, animate) {
            currentIndex = (nextIndex + cards.length) % cards.length;
            updatePosition(animate);
        }

        function startAutoplay() {
            if (autoplayTimer || cards.length <= 1) {
                return;
            }

            autoplayTimer = window.setInterval(function() {
                moveToIndex(currentIndex + 1, true);
            }, 5000);
        }

        function stopAutoplay() {
            if (!autoplayTimer) {
                return;
            }

            window.clearInterval(autoplayTimer);
            autoplayTimer = null;
        }

        previousButton.addEventListener('click', function() {
            moveToIndex(currentIndex - 1, true);
        });

        nextButton.addEventListener('click', function() {
            moveToIndex(currentIndex + 1, true);
        });

        carousel.addEventListener('mouseenter', stopAutoplay);
        carousel.addEventListener('mouseleave', startAutoplay);
        buildIndicators();
        window.addEventListener('resize', layoutCards);
        layoutCards();
        startAutoplay();
    });
}

document.addEventListener('DOMContentLoaded', function() {
    if (window.bulmaCarousel && typeof bulmaCarousel.attach === 'function') {
        var options = {
			 slidesToScroll: 1,
			 slidesToShow: 1,
			 loop: true,
			 infinite: true,
			 autoplay: true,
			 autoplaySpeed: 5000,
        };

		// Initialize all div with carousel class
        bulmaCarousel.attach('.carousel', options);
	}

    if (window.bulmaSlider && typeof bulmaSlider.attach === 'function') {
        bulmaSlider.attach();
    }
    
    // Setup video autoplay for carousel
    setupVideoCarouselAutoplay();
    setupPaperCarousels();

});
