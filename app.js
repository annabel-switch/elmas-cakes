// DATA INITIALIZATION & STATE
let products = JSON.parse(localStorage.getItem('elma_products')) || [
  { id: 6, name: "Signature Whipped Cake", category: "Cakes", price: 20000, image: "https://i.postimg.cc/FRcMbPQn/IMG-5042.jpg", description: "Light and fluffy whip cream cake", outOfStock: false },
  { id: 7, name: "Fondant Cake", category: "Cakes", price: 35000, image: "https://i.postimg.cc/7ZFX1qYH/IMG-6097.jpg", description: "Selection of freshly baked sweet treats", outOfStock: false },
  { id: 8, name: "Deluxe Tiered Cake", category: "Cakes", price: 65000, image: "https://i.postimg.cc/vTK5Qv47/IMG-8135.jpg", description: "Multi-layer luxury celebration cake", outOfStock: false },
  { id: 9, name: "Buttercream Floral Cake", category: "Cakes", price: 19000, image: "https://i.postimg.cc/GhsyFGBy/IMG-0921.jpg", description: "Hand-piped custom floral buttercream design", outOfStock: false },
  { id: 10, name: "White Butter Cream", category: "Cakes", price: 15000, image: "https://i.postimg.cc/gcxD7wXx/IMG-1336.jpg", description: "Set of decorated specialty cupcakes", outOfStock: false },
  { id: 11, name: "Specialty Custom Cake", category: "Cakes", price: 22000, image: "https://i.postimg.cc/QtLdf3gD/IMG-1545.jpg", description: "Freshly crafted custom cake design", outOfStock: false }
];

let cart = JSON.parse(localStorage.getItem('elma_cart')) || [];
let ordersList = JSON.parse(localStorage.getItem('elma_orders')) || [];

let defaultReviews = [
  { name: "Osasere K.", rating: 5, comment: "The Chocolate Fudge Cake was extremely moist and fresh! Arrived right on time in GRA.", referral: "Referred by Osasere" },
  { name: "Adesuwa O.", rating: 5, comment: "Ordered a birthday cake for my sister. Super delicious and neat packaging!", referral: "Referred by Divine" },
  { name: "Eseosa B.", rating: 5, comment: "Best cupcakes in Benin City! Soft, fluffy, and rich in taste.", referral: "Referred by Mercy" },
  { name: "Precious A.", rating: 5, comment: "Fast delivery to UNIBEN Ugbowo campus! Everyone loved the Red Velvet cake.", referral: "Direct Customer" },
  { name: "Blessing N.", rating: 5, comment: "The custom design came out exactly like the sample picture I gave them! 10/10 service.", referral: "Referred by Anita" },
  { name: "Tariq M.", rating: 4, comment: "Prompt WhatsApp response and the cake was delivered fresh without any mess.", referral: "Direct Customer" }
];

// FORCE UPDATE LOCAL STORAGE WITH REVIEWS
localStorage.setItem('elma_reviews', JSON.stringify(defaultReviews));
let reviewsList = defaultReviews;

let discountApplied = 0;
let currentCategoryFilter = 'All';
let currentDeliveryFee = 0;

function saveProducts() { localStorage.setItem('elma_products', JSON.stringify(products)); }
function saveOrders() { localStorage.setItem('elma_orders', JSON.stringify(ordersList)); }

// LOCATION DATA
const locationData = {
  "Edo": {
    "Benin City": [
      { area: "UNIBEN Ugbowo Campus / BDPA", fee: 1000 },
      { area: "Ekosodin", fee: 1200 },
      { area: "GRA / Airport Road", fee: 1500 },
      { area: "Uselu / Oluku", fee: 1200 },
      { area: "Sapele Road / Limit", fee: 1800 },
      { area: "Aduwawa / Ikpoba Hill", fee: 2000 }
    ]
  },
  "Delta": {
    "Asaba": [
      { area: "GRA / Okpanam Road", fee: 2500 },
      { area: "Summit / DBS Road", fee: 2500 }
    ],
    "Warri": [
      { area: "Effurun / PTI", fee: 3000 },
      { area: "Enerhen / Airport Road", fee: 3000 }
    ]
  },
  "Lagos": {
    "Lagos Mainland": [
      { area: "Ikeja / Yaba / Surulere", fee: 3500 },
      { area: "Unilag Campus / Akoka", fee: 3500 }
    ],
    "Lagos Island": [
      { area: "Lekki Phase 1 / Ikoyi", fee: 4500 },
      { area: "Ajah / Sangotedo", fee: 5000 }
    ]
  }
};

