// Liste des émojis par défaut
const defaultEmojis = [
  "🍓", "🍕", "🍔", "🌵", "🐱", "🐟", "🎸", "🎨", "📱", "🚗",
  "🍦", "🥑", "🦄", "🌙", "🔥", "🎶", "💻", "🐻", "🍩", "🏀",
  "🌈", "🍿", "🥂", "🍹", "🎁", "🏞️", "🚀", "🎧", "👑", "⚽",
  "📚", "🎂", "🍪", "🌻", "🎀", "🐶", "🍇", "🌎", "🍉", "🎤",
  "🎯", "🍋", "🎹", "🐾", "🪐", "🛴", "🦋", "🍫", "🐨", "🍒",
  "🌴", "🚲", "🎮", "⚡", "⭐", "🌟", "☕"
];

// Fonction pour charger les émojis personnalisés depuis `localStorage`
function loadEmojiList() {
  const storedEmojis = localStorage.getItem("emojiList");
  return storedEmojis ? JSON.parse(storedEmojis) : [...defaultEmojis];
}

// Fonction pour sauvegarder les émojis dans `localStorage`
function saveEmojiList() {
  localStorage.setItem("emojiList", JSON.stringify(emojiList));
}

// Fonction pour sauvegarder les cartes générées dans `localStorage`
function saveGeneratedCards(cards) {
  localStorage.setItem("generatedCards", JSON.stringify(cards));
}

// Fonction pour charger les cartes générées depuis `localStorage`
function loadGeneratedCards() {
  const savedCards = localStorage.getItem("generatedCards");
  if (savedCards) {
    const cards = JSON.parse(savedCards);
    const cardContainer = document.getElementById("cardContainer");
    cardContainer.innerHTML = ""; // Efface les anciennes cartes

    cards.forEach((card) => {
      const cardDiv = document.createElement("div");
      cardDiv.className = "card";
      positionSymbols(cardDiv, card);
      cardContainer.appendChild(cardDiv);
    });
  }
}

// Initialisation de la liste d'émojis
let emojiList = loadEmojiList();
let activeSymbol = null; // Émoji actuellement sélectionné pour modification

// Fonction pour générer les cartes Dobble
function generateDobbleCards() {
  const n = 7; // Nombre de symboles par carte - 1
  const totalSymbols = n * n + n + 1; // Nombre total de symboles nécessaires
  const symbols = emojiList.slice(0, totalSymbols);
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
  const cards = generateDobbleCards();
  saveGeneratedCards(cards); // Sauvegarde les cartes générées
  loadGeneratedCards(); // Recharge les cartes
}

// Fonction pour positionner les symboles sur une carte
function positionSymbols(cardDiv, card) {
  const cardSize = 250;
  const margin = 20;

  const minSize = parseInt(document.getElementById("minSize").value, 10) || 30;
  const maxSize = parseInt(document.getElementById("maxSize").value, 10) || 70;

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

    const rotation = Math.random() * 360; // Rotation aléatoire
    const symbolDiv = document.createElement("div");
    symbolDiv.className = "symbol";

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
      transform: `rotate(${rotation}deg)`,
      cursor: "move"
    });

    enableDrag(symbolDiv); // Active le déplacement
    cardDiv.appendChild(symbolDiv);
  });
}

// Fonction pour activer le déplacement des émojis
function enableDrag(symbol) {
  let isDragging = false;
  let offsetX, offsetY;

  symbol.addEventListener("mousedown", (event) => {
    isDragging = true;
    offsetX = event.clientX - symbol.offsetLeft;
    offsetY = event.clientY - symbol.offsetTop;
    symbol.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", (event) => {
    if (isDragging) {
      const parentRect = symbol.parentElement.getBoundingClientRect();
      let newLeft = event.clientX - offsetX;
      let newTop = event.clientY - offsetY;

      if (newLeft < 0) newLeft = 0;
      if (newTop < 0) newTop = 0;
      if (newLeft + symbol.offsetWidth > parentRect.width) {
        newLeft = parentRect.width - symbol.offsetWidth;
      }
      if (newTop + symbol.offsetHeight > parentRect.height) {
        newTop = parentRect.height - symbol.offsetHeight;
      }

      symbol.style.left = `${newLeft}px`;
      symbol.style.top = `${newTop}px`;
    }
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      symbol.style.cursor = "move";
    }
  });
}

// Fonction pour télécharger les cartes en PDF
async function downloadCardsAsPDF() {
  const cardContainer = document.getElementById("cardContainer");
  const cards = cardContainer.querySelectorAll(".card");

  if (cards.length === 0) {
    alert("Aucune carte à télécharger.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("portrait", "mm", "a4");
  const cardWidth = 70;
  const cardHeight = 70;

  let currentCardIndex = 0;

  for (let i = 0; i < cards.length; i++) {
    const canvas = await html2canvas(cards[i], { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const x = 10 + (currentCardIndex % 3) * 80;
    const y = 10 + Math.floor(currentCardIndex / 3) * 80;

    pdf.addImage(imgData, "PNG", x, y, cardWidth, cardHeight);

    if ((i + 1) % 6 === 0 && i !== cards.length - 1) {
      pdf.addPage();
    }
    currentCardIndex++;
  }

  pdf.save("cartes_dobble.pdf");
}

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
  loadGeneratedCards();
  populateEmojiTable();
});

// Fonction pour remplir le tableau des émojis personnalisables
function populateEmojiTable() {
  const tableBody = document.getElementById("emojiTable").querySelector("tbody");
  tableBody.innerHTML = "";

  emojiList.forEach((emoji, index) => {
    const row = document.createElement("tr");

    const numberCell = document.createElement("td");
    numberCell.textContent = index + 1;
    row.appendChild(numberCell);

    const emojiCell = document.createElement("td");
    if (emoji.startsWith("data:image")) {
      emojiCell.innerHTML = `<img src="${emoji}" width="20" height="20">`;
    } else {
      emojiCell.textContent = emoji;
    }
    row.appendChild(emojiCell);

    const actionCell = document.createElement("td");
    const resetButton = document.createElement("button");
    resetButton.textContent = "Réinitialiser";
    resetButton.onclick = () => {
      emojiList[index] = defaultEmojis[index];
      saveEmojiList();
      generateCards();
    };
    actionCell.appendChild(resetButton);
    row.appendChild(actionCell);

    tableBody.appendChild(row);
  });
}
