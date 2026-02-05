// CardCraft Builder - Main application logic

let selectedTemplate = 'modern';
let generatedCard = null;
let currentFormData = null;
let currentCustomizations = null;
let currentScaffold = null;

// History management for undo/redo
let historyStack = [];
let historyIndex = -1;
const MAX_HISTORY = 20;

// Section to socket mapping - template-aware
function getSectionSockets(sectionName, templateName) {
    const mappings = {
        modern: {
            header: ['SOCKET_BACKGROUND_ELEMENTS', 'SOCKET_HEADER', 'SOCKET_BASE_STYLES', 'SOCKET_CUSTOM_STYLES', 'SOCKET_ANIMATIONS'],
            contact: ['SOCKET_CONTACT_INFO'],
            qr: ['SOCKET_QR_SECTION', 'SOCKET_CARD_SCRIPT'],
            buttons: ['SOCKET_QR_SECTION']
        },
        minimal: {
            header: ['SOCKET_BASE_STYLES', 'SOCKET_CUSTOM_STYLES'],
            contact: ['SOCKET_CONTENT'],
            qr: ['SOCKET_CONTENT', 'SOCKET_CARD_SCRIPT'],
            buttons: ['SOCKET_CONTENT', 'SOCKET_CARD_SCRIPT']
        },
        business: {
            header: ['SOCKET_HEADER', 'SOCKET_PROFESSIONAL_STYLES'],
            contact: ['SOCKET_INFO'],
            qr: ['SOCKET_FOOTER', 'SOCKET_CARD_SCRIPT'],
            buttons: ['SOCKET_FOOTER']
        }
    };
    
    // Default for creative and other templates
    const defaultMapping = {
        header: ['SOCKET_BASE_STYLES', 'SOCKET_CREATIVE_STYLES', 'SOCKET_ANIMATIONS'],
        contact: ['SOCKET_CREATIVE_LAYOUT'],
        qr: ['SOCKET_CREATIVE_LAYOUT'],
        buttons: ['SOCKET_CREATIVE_STYLES'] // Button styles, not entire JS
    };
    
    const templateMapping = mappings[templateName] || defaultMapping;
    return templateMapping[sectionName] || [];
}

// Save current state to history
function pushHistory(customizations, formData, scaffold, cardHTML) {
    // Remove any redo states after current index
    historyStack = historyStack.slice(0, historyIndex + 1);
    
    // Add new state
    historyStack.push({
        customizations: JSON.parse(JSON.stringify(customizations)),
        formData: JSON.parse(JSON.stringify(formData)),
        scaffold: scaffold,
        cardHTML: cardHTML,
        timestamp: Date.now()
    });
    
    // Limit history size
    if (historyStack.length > MAX_HISTORY) {
        historyStack.shift();
    } else {
        historyIndex++;
    }
    
    updateHistoryButtons();
    console.log(`📚 History saved (${historyIndex + 1}/${historyStack.length})`);
}

// Undo to previous state
function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        restoreHistoryState(historyStack[historyIndex]);
        updateHistoryButtons();
        console.log(`↩️ Undo (${historyIndex + 1}/${historyStack.length})`);
    }
}

// Redo to next state
function redo() {
    if (historyIndex < historyStack.length - 1) {
        historyIndex++;
        restoreHistoryState(historyStack[historyIndex]);
        updateHistoryButtons();
        console.log(`↪️ Redo (${historyIndex + 1}/${historyStack.length})`);
    }
}

// Restore a history state
function restoreHistoryState(state) {
    currentCustomizations = JSON.parse(JSON.stringify(state.customizations));
    currentFormData = JSON.parse(JSON.stringify(state.formData));
    currentScaffold = state.scaffold;
    generatedCard = state.cardHTML;
    
    displayPreview(state.cardHTML);
}

// Update undo/redo button states
function updateHistoryButtons() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    
    if (undoBtn) {
        undoBtn.disabled = historyIndex <= 0;
        undoBtn.title = historyIndex > 0 ? `Undo (${historyIndex} steps back available)` : 'No undo history';
    }
    
    if (redoBtn) {
        redoBtn.disabled = historyIndex >= historyStack.length - 1;
        redoBtn.title = historyIndex < historyStack.length - 1 ? `Redo (${historyStack.length - historyIndex - 1} steps forward)` : 'No redo history';
    }
}

// Template selection
document.querySelectorAll('.template-option').forEach(option => {
    option.addEventListener('click', () => {
        document.querySelectorAll('.template-option').forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        selectedTemplate = option.dataset.template;
    });
});

