const emojiList = [
  "🍓", "🍕", "🍔", "🌵", "🐱", "🐟", "🎸", "🎨", "📱", "🚗", 
  "🍦", "🥑", "🦄", "🌙", "🔥", "🎶", "💻", "🐻", "🍩", "🏀", 
  "🌈", "🍿", "🥂", "🍹", "🎁", "🏞️", "🚀", "🎧", "👑", "⚽", 
  "📚", "🎂", "🍪", "🌻", "🎀", "🐶", "🍇", "🌎", "🍉", "🎤",
  "🎯", "🍋", "🎹", "🐾", "🪐", "🛴", "🦋", "🍫", "🐨", "🍒",
  "🌴", "🚲", "🎮", "⚡", "⭐", "🌟", "☕"
];
const numSymbolsPerCard = 8;
const totalCards = 55;
let activeSymbol = null;

function generateDobbleCards() {
  const n = numSymbolsPerCard - 1;
  const totalSymbols = n * n + n + 1;
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

  return cards.slice(0, totalCards);
}

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

  // Crée un élément pour afficher le symbole (texte ou image)
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

  symbolDiv.addEventListener("click", () => selectSymbol(symbolDiv));
  enableDrag(symbolDiv);
  cardDiv.appendChild(symbolDiv);
});


    positions.push({ x, y, size });

    const rotation = Math.random() * 360;
    const symbolDiv = document.createElement("div");
    symbolDiv.className = "symbol";
    symbolDiv.textContent = symbol;

    Object.assign(symbolDiv.style, {
      fontSize: `${size}px`,
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`,
      transform: `rotate(${rotation}deg)`
    });

    symbolDiv.addEventListener("click", () => selectSymbol(symbolDiv));
    enableDrag(symbolDiv);
    cardDiv.appendChild(symbolDiv);
  });
}

function selectSymbol(symbol) {
  if (activeSymbol) {
    activeSymbol.style.outline = "none";
  }

  activeSymbol = symbol;
  activeSymbol.style.outline = "2px solid #ffd700";

  const sizeControl = document.getElementById("sizeControl");
  const sizeInput = document.getElementById("emojiSize");
  const sizeValue = document.getElementById("emojiSizeValue");

  sizeControl.style.display = "flex";
  sizeInput.value = parseInt(activeSymbol.style.fontSize, 10);
  sizeValue.textContent = `${sizeInput.value} px`;
}

function adjustEmojiSize() {
  if (activeSymbol) {
    const sizeInput = document.getElementById("emojiSize");
    const sizeValue = document.getElementById("emojiSizeValue");

    const newSize = sizeInput.value;
    activeSymbol.style.fontSize = `${newSize}px`;
    activeSymbol.style.width = `${newSize}px`;
    activeSymbol.style.height = `${newSize}px`;

    sizeValue.textContent = `${newSize} px`;
  }
}

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
      const cardRect = symbol.parentElement.getBoundingClientRect();
      let newLeft = event.clientX - offsetX;
      let newTop = event.clientY - offsetY;

      if (newLeft < 0) newLeft = 0;
      if (newTop < 0) newTop = 0;
      if (newLeft + symbol.offsetWidth > cardRect.width) {
        newLeft = cardRect.width - symbol.offsetWidth;
      }
      if (newTop + symbol.offsetHeight > cardRect.height) {
        newTop = cardRect.height - symbol.offsetHeight;
      }

      symbol.style.left = `${newLeft}px`;
      symbol.style.top = `${newTop}px`;
    }
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      symbol.style.cursor = "grab";
    }
  });
}

function generateCards() {
  const cardContainer = document.getElementById("cardContainer");
  cardContainer.innerHTML = "";

  const cards = generateDobbleCards();
  cards.forEach((card) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "card";
    positionSymbols(cardDiv, card);
    cardContainer.appendChild(cardDiv);
  });
}

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

function updatePreview() {
  const minSize = document.getElementById("minSize").value;
  const maxSize = document.getElementById("maxSize").value;
  document.getElementById("minSizeValue").textContent = minSize;
  document.getElementById("maxSizeValue").textContent = maxSize;
}

document.addEventListener("DOMContentLoaded", updatePreview);

// Gérer les fichiers d'émojis personnalisés
document.getElementById("emojiUpload").addEventListener("change", (event) => {
  const files = event.target.files;

  // Vérifie si des fichiers ont été sélectionnés
  if (files.length > 0) {
    for (let file of files) {
      const reader = new FileReader();

      // Charge chaque fichier sélectionné
      reader.onload = (e) => {
        const imageURL = e.target.result; // URL temporaire de l'image
        emojiList.push(imageURL); // Ajoute l'image à la liste des émojis
      };

      reader.readAsDataURL(file); // Lit le fichier comme une URL Data
    }

    alert("Vos émojis personnalisés ont été ajoutés !");
  }
});

// Initialisation de la liste des émojis
const emojiList = [
  "🍓", "🍕", "🍔", "🌵", "🐱", "🐟", "🎸", "🎨", "📱", "🚗",
  "🍦", "🥑", "🦄", "🌙", "🔥", "🎶", "💻", "🐻", "🍩", "🏀",
  "🌈", "🍿", "🥂", "🍹", "🎁", "🏞️", "🚀", "🎧", "👑", "⚽",
  "📚", "🎂", "🍪", "🌻", "🎀", "🐶", "🍇", "🌎", "🍉", "🎤",
  "🎯", "🍋", "🎹", "🐾", "🪐", "🛴", "🦋", "🍫", "🐨", "🍒",
  "🌴", "🚲", "🎮", "⚡", "⭐", "🌟", "☕"
];

// Fonction pour afficher le tableau des émojis
function populateEmojiTable() {
  const tableBody = document.getElementById("emojiTable").querySelector("tbody");
  tableBody.innerHTML = ""; // Vide le tableau avant de le remplir

  emojiList.forEach((emoji, index) => {
    const row = document.createElement("tr");

    // Colonne numéro
    const numberCell = document.createElement("td");
    numberCell.textContent = index + 1;
    row.appendChild(numberCell);

    // Colonne émoji actuel
    const emojiCell = document.createElement("td");
    emojiCell.textContent = emoji;
    row.appendChild(emojiCell);

    // Colonne pour personnalisation
    const inputCell = document.createElement("td");
    const textInput = document.createElement("input");
    textInput.type = "text";
    textInput.placeholder = "Nouveau texte";
    textInput.dataset.index = index; // Pour lier au bon émoji
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.dataset.index = index; // Pour lier au bon émoji

    inputCell.appendChild(textInput);
    inputCell.appendChild(fileInput);
    row.appendChild(inputCell);

    // Colonne action
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
      emojiList[index] = input.value; // Remplace l'émoji par le texte
    }
  });

  fileInputs.forEach(input => {
    const index = input.dataset.index;
    const file = input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        emojiList[index] = e.target.result; // Remplace l'émoji par l'image
      };
      reader.readAsDataURL(file);
    }
  });

  alert("Personnalisations appliquées !");
  populateEmojiTable(); // Rafraîchit le tableau pour refléter les changements
}

// Fonction pour réinitialiser un émoji à sa valeur par défaut
function resetEmoji(index) {
  const defaultEmojis = [
    "🍓", "🍕", "🍔", "🌵", "🐱", "🐟", "🎸", "🎨", "📱", "🚗",
    "🍦", "🥑", "🦄", "🌙", "🔥", "🎶", "💻", "🐻", "🍩", "🏀",
    "🌈", "🍿", "🥂", "🍹", "🎁", "🏞️", "🚀", "🎧", "👑", "⚽",
    "📚", "🎂", "🍪", "🌻", "🎀", "🐶", "🍇", "🌎", "🍉", "🎤",
    "🎯", "🍋", "🎹", "🐾", "🪐", "🛴", "🦋", "🍫", "🐨", "🍒",
    "🌴", "🚲", "🎮", "⚡", "⭐", "🌟", "☕"
  ];
  emojiList[index] = defaultEmojis[index];
  alert(`Émoji #${index + 1} réinitialisé !`);
  populateEmojiTable();
}

// Initialisation
document.addEventListener("DOMContentLoaded", populateEmojiTable);


