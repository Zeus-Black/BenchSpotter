const API_URL = '/api';

const DEFAULT_CENTER = [48.8566, 2.3522];
const DEFAULT_ZOOM   = 13;
const userDivIcon = L.divIcon({
  html: '<span class="pulse"></span>',
  className: 'user-div-icon',
  iconSize: [20, 20]
});

const map = L.map('map');
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

function setDefaultView () {
  map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
}

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      console.log('→ Succès :', pos);
      const { latitude, longitude, accuracy } = pos.coords;
      console.log(`Lat: ${latitude}, Lng: ${longitude}, précision ~ ${accuracy} m`);
      map.setView([latitude, longitude], 15);
      L.marker([latitude, longitude], { icon: userDivIcon }).addTo(map);
    },
    (err) => {
      console.error('→ Erreur géoloc :', err);
      setDefaultView();
    },
    { enableHighAccuracy: true }
  );
} else {
  setDefaultView();
}

/* === Contrôle Leaflet : bouton Info dépliant =================== */
const InfoControl = L.Control.extend({
  onAdd() {
    const container = L.DomUtil.create('div', 'leaflet-control leaflet-control-info');
    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.disableScrollPropagation(container);

    const btn = L.DomUtil.create('button', '', container);
    btn.textContent = 'ℹ️ Infos';
    btn.style.cssText = 'background:#2ecc71;color:#fff;padding:6px 12px;border:none;border-radius:6px;cursor:pointer;';

    const panel = L.DomUtil.create('div', 'info-panel', container);
    panel.style.cssText = 'display:none;margin-top:6px;padding:10px 14px;width:220px;background:#fff;border:1px solid #ccc;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,.15);font-size:13px;line-height:1.4;';
    panel.innerHTML = `
      <strong>BenchSpotter</strong> <small>v1.0.0-dev</small><br>
      Projet collaboratif pour cartographier les bancs ayant les plus belles vues.<br><br>
      🪑 Bancs référencés : <span class="bench-count">0</span><br>
      📧 <a href="mailto:contact@benchspotter.live">contact</a><br>
      🐞 <a href="https://github.com/0xSp3ctra/BenchSpotter/issues" target="_blank">Signaler un bug</a><br>
      💖 <a href="https://github.com/0xSp3ctra/BenchSpotter" target="_blank">Contribuer</a>
    `;

    btn.addEventListener('click', () => {
      panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
    });

    return container;
  }
});

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

let selectedFile = null;
let placementMode = false;
const addBenchBtn = document.getElementById("add-bench-btn");

addBenchBtn.addEventListener("click", () => {
  placementMode = true;
  addBenchBtn.disabled = true;
  addBenchBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Cliquez sur la carte...';
});

function validateBenchInput(form) {
  const description = form.querySelector('input[name="description"]').value.trim();
  const noteValue = form.querySelector('input[name="note"]').value;
  const note = noteValue !== '' ? parseFloat(noteValue) : null;
  const imageInput = form.querySelector('input[name="image"]');

  if (description.length > 500) {
    alert("La description ne doit pas dépasser 500 caractères.");
    return false;
  }
  if (noteValue !== '' && (isNaN(note) || note < 0 || note > 5)) {
    alert("La note doit être un nombre entre 0 et 5.");
    return false;
  }
  if (imageInput && imageInput.files.length) {
    const file = imageInput.files[0];
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert("Seules les images JPEG ou PNG sont autorisées.");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("La taille de l'image ne doit pas dépasser 5 Mo.");
      return false;
    }
  }
  return true;
}

function validateCommentInput(form) {
  const author = form.querySelector('input[name="author"]').value.trim();
  const content = form.querySelector('textarea[name="content"]').value.trim();

  if (author.length === 0 || author.length > 50) {
    alert("Le nom doit contenir entre 1 et 50 caractères.");
    return false;
  }
  if (content.length === 0 || content.length > 200) {
    alert("Le commentaire doit contenir entre 1 et 200 caractères.");
    return false;
  }
  return true;
}

function showOverlay(percentText = "0 %") {
  let overlay = document.querySelector(".bs-upload-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "bs-upload-overlay";
    overlay.innerHTML = `
      <div>
        <div class="bs-spinner"></div>
        <div class="bs-percent" id="bs-percent">${percentText}</div>
      </div>`;
    document.body.appendChild(overlay);
  } else {
    overlay.querySelector("#bs-percent").textContent = percentText;
    overlay.style.display = "flex";
  }
}