// Undo/Redo button handlers
document.getElementById('undoBtn').addEventListener('click', undo);
document.getElementById('redoBtn').addEventListener('click', redo);

// Keyboard shortcuts for undo/redo
document.addEventListener('keydown', (e) => {
    // Ctrl+Z or Cmd+Z for undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
    }
    // Ctrl+Shift+Z or Cmd+Shift+Z for redo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
    }
    // Ctrl+Y or Cmd+Y for redo (alternative)
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
    }
});

// Export button handler - download and show smartphone directions
document.getElementById('exportBtn').addEventListener('click', () => {
    if (!generatedCard) {
        alert('Please generate a card first!');
        return;
    }
    
    // Download the HTML file
    const blob = new Blob([generatedCard], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `business-card-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    
    // Show smartphone directions modal
    document.getElementById('smartphoneModal').classList.add('active');
});

// Modal close handler
document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('smartphoneModal').classList.remove('active');
});

// Close modal when clicking outside
document.getElementById('smartphoneModal').addEventListener('click', (e) => {
    if (e.target.id === 'smartphoneModal') {
        document.getElementById('smartphoneModal').classList.remove('active');
    }
});

// Generate button handler
document.getElementById('generateBtn').addEventListener('click', async () => {
    const formData = collectFormData();
    
    if (!validateFormData(formData)) {
        alert('Please fill in all required fields (Name, Email, and Style Description)');
        return;
    }

    // Check if API key is configured
    const hasApiKey = !!localStorage.getItem('gemini_api_key');
    if (!hasApiKey) {
        // Show API key modal with helpful message
        const apiModal = document.getElementById('apiKeyModal');
        if (apiModal) {
            apiModal.classList.add('active');
            showNotification('Please configure your Google Gemini API key to enable AI-powered card generation', 'info');
        } else {
            alert('Please set up your Google Gemini API key first. Click the "Setup API Key" button in the sidebar.');
        }
        return;
    }

    await generateCard(formData);
});

// Collect form data
function collectFormData() {
    return {
        fullName: document.getElementById('fullName').value.trim(),
        title: document.getElementById('title').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        website: document.getElementById('website').value.trim(),
        company: document.getElementById('company').value.trim(),
        stylePrompt: document.getElementById('stylePrompt').value.trim(),
        colors: document.getElementById('colors').value.trim(),
        mood: document.getElementById('mood').value,
        template: selectedTemplate
    };
}

// Validate required fields
function validateFormData(data) {
    return data.fullName && data.email && data.stylePrompt;
}

// Main card generation function
async function generateCard(formData) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const generateBtn = document.getElementById('generateBtn');
    
    loadingOverlay.classList.add('active');
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';

    try {
        // Get scaffold
        const scaffold = scaffolds[formData.template];
        
        let customizations;
        
        // Check if Gemini API key is available
        geminiAPI.updateApiKey();
        
        if (geminiAPI.hasApiKey()) {
            // Use real Gemini 3.0 Pro API
            try {
                generateBtn.textContent = 'AI Generating Design...';
                customizations = await geminiAPI.generateCardDesign(formData, scaffold);
                console.log('Gemini API returned customizations:', customizations);
            } catch (error) {
                console.error('Gemini API failed, falling back to simulation:', error);
                alert('AI generation failed: ' + error.message + '\n\nFalling back to predefined styles.');
                customizations = await simulateLLMResponse(formData, scaffold);
                console.log('Simulation returned customizations:', customizations);
            }
        } else {
            // Fallback to simulated response
            generateBtn.textContent = 'Generating (Simulated)...';
            customizations = await simulateLLMResponse(formData, scaffold);
            console.log('Simulation returned customizations:', customizations);
        }
        
        // Assemble final card HTML
        const cardHTML = assembleCard(scaffold, formData, customizations);
        
        // Display preview
        displayPreview(cardHTML);
        
        // Store for export
        generatedCard = cardHTML;
        
        // Store current state for rerolls
        currentFormData = formData;
        currentCustomizations = customizations;
        currentScaffold = scaffold;
        
        // Save to history
        pushHistory(customizations, formData, scaffold, cardHTML);
        
        // Show all action buttons (except deploy which is commented out in HTML)
        document.getElementById('undoBtn').style.display = 'block';
        document.getElementById('redoBtn').style.display = 'block';
        document.getElementById('exportBtn').style.display = 'block';
        // document.getElementById('deployBtn').style.display = 'block'; // Commented out
        
        // Show regeneration hint
        document.getElementById('regenHint').style.display = 'block';
        
        // Show reroll controls
        document.getElementById('rerollControls').classList.add('active');
        
    } catch (error) {
        console.error('Generation error:', error);
        console.error('Error stack:', error.stack);
        console.error('Form data:', formData);
        console.error('Customizations:', customizations);
        alert('Error generating card: ' + error.message + '\n\nCheck console for details.');
    } finally {
        loadingOverlay.classList.remove('active');
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate My Card';
    }
}

// Build LLM prompt from scaffold sockets
function buildLLMPrompt(formData, scaffold) {
    const socketPrompts = [];
    
    for (const [socketName, socketDef] of Object.entries(scaffold.sockets)) {
        if (socketDef.llmPrompt) {
            socketPrompts.push({
                socket: socketName,
                type: socketDef.type,
                prompt: socketDef.llmPrompt,
                context: formData
            });
        }
    }
    
    return {
        template: scaffold.name,
        userStyle: formData.stylePrompt,
        colors: formData.colors,
        mood: formData.mood,
        sockets: socketPrompts,
        data: formData
    };
}

// Simulate LLM response (in production, call actual LLM API)
async function simulateLLMResponse(formData, scaffold) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Use scaffold defaults - this ensures correct socket names for each template
    const customizations = {};
    
    for (const [socketName, socketDef] of Object.entries(scaffold.sockets)) {
        if (socketDef.default) {
            customizations[socketName] = socketDef.default;
        } else {
            customizations[socketName] = '';
        }
    }
    
    return customizations;
}

// Generate custom CSS styles based on user preferences
function generateCustomStyles(formData, isDark, isCyberpunk, isMinimal) {
    const bgColor = isDark ? '#0f172a' : '#f8fafc';
    const cardBg = isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.9)';
    const textColor = isDark ? '#e2e8f0' : '#1e293b';
    const accentColor = isCyberpunk ? '#00ffff' : '#3b82f6';
    
    return `
        body {
            background: ${isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'};
        }

        .card {
            background: ${cardBg};
            backdrop-filter: blur(20px);
            box-shadow: ${isDark ? '0 20px 60px rgba(0, 0, 0, 0.4)' : '0 20px 60px rgba(0, 0, 0, 0.15)'};
            border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
        }

        h1 {
            font-size: 2.4rem;
            font-weight: bold;
            margin-bottom: 10px;
            background: linear-gradient(135deg, ${accentColor} 0%, ${isCyberpunk ? '#ff00ff' : '#8b5cf6'} 100%);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
        }

        .subtitle {
            font-size: 1.1rem;
            color: ${isDark ? '#94a3b8' : '#64748b'};
            margin-bottom: 20px;
        }

        .contact-info {
            margin: 20px 0;
        }

        .contact-item {
            display: flex;
            align-items: center;
            padding: 12px;
            margin: 8px 0;
            background: ${isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(241, 245, 249, 0.8)'};
            border-radius: 12px;
            border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
            transition: all 0.3s;
            cursor: pointer;
        }

        .contact-item:hover {
            background: ${isDark ? 'rgba(51, 65, 85, 0.8)' : 'rgba(226, 232, 240, 0.9)'};
            border-color: ${accentColor};
            transform: translateX(5px);
        }

        .contact-item svg {
            width: 24px;
            height: 24px;
            margin-right: 15px;
            fill: ${accentColor};
        }

        .contact-item a {
            color: ${textColor};
            text-decoration: none;
            flex: 1;
        }

        .qr-section {
            margin-top: 20px;
            text-align: center;
        }

        .qr-code {
            background: ${isCyberpunk ? 'linear-gradient(135deg, #0a0e1a 0%, #1a1a2e 100%)' : (isDark ? '#1e293b' : 'white')};
            padding: 15px;
            border-radius: 16px;
            display: inline-block;
            box-shadow: ${isCyberpunk ? '0 0 30px rgba(0, 255, 255, 0.3), 0 0 60px rgba(255, 0, 255, 0.2)' : (isDark ? '0 10px 30px rgba(0, 0, 0, 0.3)' : '0 10px 30px rgba(0, 0, 0, 0.1)')};
            margin: 15px auto;
            ${isCyberpunk ? 'border: 2px solid; border-image: linear-gradient(135deg, #00ffff 0%, #ff00ff 50%, #00ffff 100%) 1;' : ''}
        }

        .button-group {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }

        button {
            flex: 1;
            padding: 12px 16px;
            background: linear-gradient(135deg, ${accentColor} 0%, ${isCyberpunk ? '#ff00ff' : '#8b5cf6'} 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 4px 15px ${isCyberpunk ? 'rgba(0, 255, 255, 0.3)' : 'rgba(59, 130, 246, 0.3)'};
        }

        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px ${isCyberpunk ? 'rgba(0, 255, 255, 0.4)' : 'rgba(59, 130, 246, 0.4)'};
        }`;
}

// Generate animation CSS
function generateAnimations(formData, isCyberpunk) {
    if (!isCyberpunk) return '';
    
    return `
        @keyframes qrGlow {
            0%, 100% {
                box-shadow: 
                    0 0 30px rgba(0, 255, 255, 0.3),
                    0 0 60px rgba(255, 0, 255, 0.2);
            }
            50% {
                box-shadow: 
                    0 0 40px rgba(0, 255, 255, 0.5),
                    0 0 80px rgba(255, 0, 255, 0.3);
            }
        }

        .qr-code {
            animation: qrGlow 3s ease-in-out infinite;
        }

        @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }

        h1 {
            background-size: 200% 200%;
            animation: gradientShift 3s ease infinite;
        }`;
}

// Generate header HTML
function generateHeader(formData, isDark, isCyberpunk) {
    const hasLogo = isCyberpunk || formData.company;
    
    return `
                <div class="header" style="text-align: center; margin-bottom: 20px;">
                    ${hasLogo ? `
                    <div class="logo-circle" style="width: 96px; height: 96px; margin: 0 auto 15px;">
                        <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;">
                            <defs>
                                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:${isCyberpunk ? '#00ffff' : '#3b82f6'};stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:${isCyberpunk ? '#ff00ff' : '#8b5cf6'};stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <circle cx="50" cy="50" r="45" fill="none" stroke="url(#gradient1)" stroke-width="2"/>
                            <text x="50" y="60" font-size="40" text-anchor="middle" fill="url(#gradient1)">${formData.fullName.charAt(0)}</text>
                        </svg>
                    </div>
                    ` : ''}
                    <h1>${formData.fullName}</h1>
                    ${formData.title ? `<div class="subtitle">${formData.title}</div>` : ''}
                    ${formData.company ? `<div class="subtitle">${formData.company}</div>` : ''}
                </div>`;
}

// Generate contact info HTML
function generateContactInfo(formData, isDark) {
    const items = [];
    
    if (formData.email) {
        items.push(`
                    <div class="contact-item" onclick="window.location.href='mailto:${formData.email}'">
                        <svg viewBox="0 0 24 24">
                            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                        </svg>
                        <a href="mailto:${formData.email}">${formData.email}</a>
                    </div>`);
    }
    
    if (formData.phone) {
        items.push(`
                    <div class="contact-item" onclick="window.location.href='tel:${formData.phone}'">
                        <svg viewBox="0 0 24 24">
                            <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                        </svg>
                        <a href="tel:${formData.phone}">${formData.phone}</a>
                    </div>`);
    }
    
    if (formData.website) {
        items.push(`
                    <div class="contact-item" onclick="window.open('${formData.website}', '_blank')">
                        <svg viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                        </svg>
                        <a href="${formData.website}" target="_blank">${formData.website.replace(/^https?:\/\//, '')}</a>
                    </div>`);
    }
    
    return `
                <div class="contact-info">
                    ${items.join('\n')}
                </div>`;
}

// Generate particle animation script
function generateParticleScript(isDark, isCyberpunk) {
    return `
        const canvas = document.getElementById('particles-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            canvas.style.position = 'fixed';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.zIndex = '0';
            canvas.style.pointerEvents = 'none';

            const particles = [];
            const particleCount = 60;

            class Particle {
                constructor() {
                    this.x = Math.random() * canvas.width;
                    this.y = Math.random() * canvas.height;
                    this.size = Math.random() * 2 + 1;
                    this.speedX = Math.random() * 0.5 - 0.25;
                    this.speedY = Math.random() * 0.5 - 0.25;
                    this.opacity = Math.random() * 0.5 + 0.2;
                }

                update() {
                    this.x += this.speedX;
                    this.y += this.speedY;
                    if (this.x > canvas.width) this.x = 0;
                    if (this.x < 0) this.x = canvas.width;
                    if (this.y > canvas.height) this.y = 0;
                    if (this.y < 0) this.y = canvas.height;
                }

                draw() {
                    ctx.fillStyle = \`rgba(${isCyberpunk ? '0, 255, 255' : '59, 130, 246'}, \${this.opacity})\`;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }

            function animate() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                particles.forEach(particle => {
                    particle.update();
                    particle.draw();
                });
                requestAnimationFrame(animate);
            }

            animate();

            window.addEventListener('resize', () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            });
        }`;
}

// Assemble final card HTML from scaffold and customizations
function assembleCard(scaffold, formData, customizations) {
    console.log('Assembling card with customizations:', customizations);
    console.log('Scaffold sockets:', Object.keys(scaffold.sockets));
    
    let html = scaffold.structure;
    
    // Safely check if cyberpunk theme
    const customStyles = customizations.SOCKET_CUSTOM_STYLES || '';
    const isCyberpunk = customStyles.toLowerCase().includes('cyberpunk');
    
    // Replace sockets FIRST
    for (const [socketName, socketDef] of Object.entries(scaffold.sockets)) {
        const replacement = customizations[socketName] || socketDef.default || '';
        console.log(`Socket ${socketName}: ${replacement ? 'Has content (' + replacement.length + ' chars)' : 'EMPTY/MISSING'}`);
        
        // Log actual content for critical sockets
        if (socketName === 'SOCKET_CONTACT_INFO' || socketName === 'SOCKET_CARD_SCRIPT') {
            console.log(`${socketName} actual content:`, replacement);
        }
        
        html = html.replaceAll(`{{${socketName}}}`, replacement);
    }
    
    // Replace context variables AFTER sockets (so socket content gets variable substitution)
    // Determine QR colors based on style or use vibrant defaults
    const styleText = (formData.stylePrompt + formData.colors + formData.mood).toLowerCase();
    let qrDark = '#1e293b';
    let qrLight = '#ffffff';
    
    // Always use black on white for maximum QR code scannability
    // Only exception: extreme neon/cyberpunk with explicit keyword
    if (styleText.includes('cyberpunk') && styleText.includes('neon')) {
        qrDark = '#00ffff';  // Cyan on black for true cyberpunk aesthetic
        qrLight = '#000000';
        console.log('⚡ Using neon QR colors for cyberpunk theme');
    } else {
        // Default: black on white - most reliable for scanning
        qrDark = '#000000';
        qrLight = '#ffffff';
        console.log('📱 Using standard black on white QR for maximum scannability');
    }
    
    console.log('QR Color calculation - Style keywords:', styleText);
    console.log('QR Colors selected - Dark:', qrDark, 'Light:', qrLight);
    
    const contextVars = {
        FULL_NAME: formData.fullName,
        TITLE: formData.title || '',
        EMAIL: formData.email,
        PHONE: formData.phone || '',
        WEBSITE: formData.website || '',
        COMPANY: formData.company || '',
        THEME_COLOR: '#0f172a',
        QR_DARK_COLOR: qrDark,
        QR_LIGHT_COLOR: qrLight
    };
    
    console.log('Context variables being replaced:', {
        FULL_NAME: contextVars.FULL_NAME,
        EMAIL: contextVars.EMAIL,
        PHONE: contextVars.PHONE,
        WEBSITE: contextVars.WEBSITE,
        QR_DARK_COLOR: contextVars.QR_DARK_COLOR,
        QR_LIGHT_COLOR: contextVars.QR_LIGHT_COLOR
    });
    
    for (const [key, value] of Object.entries(contextVars)) {
        html = html.replaceAll(`{{${key}}}`, value);
    }
    
    console.log('Final assembled HTML:', html.substring(0, 1000) + '...');
    
    return html;
}

// Display preview in iframe
function displayPreview(html) {
    const previewFrame = document.getElementById('previewFrame');
    previewFrame.innerHTML = '';
    
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '24px';
    
    previewFrame.appendChild(iframe);
    
    try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(html);
        doc.close();
        
        // Listen for errors in the iframe
        iframe.contentWindow.addEventListener('error', (event) => {
            console.error('Preview rendering error:', event.message, event.error);
            if (event.message && event.message.includes('attribute d')) {
                alert('The generated card has malformed SVG graphics. Try regenerating with simpler design requirements.');
            }
        });
    } catch (error) {
        console.error('Error displaying preview:', error);
        alert('Failed to display the generated card. The HTML may be malformed. Try regenerating.');
    }
}

// Export handlers
document.getElementById('exportBtn').addEventListener('click', () => {
    if (!generatedCard) return;
    
    const blob = new Blob([generatedCard], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'business-card.html';
    a.click();
    URL.revokeObjectURL(url);
});

document.getElementById('deployBtn').addEventListener('click', () => {
    alert('Deploy functionality coming soon! For now, use the Export button to download your card HTML.');
});
