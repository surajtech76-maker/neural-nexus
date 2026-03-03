document.addEventListener('DOMContentLoaded', () => {

    // -----------------------------------------
    // 0. Premium Preloader
    // -----------------------------------------
    const preloader = document.getElementById('advanced-preloader');
    if (preloader) {
        // Minimum time of 2s to show off the cool animation. 
        setTimeout(() => {
            preloader.classList.add('hidden');
            setTimeout(() => {
                preloader.remove();
            }, 800);
        }, 2000);
    }

    // -----------------------------------------
    // 1. Navigation & Animations Setup
    // -----------------------------------------

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Glowing effect on hero based on mouse movement
    const hero = document.getElementById('hero');
    if (hero) {
        hero.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const x = Math.round((clientX / window.innerWidth) * 100);
            const y = Math.round((clientY / window.innerHeight) * 100);

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

    // -----------------------------------------
    // 1.5 Countdown Timer & FAQ
    // -----------------------------------------

    // Set summit date (March 11, 2026, 10:30:00)
    const summitDate = new Date("March 11, 2026 10:30:00").getTime();

    const countInterval = setInterval(function () {
        const now = new Date().getTime();
        const distance = summitDate - now;

        if (distance < 0) {
            clearInterval(countInterval);
            const countdownEl = document.querySelector('.countdown-container');
            if (countdownEl) countdownEl.innerHTML = "<h3 class='glow-text'>THE SUMMIT HAS BEGUN!</h3>";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const dEl = document.getElementById("days");
        const hEl = document.getElementById("hours");
        const mEl = document.getElementById("minutes");
        const sEl = document.getElementById("seconds");

        if (dEl && hEl && mEl && sEl) {
            dEl.textContent = days < 10 ? '0' + days : days;
            hEl.textContent = hours < 10 ? '0' + hours : hours;
            mEl.textContent = minutes < 10 ? '0' + minutes : minutes;
            sEl.textContent = seconds < 10 ? '0' + seconds : seconds;
        }
    }, 1000);

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        questionBtn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all other items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });

            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // -----------------------------------------
    // 2. Client-Side Form Validation Logic
    // -----------------------------------------

    const form = document.getElementById('registrationForm');
    const submitBtn = document.getElementById('submitBtn');
    const spinner = document.getElementById('spinner');
    const formMessage = document.getElementById('formMessage');

    // Regex Patterns
    const patterns = {
        name: /^[a-zA-Z\s]{3,50}$/, // Only alphabets & space, min 3 chars
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic valid email format
        phone: /^[6-9]\d{9}$/, // Indian mobile format: 10 digits starting with 6-9
        college: /^.{2,100}$/, // Required, 2-100 characters
        transactionId: /^[a-zA-Z0-9]{5,30}$/ // Alphanumeric, minimum 5 chars
    };

    const errorMessages = {
        name: 'Must contain only letters and spaces (min 3 chars).',
        email: 'Please enter a valid email address.',
        phone: 'Must be a valid 10-digit Indian phone number.',
        college: 'College name is required.',
        competition: 'Please select a competition.',
        transactionId: 'Invalid transaction ID format.'
    };

    // Keep track of validation status
    const isValid = {
        name: false,
        email: false,
        phone: false,
        college: false,
        competition: false,
        transactionId: false
    };

    // Helper: Validate a specific field
    function validateField(field, patternKey) {
        const value = field.value.trim();
        const errorElement = document.getElementById(field.id + 'Error');

        let valid = false;

        if (field.id === 'competition') {
            valid = value !== "";
        } else if (patterns[patternKey]) {
            valid = patterns[patternKey].test(value);
        }

        isValid[field.id] = valid;

        if (valid) {
            field.classList.add('valid');
            field.classList.remove('invalid');
            errorElement.classList.remove('visible');
            errorElement.textContent = '';
        } else {
            field.classList.add('invalid');
            field.classList.remove('valid');
            errorElement.textContent = errorMessages[field.id] || errorMessages[patternKey];
            errorElement.classList.add('visible');
        }

        checkOverallValidity();
    }

    // Check if the entire form is valid
    function checkOverallValidity() {
        const allValid = Object.values(isValid).every(status => status === true);
        submitBtn.disabled = !allValid;
    }

    // Attach real-time validation listeners
    const fieldsToValidate = [
        { id: 'name', key: 'name' },
        { id: 'email', key: 'email' },
        { id: 'phone', key: 'phone' },
        { id: 'college', key: 'college' },
        { id: 'competition', key: 'competition' },
        { id: 'transactionId', key: 'transactionId' }
    ];

    fieldsToValidate.forEach(f => {
        const element = document.getElementById(f.id);
        if (element) {
            // Validate on blur (when leaving the field)
            element.addEventListener('blur', () => validateField(element, f.key));

            // Validate while typing (after initially blurring once for better UX, but we can do it on input)
            element.addEventListener('input', () => {
                if (element.classList.contains('invalid') || element.classList.contains('valid')) {
                    validateField(element, f.key);
                }
            });
        }
    });

    // -----------------------------------------
    // 3. Form Submission (Send to Backend)
    // -----------------------------------------

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Re-validate everything just in case
            fieldsToValidate.forEach(f => {
                const element = document.getElementById(f.id);
                if (element) validateField(element, f.key);
            });

            if (!Object.values(isValid).every(status => status === true)) {
                return; // Stop if still invalid
            }

            // Start loading state
            submitBtn.disabled = true;
            spinner.classList.remove('hidden');
            formMessage.classList.add('hidden');
            formMessage.className = 'hidden';

            // Gather Data
            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                college: document.getElementById('college').value.trim(),
                competition: document.getElementById('competition').value,
                transactionId: document.getElementById('transactionId').value.trim(),
            };

            // Requirement: Log form data to verify before sending.
            console.log("Form Data being sent:", formData);

            try {
                // Pointing to local backend server
                const response = await fetch('http://localhost:5000/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (response.ok) {
                    // Success
                    formMessage.textContent = 'Registration Successful! We will see you at the Summit.';
                    formMessage.classList.add('success');
                    formMessage.classList.remove('hidden');
                    form.reset();

                    // Reset validation styling
                    document.querySelectorAll('.valid, .invalid').forEach(el => {
                        el.classList.remove('valid', 'invalid');
                    });

                    // Reset validity state
                    Object.keys(isValid).forEach(key => isValid[key] = false);
                    checkOverallValidity();
                } else {
                    // Backend validation failed or duplicate registration
                    formMessage.textContent = data.error || 'Registration failed. Please try again.';
                    formMessage.classList.add('error');
                    formMessage.classList.remove('hidden');
                }
            } catch (error) {
                console.error("Submission Error:", error);
                formMessage.textContent = 'Unable to connect to the server. Please check your internet or try again later.';
                formMessage.classList.add('error');
                formMessage.classList.remove('hidden');
            } finally {
                // Stop loading state
                spinner.classList.add('hidden');
                checkOverallValidity(); // Re-evaluate btn status
            }
        });
    }

});
