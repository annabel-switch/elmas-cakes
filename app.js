// DATA INITIALIZATION & STATE
let defaultProducts = [
  { id: 6, name: "Signature Whipped Cake", category: "Cakes", price: 20000, image: "https://i.postimg.cc/FRcMbPQn/IMG-5042.jpg", description: "Light and fluffy whip cream cake", outOfStock: false },
  { id: 7, name: "Fondant Cake", category: "Cakes", price: 35000, image: "https://i.postimg.cc/7ZFX1qYH/IMG-6097.jpg", description: "Selection of freshly baked sweet treats", outOfStock: false },
  { id: 8, name: "Deluxe Tiered Cake", category: "Cakes", price: 65000, image: "https://i.postimg.cc/vTK5Qv47/IMG-8135.jpg", description: "Multi-layer luxury celebration cake", outOfStock: false },
  { id: 9, name: "Buttercream Floral Cake", category: "Cakes", price: 19000, image: "https://i.postimg.cc/GhsyFGBy/IMG-0921.jpg", description: "Hand-piped custom floral buttercream design", outOfStock: false },
  { id: 10, name: "White Butter Cream", category: "Cakes", price: 15000, image: "https://i.postimg.cc/gcxD7wXx/IMG-1336.jpg", description: "Set of decorated specialty cupcakes", outOfStock: false },
  { id: 11, name: "Specialty Custom Cake", category: "Cakes", price: 22000, image: "https://i.postimg.cc/QtLdf3gD/IMG-1545.jpg", description: "Freshly crafted custom cake design", outOfStock: false }
];

let products = JSON.parse(localStorage.getItem('elma_products')) || defaultProducts;
let cart = JSON.parse(localStorage.getItem('elma_cart')) || [];
let ordersList = JSON.parse(localStorage.getItem('elma_orders')) || [];

let defaultReviews = [
  { name: "Osasere K.", rating: 5, comment: "The Chocolate Fudge Cake was extremely moist and fresh! Arrived right on time in GRA.", referral: "Referred by Osasere" },
  { name: "Adesuwa O.", rating: 5, comment: "Ordered a birthday cake for my sister. Super delicious and neat packaging!", referral: "Referred by Divine" },
  { name: "Eseosa B.", rating: 5, comment: "Best cupcakes in Benin City! Soft, fluffy, and rich in taste.", referral: "Referred by Mercy" }
];

let reviewsList = JSON.parse(localStorage.getItem('elma_reviews')) || defaultReviews;
let discountApplied = 0;
let currentCategoryFilter = 'All';
let currentDeliveryFee = 0;

const ADMIN_PIN = "1234";

function saveProducts() { 
  try {
    localStorage.setItem('elma_products', JSON.stringify(products)); 
  } catch (e) {
    alert("Storage limit reached! Please use an image URL link instead of uploading large files directly.");
  }
}

function saveOrders() { 
  localStorage.setItem('elma_orders', JSON.stringify(ordersList)); 
}

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
    "Asaba": [{ area: "GRA / Okpanam Road", fee: 2500 }],
    "Warri": [{ area: "Effurun / PTI", fee: 3000 }]
  },
  "Lagos": {
    "Lagos Mainland": [{ area: "Ikeja / Yaba / Surulere", fee: 3500 }],
    "Lagos Island": [{ area: "Lekki Phase 1 / Ikoyi", fee: 4500 }]
  }
};

// CATEGORIZED PRICE MATRIX
let priceMatrix = JSON.parse(localStorage.getItem('elma_price_matrix')) || [
  { id: 1, category: "Buttercream Cakes", size: '6" Single Tier', price: 15000 },
  { id: 2, category: "Buttercream Cakes", size: '8" Single Tier', price: 20000 },
  { id: 3, category: "Buttercream Cakes", size: '10" Single Tier', price: 28000 },
  { id: 4, category: "Fondant Cakes", size: '6" Single Tier', price: 25000 },
  { id: 5, category: "Fondant Cakes", size: '8" Single Tier', price: 35000 },
  { id: 6, category: "Fondant Cakes", size: '2-Tier Celebration', price: 65000 },
  { id: 7, category: "Whipped Cream Cakes", size: '6" Single Tier', price: 16000 },
  { id: 8, category: "Whipped Cream Cakes", size: '8" Single Tier', price: 22000 },
  { id: 9, category: "Whipped Cream Cakes", size: '10" Single Tier', price: 30000 }
];