function hideOverlay() {
  const overlay = document.querySelector(".bs-upload-overlay");
  if (overlay) overlay.style.display = "none";
}

L.Control.geocoder({ defaultMarkGeocode: false, placeholder: "Rechercher un lieu...", collapsed: false, showIcon: false })
  .on('markgeocode', function(e) {
    const center = e.geocode.center;
    map.setView(center, 16);
    L.marker(center).addTo(map);
  }).addTo(map);

// Gestion du modal d'informations
const infoBtn = document.getElementById('info-btn');
const infoModal = document.getElementById('info-modal');
const modalClose = document.getElementById('modal-close');

infoBtn.addEventListener('click', () => {
  infoModal.classList.add('show');
});

modalClose.addEventListener('click', () => {
  infoModal.classList.remove('show');
});

infoModal.addEventListener('click', (e) => {
  if (e.target === infoModal) {
    infoModal.classList.remove('show');
  }
});

const benchIcon = L.icon({
  iconUrl: 'img/bench-icon.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

fetch(`${API_URL}/benches`)
  .then(res => res.json())
  .then(data => {
    data.forEach(bench => {
      const popupContent = renderPopupContent(bench);
      L.marker([bench.latitude, bench.longitude], { icon: benchIcon, benchId: bench.id })
        .addTo(map)
        .bindPopup(popupContent);

      const countSpans = document.querySelectorAll('.bench-count');
      countSpans.forEach(span => span.textContent = data.length);
    });
  });

map.on('click', (e) => {
  if (!placementMode) return;
  const lat = e.latlng.lat;
  const lng = e.latlng.lng;

  const formHtml = `
  <style>
    /* Le petit CSS embarqué pour que tout fonctionne même si style.css n'est pas encore chargé */
    .bs-popup    { font-family: inherit; font-size: 14px; width: 220px; }
    .bs-popup label { display:block; margin:10px 0 4px; font-weight:600; }
    .bs-popup input[type=text],
    .bs-popup input[type=number]  { width:100%; padding:.5em .7em; border:1px solid #ccc; border-radius:6px; }
    .bs-popup input[type=number]::-webkit-inner-spin-button{ opacity:.4; }
    /* zone drag-and-drop */
    .bs-drop     { display:flex; align-items:center; justify-content:center;
                   flex-direction:column; gap:4px;
                   width:100%; height:90px; border:2px dashed #bbb; border-radius:8px;
                   color:#999; cursor:pointer; transition:.2s; }
    .bs-drop:hover{ border-color:#2ecc71; color:#2ecc71; }
    .bs-drop svg { width:26px; height:26px; opacity:.6; }
    .bs-popup button { width:100%; background:#2ecc71; color:#fff; border:none;
                       padding:.6em 0; border-radius:6px; font-weight:600;
                       cursor:pointer; margin-top:12px; transition:background .2s;}
    .bs-popup button:hover { background:#27ae60; }
    /* croix custom */
    .leaflet-popup-close-button { width:22px; height:22px; line-height:22px;
                                  background:#e74c3c; color:#fff !important; border-radius:50%;
                                  box-shadow:0 1px 4px rgba(0,0,0,.2); opacity:1 !important; }
    .leaflet-popup-close-button:hover{ background:#c0392b; }
  </style>

  <div class="bs-popup">
    <form id="bench-form" method="POST" enctype="multipart/form-data">
      <label><i class="fas fa-edit"></i> Description :</label>
      <input name="description" type="text" placeholder="Décrivez ce banc..." />

      <label><i class="fas fa-star"></i> Note (0 à 5) :</label>
      <input name="note" type="number" min="0" max="5" step="0.1" placeholder="4.5" />

      <label><i class="fas fa-camera"></i> Image :</label>
      <div class="bs-drop" id="drop-zone">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8z"/>
          <path d="M12 7a1 1 0 0 0-1 1v3H8a1 1 0 0 0 0 2h3v3a1 1 0 0 0 2 0v-3h3a1 1 0 0 0 0-2h-3V8a1 1 0 0 0-1-1z"/>
        </svg>
          <span>Déposez une image<br>ou cliquez</span>
          <input type="file" name="image" accept="image/*" hidden multiple>
        </div>
      <button type="submit"><i class="fas fa-plus"></i> Ajouter</button>
    </form>
  </div>
`;

  const popup = L.popup().setLatLng(e.latlng).setContent(formHtml);
  const tempMarker = L.marker([lat, lng], { icon: benchIcon }).addTo(map).bindPopup(popup).openPopup();

  placementMode = false;
  addBenchBtn.disabled = false;
  addBenchBtn.innerHTML = '<i class="fas fa-plus"></i> Ajouter un banc';

  map.on('popupclose', function onClose(evt) {
    if (evt.popup === popup) {
      map.removeLayer(tempMarker);
      map.off('popupclose', onClose);
    }
  });

  setTimeout(() => {
    const form = document.getElementById("bench-form");
    if (!form) return;

        // zone et input (dans le formulaire courant)
    const dropZone  = form.querySelector('.bs-drop');
    const fileInput = dropZone.querySelector('input[type=file]');
    if (!dropZone || !fileInput) return;   // sécurité

    function handleFileSelection(file){
      // spinner dans la zone
      dropZone.classList.add('loading');
      dropZone.innerHTML = '<div class="bs-spinner-small"></div>';
    
      // lecture du fichier puis thumbnail
      const reader = new FileReader();
      reader.onload = e => {
        dropZone.classList.remove('loading');
        dropZone.innerHTML = `<img src="${e.target.result}" class="bs-thumb">`;
      };
      reader.readAsDataURL(file);
    }

    /* 1. Ouvrir la boîte de dialogue si on clique sur la zone */
    dropZone.addEventListener('click', () => fileInput.click());

    /* 2. Effet visuel quand on survole la zone avec un fichier */
    ['dragenter', 'dragover'].forEach(evt =>
      dropZone.addEventListener(evt, e => {
        e.preventDefault();
        dropZone.classList.add('dragover');
      })
    );
    ['dragleave', 'drop'].forEach(evt =>
      dropZone.addEventListener(evt, e => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
      })
    );

    /* 3. Déposer un fichier par drag-and-drop */
    dropZone.addEventListener('drop', e => {
      const files = e.dataTransfer.files;
      if (files.length > 1) return alert("Une seule image autorisée");
      selectedFile = files[0];
      handleFileSelection(selectedFile);
    });

    /* 4. Vérifier la sélection via la boîte de dialogue */
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 1){
        alert("Une seule image autorisée"); fileInput.value=""; return;
      }
      if (fileInput.files.length){
        selectedFile = fileInput.files[0];
        handleFileSelection(fileInput.files[0]);
      }
    });

    form.addEventListener("submit", async (evt) => {
      evt.preventDefault();
      if (!validateBenchInput(form)) return;
      const formData = new FormData(form);
      formData.append("latitude", lat);
      formData.append("longitude", lng);

      if (!formData.get("note")) {
        formData.delete("note");
      }

      if (selectedFile) {
        formData.append("image", selectedFile);
      }   

      selectedFile = null;

      /* ---------- Envoi avec XMLHttpRequest ---------- */
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_URL}/benches`);

      showOverlay("0 %");
      // suivi de progression
      xhr.upload.addEventListener("progress", e => {
        if (e.lengthComputable) {
          const pct = Math.round(e.loaded / e.total * 100);
          showOverlay(pct + " %");
        }
      });

      // fin ou erreur
      xhr.onload = () => {
        hideOverlay();
        if (xhr.status >= 200 && xhr.status < 300) {
          map.removeLayer(tempMarker);
          location.reload();
        } else {
          alert("Erreur à l'envoi (" + xhr.status + ")");
        }
      };
      xhr.onerror = () => {
        hideOverlay();
        alert("Connexion interrompue !");
      };

      xhr.send(formData);
    });
  }, 100);
});

map.on("popupopen", (e) => {
  const benchId = e.popup._source.options.benchId;

  fetchPaginatedComments(benchId);
  setTimeout(() => {
    const formContainer = document.getElementById(`comments-form-container-${benchId}`);
    if (!formContainer) return;

    const storedAuthor = getCookie("author");
    const authorField = storedAuthor
      ? `<input type="hidden" name="author" value="${storedAuthor}">`
      : `<label><i class="fas fa-user"></i> Votre nom :<br><input name="author" placeholder="Votre nom..." /></label><br>`;

    formContainer.innerHTML = `
      <form id="comments-form-${benchId}" method="POST">
        ${authorField}
        <label><i class="fas fa-comment"></i> Votre commentaire :<br><textarea name="content" placeholder="Partagez votre avis..."></textarea></label><br>
        <button type="submit"><i class="fas fa-paper-plane"></i> Envoyer</button>
      </form>
    `;

    const form = document.getElementById(`comments-form-${benchId}`);
    form.addEventListener("submit", async (evt) => {
      evt.preventDefault();
      if (!validateCommentInput(form)) return;

      const res = await fetch(`${API_URL}/benches/${benchId}/comments`, {
        method: "POST",
        body: new FormData(form),
      });

      if (res.ok) {
        fetchPaginatedComments(benchId);
        form.reset();
      } else {
        alert("Erreur à l'ajout du commentaire");
      }
    });
  }, 50);
});

function renderPopupContent(bench) {
  return `
    <b style="font-size:16px;">${bench.description || "Pas de description"}</b><br>
    ${bench.note !== null && bench.note !== undefined ? `
      <div style="margin: 0.3em 0;">
        <strong>Note :</strong> ${'★'.repeat(Math.round(bench.note))}${'☆'.repeat(5 - Math.round(bench.note))}
        <span style="color:#888;">(${bench.note.toFixed(1)})</span>
      </div>
    ` : ""}
    ${bench.image ? `<img src="${API_URL}/static/${bench.image}" style="max-width:100%; border-radius:8px; margin:0.5em 0; box-shadow:0 2px 6px rgba(0,0,0,0.2);"><br>` : ""}
    <div style="font-size:13px; color:#555; margin-bottom:0.5em;">
      📍 <strong>Coordonnées :</strong> ${bench.latitude.toFixed(5)}, ${bench.longitude.toFixed(5)}<br>
      <a href="https://www.google.com/maps?q=${bench.latitude},${bench.longitude}" target="_blank" style="color:#3498db; text-decoration:none;">
        🌐 Voir sur Google Maps
      </a>
    </div>
    <div id="comments-${bench.id}" 
        style="font-size:13px; max-height:120px; overflow-y:auto; padding:0.5em; margin-bottom:0.5em; border:1px solid #ddd; border-radius:6px;">
      <em>Chargement des commentaires...</em>
    </div>
    <hr>
    <div id="comments-form-container-${bench.id}"></div>
  `;
}

async function fetchPaginatedComments(benchId, skip = 0, limit = 5) {
  const res = await fetch(`${API_URL}/benches/${benchId}/comments?skip=${skip}&limit=${limit}`);
  const comments = await res.json();
  const container = document.getElementById(`comments-${benchId}`);
  if (!container) return;

  if (!Array.isArray(comments)) {
    container.innerHTML = "<em>Erreur : commentaires invalides</em>";
    return;
  }

  if (comments.length === 0 && skip === 0) {
    container.innerHTML = "<em>Aucun commentaire pour l'instant</em>";
    return;
  }

  const fragment = document.createDocumentFragment();
  comments.forEach((c, i) => {
    const date = new Date(c.created_at).toLocaleString("fr-FR", {
      timeZone: "Europe/Paris",
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
    const div = document.createElement("div");
    div.style.background = i % 2 === 0 ? "#f9f9f9" : "#ffffff";
    div.style.padding = "0.4em 0.6em";
    div.style.borderRadius = "4px";
    div.style.marginBottom = "0.3em";
    div.innerHTML = `<strong>${c.author}</strong> : ${c.content}<br>
      <small style="color:#888;">🕒 ${date}</small>`;
    fragment.appendChild(div);
  });
  container.appendChild(fragment);

  if (comments.length === limit) {
    const loadMore = document.createElement("button");
    loadMore.textContent = "Charger plus";
    loadMore.style.cssText = "background:#3498db;color:#fff;border:none;padding:4px 8px;margin-top:5px;border-radius:4px;cursor:pointer;";
    loadMore.onclick = (event) => {
      event.stopPropagation();  // empêche Leaflet de fermer la popup
      loadMore.remove();
      fetchPaginatedComments(benchId, skip + limit, limit);
    };
    container.appendChild(loadMore);
  }
}
