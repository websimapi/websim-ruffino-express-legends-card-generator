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

  // Update submenu content
  const statValues = submenu.querySelectorAll('.stat-value');
  statValues[0].textContent = cardData.name;
  statValues[1].textContent = cardData.type;
  statValues[2].textContent = cardData.attributes;
  statValues[3].textContent = cardData.impact;
  
  submenu.querySelector('.full-description').textContent = cardData.description;

  // Generate card image
  const imageUrl = await generateCardImage(cardData.description);

  // Create card data object
  const newCardData = {
    name: cardData.name,
    description: cardData.description,
    type: cardData.type,
    attributes: cardData.attributes,
    impact: cardData.impact,
    imageUrl: imageUrl
  };

  if (imageUrl) {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `${cardData.name}.png`, { type: 'image/png' });
      
      const backupImageUrl = await websim.upload(file);
      newCardData.backupImageUrl = backupImageUrl;

      const cardImage = document.createElement('img');
      cardImage.className = 'card-image';
      cardImage.src = imageUrl;
      cardImage.alt = cardData.description;
      
      const imageContainer = card.querySelector('.card-image-container');
      imageContainer.appendChild(cardImage);

      await saveCard(newCardData);
    } catch (error) {
      console.error('Error handling image:', error);
      await saveCard(newCardData);
    }
  }

  // Update card visuals
  const nameElement = card.querySelector('.card-name');
  nameElement.textContent = cardData.name;
  
  const typeWrapper = card.querySelector('.type-wrapper');
  const typeDiv = document.createElement('div');
  typeDiv.className = `type-icon ${cardData.type.toLowerCase()}`;
  typeDiv.innerHTML = getTypeIcon(cardData.type);
  typeDiv.title = cardData.type;
  typeWrapper.appendChild(typeDiv);

  const cardFront = card.querySelector('.card-front');
  const primaryColor = getTypeColor(cardData.type.toLowerCase());
  cardFront.style.background = `linear-gradient(135deg, ${primaryColor}26, ${primaryColor}0F 70%)`;

  const statsElement = card.querySelector('.card-stats');
  statsElement.textContent = cardData.attributes;
  
  const descElement = card.querySelector('.effect-description');
  descElement.textContent = cardData.impact;
  
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