// AUTO-SCROLL CAROUSEL
let autoScrollInterval;
function startAutoScroll() {
  const container = document.querySelector(".reviews-slider-container");
  if (!container) return;
  clearInterval(autoScrollInterval);
  autoScrollInterval = setInterval(() => {
    if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
      container.scrollLeft = 0;
    } else {
      container.scrollBy({ left: 240, behavior: 'smooth' });
    }
  }, 1500);
}

// PROMO CODE SYSTEM
function applyPromoCode() {
  const codeInput = document.getElementById("promo-input");
  const msg = document.getElementById("promo-message");
  if (!codeInput || !msg) return;

  const code = codeInput.value.trim().toUpperCase();
  
  if (code === "ELMA10" || code === "UNIBENFREE") {
    discountApplied = 0.10; // 10% OFF
    msg.style.color = "#27ae60";
    msg.innerText = "🎉 Promo Applied! 10% discount added to your cart.";
  } else {
    discountApplied = 0;
    msg.style.color = "#e74c3c";
    msg.innerText = "❌ Invalid Promo Code.";
  }
  updateCartUI();
}

// CUSTOM CAKE BUILDER
function calculateCustomPrice() {
  const flavorSelect = document.getElementById("build-flavor");
  const sizeSelect = document.getElementById("build-size");
  const priceDisplay = document.getElementById("custom-calculated-price");
  if (!flavorSelect || !sizeSelect || !priceDisplay) return;

  const basePrice = parseFloat(flavorSelect.options[flavorSelect.selectedIndex].getAttribute("data-price") || 0);
  const multiplier = parseFloat(sizeSelect.options[sizeSelect.selectedIndex].getAttribute("data-mult") || 1);

  const finalPrice = Math.round(basePrice * multiplier);
  priceDisplay.innerText = finalPrice.toLocaleString();
}

function addCustomCakeToCart(e) {
  if (e) e.preventDefault();
  const flavor = document.getElementById("build-flavor").value;
  const size = document.getElementById("build-size").value;
  const message = document.getElementById("build-message").value.trim();
  const note = document.getElementById("build-design-note").value.trim();
  
  const priceText = document.getElementById("custom-calculated-price").innerText.replace(/,/g, '');
  const price = parseFloat(priceText) || 0;

  const customItem = {
    id: Date.now(),
    name: `Custom ${size} (${flavor})`,
    price: price,
    description: `Msg: "${message}" | Note: ${note || 'None'}`
  };

  cart.push(customItem);
  localStorage.setItem('elma_cart', JSON.stringify(cart));
  alert("Custom Cake successfully created and added to cart! 🎂");
  switchTab("store");
  updateCartUI();
}

// STORE & CART
function renderProducts() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;
  grid.innerHTML = "";
  const searchVal = document.getElementById("search-input") ? document.getElementById("search-input").value.toLowerCase() : "";

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchVal);
    const matchesCategory = (currentCategoryFilter === 'All' || p.category === currentCategoryFilter);
    return matchesSearch && matchesCategory;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #777;">No products found.</p>`;
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" onclick="openImageModal('${p.image}')" style="width:100%; height:150px; object-fit:cover; border-radius:8px; cursor:pointer;" title="Tap to preview image">
      <h3 style="margin:8px 0 4px 0;">${p.name}</h3>
      <p style="color:var(--primary); font-weight:bold; margin-bottom:8px;">₦${p.price.toLocaleString()}</p>
      <div style="display:flex; gap:8px; align-items:center;">
        <button class="btn" ${p.outOfStock ? 'disabled style="background:#ccc;"' : ''} onclick="addToCart(${p.id})" style="flex:1;">
          ${p.outOfStock ? 'Out of Stock' : 'Add to Cart 🛒'}
        </button>
        <button class="btn" onclick="openImageModal('${p.image}')" style="background:transparent; border:1px solid var(--primary); color:var(--primary); padding:6px 10px; font-size:0.85rem;">
          Preview 👁️
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// MODAL CONTROLS
function openImageModal(imgSrc) {
  const modal = document.getElementById("image-modal");
  const modalImg = document.getElementById("modal-img");
  if (modal && modalImg) {
    modalImg.src = imgSrc;
    modal.style.display = "flex";
  }
}

