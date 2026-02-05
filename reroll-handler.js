// Section reroll handler for CardCraft

// Regenerate specific section
async function regenerateSection(sectionName) {
    if (!currentFormData || !currentCustomizations || !currentScaffold) {
        alert('Please generate a card first');
        return;
    }

    const rerollBtn = document.querySelector(`[data-section="${sectionName}"]`);
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    rerollBtn.disabled = true;
    rerollBtn.innerHTML = '<span class="icon">⏳</span><span>Regenerating...</span>';
    loadingOverlay.classList.add('active');

    try {
        // Get sockets for this section based on template
        const socketsToRegenerate = getSectionSockets(sectionName, currentScaffold.name.toLowerCase().split(' ')[0]);
        
        if (!socketsToRegenerate || socketsToRegenerate.length === 0) {
            throw new Error(`Unknown section: ${sectionName}`);
        }

        // Filter to only sockets that exist in current scaffold
        const validSockets = socketsToRegenerate.filter(socketName => 
            currentScaffold.sockets[socketName] !== undefined
        );
        
        if (validSockets.length === 0) {
            throw new Error(`No valid sockets found for ${sectionName} in ${currentScaffold.name} template`);
        }
        
        console.log(`Regenerating ${validSockets.length} sockets for ${sectionName}:`, validSockets);

        // Check if Gemini API is available
        geminiAPI.updateApiKey();
        
        let newCustomizations;
        
        if (geminiAPI.hasApiKey()) {
            // Regenerate only the specified sockets using Gemini
            // Pass current customizations for context
            newCustomizations = await geminiAPI.regenerateSockets(
                currentFormData, 
                currentScaffold, 
                validSockets,
                currentCustomizations
            );
        } else {
            // Fallback simulation for specific sockets
            newCustomizations = await simulateSocketRegeneration(
                currentFormData, 
                currentScaffold, 
                validSockets
            );
        }

        // Merge new customizations with existing ones
        currentCustomizations = { ...currentCustomizations, ...newCustomizations };

        // Reassemble and display
        const cardHTML = assembleCard(currentScaffold, currentFormData, currentCustomizations);
        displayPreview(cardHTML);
        generatedCard = cardHTML;
        
        // Save to history
        pushHistory(currentCustomizations, currentFormData, currentScaffold, cardHTML);

        console.log(`✅ Section "${sectionName}" regenerated successfully`);

    } catch (error) {
        console.error(`Section regeneration failed:`, error);
        alert(`Failed to regenerate ${sectionName}: ${error.message}`);
    } finally {
        loadingOverlay.classList.remove('active');
        
        // Reset button
        const icons = { header: '🎨', contact: '📇', qr: '📱', buttons: '🔘' };
        const labels = { header: 'Header & Brand', contact: 'Contact Info', qr: 'QR Code', buttons: 'Action Buttons' };
        rerollBtn.disabled = false;
        rerollBtn.innerHTML = `<span class="icon">${icons[sectionName]}</span><span>${labels[sectionName]}</span>`;
    }
}

// Wire up reroll buttons
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.reroll-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            regenerateSection(section);
        });
    });
});

// Simulate socket regeneration for fallback
async function simulateSocketRegeneration(formData, scaffold, sockets) {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const customizations = {};
    
    // Generate simple variations for each socket
    for (const socketName of sockets) {
        const socketDef = scaffold.sockets[socketName];
        if (socketDef && socketDef.default) {
            customizations[socketName] = socketDef.default;
        }
    }
    
    return customizations;
}
