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

  function selectSymbol(symbol) {
  if (activeSymbol) {
    activeSymbol.style.outline = "none"; // Retire la bordure de l'ancien symbole
  }

  activeSymbol = symbol;
  activeSymbol.style.outline = "2px solid #ffd700"; // Ajoute une bordure au symbole sélectionné

  const sizeControl = document.getElementById("sizeControl");
  const sizeInput = document.getElementById("emojiSize");
  const sizeValue = document.getElementById("emojiSizeValue");

  sizeControl.style.display = "flex"; // Affiche le contrôle de taille
  sizeInput.value = parseInt(activeSymbol.style.width, 10); // Initialise la taille
  sizeValue.textContent = `${sizeInput.value} px`; // Affiche la taille actuelle
}

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

    // Création de l'élément du symbole
    const symbolDiv = document.createElement("div");
    symbolDiv.className = "symbol";

    // Vérifie si le symbole est une URL d'image ou du texte
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

    // Applique les styles
    Object.assign(symbolDiv.style, {
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`,
      transform: `rotate(${rotation}deg)`
    });

    // Ajoute les événements pour la sélection et le déplacement
    symbolDiv.addEventListener("click", () => selectSymbol(symbolDiv));
    enableDrag(symbolDiv);

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

function populateEmojiTable() {
  const tableBody = document.getElementById("emojiTable").querySelector("tbody");
  tableBody.innerHTML = ""; // Vide la table avant de la remplir

  emojiList.forEach((emoji, index) => {
    const row = document.createElement("tr");

    // Colonne numéro
    const numberCell = document.createElement("td");
    numberCell.textContent = index + 1;
    row.appendChild(numberCell);

    // Colonne émoji actuel (ancien + nouveau)
    const emojiCell = document.createElement("td");
    const oldEmojiSpan = document.createElement("span"); // Émoji actuel
    oldEmojiSpan.textContent = emoji;
    oldEmojiSpan.style.marginRight = "10px";

    const newEmojiSpan = document.createElement("span"); // Place pour le nouvel émoji
    newEmojiSpan.id = `new-emoji-${index}`; // ID unique pour le nouvel émoji
    emojiCell.appendChild(oldEmojiSpan);
    emojiCell.appendChild(newEmojiSpan);
    row.appendChild(emojiCell);

    // Colonne pour personnalisation
    const inputCell = document.createElement("td");
    const textInput = document.createElement("input");
    textInput.type = "text";
    textInput.placeholder = "Nouveau texte";
    textInput.dataset.index = index;

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.dataset.index = index;

    // Gère l'aperçu immédiat des personnalisations
    textInput.addEventListener("input", (event) => {
      const index = event.target.dataset.index;
      document.getElementById(`new-emoji-${index}`).textContent = event.target.value || "";
    });

    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      const index = event.target.dataset.index;
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newEmoji = document.createElement("img");
          newEmoji.src = e.target.result;
          newEmoji.style.width = "20px";
          newEmoji.style.height = "20px";

          const newEmojiSpan = document.getElementById(`new-emoji-${index}`);
          newEmojiSpan.innerHTML = ""; // Efface l'ancien contenu
          newEmojiSpan.appendChild(newEmoji);
        };
        reader.readAsDataURL(file);
      }
    });

    inputCell.appendChild(textInput);
    inputCell.appendChild(fileInput);
    row.appendChild(inputCell);

    // Colonne action (réinitialisation)
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
      emojiList[index] = input.value; // Met à jour l'émoji dans la liste
    }
  });

  fileInputs.forEach(input => {
    const index = input.dataset.index;
    const file = input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        emojiList[index] = e.target.result; // Met à jour l'émoji avec l'image chargée
        updateExistingCards(); // Met à jour les cartes existantes
      };
      reader.readAsDataURL(file);
    }
  });

  updateExistingCards(); // Met à jour les cartes existantes immédiatement
  alert("Personnalisations appliquées !");
}

populateEmojiTable(); // Met à jour le tableau
generateCards(); // Regénère les cartes avec les personnalisations appliquées

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
  populateEmojiTable(); // Affiche le tableau des émojis
  generateCards(); // Génère les cartes initiales
});


function enableDrag(symbol) {
  let isDragging = false;
  let offsetX, offsetY;

  symbol.addEventListener("mousedown", (event) => {
    isDragging = true;
    offsetX = event.clientX - symbol.offsetLeft;
    offsetY = event.clientY - symbol.offsetTop;
    symbol.style.cursor = "grabbing"; // Change le curseur pendant le déplacement
  });

  document.addEventListener("mousemove", (event) => {
    if (isDragging) {
      const cardRect = symbol.parentElement.getBoundingClientRect();
      let newLeft = event.clientX - offsetX;
      let newTop = event.clientY - offsetY;

      // Empêche de dépasser les limites de la carte
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
      symbol.style.cursor = "grab"; // Retour au curseur par défaut
    }
  });
}

function enableDrag(symbol) {
  let isDragging = false;
  let offsetX, offsetY;

  symbol.addEventListener("mousedown", (event) => {
    isDragging = true;
    offsetX = event.clientX - symbol.offsetLeft;
    offsetY = event.clientY - symbol.offsetTop;
    symbol.style.cursor = "grabbing"; // Change le curseur pendant le déplacement
  });

  document.addEventListener("mousemove", (event) => {
    if (isDragging) {
      const cardRect = symbol.parentElement.getBoundingClientRect();
      let newLeft = event.clientX - offsetX;
      let newTop = event.clientY - offsetY;

      // Empêche de dépasser les limites de la carte
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
      symbol.style.cursor = "grab"; // Retour au curseur par défaut
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("emojiTable")) {
    populateEmojiTable(); // Charge la table si elle est présente dans la page
  }
});

function updateExistingCards() {
  const cards = document.querySelectorAll(".card");
  cards.forEach((card, cardIndex) => {
    const symbols = card.querySelectorAll(".symbol");

    symbols.forEach((symbol, symbolIndex) => {
      const emoji = emojiList[(cardIndex + symbolIndex) % emojiList.length];

      if (emoji.startsWith("data:image")) {
        // Si l'émoji est une image, insère une balise <img>
        const img = document.createElement("img");
        img.src = emoji;
        img.style.width = "100%";
        img.style.height = "100%";

        symbol.innerHTML = ""; // Vide le contenu précédent
        symbol.appendChild(img);
      } else {
        // Sinon, insère le texte de l'émoji
        symbol.textContent = emoji;
      }
    });
  });
}

// Liste des émojis par défaut
const emojiList = [
  "🍓", "🍕", "🍔", "🌵", "🐱", "🐟", "🎸", "🎨", "📱", "🚗",
  "🍦", "🥑", "🦄", "🌙", "🔥", "🎶", "💻", "🐻", "🍩", "🏀",
  "🌈", "🍿", "🥂", "🍹", "🎁", "🏞️", "🚀", "🎧", "👑", "⚽",
  "📚", "🎂", "🍪", "🌻", "🎀", "🐶", "🍇", "🌎", "🍉", "🎤",
  "🎯", "🍋", "🎹", "🐾", "🪐", "🛴", "🦋", "🍫", "🐨", "🍒",
  "🌴", "🚲", "🎮", "⚡", "⭐", "🌟", "☕"
];

// Remplit le tableau de personnalisation
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
    emojiCell.id = `current-emoji-${index}`;
    row.appendChild(emojiCell);

    // Colonne pour personnalisation
    const inputCell = document.createElement("td");
    const textInput = document.createElement("input");
    textInput.type = "text";
    textInput.placeholder = "Nouveau texte";
    textInput.dataset.index = index;

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.dataset.index = index;

    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          emojiList[index] = e.target.result; // Met à jour l'émoji
          document.getElementById(`current-emoji-${index}`).innerHTML = `<img src="${e.target.result}" width="20" height="20">`;
        };
        reader.readAsDataURL(file);
      }
    });

    textInput.addEventListener("input", (event) => {
      const value = event.target.value;
      emojiList[index] = value || emojiList[index]; // Met à jour avec le texte
      document.getElementById(`current-emoji-${index}`).textContent = value || emojiList[index];
    });

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

// Fonction pour réinitialiser un émoji
function resetEmoji(index) {
  emojiList[index] = emojiList[index];
  const currentEmoji = document.getElementById(`current-emoji-${index}`);
  currentEmoji.textContent = emojiList[index];
}

// Fonction d'initialisation
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("emojiTable")) {
    populateEmojiTable(); // Affiche le tableau si la page contient le tableau
  }
});

