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
  navigator.clipboard.writeText(link).then(() => {
    alert("Store link copied to clipboard! Share it with your friends to earn free gifts! 🎁");
  }).catch(() => {
    alert("Store link: " + link);
  });
}

// Navigation
function switchTab(tabId, evt) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
  
  document.getElementById(tabId).classList.add('active');
  if (evt) evt.target.classList.add('active');
  updateDashboards();
}

// Render Products with Search & Categories
function renderProducts() {
  const grid = document.getElementById('product-grid');
  const searchVal = document.getElementById('search-input').value.toLowerCase();

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
  if (evt) evt.target.classList.add('active');
  renderProducts();
}

// Render Addons
function renderAddons() {
  const grid = document.getElementById('addons-grid');
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
  const flavour = document.getElementById(`flavour-${id}`).value;
  const note = document.getElementById(`note-${id}`).value;
  const cartKey = `${id}-${flavour}-${note}`;

  if (cart[cartKey]) {
    cart[cartKey].qty += 1;
  } else {
    const prod = products.find(p => p.id === id);
    cart[cartKey] = { ...prod, qty: 1, flavour, note, key: cartKey };
  }
  renderCart();
}

function addAddonToCart(id) {
  const addon = addons.find(a => a.id === id);
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

  const keys = Object.keys(cart);
  if (keys.length === 0) {
    cartContainer.innerHTML = '<p class="empty-msg">Your cart is currently empty.</p>';
    cartTotal.style.display = 'none';
    checkoutBtn.style.display = 'none';
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
  totalAmount.innerText = grandTotal.toLocaleString();
  cartTotal.style.display = 'block';
  checkoutBtn.style.display = 'block';
  updateDashboards();
}

function sendToWhatsApp() {
  const phone = "2349135059528";
  const date = document.getElementById('delivery-date').value;
  
  let msg = "Hello 👋 Elma we want to Order a Cake or your pastries:\n\n";
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
  list.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="review-header">
        <span>${r.name}</span>
        <span class="stars">${'⭐️'.repeat(r.rating)}</span>
      </div>
      <p>${r.comment}</p>
    </div>
  `).join('');
}

function submitReview(e) {
  e.preventDefault();
  const name = document.getElementById('rev-name').value;
  const rating = parseInt(document.getElementById('rev-rating').value);
  const comment = document.getElementById('rev-comment').value;

  reviews.unshift({ name, rating, comment });
  renderReviews();
  document.getElementById('review-form').reset();
  updateDashboards();
}

function updateDashboards() {
  const totalCartCount = Object.values(cart).reduce((sum, i) => sum + i.qty, 0);
  document.getElementById('cust-cart-count').innerText = totalCartCount;
  document.getElementById('cust-review-count').innerText = reviews.length;

  document.getElementById('adm-prod-count').innerText = products.length;
  document.getElementById('adm-img-count').innerText = gallery.length;
  document.getElementById('adm-rev-count').innerText = reviews.length;
}

function adminLogin(e) {
  e.preventDefault();
  const pass = document.getElementById('admin-pass').value;
  if (pass === 'elma') {
    isAdmin = true;
    document.getElementById('admin-login-sec').style.display = 'none';
    document.getElementById('admin-panel-sec').style.display = 'block';
    renderGallery();
    updateDashboards();
  } else {
    alert('Incorrect Password');
  }
}

function addNewProduct(e) {
  e.preventDefault();
  const name = document.getElementById('new-prod-name').value;
  const price = parseInt(document.getElementById('new-prod-price').value);
  const category = document.getElementById('new-prod-cat').value;
  const img = document.getElementById('new-prod-img').value || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80";

  products.push({ id: Date.now(), name, price, category, img });
  renderProducts();
  updateDashboards();
  e.target.reset();
  alert('Product added successfully!');
}

function addNewImage(e) {
  e.preventDefault();
  const title = document.getElementById('new-img-title').value;
  const url = document.getElementById('new-img-url').value;
  gallery.push({ id: Date.now(), title, url });
  renderGallery();
  updateDashboards();
  e.target.reset();
  alert('Picture added to Gallery!');
}

// Initial Load
renderProducts();
renderAddons();
renderGallery();
renderReviews();