function closeImageModal() {
  const modal = document.getElementById("image-modal");
  if (modal) {
    modal.style.display = "none";
  }
}

function filterCategory(cat, e) {
  currentCategoryFilter = cat;
  if (e) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (e.target) e.target.classList.add('active');
  }
  renderProducts();
}

function addToCart(id) {
  const prod = products.find(p => p.id === id);
  if (prod) {
    cart.push(prod);
    localStorage.setItem('elma_cart', JSON.stringify(cart));
    updateCartUI();
    alert(`${prod.name} added to cart!`);
  }
}

function updateCartUI() {
  const cartContainer = document.getElementById("cart-items");
  const totalAmount = document.getElementById("total-amount");
  const cartTotal = document.getElementById("cart-total");
  const checkoutBtn = document.getElementById("checkout-btn");
  if (!cartContainer) return;

  if (cart.length === 0) {
    cartContainer.innerHTML = `<p class="empty-msg">Your cart is currently empty.</p>`;
    if (cartTotal) cartTotal.style.display = "none";
    if (checkoutBtn) checkoutBtn.style.display = "none";
    return;
  }

  let total = 0;
  cartContainer.innerHTML = "";
  cart.forEach((item, index) => {
    total += item.price;
    const div = document.createElement("div");
    div.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;";
    div.innerHTML = `<span>${item.name} - ₦${item.price.toLocaleString()}</span> <button onclick="removeFromCart(${index})" class="remove-btn" style="padding:2px 6px;">✕</button>`;
    cartContainer.appendChild(div);
  });

  if (discountApplied > 0) {
    total = total - (total * discountApplied);
  }

  let grandTotal = total + currentDeliveryFee;

  if (totalAmount) totalAmount.innerText = grandTotal.toLocaleString();
  if (cartTotal) cartTotal.style.display = "block";
  if (checkoutBtn) checkoutBtn.style.display = "block";
}

function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem('elma_cart', JSON.stringify(cart));
  updateCartUI();
}

function sendToWhatsApp() {
  if (cart.length === 0) return;
  const date = document.getElementById("delivery-date") ? document.getElementById("delivery-date").value : "Not specified";
  const state = document.getElementById("select-state") ? document.getElementById("select-state").value : "";
  const city = document.getElementById("select-city") ? document.getElementById("select-city").value : "";
  const area = document.getElementById("select-area") ? document.getElementById("select-area").value : "";

  if (!state || !city || !area) {
    alert("Please select your State, City, and Area before checking out!");
    return;
  }

  const userPhone = prompt("Enter your phone number so you can track your order status:");
  
  const orderId = `ORD-${Math.floor(100 + Math.random() * 900)}`;
  let message = `Hello Elma's Cakes! 🎂\n*Order ID:* ${orderId}\n\n`;
  let total = 0;
  let itemNames = [];

  cart.forEach((item, i) => {
    message += `${i + 1}. ${item.name} (${item.description || ''}) - ₦${item.price.toLocaleString()}\n`;
    itemNames.push(item.name);
    total += item.price;
  });

  if (discountApplied > 0) {
    const discountVal = total * discountApplied;
    total = total - discountVal;
    message += `\n*Discount Applied:* 10% OFF (-₦${discountVal.toLocaleString()})`;
  }

  const grandTotal = total + currentDeliveryFee;

  message += `\n\n📍 *Delivery Location:* ${area}, ${city}, ${state}`;
  message += `\n🚚 *Delivery Fee:* ₦${currentDeliveryFee.toLocaleString()}`;
  message += `\n💰 *Grand Total:* ₦${grandTotal.toLocaleString()}`;
  message += `\n📅 *Delivery Date:* ${date}`;

  ordersList.unshift({
    id: orderId,
    phone: userPhone || "Not Provided",
    items: itemNames.join(", "),
    total: grandTotal,
    status: "Order Received 📝"
  });
  saveOrders();

  cart = [];
  localStorage.setItem('elma_cart', JSON.stringify(cart));
  updateCartUI();

  window.open(`https://wa.me/2349135059528?text=${encodeURIComponent(message)}`, '_blank');
}

