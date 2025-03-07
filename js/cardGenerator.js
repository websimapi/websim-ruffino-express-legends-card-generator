import { getCardDescription, generateCardImage } from './api.js';
import { saveCard } from './db.js';
import { handleHover, resetHover } from './components/card.js';
import { getTypeIcon, getTypeColor } from './utils.js';

export async function generateCard() {
  // Remove existing card and submenu
  const existingCard = document.querySelector('.card');
  const existingSubmenu = document.querySelector('.submenu');
  if (existingCard) existingCard.remove();
  if (existingSubmenu) existingSubmenu.remove();

  // Create new card
  const cardContainer = document.getElementById('cardContainer');
  const card = document.createElement('div');
  card.className = 'card';
  
  const cardInner = document.createElement('div');
  cardInner.className = 'card-inner flipped';
  
  cardInner.innerHTML = `
    <div class="card-front">
      <h2 class="card-name"></h2>
      <div class="card-image-container"></div>
      <div class="stats-container">
        <div class="type-wrapper"></div>
        <p class="card-stats"></p>
      </div>
      <div class="card-description">
        <p class="effect-description"></p>
      </div>
    </div>
    <div class="card-back">
      <div class="card-back-design">
        <svg class="card-back-logo" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="2"/>
          <path d="M30,50 L70,50 M50,30 L50,70" stroke="currentColor" stroke-width="4"/>
          <text x="50" y="85" text-anchor="middle" fill="currentColor" font-size="12">RUFFINO</text>
        </svg>
        <div class="card-back-pattern"></div>
      </div>
    </div>
  `;
  
  card.appendChild(cardInner);
  
  // Create submenu
  const submenu = document.createElement('div');
  submenu.className = 'submenu hidden';
  
  submenu.innerHTML = `
    <div class="submenu-grid">
      <div class="stat-box">
        <div class="stat-label">Name</div>
        <div class="stat-value">???</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Type</div>
        <div class="stat-value">???</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Attributes</div>
        <div class="stat-value">???</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Impact</div>
        <div class="stat-value">???</div>
      </div>
    </div>
    <div class="description-box">
      <div class="description-title">Description</div>
      <div class="full-description">Generate a card to see its description!</div>
    </div>
  `;
  
  cardContainer.appendChild(submenu);

  // Get card description
  const cardData = await getCardDescription();

  // Ensure type exists
  const cardType = cardData.type || 'Unknown';

  // Update submenu content
  const statValues = submenu.querySelectorAll('.stat-value');
  statValues[0].textContent = cardData.name || 'Unknown';
  statValues[1].textContent = cardType;
  statValues[2].textContent = cardData.attributes || 'Unknown';
  statValues[3].textContent = cardData.impact || 'Unknown';
  
  submenu.querySelector('.full-description').textContent = cardData.description || 'No description available';

  // Generate card image with name context
  const imageUrl = await generateCardImage(cardData.description, cardData.name);

  // Create card data object with guaranteed type
  const newCardData = {
    name: cardData.name,
    description: cardData.description,
    type: cardType,
    height: cardData.height || 'Unknown',
    weight: cardData.weight || 'Unknown',
    attributes: cardData.attributes,
    impact: cardData.impact,
  };

  if (imageUrl) {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `${cardData.name}.png`, { type: 'image/png' });
      const backupImageUrl = await websim.upload(file);
      
      // Save both URLs in card data
      newCardData.imageUrl = imageUrl;
      newCardData.backupImageUrl = backupImageUrl;
      
      const cardImage = document.createElement('img');
      cardImage.className = 'pokemon-image';
      cardImage.src = imageUrl;
      cardImage.alt = cardData.description;
      cardImage.style.width = '100%';
      cardImage.style.height = '100%';
      cardImage.style.objectFit = 'cover';
      
      const imageContainer = card.querySelector('.card-image-container');
      imageContainer.style.height = '45%';
      imageContainer.style.maxHeight = '45%';
      imageContainer.style.margin = '22px 0 0 0';
      imageContainer.appendChild(cardImage);

      // Save card with both URLs
      await saveCard(newCardData);
    } catch (error) {
      console.error('Error handling image:', error);
      await saveCard(newCardData);
    }
  }

  // Update card visuals
  const nameElement = card.querySelector('.card-name');
  nameElement.textContent = cardData.name;
  nameElement.style.fontSize = '0.75em'; 

  const typeWrapper = card.querySelector('.type-wrapper');
  typeWrapper.innerHTML = ''; // Clear existing content
  const typeDiv = document.createElement('div');
  typeDiv.className = `type-icon ${cardType.toLowerCase()}`;
  typeDiv.innerHTML = getTypeIcon(cardType);
  typeDiv.title = cardType;
  typeWrapper.appendChild(typeDiv);

  const cardFront = card.querySelector('.card-front');
  const primaryColor = getTypeColor(cardType.toLowerCase());
  cardFront.style.background = `linear-gradient(135deg, ${primaryColor}26, ${primaryColor}0F 70%)`;

  const statsElement = card.querySelector('.card-stats');
  statsElement.textContent = cardData.attributes;
  statsElement.style.fontSize = '0.6em'; 

  const descElement = card.querySelector('.effect-description'); 
  if (cardData.attributes.length > 30) {
    descElement.textContent = `${cardData.description}\n\nAttributes: ${cardData.attributes}\n\nEffects: ${cardData.impact}`;
  } else {
    descElement.textContent = cardData.description;
  }
  descElement.style.fontSize = '0.6em';

  // Special styling for Rob's cards
  const isRobCard = cardData.name.includes('Rob');
  if (isRobCard) {
    cardInner.classList.add('memorial-card');
    // Add subtle golden border and memorial styling
    const cardFront = cardInner.querySelector('.card-front');
    cardFront.style.border = '2px solid rgba(218, 165, 32, 0.4)';
    cardFront.style.boxShadow = '0 0 15px rgba(218, 165, 32, 0.2)';
    
    // Add memorial ribbon
    const ribbon = document.createElement('div');
    ribbon.className = 'memorial-ribbon';
    ribbon.innerHTML = 'In Memoriam';
    cardFront.appendChild(ribbon);
  }

  cardContainer.appendChild(card);

  // Add click handler for submenu toggle
  card.addEventListener('click', (e) => {
    const cardInner = e.currentTarget.querySelector('.card-inner');
    cardInner.classList.toggle('flipped');
    
    if (!cardInner.classList.contains('flipped')) {
      setTimeout(() => submenu.classList.remove('hidden'), 400);
    } else {
      submenu.classList.add('hidden');
    }
  });

  // Add hover effects
  card.addEventListener('mousemove', handleHover);
  card.addEventListener('mouseleave', resetHover);

  // Show card with animation
  requestAnimationFrame(() => card.classList.add('show'));
}