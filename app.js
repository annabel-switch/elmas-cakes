// DATA INITIALIZATION (Prevents undefined crashes)
let products = JSON.parse(localStorage.getItem('elma_products')) || [
  { id: 1, name: "Chocolate Fudge Cake", category: "Cakes", price: 15000, image: "https://via.placeholder.com/150", description: "Rich chocolate cake", outOfStock: false },
  { id: 2, name: "Vanilla Cupcake Box", category: "Pastries", price: 8000, image: "https://via.placeholder.com/150", description: "Box of 6 cupcakes", outOfStock: false }
];

let galleryImages = JSON.parse(localStorage.getItem('elma_gallery')) || [];
let reviewsList = JSON.parse(localStorage.getItem('elma_reviews')) || [];
let cart = JSON.parse(localStorage.getItem('elma_cart')) || [];

function saveProducts() {
  localStorage.setItem('elma_products', JSON.stringify(products));
}

// BULLETPROOF TAB SWITCHER
function switchTab(tabId) {
  // 1. Hide all tab content sections completely
  const tabs = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => {
    tab.classList.remove('active');
    tab.style.setProperty('display', 'none', 'important');
  });

  // 2. Remove active state from all nav buttons
  const buttons = document.querySelectorAll('.nav-btn');
  buttons.forEach(btn => btn.classList.remove('active'));

  // 3. Show target tab specifically
  const targetTab = document.getElementById(tabId);
  if (targetTab) {
    targetTab.classList.add('active');
    targetTab.style.setProperty('display', 'block', 'important');
  }

  // 4. Highlight clicked button
  const clickedBtn = Array.from(buttons).find(btn => 
    btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${tabId}'`)
  );
  if (clickedBtn) {
    clickedBtn.classList.add('active');
  }

  // 5. Run render function for target tab
  if (tabId === 'admin') {
    renderAdminDashboard();
  } else if (tabId === 'store') {
    renderProducts();
  }
}

// STORE FRONTEND FUNCTIONS
function renderProducts() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;
  grid.innerHTML = "";

  const searchVal = document.getElementById("search-input") ? document.getElementById("search-input").value.toLowerCase() : "";

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchVal));

  if (filtered.length === 0) {
    grid.innerHTML = "<p>No products found.</p>";
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" style="width:100%; height:150px; object-fit:cover; border-radius:8px;">
      <h3 style="margin:8px 0 4px 0;">${p.name}</h3>
      <p style="color:var(--primary); font-weight:bold; margin-bottom:8px;">₦${p.price.toLocaleString()}</p>
      <button class="btn" ${p.outOfStock ? 'disabled style="background:#ccc;"' : ''} onclick="addToCart(${p.id})">
        ${p.outOfStock ? 'Out of Stock' : 'Add to Cart 🛒'}
      </button>
    `;
    grid.appendChild(card);
  });
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
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const totalAmount = document.getElementById("total-amount");
  const checkoutBtn = document.getElementById("checkout-btn");

  if (!cartItemsContainer) return;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `<p class="empty-msg">Your cart is currently empty.</p>`;
    if (cartTotal) cartTotal.style.display = "none";
    if (checkoutBtn) checkoutBtn.style.display = "none";
    return;
  }

  let total = 0;
  cartItemsContainer.innerHTML = "";
  cart.forEach((item, index) => {
    total += item.price;
    const div = document.createElement("div");
    div.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;";
    div.innerHTML = `
      <span>${item.name} - ₦${item.price.toLocaleString()}</span>
      <button onclick="removeFromCart(${index})" class="remove-btn" style="padding:2px 6px;">✕</button>
    `;
    cartItemsContainer.appendChild(div);
  });

  if (totalAmount) totalAmount.innerText = total.toLocaleString();
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
  let message = `Hello Elma's Cakes! 🎂\nI would like to place an order:\n\n`;
  let total = 0;
  
  cart.forEach((item, i) => {
    message += `${i + 1}. ${item.name} - ₦${item.price.toLocaleString()}\n`;
    total += item.price;
  });

  message += `\n*Total:* ₦${total.toLocaleString()}`;
  message += `\n*Delivery Date:* ${date}`;

  const encodedMsg = encodeURIComponent(message);
  window.open(`https://wa.me/2349135059528?text=${encodedMsg}`, '_blank');
}

