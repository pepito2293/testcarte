// Liste des émojis par défaut
const defaultEmojis = [
  "🍓", "🍕", "🍔", "🌵", "🐱", "🐟", "🎸", "🎨", "📱", "🚗",
  "🍦", "🥑", "🦄", "🌙", "🔥", "🎶", "💻", "🐻", "🍩", "🏀",
  "🌈", "🍿", "🥂", "🍹", "🎁", "🏞️", "🚀", "🎧", "👑", "⚽",
  "📚", "🎂", "🍪", "🌻", "🎀", "🐶", "🍇", "🌎", "🍉", "🎤",
  "🎯", "🍋", "🎹", "🐾", "🪐", "🛴", "🦋", "🍫", "🐨", "🍒",
  "🌴", "🚲", "🎮", "⚡", "⭐", "🌟", "☕"
];

// Initialisation de la liste d'émojis
let emojiList = [...defaultEmojis];

// Fonction pour générer les cartes Dobble
function generateDobbleCards() {
  const n = 7; // Nombre de symboles par carte - 1
  const totalSymbols = n * n + n + 1; // Nombre total de symboles nécessaires
  const symbols = emojiList.slice(0, totalSymbols); // Utilise la liste d'émojis
  const cards = [];

  for (let i = 0; i <= n; i++) {
    const card = [symbols[0]];
    for (let j = 0; j < n; j++) {
      card.push(symbols[1 + i * n + j]);
    }
    cards.push(card);
  }

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const card = [symbols[1 + i]];
      for (let k = 0; k < n; k++) {
        const index = 1 + n + k * n + ((i * k + j) % n);
        card.push(symbols[index]);
      }
      cards.push(card);
    }
  }

  return cards.slice(0, 55); // Limite à 55 cartes
}

// Fonction pour afficher les cartes dans la grille
function generateCards() {
  const cardContainer = document.getElementById("cardContainer");
  cardContainer.innerHTML = ""; // Efface les anciennes cartes

  const cards = generateDobbleCards();
  cards.forEach((card) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "card";
    positionSymbols(cardDiv, card);
    cardContainer.appendChild(cardDiv);
  });
}

// Fonction pour positionner les symboles sur une carte
function positionSymbols(cardDiv, card) {
  const cardSize = 250;
  const margin = 20;

  // Récupère les valeurs des curseurs
  const minSize = parseInt(document.getElementById("minSize").value, 10) || 30;
  const maxSize = parseInt(document.getElementById("maxSize").value, 10) || 70;

  const positions = [];

  card.forEach((symbol) => {
    let isValidPosition = false;
    let x, y, size;

    while (!isValidPosition) {
      size = Math.random() * (maxSize - minSize) + minSize; // Calcule une taille aléatoire
      x = margin + Math.random() * (cardSize - 2 * margin - size);
      y = margin + Math.random() * (cardSize - 2 * margin - size);

      // Vérifie que les émojis ne se chevauchent pas
      isValidPosition = positions.every(pos => {
        const distance = Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
        return distance > (pos.size + size) / 2 + 10;
      });
    }

    positions.push({ x, y, size });

    const symbolDiv = document.createElement("div");
    symbolDiv.className = "symbol";
    symbolDiv.textContent = symbol;

    Object.assign(symbolDiv.style, {
      fontSize: `${size}px`,
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`,
      position: "absolute"
    });

    cardDiv.appendChild(symbolDiv);
  });
}

// Fonction pour mettre à jour l'affichage des valeurs des curseurs
function updatePreview() {
  const minSizeInput = document.getElementById("minSize");
  const maxSizeInput = document.getElementById("maxSize");
  const minSizeValue = document.getElementById("minSizeValue");
  const maxSizeValue = document.getElementById("maxSizeValue");

  // Met à jour les valeurs affichées
  minSizeValue.textContent = `${minSizeInput.value}px`;
  maxSizeValue.textContent = `${maxSizeInput.value}px`;

  // Vérifie les contraintes
  if (parseInt(minSizeInput.value, 10) > parseInt(maxSizeInput.value, 10)) {
    maxSizeInput.value = minSizeInput.value;
    maxSizeValue.textContent = `${maxSizeInput.value}px`;
  }
}

// Fonction pour télécharger les cartes au format PDF
async function downloadCardsAsPDF() {
  try {
    const cardContainer = document.getElementById("cardContainer");
    const cards = cardContainer.querySelectorAll(".card");

    if (cards.length === 0) {
      alert("Aucune carte à télécharger.");
      return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("portrait", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const cardWidth = 70;
    const cardHeight = 70;
    const margin = 10;
    const cardsPerRow = Math.floor((pageWidth - margin) / (cardWidth + margin));
    const cardsPerCol = Math.floor((pageHeight - margin) / (cardHeight + margin));
    const cardsPerPage = cardsPerRow * cardsPerCol;

    let currentCardIndex = 0;

    for (let i = 0; i < cards.length; i++) {
      const canvas = await html2canvas(cards[i], { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const row = Math.floor(currentCardIndex / cardsPerRow) % cardsPerCol;
      const col = currentCardIndex % cardsPerRow;
      const x = margin + col * (cardWidth + margin);
      const y = margin + row * (cardHeight + margin);

      pdf.addImage(imgData, "PNG", x, y, cardWidth, cardHeight);
      currentCardIndex++;

      if (currentCardIndex % cardsPerPage === 0 && currentCardIndex < cards.length) {
        pdf.addPage();
      }
    }

    pdf.save("dobble_cards.pdf");
  } catch (error) {
    console.error("Erreur lors du téléchargement du PDF :", error);
    alert("Une erreur est survenue lors du téléchargement du PDF. Veuillez réessayer.");
  }
}

// Mise à jour des curseurs et génération des cartes à chaque changement
document.getElementById("minSize").addEventListener("input", () => {
  updatePreview();
  generateCards();
});

document.getElementById("maxSize").addEventListener("input", () => {
  updatePreview();
  generateCards();
});

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  generateCards();
  updatePreview();
});
