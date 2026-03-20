/* ══════════════════════════════════════════════════
   HARPA Gaming — Cookie Consent Manager
   Pure vanilla JS, no dependencies.
   ══════════════════════════════════════════════════ */

(function () {
    'use strict';

    const STORAGE_KEY = 'harpa_cookie_consent';
    const CONSENT_VERSION = 1;

    // ─── Default consent state ───────────────────────
    const DEFAULT_CONSENT = {
        version: CONSENT_VERSION,
        essential: true,    // always true
        analytics: false,
        marketing: false,
        timestamp: null
    };

    // ─── Read / Write consent ────────────────────────
    function getConsent() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            const data = JSON.parse(raw);
            if (data.version !== CONSENT_VERSION) return null;
            return data;
        } catch (e) {
            return null;
        }
    }

    function saveConsent(consent) {
        consent.timestamp = new Date().toISOString();
        consent.version = CONSENT_VERSION;
        consent.essential = true; // always
        localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
        window.dispatchEvent(new CustomEvent('consentUpdated', { detail: consent }));
    }

    // ─── Public API ──────────────────────────────────
    window.HarpaConsent = {
        hasConsent: function (category) {
            const c = getConsent();
            if (!c) return category === 'essential';
            return !!c[category];
        },
        getAll: function () {
            return getConsent() || { ...DEFAULT_CONSENT };
        },
        openSettings: function () {
            showModal();
        }
    };

    // ─── Inject HTML ─────────────────────────────────
    function createBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookie-banner';
        banner.className = 'cookie-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Cookie consent');
        banner.innerHTML = `
            <div class="cookie-banner-inner">
                <div class="cookie-banner-text">
                    <span class="cookie-banner-icon">🍪</span>
                    <div>
                        <p class="cookie-banner-title">COOKIE_CONSENT</p>
                        <p class="cookie-banner-desc">We use cookies to improve your experience. You can manage your preferences anytime. <a href="./cookies.html">Cookies Policy</a></p>
                    </div>
                </div>
                <div class="cookie-banner-actions">
                    <button id="cookie-reject" class="cookie-btn cookie-btn-outline" type="button">Reject All</button>
                    <button id="cookie-essential" class="cookie-btn cookie-btn-outline" type="button">Essential Only</button>
                    <button id="cookie-accept" class="cookie-btn cookie-btn-outline" type="button">Accept All</button>
                    <button id="cookie-manage" class="cookie-btn-link" type="button">Manage Preferences</button>
                </div>
            </div>
        `;
        document.body.appendChild(banner);

        // Button handlers
        document.getElementById('cookie-accept').addEventListener('click', function () {
            saveConsent({ essential: true, analytics: true, marketing: true });
            hideBanner();
        });

        document.getElementById('cookie-reject').addEventListener('click', function () {
            saveConsent({ essential: true, analytics: false, marketing: false });
            hideBanner();
        });

        document.getElementById('cookie-essential').addEventListener('click', function () {
            saveConsent({ essential: true, analytics: false, marketing: false });
            hideBanner();
        });

        document.getElementById('cookie-manage').addEventListener('click', function () {
            hideBanner();
            showModal();
        });

        // Animate in
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                banner.classList.add('cookie-banner-visible');
            });
        });
    }

    function hideBanner() {
        var banner = document.getElementById('cookie-banner');
        if (banner) {
            banner.classList.remove('cookie-banner-visible');
            setTimeout(function () { banner.remove(); }, 400);
        }
    }

    // ─── Preferences Modal ───────────────────────────
    function showModal() {
        // Remove existing if any
        var existing = document.getElementById('cookie-modal-overlay');
        if (existing) existing.remove();

        var current = getConsent() || { ...DEFAULT_CONSENT };

        var overlay = document.createElement('div');
        overlay.id = 'cookie-modal-overlay';
        overlay.className = 'cookie-modal-overlay';
        overlay.innerHTML = `
            <div class="cookie-modal" role="dialog" aria-label="Cookie preferences">
                <div class="cookie-modal-header">
                    <h3 class="cookie-modal-title">COOKIE_PREFERENCES</h3>
                    <button class="cookie-modal-close" id="cookie-modal-close" type="button" aria-label="Close">
                        <span class="material-icons">close</span>
                    </button>
                </div>
                <div class="cookie-modal-body">
                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <div>
                                <h4 class="cookie-category-name">Essential</h4>
                                <p class="cookie-category-desc">Required for the website to function. Cannot be disabled.</p>
                            </div>
                            <div class="cookie-toggle-wrap">
                                <span class="cookie-always-on">Always On</span>
                            </div>
                        </div>
                    </div>
                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <div>
                                <h4 class="cookie-category-name">Analytics</h4>
                                <p class="cookie-category-desc">Help us understand how visitors interact with the website.</p>
                            </div>
                            <div class="cookie-toggle-wrap">
                                <label class="cookie-toggle" for="cookie-toggle-analytics">
                                    <input type="checkbox" id="cookie-toggle-analytics" ${current.analytics ? 'checked' : ''}>
                                    <span class="cookie-toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <div>
                                <h4 class="cookie-category-name">Marketing</h4>
                                <p class="cookie-category-desc">Used for targeted advertising and campaign measurement.</p>
                            </div>
                            <div class="cookie-toggle-wrap">
                                <label class="cookie-toggle" for="cookie-toggle-marketing">
                                    <input type="checkbox" id="cookie-toggle-marketing" ${current.marketing ? 'checked' : ''}>
                                    <span class="cookie-toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="cookie-modal-footer">
                    <button id="cookie-modal-reject" class="cookie-btn cookie-btn-outline" type="button">Reject All</button>
                    <button id="cookie-modal-save" class="cookie-btn cookie-btn-primary" type="button">Save Preferences</button>
                    <button id="cookie-modal-accept" class="cookie-btn cookie-btn-outline" type="button">Accept All</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Animate in
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                overlay.classList.add('cookie-modal-visible');
            });
        });

        // Close handlers
        document.getElementById('cookie-modal-close').addEventListener('click', closeModal);
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeModal();
        });

        document.getElementById('cookie-modal-save').addEventListener('click', function () {
            saveConsent({
                essential: true,
                analytics: document.getElementById('cookie-toggle-analytics').checked,
                marketing: document.getElementById('cookie-toggle-marketing').checked
            });
            closeModal();
        });

        document.getElementById('cookie-modal-accept').addEventListener('click', function () {
            saveConsent({ essential: true, analytics: true, marketing: true });
            closeModal();
        });

        document.getElementById('cookie-modal-reject').addEventListener('click', function () {
            saveConsent({ essential: true, analytics: false, marketing: false });
            closeModal();
        });

        // Escape key
        function onEsc(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', onEsc);
            }
        }
        document.addEventListener('keydown', onEsc);
    }

    function closeModal() {
        var overlay = document.getElementById('cookie-modal-overlay');
        if (overlay) {
            overlay.classList.remove('cookie-modal-visible');
            setTimeout(function () { overlay.remove(); }, 300);
        }
    }

    // ─── Init ────────────────────────────────────────
    function init() {
        // Wire up footer "Cookie Settings" link
        document.querySelectorAll('[data-cookie-settings]').forEach(function (el) {
            el.addEventListener('click', function (e) {
                e.preventDefault();
                showModal();
            });
        });

        // Show banner if no consent stored
        if (!getConsent()) {
            createBanner();
        }
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
