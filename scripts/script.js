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

// Fonction pour remplir le tableau des émojis personnalisables
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
    if (emoji.startsWith("data:image")) {
      emojiCell.innerHTML = `<img src="${emoji}" width="20" height="20">`;
    } else {
      emojiCell.textContent = emoji;
    }
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

    // Gestion des événements pour les nouvelles entrées
    textInput.addEventListener("input", (event) => {
      const value = event.target.value;
      emojiList[index] = value || emojiList[index];
      document.getElementById(`current-emoji-${index}`).textContent = value || emojiList[index];
    });

    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          emojiList[index] = e.target.result;
          document.getElementById(`current-emoji-${index}`).innerHTML = `<img src="${e.target.result}" width="20" height="20">`;
        };
        reader.readAsDataURL(file);
      }
    });

    inputCell.appendChild(textInput);
    inputCell.appendChild(fileInput);
    row.appendChild(inputCell);

    // Colonne pour réinitialiser l'émoji
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
  emojiList[index] = defaultEmojis[index]; // Réinitialise l'émoji
  populateEmojiTable(); // Met à jour le tableau
}


function applyCustomizations() {
  const textInputs = document.querySelectorAll("input[type='text']");
  const fileInputs = document.querySelectorAll("input[type='file']");

  // Mise à jour de la liste emojiList avec les nouvelles valeurs
  textInputs.forEach(input => {
    const index = input.dataset.index;
    if (input.value) {
      emojiList[index] = input.value; // Remplace par le texte saisi
    }
  });

  fileInputs.forEach(input => {
    const index = input.dataset.index;
    const file = input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        emojiList[index] = e.target.result; // Met à jour avec l'image
        document.getElementById(`current-emoji-${index}`).innerHTML = `<img src="${e.target.result}" width="20" height="20">`;
      };
      reader.readAsDataURL(file);
    }
  });

  // Réaffiche le tableau mis à jour
  populateEmojiTable();

  // Affiche un message de confirmation
  alert("Personnalisations appliquées !");
}


// Initialisation
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("emojiTable")) {
    populateEmojiTable();
  }
});
