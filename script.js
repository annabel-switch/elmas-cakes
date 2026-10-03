// Initial Data
let products = [
  { id: 1, name: "6-inch Simple Cake", price: 12000, category: "Cakes", img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80" },
  { id: 2, name: "8-inch Custom Cake", price: 20000, category: "Cakes", img: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=400&q=80" },
  { id: 3, name: "10-inch Celebration Cake", price: 32000, category: "Cakes", img: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=400&q=80" },
  { id: 4, name: "Box of 6 Cupcakes", price: 8000, category: "Pastries", img: "https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=400&q=80" },
  { id: 5, name: "Fudgy Brownie Box", price: 10000, category: "Pastries", img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80" }
];

let addons = [
  { id: 101, name: "Birthday Candles 🕯️", price: 500 },
  { id: 102, name: "Custom Cake Topper ✨", price: 1500 },
  { id: 103, name: "Greeting Card 💌", price: 1000 }
];

let gallery = [
  { id: 1, title: "Custom Birthday Cake", url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80" },
  { id: 2, title: "Chocolate Cupcakes", url: "https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=400&q=80" }
];

let reviews = [
  { name: "Blessing", rating: 5, comment: "The cake was super moist and delicious! Highly recommend." }
];

let cart = {};
let selectedCategory = "All";
let isAdmin = false;

// Share Referral Function
function copyReferralLink() {
  const link = window.location.href;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(link).then(() => {
      alert("Store link copied to clipboard! Share it with your friends to earn free gifts! 🎁");
    }).catch(() => {
      alert("Store link: " + link);
    });
  } else {
    alert("Store link: " + link);
  }
}

// Navigation Tab Switcher
function switchTab(tabId, evt) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
  
  const targetTab = document.getElementById(tabId);
  if (targetTab) {
    targetTab.classList.add('active');
  }
  
  if (evt && evt.currentTarget) {
    evt.currentTarget.classList.add('active');
  }
  
  updateDashboards();
}

// Render Products with Search & Categories
function renderProducts() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;
  
  const searchInput = document.getElementById('search-input');
  const searchVal = searchInput ? searchInput.value.toLowerCase() : "";

  const filtered = products.filter(p => {
    const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchVal);
    return matchesCat && matchesSearch;
  });

  grid.innerHTML = filtered.map(p => `
    <div class="card">
      <div>
        <img src="${p.img}" alt="${p.name}">
        <h3>${p.name}</h3>
        <div class="price">₦${p.price.toLocaleString()}</div>

        <div class="custom-box">
          <label>Flavour:</label>
          <select id="flavour-${p.id}">
            <option value="Vanilla">Vanilla</option>
            <option value="Chocolate">Chocolate</option>
            <option value="Red Velvet">Red Velvet</option>
            <option value="Marble">Marble</option>
          </select>
          <label>Inscription on Cake:</label>
          <input type="text" id="note-${p.id}" placeholder="e.g. Happy Birthday Divine!">
        </div>
      </div>
      <button class="btn" onclick="addToCart(${p.id})">Add to Cart 🛒</button>
    </div>
  `).join('');
}

function filterCategory(cat, evt) {
  selectedCategory = cat;
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  if (evt && evt.currentTarget) {
    evt.currentTarget.classList.add('active');
  }
  renderProducts();
}

// Render Addons
function renderAddons() {
  const grid = document.getElementById('addons-grid');
  if (!grid) return;
  grid.innerHTML = addons.map(a => `
    <div class="addon-card">
      <div>
        <strong>${a.name}</strong><br>
        <small>₦${a.price.toLocaleString()}</small>
      </div>
      <button class="qty-btn" onclick="addAddonToCart(${a.id})">+</button>
    </div>
  `).join('');
}

function addToCart(id) {
  const flavourEl = document.getElementById(`flavour-${id}`);
  const noteEl = document.getElementById(`note-${id}`);
  
  const flavour = flavourEl ? flavourEl.value : "";
  const note = noteEl ? noteEl.value : "";
  const cartKey = `${id}-${flavour}-${note}`;

  if (cart[cartKey]) {
    cart[cartKey].qty += 1;
  } else {
    const prod = products.find(p => p.id === id);
    if (prod) {
      cart[cartKey] = { ...prod, qty: 1, flavour, note, key: cartKey };
    }
  }
  renderCart();
}

function addAddonToCart(id) {
  const addon = addons.find(a => a.id === id);
  if (!addon) return;
  
  const cartKey = `addon-${id}`;

  if (cart[cartKey]) {
    cart[cartKey].qty += 1;
  } else {
    cart[cartKey] = { name: addon.name, price: addon.price, qty: 1, flavour: "", note: "", key: cartKey };
  }
  renderCart();
}

function changeQty(key, delta) {
  if (cart[key]) {
    cart[key].qty += delta;
    if (cart[key].qty <= 0) delete cart[key];
  }
  renderCart();
}

function removeFromCart(key) {
  delete cart[key];
  renderCart();
}

function renderCart() {
  const cartContainer = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');
  const totalAmount = document.getElementById('total-amount');

  if (!cartContainer) return;

  const keys = Object.keys(cart);
  if (keys.length === 0) {
    cartContainer.innerHTML = '<p class="empty-msg">Your cart is currently empty.</p>';
    if (cartTotal) cartTotal.style.display = 'none';
    if (checkoutBtn) checkoutBtn.style.display = 'none';
    updateDashboards();
    return;
  }

  let grandTotal = 0;
  let html = '';
  keys.forEach(k => {
    const item = cart[k];
    const subtotal = item.price * item.qty;
    grandTotal += subtotal;
    html += `
      <div class="cart-item">
        <div>
          <strong>${item.name}</strong><br>
          ${item.flavour ? `<small>Flavour: ${item.flavour}</small><br>` : ''}
          ${item.note ? `<small>Inscription: "${item.note}"</small><br>` : ''}
          <small>₦${item.price.toLocaleString()} each</small>
        </div>
        <div class="cart-controls">
          <button class="qty-btn" onclick="changeQty('${item.key}', -1)">-</button>
          <span>${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.key}', 1)">+</button>
          <button class="remove-btn" onclick="removeFromCart('${item.key}')">Remove</button>
        </div>
      </div>
    `;
  });

  cartContainer.innerHTML = html;
  if (totalAmount) totalAmount.innerText = grandTotal.toLocaleString();
  if (cartTotal) cartTotal.style.display = 'block';
  if (checkoutBtn) checkoutBtn.style.display = 'block';
  updateDashboards();
}

function sendToWhatsApp() {
  const phone = "2349135059528";
  const dateEl = document.getElementById('delivery-date');
  const date = dateEl ? dateEl.value : "";
  
  let msg = "Hello 👋 Elma, I would like to order:\n\n";
  if (date) msg += `📅 *Preferred Date:* ${date}\n\n`;

  let total = 0;
  Object.values(cart).forEach(item => {
    const subtotal = item.price * item.qty;
    total += subtotal;
    msg += `• *${item.name}* x${item.qty} - ₦${subtotal.toLocaleString()}\n`;
    if (item.flavour) msg += `   - Flavour: ${item.flavour}\n`;
    if (item.note) msg += `   - Inscription: "${item.note}"\n`;
  });

  msg += `\n*Total Amount: ₦${total.toLocaleString()}*`;
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
}

// Gallery & Reviews
function renderGallery() {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;
  grid.innerHTML = gallery.map(img => `
    <div class="gallery-item">
      <img src="${img.url}" alt="${img.title}">
      <p>${img.title}</p>
      ${isAdmin ? `<button class="remove-btn" onclick="removeImage(${img.id})" style="margin-top: 5px;">Delete Photo</button>` : ''}
    </div>
  `).join('');
}

function removeImage(id) {
  gallery = gallery.filter(img => img.id !== id);
  renderGallery();
  updateDashboards();
}

function renderReviews() {
  const list = document.getElementById('reviews-list');
  if (!list) return;
  list.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="review-header">
        <span class="review-author">${r.name}</span>
        <span class="stars">${'⭐️'.repeat(r.rating)}</span>
      </div>
      <p>${r.comment}</p>
    </div>
  `).join('');
}

function submitReview(e) {
  if (e) e.preventDefault();
  const nameEl = document.getElementById('rev-name');
  const ratingEl = document.getElementById('rev-rating');
  const commentEl = document.getElementById('rev-comment');

  if (!nameEl || !commentEl) return;

  const name = nameEl.value;
  const rating = parseInt(ratingEl ? ratingEl.value : 5);
  const comment = commentEl.value;

  reviews.unshift({ name, rating, comment });
  renderReviews();
  const form = document.getElementById('review-form');
  if (form) form.reset();
  updateDashboards();
}

function updateDashboards() {
  const totalCartCount = Object.values(cart).reduce((sum, i) => sum + i.qty, 0);
  const custCartCount = document.getElementById('cust-cart-count');
  const custRevCount = document.getElementById('cust-review-count');
  const admProdCount = document.getElementById('adm-prod-count');
  const admImgCount = document.getElementById('adm-img-count');
  const admRevCount = document.getElementById('adm-rev-count');

  if (custCartCount) custCartCount.innerText = totalCartCount;
  if (custRevCount) custRevCount.innerText = reviews.length;
  if (admProdCount) admProdCount.innerText = products.length;
  if (admImgCount) admImgCount.innerText = gallery.length;
  if (admRevCount) admRevCount.innerText = reviews.length;
}

function adminLogin(e) {
  if (e) e.preventDefault();
  const passEl = document.getElementById('admin-pass');
  const pass = passEl ? passEl.value : "";
  
  if (pass === 'elma') {
    isAdmin = true;
    const loginSec = document.getElementById('admin-login-sec');
    const panelSec = document.getElementById('admin-panel-sec');
    if (loginSec) loginSec.style.display = 'none';
    if (panelSec) panelSec.style.display = 'block';
    renderGallery();
    updateDashboards();
  } else {
    alert('Incorrect Password');
  }
}

function addNewProduct(e) {
  if (e) e.preventDefault();
  const nameEl = document.getElementById('new-prod-name');
  const priceEl = document.getElementById('new-prod-price');
  const catEl = document.getElementById('new-prod-cat');
  const imgEl = document.getElementById('new-prod-img');

  if (!nameEl || !priceEl) return;

  const name = nameEl.value;
  const price = parseInt(priceEl.value);
  const category = catEl ? catEl.value : "Cakes";
  const img = (imgEl && imgEl.value) ? imgEl.value : "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80";

  products.push({ id: Date.now(), name, price, category, img });
  renderProducts();
  updateDashboards();
  if (e && e.target) e.target.reset();
  alert('Product added successfully!');
}

function addNewImage(e) {
  if (e) e.preventDefault();
  const titleEl = document.getElementById('new-img-title');
  const urlEl = document.getElementById('new-img-url');

  if (!titleEl || !urlEl) return;

  const title = titleEl.value;
  const url = urlEl.value;
  
  gallery.push({ id: Date.now(), title, url });
  renderGallery();
  updateDashboards();
  if (e && e.target) e.target.reset();
  alert('Picture added to Gallery!');
}

// Initial Load Handler
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  renderAddons();
  renderGallery();
  renderReviews();
  renderCart();

  // Attach Form Event Listeners if elements exist
  const reviewForm = document.getElementById('review-form');
  if (reviewForm) reviewForm.addEventListener('submit', submitReview);

  const adminLoginForm = document.getElementById('admin-login-form');
  if (adminLoginForm) adminLoginForm.addEventListener('submit', adminLogin);

  const addProdForm = document.getElementById('add-product-form');
  if (addProdForm) addProdForm.addEventListener('submit', addNewProduct);

  const addImgForm = document.getElementById('add-image-form');
  if (addImgForm) addImgForm.addEventListener('submit', addNewImage);
  
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.addEventListener('input', renderProducts);
});

