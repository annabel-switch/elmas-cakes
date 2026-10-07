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
  { name: "Eseosa B.", rating: 5, comment: "Best cupcakes in Benin City! Soft, fluffy, and rich in taste.", referral: "Referred by Mercy" },
  { name: "Precious A.", rating: 5, comment: "Fast delivery to UNIBEN Ugbowo campus! Everyone loved the Red Velvet cake.", referral: "Direct Customer" }
];

let reviewsList = JSON.parse(localStorage.getItem('elma_reviews')) || defaultReviews;
let discountApplied = 0;
let currentCategoryFilter = 'All';
let currentDeliveryFee = 0;

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

// CATEGORIZED PRICE MATRIX (Buttercream, Fondant, Whipped Cream)
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

function savePriceMatrix() {
  localStorage.setItem('elma_price_matrix', JSON.stringify(priceMatrix));
}

// RENDER PRODUCTS IN STORE
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

// ADD TO CART FUNCTION
window.addToCart = function(id) {
  const prod = products.find(p => p.id === id);
  if (prod) {
    cart.push({ id: prod.id, name: prod.name, price: Number(prod.price) });
    localStorage.setItem('elma_cart', JSON.stringify(cart));
    updateCartUI();
    alert(`🎉 ${prod.name} added to cart!`);
  }
};

// REMOVE FROM CART FUNCTION
window.removeFromCart = function(index) {
  cart.splice(index, 1);
  localStorage.setItem('elma_cart', JSON.stringify(cart));
  updateCartUI();
};

// UPDATE CART DISPLAY
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

// PROMO CODE SYSTEM
function applyPromoCode() {
  const codeInput = document.getElementById("promo-input");
  const msg = document.getElementById("promo-message");
  if (!codeInput || !msg) return;

  const code = codeInput.value.trim().toUpperCase();
  
  if (code === "ELMA10" || code === "UNIBENFREE") {
    discountApplied = 0.10;
    msg.style.color = "#27ae60";
    msg.innerText = "🎉 Promo Applied! 10% discount added to your cart.";
  } else {
    discountApplied = 0;
    msg.style.color = "#e74c3c";
    msg.innerText = "❌ Invalid Promo Code.";
  }
  updateCartUI();
}

// SEND ORDER TO WHATSAPP
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
  if (!userPhone) return;

  const orderId = `ORD-${Math.floor(100 + Math.random() * 900)}`;
  let message = `Hello Elma's Cakes! 🎂\n*Order ID:* ${orderId}\n\n`;
  let subtotal = 0;
  let itemNames = [];

  cart.forEach((item, i) => {
    message += `${i + 1}. ${item.name} - ₦${Number(item.price).toLocaleString()}\n`;
    itemNames.push(item.name);
    subtotal += Number(item.price);
  });

  let totalAfterDiscount = subtotal;
  if (discountApplied > 0) {
    const discountVal = subtotal * discountApplied;
    totalAfterDiscount = subtotal - discountVal;
    message += `\n*Discount Applied:* 10% OFF (-₦${discountVal.toLocaleString()})`;
  }

  const grandTotal = totalAfterDiscount + currentDeliveryFee;

  message += `\n\n📍 *Delivery Location:* ${area}, ${city}, ${state}`;
  message += `\n🚚 *Delivery Fee:* ₦${currentDeliveryFee.toLocaleString()}`;
  message += `\n💰 *Grand Total:* ₦${Math.round(grandTotal).toLocaleString()}`;
  message += `\n📅 *Delivery Date:* ${date}`;

  ordersList.unshift({
    id: orderId,
    phone: userPhone,
    items: itemNames.join(", "),
    total: Math.round(grandTotal),
    status: "Order Received 📝"
  });
  saveOrders();

  cart = [];
  localStorage.setItem('elma_cart', JSON.stringify(cart));
  updateCartUI();

  window.open(`https://wa.me/2349135059528?text=${encodeURIComponent(message)}`, '_blank');
}

// RENDER PRICE LIST (BUTTERCREAM, FONDANT, WHIPPED CREAM)
function renderCustomerPriceList() {
  const container = document.getElementById("price-list-container");
  if (!container) return;
  container.innerHTML = "";

  const categories = ["Buttercream Cakes", "Fondant Cakes", "Whipped Cream Cakes"];

  categories.forEach(cat => {
    const items = priceMatrix.filter(p => p.category === cat);
    if (items.length === 0) return;

    const card = document.createElement("div");
    card.style.cssText = "background: #fff; border: 2px solid #ffccd5; border-radius: 12px; overflow: hidden; margin-bottom:15px;";
    
    let rowsHtml = items.map(row => `
      <tr style="border-bottom: 1px solid #ffe6ea;">
        <td style="padding: 10px 14px; font-weight: 500;">${row.size}</td>
        <td style="padding: 10px 14px; text-align: right; font-weight: bold; color: #d63031;">₦${Number(row.price).toLocaleString()}</td>
      </tr>
    `).join('');

    card.innerHTML = `
      <div style="background: #d63031; color: white; padding: 12px; text-align: center; font-weight: bold; font-size:1.05rem;">
        🎂 ${cat.toUpperCase()} 🎂
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        ${rowsHtml}
      </table>
    `;
    container.appendChild(card);
  });
}

// TAB SWITCHER FUNCTION
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
  if (modal) modal.style.display = "none";
}

function updateDeliveryDisplay() {
  const feeDisplay = document.getElementById("delivery-fee-display");
  if (feeDisplay) feeDisplay.innerText = `₦${currentDeliveryFee.toLocaleString()}`;
  updateCartUI();
}

// INITIALIZE STORE & LOCATION LISTENERS
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

