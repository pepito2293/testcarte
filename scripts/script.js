// Liste des émojis par défaut
const emojiList = [
  "🍓", "🍕", "🍔", "🌵", "🐱", "🐟", "🎸", "🎨", "📱", "🚗",
  "🍦", "🥑", "🦄", "🌙", "🔥", "🎶", "💻", "🐻", "🍩", "🏀",
  "🌈", "🍿", "🥂", "🍹", "🎁", "🏞️", "🚀", "🎧", "👑", "⚽",
  "📚", "🎂", "🍪", "🌻", "🎀", "🐶", "🍇", "🌎", "🍉", "🎤",
  "🎯", "🍋", "🎹", "🐾", "🪐", "🛴", "🦋", "🍫", "🐨", "🍒",
  "🌴", "🚲", "🎮", "⚡", "⭐", "🌟", "☕"
];

// Fonction pour générer les cartes Dobble
function generateDobbleCards() {
  const n = 7; // Nombre de symboles par carte - 1
  const totalSymbols = n * n + n + 1; // Nombre total de symboles nécessaires
  const symbols = emojiList.slice(0, totalSymbols); // Sélection des émojis nécessaires
  const cards = [];

  // Génération des cartes
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

  const cards = generateDobbleCards(); // Génère les cartes
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
  const minSize = parseInt(document.getElementById("minSize").value, 10);
  const maxSize = parseInt(document.getElementById("maxSize").value, 10);

  const positions = [];

  card.forEach((symbol) => {
    let isValidPosition = false;
    let x, y, size;

    while (!isValidPosition) {
      size = Math.random() * (maxSize - minSize) + minSize;
      x = margin + Math.random() * (cardSize - 2 * margin - size);
      y = margin + Math.random() * (cardSize - 2 * margin - size);

      isValidPosition = positions.every(pos => {
        const distance = Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
        return distance > (pos.size + size) / 2 + 10;
      });
    }

    positions.push({ x, y, size });

    const rotation = Math.random() * 360;

    const symbolDiv = document.createElement("div");
    symbolDiv.className = "symbol";

    // Vérifie si le symbole est une URL d'image ou un émoji
    if (symbol.startsWith("data:image")) {
      const img = document.createElement("img");
      img.src = symbol;
      img.style.width = `${size}px`;
      img.style.height = `${size}px`;
      symbolDiv.appendChild(img);
    } else {
      symbolDiv.textContent = symbol;
      symbolDiv.style.fontSize = `${size}px`;
    }

    Object.assign(symbolDiv.style, {
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`,
      transform: `rotate(${rotation}deg)`
    });

    cardDiv.appendChild(symbolDiv);
  });
}

// Fonction pour télécharger les cartes au format PDF
async function downloadCardsAsPDF() {
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
}

// Fonction pour afficher le tableau des émojis personnalisables
function populateEmojiTable() {
  const tableBody = document.getElementById("emojiTable").querySelector("tbody");
  tableBody.innerHTML = "";

  emojiList.forEach((emoji, index) => {
    const row = document.createElement("tr");

    const numberCell = document.createElement("td");
    numberCell.textContent = index + 1;
    row.appendChild(numberCell);

    const emojiCell = document.createElement("td");
    emojiCell.textContent = emoji;
    row.appendChild(emojiCell);

    const inputCell = document.createElement("td");
    const textInput = document.createElement("input");
    textInput.type = "text";
    textInput.placeholder = "Nouveau texte";
    textInput.dataset.index = index;
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.dataset.index = index;

    inputCell.appendChild(textInput);
    inputCell.appendChild(fileInput);
    row.appendChild(inputCell);

    const actionCell = document.createElement("td");
    const resetButton = document.createElement("button");
    resetButton.textContent = "Réinitialiser";
    resetButton.onclick = () => resetEmoji(index);
    actionCell.appendChild(resetButton);
    row.appendChild(actionCell);

    tableBody.appendChild(row);
  });
}

// Fonction pour appliquer les personnalisations
function applyCustomizations() {
  const textInputs = document.querySelectorAll("input[type='text']");
  const fileInputs = document.querySelectorAll("input[type='file']");

  textInputs.forEach(input => {
    const index = input.dataset.index;
    if (input.value) {
      emojiList[index] = input.value;
    }
  });

  fileInputs.forEach(input => {
    const index = input.dataset.index;
    const file = input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        emojiList[index] = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  alert("Personnalisations appliquées !");
  populateEmojiTable();
}

// Fonction pour réinitialiser un émoji à sa valeur par défaut
function resetEmoji(index) {
  const defaultEmojis = [...emojiList]; // Liste initiale
  emojiList[index] = defaultEmojis[index];
  alert(`Émoji #${index + 1} réinitialisé !`);
  populateEmojiTable();
}

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  populateEmojiTable();
  updatePreview();
});
