// Gemini 3.0 Pro API Integration for CardCraft

class GeminiAPI {
    constructor() {
        this.apiKey = localStorage.getItem('gemini_api_key');
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent';
    }

    hasApiKey() {
        return !!this.apiKey;
    }

    updateApiKey() {
        this.apiKey = localStorage.getItem('gemini_api_key');
    }

    async generateContent(prompt, options = {}) {
        if (!this.apiKey) {
            throw new Error('No API key configured. Please setup your Gemini API key.');
        }

        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: options.temperature || 0.7,
                topK: options.topK || 40,
                topP: options.topP || 0.95,
                maxOutputTokens: options.maxOutputTokens || 8192,
            }
        };

        try {
            const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || `API error: ${response.status}`);
            }

            const data = await response.json();
            
            // Error handling for undefined or blocked responses
            if (!data || !data.candidates || data.candidates.length === 0) {
                console.error('Gemini API returned no candidates:', data);
                throw new Error('Gemini API returned empty response. Prompt may be too long or blocked.');
            }

            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Gemini API error:', error);
            throw error;
        }
    }

    async generateCardDesign(formData, scaffold) {
        if (!this.apiKey) {
            throw new Error('Gemini API key not configured');
        }

        try {
            const prompt = this.buildDesignPrompt(formData, scaffold);
            const response = await this.generateContent(prompt, {
                temperature: 0.9,
                maxOutputTokens: 8192
            });

            return this.parseDesignResponse(response, scaffold);
        } catch (error) {
            console.error('Card design generation failed:', error);
            throw error;
        }
    }

    async regenerateSockets(formData, scaffold, socketNames, currentCustomizations = {}) {
        if (!this.apiKey) {
            throw new Error('Gemini API key not configured');
        }

        try {
            const prompt = this.buildSocketRegenerationPrompt(formData, scaffold, socketNames, currentCustomizations);
            const response = await this.generateContent(prompt, {
                temperature: 1.0,
                maxOutputTokens: 4096
            });

            // Pass socketFilter to only parse requested sockets
            return this.parseDesignResponse(response, scaffold, socketNames);
        } catch (error) {
            console.error('Socket regeneration failed:', error);
            throw error;
        }
    }

    buildSocketRegenerationPrompt(formData, scaffold, socketNames, currentCustomizations = {}) {
        // Build context from current customizations
        let contextInfo = '';
        let targetedInstructions = '';
        
        if (Object.keys(currentCustomizations).length > 0) {
            contextInfo = '\n**CURRENT DESIGN CONTEXT:**\nThe card currently has this aesthetic/theme:\n';
            for (const [socketName, content] of Object.entries(currentCustomizations)) {
                if (content && !socketNames.includes(socketName)) {
                    // Show preview of other sockets to maintain consistency
                    const preview = content.substring(0, 200);
                    contextInfo += `- ${socketName}: ${preview}...\n`;
                }
            }
            contextInfo += '\n**MAINTAIN this overall theme and aesthetic while creating a fresh variation for the requested sockets.**\n';
            
            // If regenerating a style socket, provide targeted instructions
            for (const socketName of socketNames) {
                if (socketName.includes('STYLES')) {
                    targetedInstructions += `\n**CRITICAL - BUTTON-ONLY REGENERATION:**\n`;
                    targetedInstructions += `This socket contains CSS for the ENTIRE card. You must:\n`;
                    targetedInstructions += `1. Generate the COMPLETE CSS for the entire card (maintain current design)\n`;
                    targetedInstructions += `2. ONLY change button/action button selectors: button, .btn, .button-group, .action-buttons\n`;
                    targetedInstructions += `3. Keep existing styles for: :root, body, .container, .card, .header, h1, h2, h3, .contact, .qr-section, etc.\n`;
                    targetedInstructions += `4. Make button styles CREATIVE: use gradients, box-shadows, hover effects, active states\n`;
                    targetedInstructions += `5. Ensure buttons are prominent and match the overall theme\n\n`;
                }
            }
        }

        return `You are regenerating specific sections of an existing business card design. Create a FRESH, CREATIVE, VISUALLY IMPRESSIVE variation that MAINTAINS THE CURRENT THEME.

**User Information:**
- Name: ${formData.fullName}
- Title: ${formData.title || 'N/A'}
- Company: ${formData.company || 'N/A'}
- Email: ${formData.email}
- Phone: ${formData.phone || 'N/A'}
- Website: ${formData.website || 'N/A'}

**Original Style Request:**
${formData.stylePrompt}
${contextInfo}
${targetedInstructions}

**REGENERATE ONLY these sockets with creative, elaborate styling:**
${socketNames.map(name => {
    const socketDef = scaffold.sockets[name];
    return `
**${name}** (${socketDef.type}):
${socketDef.llmPrompt || socketDef.description || 'Generate appropriate content'}

**IMPORTANT**: This must be CREATIVE, DETAILED, and VISUALLY IMPRESSIVE. ${socketDef.type === 'css' ? 'Include modern CSS features: gradients, animations, shadows, borders, hover effects.' : 'Generate substantial, creative content.'}`;
}).join('\n')}

**CRITICAL RULES:**
- NO SVG tags, use CSS gradients/effects instead
- MAINTAIN the overall design theme from context above
- Make this section STAND OUT with creative, modern styling
- Ensure good contrast and readability
- Generate COMPLETE, PRODUCTION-READY code

Format response as:
${socketNames.map(name => `=== ${name} ===
[${scaffold.sockets[name].type} code here]
`).join('\n')}`;
    }

    buildDesignPrompt(formData, scaffold) {
        return `You are a professional web designer creating a custom digital business card. Generate CSS, HTML, and JavaScript code for the following design request.

**CRITICAL HTML STRUCTURE - DO NOT CHANGE:**
The card uses this EXACT HTML structure (you cannot modify this):
\`\`\`html
<body>
    <!-- Background elements go here -->
    <div class="container">
        <div class="card">
            <div class="card-inner">
                <!-- Header content -->
                <!-- Contact info -->
                <!-- QR section -->
            </div>
        </div>
    </div>
</body>
\`\`\`

**REQUIRED CLASS NAMES (use these EXACT names in your CSS):**
- body
- .container
- .card
- .card-inner
- h1, h2, h3 (for headings)
- .contact-info (for contact section)
- .contact-item (for each contact entry)
- .qr-section
- .qr-code
- button (for action buttons)

**DO NOT create custom class names** like .digital-card, .profile-card, .business-card, etc.
**ONLY style the classes listed above.**

**User Information:**
- Name: ${formData.fullName}
- Title: ${formData.title || 'N/A'}
- Company: ${formData.company || 'N/A'}
- Email: ${formData.email}
- Phone: ${formData.phone || 'N/A'}
- Website: ${formData.website || 'N/A'}

**Style Request:**
${formData.stylePrompt}

**Additional Preferences:**
- Colors: ${formData.colors || 'Your choice based on style'}
- Mood: ${formData.mood || 'Professional'}
- Template: ${scaffold.name}

**CRITICAL CONTRAST RULES (HIGHEST PRIORITY - DO NOT VIOLATE):**
1. **NEVER use white/light text on white/light backgrounds** - This makes text invisible
2. **NEVER use dark text on dark backgrounds** - This makes text invisible
3. **Light backgrounds (#ffffff, #f0f0f0, pastels) REQUIRE dark text** (#000000, #1a1a1a, #333333)
4. **Dark backgrounds (#000000, #1a1a1a, #2c2c2c) REQUIRE light text** (#ffffff, #f0f0f0)
5. **Minimum contrast ratio: 4.5:1** - Use online contrast checkers if unsure
6. **If card background is light/white, ALL text MUST be dark (#000000 or similar)**
7. **If card background is dark/black, ALL text MUST be light (#ffffff or similar)**

**IMPORTANT STYLE NOTES:**
- "Professional" means sophisticated, elegant, and polished - NOT plain or boring
- Use refined color palettes, subtle gradients, elegant typography, and tasteful shadows
- Every design should have personality and visual interest while maintaining professionalism
- Avoid inline SVG paths - they often cause rendering errors

**Requirements:**
Generate code for these EXACT sockets (customization points) for the ${scaffold.name} template:

${Object.entries(scaffold.sockets)
    .filter(([_, def]) => def.llmPrompt || def.required)
    .map(([name, def]) => `
**${name}** (${def.type}${def.required ? ' - REQUIRED' : ''}):
${def.llmPrompt || def.description || 'Generate appropriate content for this socket'}
`).join('\n')}

**CRITICAL LAYOUT CONSTRAINTS:**
1. **Card dimensions**: .card max-width MUST be 420-450px, padding 30-40px
2. **Typography hierarchy**: h1 minimum 1.8rem, h2 minimum 1.2rem, h3 minimum 1rem, body text minimum 0.95rem
3. **Button requirements**: Buttons MUST have minimum 44px height, 12px padding, clear borders or backgrounds
4. **Spacing**: Use consistent spacing (multiples of 8px: 8px, 16px, 24px, 32px)
5. **All contact info REQUIRED**: Email, phone, AND website MUST all be visible as clickable links - never omit any
6. **Color contrast - CRITICAL**: 
   - If .card background is light/white (#fff, #f0f0f0, pastels): ALL text MUST be dark (#000, #1a1a1a, #333)
   - If .card background is dark/black (#000, #1a1a1a, #2c2c2c): ALL text MUST be light (#fff, #f0f0f0)
   - Minimum contrast ratio: 4.5:1
   - Test: Can you read the text easily? If not, fix the colors immediately
7. **No horizontal overflow**: Never use fixed widths that exceed container, always use max-width and percentage widths
8. **Background safety**: Background elements MUST have lower z-index than content (z-index: 0-5 for backgrounds, 10+ for content)
9. **QR container**: QR code container MUST have max-width: 180px and be centered with margin: 0 auto
10. **Button group**: Action buttons MUST be in a flex container with gap: 10px and max-width per button
11. **Prevent layout breaks**: Never use position: absolute on critical content (header, contact info, QR)
12. **Animation limits**: Animations MUST be subtle - no spinning, no excessive movement (max 10px translation)

**IMPORTANT INSTRUCTIONS:**
1. **CRITICAL #1 PRIORITY - TEXT CONTRAST**: Check your card background color FIRST, then set text colors:
   - Light card background? → Use dark text (#000000, #1a1a1a, #333333)
   - Dark card background? → Use light text (#ffffff, #f0f0f0, #e0e0e0)
   - NEVER EVER use white text on white background or dark text on dark background
2. Generate ONLY the code for each socket, clearly labeled
3. Use the exact socket names as section headers
4. Make the design match the user's style description
5. **CRITICAL**: Only use the required class names listed above for card structure
6. Include animations ONLY if they follow the limits above
7. Ensure mobile responsiveness with @media (max-width: 480px)
8. Use vibrant, saturated colors that stand out against backgrounds
9. **CRITICAL**: ALL THREE contact methods (email, phone, website) MUST be visible and clickable - this is non-negotiable
10. Contact links must be clearly visible with good color contrast and minimum 16px font size
11. DO NOT include any explanatory text outside the code blocks
13. **CRITICAL**: Do NOT wrap CSS in <style> tags - return RAW CSS only
14. **CRITICAL**: Do NOT wrap JavaScript in <script> tags - return RAW JavaScript only
15. **CRITICAL**: Do NOT wrap HTML content in extra tags - return RAW HTML only
16. The scaffold already has <style> and <script> tags - you're just filling in the content
17. **CRITICAL**: All JavaScript MUST be wrapped in IIFE (immediately invoked function) like: (function() { your code })();
18. **CRITICAL**: Never use top-level return statements - they cause syntax errors
26. **CRITICAL JAVASCRIPT SYNTAX**: 
   - No double semicolons (;;)
   - No empty statements (standalone semicolons)
   - All functions must be properly closed with matching braces
27. **DO NOT GENERATE SOCKET_BACKGROUND_SCRIPT** - Skip this socket entirely. Background animations cause too many syntax errors. The default will handle it.
19. **CRITICAL QR CODE REQUIREMENT**: If generating SOCKET_INTERACTIONS or SOCKET_CARD_SCRIPT, you MUST include QR code generation using vCard data (contact information), NOT a website URL
20. **QR CODE FORMAT**: Use this SIMPLIFIED vCard format to prevent overflow:
           const vCardData = 'BEGIN:VCARD\\nVERSION:3.0\\nFN:{{FULL_NAME}}\\nEMAIL:{{EMAIL}}\\nTEL:{{PHONE}}\\nEND:VCARD';
           new QRCode(document.getElementById("qrcode"), { text: vCardData, width: 160, height: 160, colorDark: "{{QR_DARK_COLOR}}", colorLight: "{{QR_LIGHT_COLOR}}", correctLevel: QRCode.CorrectLevel.H });
21. **QR CODE LAYOUT**: The QR code MUST be centered with proper margins. Use: display: flex; justify-content: center; margin: 20px auto;
22. **CRITICAL - NO INLINE SVG**: DO NOT use inline SVG elements (<svg>) for icons - they cause rendering errors. Use emoji icons (📧 ✉️ 📱 🌐) or Unicode symbols instead
23. **CSS SAFETY RULES**:
   - Never use overflow: hidden on .card or .card-inner (causes QR cutoff)
   - Always use box-sizing: border-box
   - Use relative units (rem, %, vh) over fixed px for responsive design
   - Background gradients MUST have sufficient contrast with text
24. **GUARANTEED ELEMENTS**: Every design MUST include:
   - Name (h1) - clearly visible, large
   - Title/Company (h2 or h3) - visible
   - Email link (with mailto:) - minimum 16px
   - Phone link (with tel:) - minimum 16px  
   - Website link (with https://) - minimum 16px
   - QR code container (#qrcode div)
   - Two action buttons (#saveContact, #shareCard)
25. Format your response EXACTLY like this:

${Object.keys(scaffold.sockets)
    .filter(name => scaffold.sockets[name].llmPrompt || scaffold.sockets[name].required)
    .map(name => `=== ${name} ===
[${scaffold.sockets[name].type} code here]
`).join('\n')}

**CRITICAL**: Use these EXACT socket names. Do not use any other socket names.

Generate creative, unique designs that truly match the user's vision!`;
    }

    parseDesignResponse(response, scaffold, socketFilter = null) {
        const customizations = {};
        
        // Parse socket sections from response
        const socketRegex = /===\s*(\w+)\s*===\s*([\s\S]*?)(?====|$)/g;
        let match;
        
        while ((match = socketRegex.exec(response)) !== null) {
            const socketName = match[1].trim();
            
            // Skip sockets not in filter during partial regeneration
            if (socketFilter && !socketFilter.includes(socketName)) {
                continue;
            }
            
            let socketContent = match[2].trim();
            
            // Remove markdown code blocks if present
            socketContent = socketContent.replace(/```(?:css|html|javascript|js)?\n([\s\S]*?)```/g, '$1');
            socketContent = socketContent.trim();
            
            // CRITICAL: Remove wrapper tags that Gemini might add
            // Remove <style> tags from CSS sockets
            if (socketName.includes('STYLES') || socketName.includes('ANIMATIONS')) {
                socketContent = socketContent.replace(/<style[^>]*>/gi, '');
                socketContent = socketContent.replace(/<\/style>/gi, '');
            }
            
            // Remove <script> tags from JavaScript sockets
            if (socketName.includes('SCRIPT')) {
                socketContent = socketContent.replace(/<script[^>]*>/gi, '');
                socketContent = socketContent.replace(/<\/script>/gi, '');
            }
            
            // Strip any wrapper tags
            const socketType = scaffold.sockets[socketName].type;
            if (socketType === 'css') {
                socketContent = socketContent.replace(/<style[^>]*>/gi, '').replace(/<\/style>/gi, '');
            } else if (socketType === 'javascript') {
                socketContent = socketContent.replace(/<script[^>]*>/gi, '').replace(/<\/script>/gi, '');
                
                // Basic JavaScript syntax validation
                try {
                    // Check for common syntax errors
                    if (socketContent.includes(';;') || socketContent.includes('; ;')) {
                        console.warn('Double semicolon detected in JavaScript, cleaning...');
                        socketContent = socketContent.replace(/;\s*;/g, ';');
                    }
                    // Remove empty statements
                    socketContent = socketContent.replace(/^\s*;\s*$/gm, '');
                } catch (e) {
                    console.warn('JavaScript syntax check failed:', e);
                }
            } else if (socketType === 'html') {
                // Remove ALL inline SVG to prevent rendering errors
                if (socketContent.includes('<svg')) {
                    console.warn('Inline SVG detected - stripping to prevent rendering errors...');
                    socketContent = socketContent.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '');
                }
            }
            
            socketContent = socketContent.trim();
            
            customizations[socketName] = socketContent;
        }

        // Only fill in defaults for FULL generation (no socketFilter)
        // During partial regeneration, return ONLY the regenerated sockets
        if (!socketFilter) {
            for (const [socketName, socketDef] of Object.entries(scaffold.sockets)) {
                if (!customizations[socketName] && socketDef.default) {
                    customizations[socketName] = socketDef.default;
                } else if (!customizations[socketName]) {
                    customizations[socketName] = '';
                }
            }
        }

        return customizations;
    }

    // Test API key validity
    async testApiKey() {
        try {
            await this.generateContent('Hello', { maxOutputTokens: 10 });
            return { valid: true };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }
}

// Global instance
const geminiAPI = new GeminiAPI();
