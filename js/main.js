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

});



// ─── Shop notify — Brevo integration ──────────────
async function handleNotifySubmit(e) {
    e.preventDefault();

    const emailInput = document.getElementById('notify-email');
    const gdprCheckbox = document.getElementById('notify-gdpr');
    const submitBtn = document.getElementById('notify-btn');
    const msgEl = document.getElementById('notify-message');
    const consentLabel = gdprCheckbox?.closest('.notify-consent');

    // Reset UI states
    msgEl.textContent = '';
    msgEl.className = 'notify-message';
    if (consentLabel) consentLabel.classList.remove('error');

    const email = emailInput?.value?.trim();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        msgEl.textContent = 'Please enter a valid email address.';
        msgEl.className = 'notify-message error';
        return false;
    }

    // Validate GDPR consent
    if (!gdprCheckbox?.checked) {
        msgEl.textContent = 'Please agree to receive updates to continue.';
        msgEl.className = 'notify-message error';
        if (consentLabel) consentLabel.classList.add('error');
        return false;
    }

    // Disable button & show loading
    submitBtn.disabled = true;
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = 'SENDING... <span class="material-icons spinning">sync</span>';

    try {
        const res = await fetch('/.netlify/functions/newsletter-signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, gdprConsent: true }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
            msgEl.textContent = "You're on the list. Stay ready.";
            msgEl.className = 'notify-message';
            emailInput.value = '';
            gdprCheckbox.checked = false;
        } else {
            msgEl.textContent = data.message || 'Something went wrong. Try again.';
            msgEl.className = 'notify-message error';
        }
    } catch (err) {
        console.error('Notify submit error:', err);
        msgEl.textContent = 'Something went wrong. Try again.';
        msgEl.className = 'notify-message error';
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
    }

    return false;
}
