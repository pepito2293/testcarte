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
  if (storedEmojis) {
    return JSON.parse(storedEmojis); // Charge les émojis personnalisés
  }
  return [...defaultEmojis]; // Si rien n'est trouvé, retourne la liste par défaut
}

// Fonction pour sauvegarder les émojis dans `localStorage`
function saveEmojiList() {
  localStorage.setItem("emojiList", JSON.stringify(emojiList));
}

// Initialisation de la liste des émojis (personnalisée ou par défaut)
let emojiList = loadEmojiList();
let activeSymbol = null; // Émoji actuellement sélectionné pour modification

// Fonction pour générer les cartes Dobble
function generateDobbleCards() {
  const n = 7; // Nombre de symboles par carte - 1
  const totalSymbols = n * n + n + 1; // Nombre total de symboles nécessaires
  const symbols = emojiList.slice(0, totalSymbols); // Utilise les émojis personnalisés ou par défaut
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

    const rotation = Math.random() * 360;
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

    enableDragAndResize(symbolDiv); // Active le déplacement et le redimensionnement
    cardDiv.appendChild(symbolDiv);
  });
}

// Fonction pour activer le déplacement et le redimensionnement des symboles
function enableDragAndResize(symbol) {
  let isDragging = false; // Indique si le symbole est en cours de déplacement
  let offsetX, offsetY;

  // Empêche le comportement par défaut de drag & drop
  symbol.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });

  // Début du déplacement
  symbol.addEventListener("mousedown", (event) => {
    isDragging = true;
    offsetX = event.clientX - symbol.offsetLeft;
    offsetY = event.clientY - symbol.offsetTop;
    symbol.style.cursor = "grabbing"; // Change le curseur pendant le déplacement
  });

  // Déplacement de l'émoji
  document.addEventListener("mousemove", (event) => {
    if (isDragging) {
      const parentRect = symbol.parentElement.getBoundingClientRect();
      let newLeft = event.clientX - offsetX;
      let newTop = event.clientY - offsetY;

      // Empêche le symbole de sortir de la carte
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

  // Fin du déplacement
  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      symbol.style.cursor = "move"; // Retourne au curseur par défaut
    }
  });

  // Permet le redimensionnement via la molette de la souris
  symbol.addEventListener("wheel", (event) => {
    event.preventDefault();
    const currentSize = parseInt(symbol.style.width, 10);
    const newSize = event.deltaY < 0 ? currentSize + 5 : currentSize - 5;

    if (newSize >= 20 && newSize <= 100) {
      symbol.style.width = `${newSize}px`;
      symbol.style.height = `${newSize}px`;
    }
  });
}




// Fonction pour réinitialiser un émoji
function resetEmoji(index) {
  emojiList[index] = defaultEmojis[index]; // Réinitialise à la valeur par défaut
  saveEmojiList(); // Sauvegarde dans localStorage
  populateEmojiTable();
  generateCards();
  alert(`L'émoji #${index + 1} a été réinitialisé !`);
}

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  populateEmojiTable();
  generateCards();
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
    emojiCell.id = `current-emoji-${index}`;
    row.appendChild(emojiCell);

    const inputCell = document.createElement("td");

    // Création du bouton stylisé pour l'upload
    const uploadButton = document.createElement("label");
    uploadButton.className = "custom-file-upload";
    uploadButton.textContent = "Choisir un fichier";

    // Champ input file (caché)
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.dataset.index = index;

    uploadButton.appendChild(fileInput);
    inputCell.appendChild(uploadButton);

    // Gestion de l'upload de fichier
    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          emojiList[index] = e.target.result; // Remplace l'émoji par l'image
          saveEmojiList(); // Sauvegarde dans localStorage
          populateEmojiTable(); // Met à jour le tableau
          generateCards(); // Met à jour les cartes
        };
        reader.readAsDataURL(file);
      }
    });

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

// Fonction pour réinitialiser un émoji
function resetEmoji(index) {
  emojiList[index] = defaultEmojis[index]; // Réinitialise à la valeur par défaut
  saveEmojiList(); // Sauvegarde dans localStorage
  populateEmojiTable();
  generateCards();
  alert(`L'émoji #${index + 1} a été réinitialisé !`);
}