// RENDER PRODUCTS
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
    const imgUrl = p.image || 'https://via.placeholder.com/150';
    
    card.innerHTML = `
      <img src="${imgUrl}" alt="${p.name}" onclick="openImageModal('${imgUrl}')" style="width:100%; height:160px; object-fit:cover; border-radius:8px; cursor:pointer;" onerror="this.src='https://via.placeholder.com/150'">
      <h3 style="margin:8px 0 4px 0; font-size:1rem;">${p.name}</h3>
      <p style="color:var(--primary, #d63031); font-weight:bold; margin-bottom:8px;">₦${Number(p.price).toLocaleString()}</p>
      <div style="display:flex; gap:8px;">
        <button class="btn" ${p.outOfStock ? 'disabled style="background:#ccc;"' : ''} onclick="addToCart(${p.id})" style="flex:1;">
          ${p.outOfStock ? 'Out of Stock' : 'Add to Cart 🛒'}
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// CART ACTIONS
window.addToCart = function(id) {
  const prod = products.find(p => p.id === id);
  if (prod) {
    cart.push({ id: prod.id, name: prod.name, price: Number(prod.price) });
    localStorage.setItem('elma_cart', JSON.stringify(cart));
    updateCartUI();
    alert(`🎉 ${prod.name} added to cart!`);
  }
};

window.removeFromCart = function(index) {
  cart.splice(index, 1);
  localStorage.setItem('elma_cart', JSON.stringify(cart));
  updateCartUI();
};

function updateCartUI() {
  const cartContainer = document.getElementById("cart-items");
  const totalAmount = document.getElementById("total-amount");
  const cartTotal = document.getElementById("cart-total");
  const checkoutBtn = document.getElementById("checkout-btn");
  const custCart = document.getElementById("cust-cart-count");

  if (custCart) custCart.innerText = cart.length;
  if (!cartContainer) return;

  if (cart.length === 0) {
    cartContainer.innerHTML = `<p class="empty-msg">Your cart is currently empty.</p>`;
    if (cartTotal) cartTotal.style.display = "none";
    if (checkoutBtn) checkoutBtn.style.display = "none";
    if (totalAmount) totalAmount.innerText = "0";
    return;
  }

  let subtotal = 0;
  cartContainer.innerHTML = "";
  
  cart.forEach((item, index) => {
    subtotal += Number(item.price);
    const div = document.createElement("div");
    div.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; background:#fff; padding:8px; border-radius:6px; border:1px solid #eee;";
    div.innerHTML = `
      <span><strong>${item.name}</strong> - ₦${Number(item.price).toLocaleString()}</span> 
      <button onclick="removeFromCart(${index})" style="background:#ff7675; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">✕</button>
    `;
    cartContainer.appendChild(div);
  });

  let totalAfterDiscount = subtotal;
  if (discountApplied > 0) {
    totalAfterDiscount = subtotal - (subtotal * discountApplied);
  }

  let grandTotal = totalAfterDiscount + currentDeliveryFee;

  if (totalAmount) totalAmount.innerText = Math.round(grandTotal).toLocaleString();
  if (cartTotal) cartTotal.style.display = "block";
  if (checkoutBtn) checkoutBtn.style.display = "block";
}

// ADMIN AUTHENTICATION
function unlockAdmin(e) {
  if (e) e.preventDefault();
  const pinInput = document.getElementById("admin-pin-input");
  const loginScreen = document.getElementById("admin-login-screen");
  const dashboard = document.getElementById("admin-dashboard");
  const errorMsg = document.getElementById("admin-login-error");

  if (pinInput && pinInput.value === ADMIN_PIN) {
    if (loginScreen) loginScreen.style.display = "none";
    if (dashboard) dashboard.style.display = "block";
    renderAdminDashboard();
  } else if (errorMsg) {
    errorMsg.style.display = "block";
  }
}

function lockAdmin() {
  const loginScreen = document.getElementById("admin-login-screen");
  const dashboard = document.getElementById("admin-dashboard");
  if (loginScreen) loginScreen.style.display = "block";
  if (dashboard) dashboard.style.display = "none";
}

function renderAdminDashboard() {
  let totalRev = ordersList.reduce((acc, curr) => acc + curr.total, 0);
  
  const revStat = document.getElementById("stat-total-revenue");
  const prodStat = document.getElementById("stat-product-count");
  const revCountStat = document.getElementById("stat-reviews-count");

  if (revStat) revStat.innerText = `₦${totalRev.toLocaleString()}`;
  if (prodStat) prodStat.innerText = products.length;
  if (revCountStat) revCountStat.innerText = reviewsList.length;

  const priceBody = document.getElementById("price-editor-body");
  if (priceBody) {
    priceBody.innerHTML = "";
    products.forEach((p, index) => {
      const tr = document.createElement("tr");
      tr.style.borderBottom = "1px solid #eee";
      tr.innerHTML = `
        <td style="padding:8px; font-weight:bold;">${p.name}</td>
        <td style="padding:8px;">
          <input type="number" id="quick-price-${index}" value="${p.price}" style="width:90px; padding:4px; border:1px solid #ccc; border-radius:4px;">
        </td>
        <td style="padding:8px; text-align:right;">
          <button onclick="updateQuickPrice(${index})" class="btn" style="padding:4px 8px; font-size:0.75rem; width:auto;">Save 💾</button>
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
      row.style.borderBottom = "1px solid #eee";
      row.innerHTML = `
        <td style="padding:6px;"><strong>${o.id}</strong></td>
        <td style="padding:6px;">${o.phone}</td>
        <td style="padding:6px;">${o.items}</td>
        <td style="padding:6px; font-weight:bold;">₦${o.total.toLocaleString()}</td>
        <td style="padding:6px;">${o.status}</td>
        <td style="padding:6px; text-align:right;"><button onclick="deleteOrder(${index})" style="background:#ff7675; color:white; border:none; padding:2px 6px; border-radius:4px;">Delete</button></td>
      `;
      orderTable.appendChild(row);
    });
  }
}

