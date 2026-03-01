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
