// Scaffold System - Templates with "sockets" for LLM customization
// Each scaffold has fixed structure with customizable elements

const scaffolds = {
    modern: {
        name: "Modern Tech",
        description: "Tech-focused design with animations",
        structure: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="{{THEME_COLOR}}">
    <link rel="apple-touch-icon" href="https://www.dropbox.com/scl/fi/imwg68s2o6vkfvgfgug4c/Generated-Image-February-05-2026-12_58AM.jpeg?rlkey=ykk4aw5pmg3t2zk48anmzi1e5&st=uztyelil&dl=1">
    <link rel="icon" type="image/jpeg" href="https://www.dropbox.com/scl/fi/imwg68s2o6vkfvgfgug4c/Generated-Image-February-05-2026-12_58AM.jpeg?rlkey=ykk4aw5pmg3t2zk48anmzi1e5&st=uztyelil&dl=1">
    <title>{{FULL_NAME}} - Digital Card</title>
    <style>
        {{SOCKET_BASE_STYLES}}
        {{SOCKET_CUSTOM_STYLES}}
        {{SOCKET_ANIMATIONS}}
    </style>
</head>
<body>
    {{SOCKET_BACKGROUND_ELEMENTS}}
    
    <div class="container">
        <div class="card">
            <div class="card-inner">
                {{SOCKET_HEADER}}
                {{SOCKET_CONTACT_INFO}}
                {{SOCKET_QR_SECTION}}
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
    <script>
        {{SOCKET_BACKGROUND_SCRIPT}}
        {{SOCKET_CARD_SCRIPT}}
    </script>
</body>
</html>`,
        sockets: {
            SOCKET_BASE_STYLES: {
                type: 'css',
                required: true,
                description: 'Base layout and reset styles',
                default: `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            position: relative;
        }

        .container {
            position: relative;
            z-index: 2;
            padding: 20px;
            width: 100%;
            max-width: 500px;
        }

        .card {
            border-radius: 24px;
            padding: 30px 25px;
            position: relative;
            overflow: hidden;
        }

        .card-inner {
            position: relative;
            z-index: 1;
        }`
            },
            SOCKET_CUSTOM_STYLES: {
                type: 'css',
                required: true,
                description: 'LLM-generated custom styles (colors, fonts, layout specifics)',
                llmPrompt: 'Generate CSS for colors, backgrounds, typography, and component styling based on user preferences'
            },
            SOCKET_ANIMATIONS: {
                type: 'css',
                required: false,
                description: 'LLM-generated animation keyframes and effects',
                llmPrompt: 'Create CSS animations and transitions that match the desired aesthetic'
            },
            SOCKET_BACKGROUND_ELEMENTS: {
                type: 'html',
                required: false,
                description: 'Background effects (particles, gradients, etc)',
                llmPrompt: 'Generate background elements HTML (canvas, divs for effects, etc)'
            },
            SOCKET_HEADER: {
                type: 'html',
                required: true,
                description: 'Header section with logo/icon and name',
                llmPrompt: 'Create header HTML with creative logo element and name display using provided data'
            },
            SOCKET_CONTACT_INFO: {
                type: 'html',
                required: true,
                description: 'Contact information display',
                llmPrompt: 'Generate contact info section HTML with icons and styling. MUST include visible email, phone, and website links.',
                default: `
                <div class="contact-info">
                    <div class="contact-item">
                        <a href="mailto:{{EMAIL}}" style="display:block; color:inherit; padding:10px; font-size:1rem;">📧 {{EMAIL}}</a>
                    </div>
                    <div class="contact-item">
                        <a href="tel:{{PHONE}}" style="display:block; color:inherit; padding:10px; font-size:1rem;">📱 {{PHONE}}</a>
                    </div>
                    <div class="contact-item">
                        <a href="https://{{WEBSITE}}" target="_blank" style="display:block; color:inherit; padding:10px; font-size:1rem;">🌐 {{WEBSITE}}</a>
                    </div>
                </div>`
            },
            SOCKET_QR_SECTION: {
                type: 'html',
                required: true,
                description: 'QR code and action buttons',
                llmPrompt: 'QR code section with centered QR and action buttons. NO inline SVG. QR container must be centered with proper margins.',
                default: `
                <div class="qr-section" style="margin: 20px 0; text-align: center;">
                    <div class="qr-code" style="display: flex; justify-content: center; margin: 20px auto; max-width: 180px;">
                        <div id="qrcode"></div>
                    </div>
                    <div class="button-group" style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                        <button id="saveContact" style="flex: 1; max-width: 160px; padding: 12px; background: #0066cc; color: white; border: none; border-radius: 8px; cursor: pointer;">💾 Save Contact</button>
                        <button id="shareCard" style="flex: 1; max-width: 160px; padding: 12px; background: #28a745; color: white; border: none; border-radius: 8px; cursor: pointer;">📤 Share</button>
                    </div>
                </div>`
            },
            SOCKET_BACKGROUND_SCRIPT: {
                type: 'javascript',
                required: false,
                description: 'Background animation/effects JavaScript',
                default: ``
            },
            SOCKET_CARD_SCRIPT: {
                type: 'javascript',
                required: true,
                description: 'Card functionality (QR, vCard, sharing)',
                default: `
        (function initQRCode() {
            if (typeof QRCode === 'undefined') {
                setTimeout(initQRCode, 100);
                return;
            }
            
            // Generate simplified vCard data for QR code (prevent overflow)
            const vCardData = 'BEGIN:VCARD\\nVERSION:3.0\\nFN:{{FULL_NAME}}\\nEMAIL:{{EMAIL}}\\nTEL:{{PHONE}}\\nEND:VCARD';
            
            console.log('✅ QR Code vCard data generated');
            
            try {
                new QRCode(document.getElementById("qrcode"), {
                    text: vCardData,
                    width: 160,
                    height: 160,
                    colorDark: "{{QR_DARK_COLOR}}",
                    colorLight: "{{QR_LIGHT_COLOR}}",
                    correctLevel: QRCode.CorrectLevel.H
                });
                console.log('✅ QR Code generated with contact data');
            } catch (error) {
                console.error('❌ QR Code failed:', error);
            }
        })();

        document.getElementById('saveContact').addEventListener('click', () => {
            const vcard = \`BEGIN:VCARD
VERSION:3.0
FN:{{FULL_NAME}}
EMAIL:{{EMAIL}}
TEL:{{PHONE}}
URL:{{WEBSITE}}
ORG:{{COMPANY}}
TITLE:{{TITLE}}
END:VCARD\`;

            const blob = new Blob([vcard], { type: 'text/vcard' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = '{{FULL_NAME}}.vcf';
            a.click();
            URL.revokeObjectURL(url);
        });

        document.getElementById('shareCard').addEventListener('click', async () => {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: '{{FULL_NAME}}',
                        text: 'Check out my digital business card!',
                        url: cardUrl
                    });
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        console.error('Share failed:', err);
                    }
                }
            } else {
                navigator.clipboard.writeText(cardUrl);
                alert('Link copied to clipboard!');
            }
        });`
            }
        },
        contextVariables: ['FULL_NAME', 'TITLE', 'EMAIL', 'PHONE', 'WEBSITE', 'COMPANY', 'THEME_COLOR', 'QR_DARK_COLOR', 'QR_LIGHT_COLOR']
    },

    minimal: {
        name: "Minimal",
        description: "Clean, simple design focusing on content",
        structure: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="apple-touch-icon" href="https://www.dropbox.com/scl/fi/imwg68s2o6vkfvgfgug4c/Generated-Image-February-05-2026-12_58AM.jpeg?rlkey=ykk4aw5pmg3t2zk48anmzi1e5&st=uztyelil&dl=1">
    <link rel="icon" type="image/jpeg" href="https://www.dropbox.com/scl/fi/imwg68s2o6vkfvgfgug4c/Generated-Image-February-05-2026-12_58AM.jpeg?rlkey=ykk4aw5pmg3t2zk48anmzi1e5&st=uztyelil&dl=1">
    <title>{{FULL_NAME}}</title>
    <style>
        {{SOCKET_BASE_STYLES}}
        {{SOCKET_CUSTOM_STYLES}}
    </style>
</head>
<body>
    <div class="card">
        {{SOCKET_CONTENT}}
    </div>
    <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
    <script>{{SOCKET_CARD_SCRIPT}}</script>
</body>
</html>`,
        sockets: {
            SOCKET_BASE_STYLES: {
                type: 'css',
                required: true,
                default: `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .card {
            max-width: 500px;
            width: 100%;
            padding: 40px;
        }`
            },
            SOCKET_CUSTOM_STYLES: {
                type: 'css',
                required: true,
                llmPrompt: 'Generate minimal, clean CSS with subtle effects and typography'
            },
            SOCKET_CONTENT: {
                type: 'html',
                required: true,
                llmPrompt: 'Create minimal card content with all user info and QR code'
            },
            SOCKET_CARD_SCRIPT: {
                type: 'javascript',
                required: true,
                default: `
        new QRCode(document.getElementById("qrcode"), {
            text: window.location.href,
            width: 150,
            height: 150
        });`
            }
        },
        contextVariables: ['FULL_NAME', 'TITLE', 'EMAIL', 'PHONE', 'WEBSITE', 'COMPANY']
    },

    creative: {
        name: "Creative",
        description: "Bold, artistic design with unique layouts",
        structure: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="apple-touch-icon" href="https://www.dropbox.com/scl/fi/imwg68s2o6vkfvgfgug4c/Generated-Image-February-05-2026-12_58AM.jpeg?rlkey=ykk4aw5pmg3t2zk48anmzi1e5&st=uztyelil&dl=1">
    <link rel="icon" type="image/jpeg" href="https://www.dropbox.com/scl/fi/imwg68s2o6vkfvgfgug4c/Generated-Image-February-05-2026-12_58AM.jpeg?rlkey=ykk4aw5pmg3t2zk48anmzi1e5&st=uztyelil&dl=1">
    <title>{{FULL_NAME}} - Portfolio Card</title>
    <style>
        {{SOCKET_BASE_STYLES}}
        {{SOCKET_CREATIVE_STYLES}}
        {{SOCKET_ANIMATIONS}}
    </style>
</head>
<body>
    {{SOCKET_CREATIVE_LAYOUT}}
    <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
    <script>{{SOCKET_INTERACTIONS}}</script>
</body>
</html>`,
        sockets: {
            SOCKET_BASE_STYLES: { 
                type: 'css', 
                required: true,
                default: `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: #0a0a0a;
            color: #fff;
        }`
            },
            SOCKET_CREATIVE_STYLES: { type: 'css', required: true, llmPrompt: 'Create bold, artistic CSS with unique design elements' },
            SOCKET_ANIMATIONS: { type: 'css', required: false, llmPrompt: 'Add creative animations and transitions' },
            SOCKET_CREATIVE_LAYOUT: { 
                type: 'html', 
                required: true, 
                llmPrompt: 'Design unique HTML layout with artistic elements. MUST include ALL contact info (email, phone, website) as visible, clickable links. Include header with name/title/company AND contact section AND QR code section.',
                default: `
    <div class="container">
        <div class="card">
            <div class="card-inner">
                <h1>{{FULL_NAME}}</h1>
                <h2>{{TITLE}}</h2>
                <h3>{{COMPANY}}</h3>
                <div class="contact-info">
                    <div class="contact-item">
                        <a href="mailto:{{EMAIL}}" style="display:block; color:inherit; padding:10px;">{{EMAIL}}</a>
                    </div>
                    <div class="contact-item">
                        <a href="tel:{{PHONE}}" style="display:block; color:inherit; padding:10px;">{{PHONE}}</a>
                    </div>
                    <div class="contact-item">
                        <a href="https://{{WEBSITE}}" target="_blank" style="display:block; color:inherit; padding:10px;">{{WEBSITE}}</a>
                    </div>
                </div>
                <div class="qr-section">
                    <div class="qr-code"><div id="qrcode"></div></div>
                </div>
            </div>
        </div>
    </div>`
            },
            SOCKET_INTERACTIONS: { 
                type: 'javascript', 
                required: true,
                llmPrompt: 'Generate JavaScript for interactivity. MUST include QR code generation using vCard contact data (not website URL). Required: const vCardData with BEGIN:VCARD format, new QRCode() call.',
                default: `
        // Wrap in function to avoid illegal return statement
        (function initQRCode() {
            // Wait for QRCode library to be fully loaded
            if (typeof QRCode === 'undefined') {
                console.error('QRCode library not loaded yet, retrying...');
                setTimeout(initQRCode, 100);
                return;
            }
            
            // Generate vCard data for QR code
            const vCardData = 'BEGIN:VCARD\\nVERSION:3.0\\nFN:{{FULL_NAME}}\\nEMAIL:{{EMAIL}}\\nTEL:{{PHONE}}\\nEND:VCARD';
            
            console.log('✅ QR Generation - vCard data created');
            console.log('🎨 QR Colors - Dark:', '{{QR_DARK_COLOR}}', 'Light:', '{{QR_LIGHT_COLOR}}');
            
            const qrElement = document.getElementById("qrcode");
            if (!qrElement) {
                console.error('QR code element #qrcode not found in DOM');
                return;
            }
            
            try {
                new QRCode(qrElement, {
                    text: vCardData,
                    width: 150,
                    height: 150,
                    colorDark: '{{QR_DARK_COLOR}}',
                    colorLight: '{{QR_LIGHT_COLOR}}',
                    correctLevel: QRCode.CorrectLevel.H
                });
                console.log('✅ QR Code generated with contact data');
            } catch (error) {
                console.error('❌ QR Code generation failed:', error);
            }
        })();`
            }
        },
        contextVariables: ['FULL_NAME', 'TITLE', 'EMAIL', 'PHONE', 'WEBSITE', 'COMPANY']
    },

    business: {
        name: "Business Professional",
        description: "Traditional, professional design",
        structure: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="apple-touch-icon" href="https://www.dropbox.com/scl/fi/imwg68s2o6vkfvgfgug4c/Generated-Image-February-05-2026-12_58AM.jpeg?rlkey=ykk4aw5pmg3t2zk48anmzi1e5&st=uztyelil&dl=1">
    <link rel="icon" type="image/jpeg" href="https://www.dropbox.com/scl/fi/imwg68s2o6vkfvgfgug4c/Generated-Image-February-05-2026-12_58AM.jpeg?rlkey=ykk4aw5pmg3t2zk48anmzi1e5&st=uztyelil&dl=1">
    <title>{{FULL_NAME}} - {{COMPANY}}</title>
    <style>
        {{SOCKET_BASE_STYLES}}
        {{SOCKET_PROFESSIONAL_STYLES}}
    </style>
</head>
<body>
    <div class="business-card">
        {{SOCKET_HEADER}}
        {{SOCKET_INFO}}
        {{SOCKET_FOOTER}}
    </div>
    <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
    <script>{{SOCKET_CARD_SCRIPT}}</script>
</body>
</html>`,
        sockets: {
            SOCKET_BASE_STYLES: { 
                type: 'css', 
                required: true,
                default: `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
.business-card { max-width: 450px; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
a { color: inherit; text-decoration: none; }
button { cursor: pointer; border: none; padding: 12px 24px; border-radius: 4px; font-size: 1rem; }`
            },
            SOCKET_PROFESSIONAL_STYLES: { 
                type: 'css', 
                required: true, 
                llmPrompt: 'Sophisticated professional business styling - elegant, modern, with personality. Not plain or boring. Use refined colors, subtle shadows, and elegant typography.'
            },
            SOCKET_HEADER: { 
                type: 'html', 
                required: true, 
                llmPrompt: 'Professional header with elegant company branding and name. Can include logo/icon element.',
                default: `<div class="header"><h1>{{FULL_NAME}}</h1><p class="title">{{TITLE}}</p><p class="company">{{COMPANY}}</p></div>`
            },
            SOCKET_INFO: { 
                type: 'html', 
                required: true, 
                llmPrompt: 'Structured contact information display with icons. MUST include email, phone, and website as visible, styled links.',
                default: `
<div class="contact-info">
    <div class="contact-item"><a href="mailto:{{EMAIL}}">📧 {{EMAIL}}</a></div>
    <div class="contact-item"><a href="tel:{{PHONE}}">📱 {{PHONE}}</a></div>
    <div class="contact-item"><a href="https://{{WEBSITE}}" target="_blank">🌐 {{WEBSITE}}</a></div>
</div>`
            },
            SOCKET_FOOTER: { 
                type: 'html', 
                required: true, 
                llmPrompt: 'Footer with QR code and action buttons (Save Contact, Share Card)',
                default: `
<div class="footer">
    <div class="qr-section">
        <div id="qrcode" style="margin: 20px auto; display: flex; justify-content: center;"></div>
    </div>
    <div class="button-group" style="display: flex; gap: 10px; margin-top: 20px;">
        <button id="saveContact" style="flex: 1; background: #0066cc; color: white;">Save Contact</button>
        <button id="shareCard" style="flex: 1; background: #28a745; color: white;">Share Card</button>
    </div>
</div>`
            },
            SOCKET_CARD_SCRIPT: { 
                type: 'javascript', 
                required: true,
                default: `
(function initBusinessCard() {
    if (typeof QRCode === 'undefined') {
        setTimeout(initBusinessCard, 100);
        return;
    }
    
    // Generate simplified vCard data for QR code (prevent overflow)
    const vCardData = 'BEGIN:VCARD\nVERSION:3.0\nFN:{{FULL_NAME}}\nEMAIL:{{EMAIL}}\nTEL:{{PHONE}}\nEND:VCARD';
    
    console.log('✅ QR Code vCard data generated');
    
    try {
        new QRCode(document.getElementById("qrcode"), {
            text: vCardData,
            width: 160,
            height: 160,
            colorDark: "{{QR_DARK_COLOR}}",
            colorLight: "{{QR_LIGHT_COLOR}}",
            correctLevel: QRCode.CorrectLevel.H
        });
        console.log('✅ QR Code generated with contact data');
    } catch (error) {
        console.error('❌ QR Code failed:', error);
    }
})();

document.getElementById('saveContact')?.addEventListener('click', () => {
    const vcard = \`BEGIN:VCARD\nVERSION:3.0\nFN:{{FULL_NAME}}\nEMAIL:{{EMAIL}}\nTEL:{{PHONE}}\nURL:{{WEBSITE}}\nORG:{{COMPANY}}\nTITLE:{{TITLE}}\nEND:VCARD\`;
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '{{FULL_NAME}}.vcf';
    a.click();
});

document.getElementById('shareCard')?.addEventListener('click', () => {
    if (navigator.share) {
        navigator.share({ title: '{{FULL_NAME}}', text: 'Check out my digital card!', url: window.location.href });
    } else {
        alert('Share: ' + window.location.href);
    }
});`
            }
        },
        contextVariables: ['FULL_NAME', 'TITLE', 'EMAIL', 'PHONE', 'WEBSITE', 'COMPANY']
    }
};

// Export for use in builder
if (typeof module !== 'undefined' && module.exports) {
    module.exports = scaffolds;
}
