document.addEventListener('DOMContentLoaded', () => {

    // Countdown Timer Logic
    const countdownContainer = document.getElementById('countdown');
    const eventStartedMessage = document.getElementById('event-started-message');

    // Set Target Date: 11 MARCH 2026 AT 10:30 AM
    const targetDate = new Date('March 11, 2026 10:30:00').getTime();

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    function updateCountdown() {
        if (!countdownContainer) return;

        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            clearInterval(countdownInterval);
            countdownContainer.classList.add('hidden');
            if (eventStartedMessage) {
                eventStartedMessage.classList.remove('hidden');
            }
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Update elements and trigger animation if value changed
        updateTimeValue(daysEl, formatTime(days));
        updateTimeValue(hoursEl, formatTime(hours));
        updateTimeValue(minutesEl, formatTime(minutes));
        updateTimeValue(secondsEl, formatTime(seconds));
    }

    function formatTime(time) {
        return time < 10 ? `0${time}` : time;
    }

    function updateTimeValue(element, newValue) {
        if (element && element.innerText !== String(newValue)) {
            element.innerText = newValue;
            // Retrigger animation
            element.style.animation = 'none';
            element.offsetHeight; // trigger reflow
            element.style.animation = null;
        }
    }

    updateCountdown(); // Initial call
    const countdownInterval = setInterval(updateCountdown, 1000); // Update every second


    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Form Submission Handler (Mock)
    const form = document.getElementById('registrationForm');
    const formMessage = document.getElementById('formMessage');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Get values
            const name = document.getElementById('fullName').value;
            const mobile = document.getElementById('mobileNo').value;
            const eventSelect = document.getElementById('eventSelect');
            const eventName = eventSelect.options[eventSelect.selectedIndex].text;
            const transactionId = document.getElementById('transactionId').value;

            // Show success message
            formMessage.textContent = `Awesome, ${name}! You've registered for ${eventName}. Payment Txn: ${transactionId} is under review.`;
            formMessage.className = 'success';
            formMessage.classList.remove('hidden');

            // Reset form
            form.reset();

            // Hide message after 5 seconds
            setTimeout(() => {
                formMessage.classList.add('hidden');
            }, 5000);
        });
    }

    // Add glowing effect to mouse movement for extra "cool" factor on hero
    const hero = document.getElementById('hero');
    if (hero) {
        hero.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const x = Math.round((clientX / window.innerWidth) * 100);
            const y = Math.round((clientY / window.innerHeight) * 100);

            // Subtle change in blob positions based on mouse
            const blob1 = document.querySelector('.blob-1');
            const blob2 = document.querySelector('.blob-2');

            if (blob1 && blob2) {
                blob1.style.transform = `translate(${x / 5}px, ${y / 5}px)`;
                blob2.style.transform = `translate(-${x / 5}px, -${y / 5}px)`;
            }
        });
    }

    // Scroll Reveal Animation
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Initialize Particles.js
    if (window.particlesJS) {
        particlesJS("particles-js", {
            "particles": {
                "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": ["#00f0ff", "#9333ea", "#e81cff", "#ffffff"] },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.6, "random": true, "anim": { "enable": true, "speed": 1, "opacity_min": 0.1, "sync": false } },
                "size": { "value": 3, "random": true, "anim": { "enable": true, "speed": 2, "size_min": 0.1, "sync": false } },
                "line_linked": { "enable": true, "distance": 150, "color": "#00f0ff", "opacity": 0.2, "width": 1 },
                "move": { "enable": true, "speed": 1.5, "direction": "none", "random": true, "straight": false, "out_mode": "out", "bounce": false }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" }, "resize": true },
                "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 1 } }, "push": { "particles_nb": 4 } }
            },
            "retina_detect": true
        });
    }
});
