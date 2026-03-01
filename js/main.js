/* Main JS for Harpa Gaming Interactivity */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Harpa Gaming Core Initialized');

    // ─── Smooth Scroll for local anchors ───────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            e.preventDefault();
            const el = document.querySelector(targetId);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ─── FAQ Accordion ─────────────────────────────
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                // Close all other items
                faqItems.forEach(other => other.classList.remove('active'));
                // Toggle current
                if (!isActive) {
                    item.classList.add('active');
                    question.setAttribute('aria-expanded', 'true');
                } else {
                    question.setAttribute('aria-expanded', 'false');
                }
            });
        }
    });

    // ─── Contact Form ──────────────────────────────
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
});

// ─── Contact Form Handler ──────────────────────────
async function handleContactSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = document.getElementById('contact-submit');
    const statusEl = document.getElementById('form-status');
    const submitText = form.querySelector('.submit-text');
    const submitLoading = form.querySelector('.submit-loading');
    const submitArrow = form.querySelector('.submit-arrow');

    // Get values
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const message = document.getElementById('contact-message').value.trim();
    const honeypot = document.getElementById('hp-field')?.value || '';

    // Reset errors
    clearErrors();
    statusEl.textContent = '';
    statusEl.className = 'form-status';

    // Honeypot check (silent)
    if (honeypot) {
        statusEl.textContent = 'Message sent successfully.';
        statusEl.className = 'form-status success';
        form.reset();
        return;
    }

    // Validate
    let hasError = false;

    if (!name || name.length < 2) {
        showError('contact-name', 'name-error', 'Name must be at least 2 characters.');
        hasError = true;
    }

    if (!email || !isValidEmail(email)) {
        showError('contact-email', 'email-error', 'Please enter a valid email address.');
        hasError = true;
    }

    if (!message || message.length < 10) {
        showError('contact-message', 'message-error', 'Message must be at least 10 characters.');
        hasError = true;
    }

    if (hasError) return;

    // Submit
    submitBtn.disabled = true;
    submitText.style.display = 'none';
    submitArrow.style.display = 'none';
    submitLoading.style.display = 'inline-flex';

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, message })
        });

        const data = await response.json();

        if (data.success) {
            statusEl.textContent = data.message || 'Message sent successfully!';
            statusEl.className = 'form-status success';
            form.reset();
        } else {
            statusEl.textContent = data.message || 'Failed to send message. Please try again.';
            statusEl.className = 'form-status error';
        }
    } catch (error) {
        statusEl.textContent = 'Network error. Please check your connection and try again.';
        statusEl.className = 'form-status error';
    } finally {
        submitBtn.disabled = false;
        submitText.style.display = 'inline';
        submitArrow.style.display = 'inline';
        submitLoading.style.display = 'none';
    }
}

function showError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    if (input) input.classList.add('error');
    if (error) error.textContent = message;
}

function clearErrors() {
    document.querySelectorAll('.form-input.error').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Shop notify (visual only) ────────────────────
function handleNotifySubmit(e) {
    e.preventDefault();
    const msgEl = document.getElementById('notify-message');
    if (msgEl) {
        msgEl.textContent = 'Thanks! You\'ll be notified when we launch.';
    }
    e.target.reset();
    return false;
}
