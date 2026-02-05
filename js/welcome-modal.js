// CardCraft Welcome Modal
(function() {
    'use strict';

    // Check if modal should be shown
    function shouldShowModal() {
        const hideModalPermanent = localStorage.getItem('hideCardCraftWelcomeModal');
        const hideModalThisSession = sessionStorage.getItem('hideCardCraftWelcomeModal');
        
        // Don't show if permanently hidden or hidden this session
        if (hideModalPermanent === 'true' || hideModalThisSession === 'true') {
            return false;
        }
        
        return true;
    }

    // Create and show modal
    function createModal() {
        if (!shouldShowModal()) return;

        const signedUpEmail = localStorage.getItem('cardcraftSignedUpEmail');
        const hasSignedUp = !!signedUpEmail;

        const modalHTML = `
            <div id="cardcraft-welcome-modal" class="cc-modal-overlay">
                <div class="cc-modal-container">
                    <button class="cc-modal-close" onclick="closeCardCraftModal()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    
                    <div class="cc-modal-content">
                        <!-- Header -->
                        <div class="cc-modal-header">
                            <div class="cc-modal-icon">🎴</div>
                            <h2>Welcome to <span class="cc-gradient-text">CardCraft</span></h2>
                            <p class="cc-modal-subtitle">Thank you for visiting!</p>
                        </div>

                        <!-- Mission Boxes -->
                        <div class="cc-modal-section">
                            <div class="cc-info-box cc-box-blue">
                                <div class="cc-box-header">
                                    <span class="cc-box-icon">💎</span>
                                    <h3>Free & Open Source</h3>
                                </div>
                                <p>CardCraft is <strong>100% free</strong> and released under the <strong>MIT License</strong>. 
                                   No subscriptions, no paywalls, no limits. Create unlimited AI-powered digital business 
                                   cards and share them anywhere.</p>
                            </div>

                            <div class="cc-info-box cc-box-purple">
                                <div class="cc-box-header">
                                    <span class="cc-box-icon">🚀</span>
                                    <h3>Community-Sustained</h3>
                                </div>
                                <p>This project is sustained by donations from users who find value in it. If CardCraft 
                                   helps you make a valuable connection or land a client, consider giving back to keep it 
                                   free for everyone.</p>
                            </div>

                            <div class="cc-info-box cc-box-cyan">
                                <div class="cc-box-header">
                                    <span class="cc-box-icon">📚</span>
                                    <h3>Upcoming Book</h3>
                                </div>
                                <p><strong>"The Alchemist's Cookbook"</strong> - A book on personal philosophy and 
                                   AI's potential to transform humanity. <span class="cc-gradient-text">Free for 
                                   newsletter subscribers</span> when it launches!</p>
                            </div>
                        </div>

                        <!-- Newsletter Signup -->
                        <div class="cc-newsletter-section">
                            <div class="cc-newsletter-header">
                                <span class="cc-newsletter-icon">✉️</span>
                                <div>
                                    <h3>Get Updates & Free Book</h3>
                                    <p>Stay informed about new features and receive the book when it's ready!</p>
                                </div>
                            </div>
                            
                            ${hasSignedUp ? `
                                <div class="cc-signup-success">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                    <span>Thank you! You'll receive updates soon.</span>
                                </div>
                            ` : `
                                <form id="cc-newsletter-form" class="cc-newsletter-form">
                                    <div class="cc-input-wrapper">
                                        <input 
                                            type="email" 
                                            id="cc-modal-email" 
                                            placeholder="your@email.com"
                                            required
                                        />
                                        <button type="submit" class="cc-btn-submit" id="cc-submit-btn">
                                            Sign Up
                                        </button>
                                    </div>
                                    <div id="cc-newsletter-status" class="cc-newsletter-status"></div>
                                </form>
                            `}
                        </div>

                        <!-- Don't Show Again -->
                        <div class="cc-modal-checkbox">
                            <input type="checkbox" id="cc-dont-show" />
                            <label for="cc-dont-show">Don't show this message again</label>
                        </div>

                        <!-- Action Buttons -->
                        <div class="cc-modal-actions">
                            <button class="cc-btn cc-btn-secondary" onclick="closeCardCraftModal()">
                                Continue Exploring
                            </button>
                            <a href="donate.html" class="cc-btn cc-btn-primary" onclick="closeCardCraftModal()">
                                ❤️ Support Development
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add event listeners
        if (!hasSignedUp) {
            setupNewsletterForm();
        }
        
        // Show modal with animation
        setTimeout(() => {
            const modal = document.getElementById('cardcraft-welcome-modal');
            if (modal) modal.classList.add('cc-modal-show');
        }, 100);
    }

    // Setup newsletter form
    function setupNewsletterForm() {
        const form = document.getElementById('cc-newsletter-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const emailInput = document.getElementById('cc-modal-email');
            const submitBtn = document.getElementById('cc-submit-btn');
            const statusEl = document.getElementById('cc-newsletter-status');
            const email = emailInput.value.trim();
            
            if (!email) return;

            submitBtn.disabled = true;
            submitBtn.textContent = 'Signing Up...';
            statusEl.textContent = '';
            statusEl.className = 'cc-newsletter-status';

            try {
                const response = await fetch('https://ai-alchemist.netlify.app/api/newsletter/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        email, 
                        source: 'cardcraft_welcome_modal' 
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('cardcraftSignedUpEmail', email);
                    statusEl.className = 'cc-newsletter-status cc-status-success';
                    statusEl.textContent = '✓ Thank you! You\'ll receive updates soon.';
                    
                    // Replace form with success message after delay
                    setTimeout(() => {
                        form.innerHTML = `
                            <div class="cc-signup-success">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                                <span>Thank you! You'll receive updates soon.</span>
                            </div>
                        `;
                    }, 1500);
                } else {
                    statusEl.className = 'cc-newsletter-status cc-status-error';
                    statusEl.textContent = '✗ ' + (data.error || 'Failed to subscribe. Please try again.');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Sign Up';
                }
            } catch (error) {
                console.error('Newsletter subscription error:', error);
                statusEl.className = 'cc-newsletter-status cc-status-error';
                statusEl.textContent = '✗ Network error. Please check your connection.';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign Up';
            }
        });
    }

    // Close modal function (global)
    window.closeCardCraftModal = function() {
        const modal = document.getElementById('cardcraft-welcome-modal');
        const dontShow = document.getElementById('cc-dont-show');
        
        if (dontShow && dontShow.checked) {
            localStorage.setItem('hideCardCraftWelcomeModal', 'true');
        } else {
            // Always hide for this session when closed
            sessionStorage.setItem('hideCardCraftWelcomeModal', 'true');
        }
        
        if (modal) {
            modal.classList.remove('cc-modal-show');
            setTimeout(() => modal.remove(), 300);
        }
    };

    // Initialize modal on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(createModal, 1000);
        });
    } else {
        setTimeout(createModal, 1000);
    }
})();