// ADMIN PANEL STATE & LOGIC
const ADMIN_PIN = "1234";

function unlockAdmin(e) {
  e.preventDefault();
  const inputPin = document.getElementById("admin-pin-input").value;
  const errorMsg = document.getElementById("admin-login-error");

  if (inputPin === ADMIN_PIN) {
    document.getElementById("admin-login-screen").style.display = "none";
    document.getElementById("admin-dashboard").style.display = "block";
    errorMsg.style.display = "none";
    renderAdminDashboard();
  } else {
    errorMsg.style.display = "block";
  }
}

function lockAdmin() {
  if (document.getElementById("admin-pin-input")) document.getElementById("admin-pin-input").value = "";
  document.getElementById("admin-login-screen").style.display = "block";
  document.getElementById("admin-dashboard").style.display = "none";
}

function renderAdminDashboard() {
  const statProd = document.getElementById("stat-product-count");
  const statGal = document.getElementById("stat-gallery-count");
  const statRev = document.getElementById("stat-reviews-count");

  if (statProd) statProd.innerText = products.length;
  if (statGal) statGal.innerText = galleryImages ? galleryImages.length : 0;
  if (statRev) statRev.innerText = reviewsList ? reviewsList.length : 0;

  const tbody = document.getElementById("admin-inventory-table");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 15px; color:#aaa;">No products in database.</td></tr>`;
    return;
  }

  products.forEach((item, index) => {
    const isOut = item.outOfStock ? true : false;
    const row = document.createElement("tr");
    row.style.borderBottom = "1px solid var(--border)";
    row.innerHTML = `
      <td style="padding: 10px; font-weight: bold; display: flex; align-items: center; gap: 8px;">
        <img src="${item.image}" style="width:35px; height:35px; object-fit:cover; border-radius:4px;">
        ${item.name}
      </td>
      <td style="padding: 10px;">${item.category || 'Cakes'}</td>
      <td style="padding: 10px; font-weight: bold; color: var(--primary);">₦${item.price.toLocaleString()}</td>
      <td style="padding: 10px;">
        <span style="padding: 3px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; background: ${isOut ? '#ff7675' : '#55efc4'}; color: ${isOut ? 'white' : '#2d3436'};">
          ${isOut ? 'Out of Stock' : 'In Stock'}
        </span>
      </td>
      <td style="padding: 10px; text-align: right;">
        <button onclick="toggleStock(${index})" class="qty-btn" style="width:auto; padding: 4px 8px; font-size: 0.75rem; margin-right: 4px;">
          ${isOut ? 'Mark In Stock' : 'Mark Out'}
        </button>
        <button onclick="deleteProduct(${index})" class="remove-btn" style="padding: 4px 8px;">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function addNewProduct(e) {
  e.preventDefault();
  const name = document.getElementById("prod-name").value.trim();
  const category = document.getElementById("prod-category").value;
  const price = parseFloat(document.getElementById("prod-price").value);
  const image = document.getElementById("prod-image").value.trim();
  const desc = document.getElementById("prod-desc").value.trim();

  if (!name || !price || !image) return;

  const newProd = {
    id: Date.now(),
    name: name,
    category: category,
    price: price,
    image: image,
    description: desc,
    outOfStock: false
  };

  products.push(newProd);
  saveProducts();

  document.getElementById("add-product-form").reset();
  renderAdminDashboard();
  renderProducts();
  alert(`"${name}" has been successfully added to the menu! 🎉`);
}

function toggleStock(index) {
  products[index].outOfStock = !products[index].outOfStock;
  saveProducts();
  renderAdminDashboard();
  renderProducts();
}

function deleteProduct(index) {
  if (confirm(`Are you sure you want to delete "${products[index].name}"?`)) {
    products.splice(index, 1);
    saveProducts();
    renderAdminDashboard();
    renderProducts();
  }
}

function filterCategory(cat, e) {
  if (e) {
    const btns = document.querySelectorAll('.filter-btn');
    btns.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
  }
  renderProducts();
}

function copyReferralLink() {
  navigator.clipboard.writeText(window.location.href);
  alert("Store link copied to clipboard! Share it with friends to earn free cupcakes. 🎁");
}

// INITIALIZE STORE ON PAGE LOAD
document.addEventListener("DOMContentLoaded", () => {
  switchTab("store");
  renderProducts();
  updateCartUI();
});