// LIVE TRACKING FEATURE
function trackOrder() {
  const queryInput = document.getElementById("track-input");
  const res = document.getElementById("tracking-result");
  if (!queryInput || !res) return;

  const query = queryInput.value.trim().toLowerCase();
  if (!query) return;

  const found = ordersList.filter(o => o.id.toLowerCase().includes(query) || o.phone.includes(query));

  if (found.length === 0) {
    res.style.display = "block";
    res.innerHTML = `<p style="color:#e74c3c;">No order found matching "${query}". Please check your Order ID or phone number.</p>`;
    return;
  }

  res.style.display = "block";
  res.innerHTML = "<h4>Your Order Status:</h4>";
  found.forEach(o => {
    res.innerHTML += `
      <div style="background:#f1f1f1; padding:12px; border-radius:8px; margin-bottom:8px;">
        <p><strong>Order ID:</strong> ${o.id}</p>
        <p><strong>Items:</strong> ${o.items}</p>
        <p><strong>Status:</strong> <span class="status-badge status-baking">${o.status}</span></p>
      </div>
    `;
  });
}

// REVIEWS & SLIDER
function renderReviews() {
  const track = document.getElementById("reviews-track");
  if (!track) return;
  track.innerHTML = "";

  reviewsList.forEach(rev => {
    const card = document.createElement("div");
    card.className = "review-card";
    card.innerHTML = `
      <div class="review-header"><span class="review-author">${rev.name}</span><span class="review-stars">${"⭐".repeat(rev.rating)}</span></div>
      <p class="review-body">"${rev.comment}"</p>
      ${rev.referral ? `<span class="review-referral">🎁 ${rev.referral}</span>` : ''}
    `;
    track.appendChild(card);
  });
}

function submitReview(e) {
  if (e) e.preventDefault();
  const name = document.getElementById("rev-name").value.trim();
  const rating = parseInt(document.getElementById("rev-rating").value);
  const comment = document.getElementById("rev-comment").value.trim();
  const ref = document.getElementById("rev-referred").value.trim();

  reviewsList.unshift({ name, rating, comment, referral: ref ? `Referred by ${ref}` : "Direct Customer" });
  localStorage.setItem('elma_reviews', JSON.stringify(reviewsList));
  
  const form = document.getElementById("review-form");
  if (form) form.reset();

  renderReviews();
  alert("Thank you! Review published. 🎉");
}

// ADMIN PANEL LOGIC
const ADMIN_PIN = "1234";

function unlockAdmin(e) {
  if (e) e.preventDefault();
  const pinInput = document.getElementById("admin-pin-input");
  if (pinInput && pinInput.value === ADMIN_PIN) {
    document.getElementById("admin-login-screen").style.display = "none";
    document.getElementById("admin-dashboard").style.display = "block";
    renderAdminDashboard();
  } else {
    document.getElementById("admin-login-error").style.display = "block";
  }
}

function lockAdmin() {
  document.getElementById("admin-login-screen").style.display = "block";
  document.getElementById("admin-dashboard").style.display = "none";
}

