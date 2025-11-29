// Trading Card Creator - Interactive JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const cardForm = document.getElementById('cardForm');
    const previewCard = document.getElementById('previewCard');
    const queuePreview = document.getElementById('queuePreview');
    const printArea = document.getElementById('printArea');
    const cardCountSpan = document.getElementById('cardCount');
    
    // Buttons
    const addCardBtn = document.getElementById('addCardBtn');
    const clearFormBtn = document.getElementById('clearFormBtn');
    const printBtn = document.getElementById('printBtn');
    const clearQueueBtn = document.getElementById('clearQueueBtn');
    
    // Form inputs
    const inputs = {
        name: document.getElementById('cardName'),
        cost: document.getElementById('cardCost'),
        type: document.getElementById('cardType'),
        rarity: document.getElementById('cardRarity'),
        image: document.getElementById('cardImage'),
        ability: document.getElementById('cardAbility'),
        flavor: document.getElementById('cardFlavor'),
        attack: document.getElementById('cardAttack'),
        defense: document.getElementById('cardDefense'),
        id: document.getElementById('cardId')
    };
    
    // Preview elements
    const preview = {
        name: document.getElementById('previewName'),
        cost: document.getElementById('previewCost'),
        type: document.getElementById('previewType'),
        rarity: document.getElementById('previewRarity'),
        image: document.getElementById('previewImage'),
        ability: document.getElementById('previewAbility'),
        flavor: document.getElementById('previewFlavor'),
        attack: document.getElementById('previewAttack'),
        defense: document.getElementById('previewDefense'),
        id: document.getElementById('previewId')
    };
    
    // Card queue
    let cardQueue = [];
    
    // Rarity display mapping
    const rarityDisplay = {
        legendary: '★★★ LEGENDARY',
        rare: '★★ RARE',
        uncommon: '★ UNCOMMON',
        common: '★ COMMON'
    };
    
    // Update preview in real-time
    function updatePreview() {
        // Update text content
        preview.name.textContent = inputs.name.value || 'Card Name';
        preview.cost.textContent = inputs.cost.value || '0';
        preview.type.textContent = inputs.type.value || 'Type';
        preview.ability.textContent = inputs.ability.value || '';
        preview.flavor.textContent = inputs.flavor.value ? `"${inputs.flavor.value}"` : '';
        preview.attack.textContent = inputs.attack.value || '0';
        preview.defense.textContent = inputs.defense.value || '0';
        preview.id.textContent = `#${inputs.id.value || '000'}`;
        
        // Update rarity
        const rarity = inputs.rarity.value;
        previewCard.className = `trading-card ${rarity}`;
        preview.rarity.textContent = rarityDisplay[rarity];
        
        // Update image
        const imageValue = inputs.image.value.trim();
        if (imageValue.startsWith('http://') || imageValue.startsWith('https://')) {
            // It's a URL, show as image
            preview.image.innerHTML = `<img src="${escapeHtml(imageValue)}" alt="Card Image" onerror="this.parentElement.innerHTML='<span class=\\'placeholder-icon\\'>❌</span>'">`;
        } else {
            // It's an emoji or text, show as placeholder
            preview.image.innerHTML = `<span class="placeholder-icon">${escapeHtml(imageValue) || '🎴'}</span>`;
        }
    }
    
    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Get current card data from form
    function getCardData() {
        return {
            name: inputs.name.value,
            cost: inputs.cost.value,
            type: inputs.type.value,
            rarity: inputs.rarity.value,
            image: inputs.image.value,
            ability: inputs.ability.value,
            flavor: inputs.flavor.value,
            attack: inputs.attack.value,
            defense: inputs.defense.value,
            id: inputs.id.value
        };
    }
    
    // Create card HTML from data
    function createCardHtml(cardData, includeRemoveBtn = false) {
        const imageValue = cardData.image.trim();
        let imageHtml;
        
        if (imageValue.startsWith('http://') || imageValue.startsWith('https://')) {
            imageHtml = `<img src="${escapeHtml(imageValue)}" alt="Card Image">`;
        } else {
            imageHtml = `<span class="placeholder-icon">${escapeHtml(imageValue) || '🎴'}</span>`;
        }
        
        const removeBtn = includeRemoveBtn ? 
            `<button class="remove-card-btn" onclick="removeCard(this)" title="Remove card">×</button>` : '';
        
        return `
            <div class="queue-card-wrapper">
                ${removeBtn}
                <div class="trading-card ${cardData.rarity}">
                    <div class="card-border">
                        <div class="card-header">
                            <span class="card-name">${escapeHtml(cardData.name)}</span>
                            <span class="card-cost">${escapeHtml(cardData.cost)}</span>
                        </div>
                        
                        <div class="card-image">
                            <div class="image-placeholder">
                                ${imageHtml}
                            </div>
                        </div>
                        
                        <div class="card-type">
                            <span class="type-badge">${escapeHtml(cardData.type)}</span>
                        </div>
                        
                        <div class="card-description">
                            <p><strong>${escapeHtml(cardData.ability)}</strong></p>
                            <p class="flavor-text">"${escapeHtml(cardData.flavor)}"</p>
                        </div>
                        
                        <div class="card-stats">
                            <div class="stat attack">
                                <span class="stat-label">ATK</span>
                                <span class="stat-value">${escapeHtml(cardData.attack)}</span>
                            </div>
                            <div class="stat defense">
                                <span class="stat-label">DEF</span>
                                <span class="stat-value">${escapeHtml(cardData.defense)}</span>
                            </div>
                        </div>
                        
                        <div class="card-footer">
                            <span class="rarity-badge">${rarityDisplay[cardData.rarity]}</span>
                            <span class="card-id">#${escapeHtml(cardData.id)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Add card to queue
    function addCardToQueue() {
        const cardData = getCardData();
        cardQueue.push(cardData);
        updateQueueDisplay();
        updateButtonStates();
        
        // Auto-increment card ID
        const currentId = parseInt(inputs.id.value) || 0;
        inputs.id.value = String(currentId + 1).padStart(3, '0');
        updatePreview();
    }
    
    // Update queue display
    function updateQueueDisplay() {
        if (cardQueue.length === 0) {
            queuePreview.innerHTML = '<p class="empty-queue">No cards in print queue. Add cards using the editor above.</p>';
        } else {
            queuePreview.innerHTML = cardQueue.map((card, index) => {
                return createCardHtml(card, true);
            }).join('');
        }
        
        cardCountSpan.textContent = `(${cardQueue.length} card${cardQueue.length !== 1 ? 's' : ''})`;
        
        // Update print area
        printArea.innerHTML = cardQueue.map(card => createCardHtml(card, false)).join('');
    }
    
    // Remove card from queue
    window.removeCard = function(btn) {
        const wrapper = btn.closest('.queue-card-wrapper');
        const index = Array.from(queuePreview.children).indexOf(wrapper);
        if (index > -1) {
            cardQueue.splice(index, 1);
            updateQueueDisplay();
            updateButtonStates();
        }
    };
    
    // Clear form
    function clearForm() {
        inputs.name.value = '';
        inputs.cost.value = '0';
        inputs.type.value = '';
        inputs.rarity.value = 'common';
        inputs.image.value = '🎴';
        inputs.ability.value = '';
        inputs.flavor.value = '';
        inputs.attack.value = '0';
        inputs.defense.value = '0';
        inputs.id.value = '001';
        updatePreview();
    }
    
    // Clear queue
    function clearQueue() {
        if (confirm('Are you sure you want to clear all cards from the print queue?')) {
            cardQueue = [];
            updateQueueDisplay();
            updateButtonStates();
        }
    }
    
    // Update button states
    function updateButtonStates() {
        const hasCards = cardQueue.length > 0;
        printBtn.disabled = !hasCards;
        clearQueueBtn.disabled = !hasCards;
    }
    
    // Print cards
    function printCards() {
        window.print();
    }
    
    // Add event listeners to all inputs for live preview
    Object.values(inputs).forEach(input => {
        input.addEventListener('input', updatePreview);
        input.addEventListener('change', updatePreview);
    });
    
    // Button event listeners
    addCardBtn.addEventListener('click', addCardToQueue);
    clearFormBtn.addEventListener('click', clearForm);
    printBtn.addEventListener('click', printCards);
    clearQueueBtn.addEventListener('click', clearQueue);
    
    // Initial update
    updatePreview();
    updateButtonStates();
});