function updateQuickPrice(index) {
  const input = document.getElementById(`quick-price-${index}`);
  if (!input) return;
  const newPrice = parseFloat(input.value);
  if (isNaN(newPrice) || newPrice < 0) return;
  products[index].price = newPrice;
  saveProducts();
  renderAdminDashboard();
  renderProducts();
  alert(`Price updated! 💰`);
}

function deleteOrder(index) {
  if (confirm("Delete order?")) {
    ordersList.splice(index, 1);
    saveOrders();
    renderAdminDashboard();
  }
}

function renderCustomerPriceList() {
  const container = document.getElementById("price-list-container");
  if (!container) return;
  container.innerHTML = "";

  const categories = ["Buttercream Cakes", "Fondant Cakes", "Whipped Cream Cakes"];

  categories.forEach(cat => {
    const items = priceMatrix.filter(p => p.category === cat);
    if (items.length === 0) return;

    const card = document.createElement("div");
    card.style.cssText = "background: #fff; border: 2px solid #ffccd5; border-radius: 12px; overflow: hidden;";
    
    let rowsHtml = items.map(row => `
      <tr style="border-bottom: 1px solid #ffe6ea;">
        <td style="padding: 10px 14px; font-weight: 500;">${row.size}</td>
        <td style="padding: 10px 14px; text-align: right; font-weight: bold; color: #d63031;">₦${Number(row.price).toLocaleString()}</td>
      </tr>
    `).join('');

    card.innerHTML = `
      <div style="background: #d63031; color: white; padding: 12px; text-align: center; font-weight: bold;">
        🎂 ${cat.toUpperCase()} 🎂
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        ${rowsHtml}
      </table>
    `;
    container.appendChild(card);
  });
}

// TAB SWITCHER
window.switchTab = function(tabId, ev) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.style.display = 'none';
  });

  const targetTab = document.getElementById(tabId);
  if (targetTab) {
    targetTab.style.display = 'block';
  }

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  if (ev && ev.currentTarget) {
    ev.currentTarget.classList.add('active');
  }

  if (tabId === 'store') renderProducts();
  if (tabId === 'price-list') renderCustomerPriceList();
};

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
  if (modal) modal.style.display = "none";
}

function updateDeliveryDisplay() {
  const feeDisplay = document.getElementById("delivery-fee-display");
  if (feeDisplay) feeDisplay.innerText = `₦${currentDeliveryFee.toLocaleString()}`;
  updateCartUI();
}

// INITIAL DOM SETUP
document.addEventListener("DOMContentLoaded", () => {
  switchTab("store");
  renderProducts();
  updateCartUI();
  renderCustomerPriceList();

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
      let selectedState = stateSelect ? stateSelect.value : "";
      let selectedCity = this.value;

      areaSelect.innerHTML = '<option value="">-- Choose Area --</option>';
      currentDeliveryFee = 0;
      updateDeliveryDisplay();

      if (selectedState && selectedCity && locationData[selectedState] && locationData[selectedState][selectedCity]) {
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