function renderAdminDashboard() {
  let totalRev = ordersList.reduce((acc, curr) => acc + curr.total, 0);
  
  const revStat = document.getElementById("stat-total-revenue");
  const prodStat = document.getElementById("stat-product-count");
  const revCountStat = document.getElementById("stat-reviews-count");

  if (revStat) revStat.innerText = `₦${totalRev.toLocaleString()}`;
  if (prodStat) prodStat.innerText = products.length;
  if (revCountStat) revCountStat.innerText = reviewsList.length;

  // POPULATE QUICK PRICE LIST EDITOR
  const priceBody = document.getElementById("price-editor-body");
  if (priceBody) {
    priceBody.innerHTML = "";
    products.forEach((p, index) => {
      const tr = document.createElement("tr");
      tr.style.borderBottom = "1px solid var(--border, #eee)";
      tr.innerHTML = `
        <td style="padding:10px; font-weight:bold;">${p.name}</td>
        <td style="padding:10px;">
          <input type="number" id="quick-price-${index}" value="${p.price}" style="width:110px; padding:6px; border:1px solid #ccc; border-radius:4px;">
        </td>
        <td style="padding:10px; text-align:right;">
          <button onclick="updateQuickPrice(${index})" class="btn" style="padding:4px 10px; font-size:0.8rem; width:auto;">Save 💾</button>
        </td>
      `;
      priceBody.appendChild(tr);
    });
  }

  const orderTable = document.getElementById("admin-orders-table");
  if (orderTable) {
    orderTable.innerHTML = "";
    ordersList.forEach((o, index) => {
      const row = document.createElement("tr");
      row.style.borderBottom = "1px solid var(--border)";
      row.innerHTML = `
        <td style="padding:8px;"><strong>${o.id}</strong></td>
        <td style="padding:8px;">${o.phone}</td>
        <td style="padding:8px;">${o.items}</td>
        <td style="padding:8px; font-weight:bold;">₦${o.total.toLocaleString()}</td>
        <td style="padding:8px;">
          <select onchange="updateOrderStatus(${index}, this.value)" style="padding:4px; border-radius:4px;">
            <option value="Order Received 📝" ${o.status === 'Order Received 📝' ? 'selected' : ''}>Order Received 📝</option>
            <option value="Baking in Progress 🥣" ${o.status === 'Baking in Progress 🥣' ? 'selected' : ''}>Baking in Progress 🥣</option>
            <option value="Out for Delivery 🚚" ${o.status === 'Out for Delivery 🚚' ? 'selected' : ''}>Out for Delivery 🚚</option>
            <option value="Delivered 🎉" ${o.status === 'Delivered 🎉' ? 'selected' : ''}>Delivered 🎉</option>
          </select>
        </td>
        <td style="padding:8px; text-align:right;"><button onclick="deleteOrder(${index})" class="remove-btn">Delete</button></td>
      `;
      orderTable.appendChild(row);
    });
  }

  const tbody = document.getElementById("admin-inventory-table");
  if (tbody) {
    tbody.innerHTML = "";
    products.forEach((item, index) => {
      const isOut = item.outOfStock;
      const row = document.createElement("tr");
      row.style.borderBottom = "1px solid var(--border)";
      row.innerHTML = `
        <td style="padding: 10px; font-weight: bold; display: flex; align-items: center; gap: 8px;">
          <img src="${item.image}" style="width:35px; height:35px; object-fit:cover; border-radius:4px;"> ${item.name}
        </td>
        <td style="padding: 10px;">${item.category}</td>
        <td style="padding: 10px; font-weight: bold; color: var(--primary);">₦${item.price.toLocaleString()}</td>
        <td style="padding: 10px;"><span style="padding: 3px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; background: ${isOut ? '#ff7675' : '#55efc4'}; color: ${isOut ? 'white' : '#2d3436'};">${isOut ? 'Out of Stock' : 'In Stock'}</span></td>
        <td style="padding: 10px; text-align: right;">
          <button onclick="toggleStock(${index})" class="qty-btn" style="width:auto; padding: 4px 8px; font-size: 0.75rem; margin-right: 4px;">${isOut ? 'Mark In Stock' : 'Mark Out'}</button>
          <button onclick="deleteProduct(${index})" class="remove-btn" style="padding: 4px 8px;">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }
}

function updateQuickPrice(index) {
  const input = document.getElementById(`quick-price-${index}`);
  if (!input) return;
  const newPrice = parseFloat(input.value);
  if (isNaN(newPrice) || newPrice < 0) {
    alert("Please enter a valid price!");
    return;
  }
  products[index].price = newPrice;
  saveProducts();
  renderAdminDashboard();
  renderProducts();
  alert(`Price for "${products[index].name}" updated to ₦${newPrice.toLocaleString()}! 💰`);
}

function updateOrderStatus(index, newStatus) {
  ordersList[index].status = newStatus;
  saveOrders();
  renderAdminDashboard();
}

function deleteOrder(index) {
  if (confirm("Delete this order record?")) {
    ordersList.splice(index, 1);
    saveOrders();
    renderAdminDashboard();
  }
}

function addNewProduct(e) {
  if (e) e.preventDefault();
  
  const name = document.getElementById("prod-name").value.trim();
  const category = document.getElementById("prod-category").value;
  const price = parseFloat(document.getElementById("prod-price").value);
  const desc = document.getElementById("prod-desc").value.trim();
  const fileInput = document.getElementById("prod-file");

  if (!fileInput || !fileInput.files[0]) {
    alert("Please select a photo for the product!");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function(event) {
    const base64Image = event.target.result;

    products.push({
      id: Date.now(),
      name: name,
      category: category,
      price: price,
      image: base64Image,
      description: desc,
      outOfStock: false
    });

    saveProducts();

    const form = document.getElementById("add-product-form");
    if (form) form.reset();

    renderAdminDashboard();
    renderProducts();
    alert(`"${name}" published successfully! 🎉`);
  };

  reader.readAsDataURL(file);
}

function toggleStock(index) {
  products[index].outOfStock = !products[index].outOfStock;
  saveProducts();
  renderAdminDashboard();
  renderProducts();
}

function deleteProduct(index) {
  if (confirm(`Delete "${products[index].name}"?`)) {
    products.splice(index, 1);
    saveProducts();
    renderAdminDashboard();
    renderProducts();
  }
}

function copyReferralLink() {
  navigator.clipboard.writeText(window.location.href);
  alert("Store link copied to clipboard! Share with friends to earn free cupcakes. 🎁");
}

function updateCustomerDashboard() {
  const custCart = document.getElementById("cust-cart-count");
  const custRev = document.getElementById("cust-review-count");
  if (custCart) custCart.innerText = cart.length;
  if (custRev) custRev.innerText = reviewsList.length;
}

function updateDeliveryDisplay() {
  const feeDisplay = document.getElementById("delivery-fee-display");
  if (feeDisplay) feeDisplay.innerText = `₦${currentDeliveryFee.toLocaleString()}`;
  updateCartUI();
}

// SECRET ADMIN UNLOCK SYSTEM
window.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('admin') === 'true' || localStorage.getItem('elma_admin_unlocked') === 'true') {
    const adminBtn = document.getElementById("admin-nav-btn");
    if (adminBtn) adminBtn.style.display = "inline-block";
  }
});

let secretCode = "";
document.addEventListener("keydown", (e) => {
  secretCode += e.key.toLowerCase();
  if (secretCode.endsWith("admin")) {
    const adminBtn = document.getElementById("admin-nav-btn");
    if (adminBtn) {
      adminBtn.style.display = "inline-block";
      localStorage.setItem('elma_admin_unlocked', 'true');
      alert("🔓 Admin Panel Unlocked!");
    }
    secretCode = "";
  }
  if (secretCode.length > 10) secretCode = secretCode.substring(1);
});

// INITIAL PRICE MATRIX DATA
let priceMatrix = JSON.parse(localStorage.getItem('elma_price_matrix')) || [
  { id: 1, category: "Single Layer", size: "4 inches", price: 10000 },
  { id: 2, category: "Single Layer", size: "6 inches", price: 15000 },
  { id: 3, category: "Single Layer", size: "8 inches", price: 20000 },
  { id: 4, category: "Double Layer", size: "6 inches", price: 25000 },
  { id: 5, category: "Double Layer", size: "8 inches", price: 30000 },
  { id: 6, category: "3 Layers", size: "8 inches", price: 55000 }
];

function savePriceMatrix() {
  localStorage.setItem('elma_price_matrix', JSON.stringify(priceMatrix));
}

// RENDER PRICE LIST FOR CUSTOMERS
function renderCustomerPriceList() {
  const container = document.getElementById("price-list-container");
  if (!container) return;
  container.innerHTML = "";

  const grouped = {};
  priceMatrix.forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  Object.keys(grouped).forEach(cat => {
    const card = document.createElement("div");
    card.style.cssText = "background: #fff; border: 2px solid #ffccd5; border-radius: 12px; overflow: hidden;";
    
    let rowsHtml = grouped[cat].map(row => `
      <tr style="border-bottom: 1px solid #ffe6ea;">
        <td style="padding: 8px 12px; font-weight: 500;">${row.size}</td>
        <td style="padding: 8px 12px; text-align: right; font-weight: bold; color: #d63031;">₦${row.price.toLocaleString()}</td>
      </tr>
    `).join('');

    card.innerHTML = `
      <div style="background: #d63031; color: white; padding: 10px; text-align: center; font-weight: bold;">
        ♥ ${cat.toUpperCase()} ♥
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        ${rowsHtml}
      </table>
    `;
    container.appendChild(card);
  });
}

// PRICE MATRIX ADMIN FUNCTIONS
function addPriceListEntry(e) {
  if (e) e.preventDefault();
  const cat = document.getElementById("price-category").value.trim();
  const size = document.getElementById("price-size").value.trim();
  const price = parseFloat(document.getElementById("price-amount").value);

  priceMatrix.push({ id: Date.now(), category: cat, size: size, price: price });
  savePriceMatrix();

  document.getElementById("add-price-entry-form").reset();
  renderAdminPriceList();
  renderCustomerPriceList();
  alert("Price entry added successfully!");
}

function deletePriceEntry(id) {
  priceMatrix = priceMatrix.filter(p => p.id !== id);
  savePriceMatrix();
  renderAdminPriceList();
  renderCustomerPriceList();
}

function renderAdminPriceList() {
  const tbody = document.getElementById("admin-price-list-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  priceMatrix.forEach(p => {
    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid #eee";
    tr.innerHTML = `
      <td style="padding: 8px;">${p.category}</td>
      <td style="padding: 8px;">${p.size}</td>
      <td style="padding: 8px; font-weight: bold;">₦${p.price.toLocaleString()}</td>
      <td style="padding: 8px; text-align: right;">
        <button onclick="deletePriceEntry(${p.id})" class="remove-btn">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// UNIVERSAL TAB SWITCHER
window.switchTab = function(tabId) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.style.display = 'none';
  });

  // Show targeted tab
  const targetTab = document.getElementById(tabId);
  if (targetTab) {
    targetTab.style.display = 'block';
  }

  // Highlight active button
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  if (window.event && window.event.currentTarget) {
    window.event.currentTarget.classList.add('active');
  }

  // Trigger tab specific functions
  if (tabId === 'admin') renderAdminDashboard();
  if (tabId === 'store') renderProducts();
  if (tabId === 'reviews') { renderReviews(); startAutoScroll(); } else { clearInterval(autoScrollInterval); }
  if (tabId === 'custom-builder') calculateCustomPrice();
  if (tabId === 'customer-dashboard' || tabId === 'account') updateCustomerDashboard();
  if (tabId === 'price-list') { renderCustomerPriceList(); renderAdminPriceList(); }
};

// INITIAL DOM SETUP
document.addEventListener("DOMContentLoaded", () => {
  switchTab("store");
  renderProducts();
  updateCartUI();
  renderCustomerPriceList();
  renderAdminPriceList();

  const stateSelect = document.getElementById("select-state");
  const citySelect = document.getElementById("select-city");
  const areaSelect = document.getElementById("select-area");

  if (stateSelect) {
    stateSelect.addEventListener("change", function() {
      let selectedState = this.value;
      citySelect.innerHTML = '<option value="">-- Choose City --</option>';
      areaSelect.innerHTML = '<option value="">-- Choose Area --</option>';
      areaSelect.disabled = true;
      currentDeliveryFee = 0;
      updateDeliveryDisplay();

      if (selectedState && locationData[selectedState]) {
        citySelect.disabled = false;
        Object.keys(locationData[selectedState]).forEach(city => {
          const opt = document.createElement("option");
          opt.value = city;
          opt.textContent = city;
          citySelect.appendChild(opt);
        });
      } else {
        citySelect.disabled = true;
      }
    });
  }

  if (citySelect) {
    citySelect.addEventListener("change", function() {
      let selectedState = stateSelect.value;
      let selectedCity = this.value;

      areaSelect.innerHTML = '<option value="">-- Choose Area --</option>';
      currentDeliveryFee = 0;
      updateDeliveryDisplay();

      if (selectedState && selectedCity && locationData[selectedState][selectedCity]) {
        areaSelect.disabled = false;
        locationData[selectedState][selectedCity].forEach(item => {
          const opt = document.createElement("option");
          opt.value = item.area;
          opt.setAttribute("data-fee", item.fee);
          opt.textContent = `${item.area} (+₦${item.fee.toLocaleString()})`;
          areaSelect.appendChild(opt);
        });
      } else {
        areaSelect.disabled = true;
      }
    });
  }

  if (areaSelect) {
    areaSelect.addEventListener("change", function() {
      const selectedOption = this.options[this.selectedIndex];
      if (selectedOption && selectedOption.getAttribute("data-fee")) {
        currentDeliveryFee = parseFloat(selectedOption.getAttribute("data-fee"));
      } else {
        currentDeliveryFee = 0;
      }
      updateDeliveryDisplay();
    });
  }
});

