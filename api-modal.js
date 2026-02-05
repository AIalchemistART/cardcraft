// API Modal JavaScript Functions

function openApiModal() {
    const modal = document.getElementById('apiKeyModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeApiModal() {
    document.getElementById('apiKeyModal').classList.remove('active');
}

function toggleKeyVisibility() {
    const input = document.getElementById('apiKeyInput');
    const icon = document.getElementById('visibilityIcon');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = '🙈';
    } else {
        input.type = 'password';
        icon.textContent = '👁️';
    }
}

function saveApiKey() {
    const apiKey = document.getElementById('apiKeyInput').value.trim();
    
    if (!apiKey) {
        alert('Please enter an API key');
        return;
    }
    
    if (!apiKey.startsWith('AIzaSy')) {
        if (!confirm('This doesn\'t look like a valid Google API key (should start with "AIzaSy"). Continue anyway?')) {
            return;
        }
    }
    
    // Store in localStorage
    localStorage.setItem('gemini_api_key', apiKey);
    
    // Update UI
    updateApiKeyStatus();
    closeApiModal();
    
    // Show success message
    showNotification('API key saved! AI-powered generation is now enabled.', 'success');
}

function updateApiKeyStatus() {
    const hasKey = !!localStorage.getItem('gemini_api_key');
    const statusEl = document.getElementById('apiKeyStatus');
    const setupBtn = document.getElementById('setupApiKeyBtn');
    
    if (statusEl) {
        if (hasKey) {
            statusEl.innerHTML = '<span style="color: #10b981;">✓ API Key Configured</span>';
            if (setupBtn) setupBtn.textContent = 'Update API Key';
        } else {
            statusEl.innerHTML = '<span style="color: #f59e0b;">⚠ No API Key</span>';
            if (setupBtn) setupBtn.textContent = 'Setup API Key';
        }
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    
    if (!document.querySelector('style[data-notification-styles]')) {
        style.setAttribute('data-notification-styles', 'true');
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateApiKeyStatus);
} else {
    updateApiKeyStatus();
}
