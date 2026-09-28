// DATA INITIALIZATION
let products = JSON.parse(localStorage.getItem('elma_products')) || [
  { id: 1, name: "Chocolate Fudge Cake", category: "Cakes", price: 15000, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300", description: "Rich chocolate cake", outOfStock: false },
  { id: 2, name: "Vanilla Cupcake Box", category: "Pastries", price: 8000, image: "https://images.unsplash.com/photo-1519869325930-281384150729?w=300", description: "Box of 6 cupcakes", outOfStock: false }
];


let defaultReviews = [
  { name: "Osasere K.", rating: 5, comment: "The Chocolate Fudge Cake was extremely moist and fresh! Arrived right on time in GRA.", referral: "Referred by Osasere" },
  { name: "Adesuwa O.", rating: 5, comment: "Ordered a birthday cake for my sister. Super delicious and neat packaging!", referral: "Referred by Divine" },
  { name: "Eseosa B.", rating: 5, comment: "Best cupcakes in Benin City! Soft, fluffy, and rich in taste.", referral: "Referred by Mercy" },
  { name: "Precious A.", rating: 5, comment: "Fast delivery to UNIBEN Ugbowo campus! Everyone loved the Red Velvet cake.", referral: "Direct Customer" },
  { name: "Blessing N.", rating: 5, comment: "The custom design came out exactly like the sample picture I gave them! 10/10 service.", referral: "Referred by Anita" },
  { name: "Tariq M.", rating: 4, comment: "Prompt WhatsApp response and the cake was delivered fresh without any mess.", referral: "Direct Customer" }
];

localStorage.removeItem('elma_reviews'); 

let reviewsList = JSON.parse(localStorage.getItem('elma_reviews')) || defaultReviews;


// FASTER AUTO-SCROLL CAROUSEL (1.5 Seconds Interval)
let autoScrollInterval;
function startAutoScroll() {
  const container = document.querySelector(".reviews-slider-container");
  if (!container) return;
  clearInterval(autoScrollInterval);
  autoScrollInterval = setInterval(() => {
    if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
      container.scrollLeft = 0; // Seamless reset to start
    } else {
      container.scrollBy({ left: 240, behavior: 'smooth' }); // Faster shift
    }
  }, 1500); // 1.5 seconds per slide for a fast, active scroll
}



let reviewsList = JSON.parse(localStorage.getItem('elma_reviews')) || defaultReviews;
let cart = JSON.parse(localStorage.getItem('elma_cart')) || [];
let ordersList = JSON.parse(localStorage.getItem('elma_orders')) || [
  { id: "ORD-101", phone: "09135059528", items: "Chocolate Fudge Cake", total: 15000, status: "Delivered 🎉" }
];

let discountApplied = 0;

function saveProducts() { localStorage.setItem('elma_products', JSON.stringify(products)); }
function saveOrders() { localStorage.setItem('elma_orders', JSON.stringify(ordersList)); }

// TAB SWITCHER
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

  const targetTab = document.getElementById(tabId);
  if (targetTab) targetTab.classList.add('active');

  const clickedBtn = Array.from(document.querySelectorAll('.nav-btn')).find(btn => 
    btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${tabId}'`)
  );
  if (clickedBtn) clickedBtn.classList.add('active');

  if (tabId === 'admin') renderAdminDashboard();
  if (tabId === 'store') renderProducts();
  if (tabId === 'reviews') { renderReviews(); startAutoScroll(); } else { clearInterval(autoScrollInterval); }
  if (tabId === 'custom-builder') calculateCustomPrice();
  if (tabId === 'customer-dashboard') updateCustomerDashboard();
}

// PROMO CODE SYSTEM
function applyPromoCode() {
  const code = document.getElementById("promo-input").value.trim().toUpperCase();
  const msg = document.getElementById("promo-message");
  
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
  if (!flavorSelect || !sizeSelect) return;

  const basePrice = parseFloat(flavorSelect.options[flavorSelect.selectedIndex].getAttribute("data-price"));
  const multiplier = parseFloat(sizeSelect.options[sizeSelect.selectedIndex].getAttribute("data-mult"));

  const finalPrice = Math.round(basePrice * multiplier);
  document.getElementById("custom-calculated-price").innerText = finalPrice.toLocaleString();
}

function addCustomCakeToCart(e) {
  e.preventDefault();
  const flavor = document.getElementById("build-flavor").value;
  const size = document.getElementById("build-size").value;
  const message = document.getElementById("build-message").value.trim();
  const note = document.getElementById("build-design-note").value.trim();
  
  const priceText = document.getElementById("custom-calculated-price").innerText.replace(/,/g, '');
  const price = parseFloat(priceText);

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

  products.filter(p => p.name.toLowerCase().includes(searchVal)).forEach(p => {
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
    total = total - (total * discountApplied);
    message += `\n*Discount Applied:* 10% OFF`;
  }

  message += `\n*Total:* ₦${total.toLocaleString()}`;
  message += `\n*Delivery Date:* ${date}`;

  // Log order to storage
  ordersList.unshift({
    id: orderId,
    phone: userPhone || "Not Provided",
    items: itemNames.join(", "),
    total: total,
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
  const query = document.getElementById("track-input").value.trim().toLowerCase();
  const res = document.getElementById("tracking-result");
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
  e.preventDefault();
  const name = document.getElementById("rev-name").value.trim();
  const rating = parseInt(document.getElementById("rev-rating").value);
  const comment = document.getElementById("rev-comment").value.trim();
  const ref = document.getElementById("rev-referred").value.trim();

  reviewsList.unshift({ name, rating, comment, referral: ref ? `Referred by ${ref}` : "Direct Customer" });
  localStorage.setItem('elma_reviews', JSON.stringify(reviewsList));
  document.getElementById("review-form").reset();
  renderReviews();
  alert("Thank you! Review published. 🎉");
}

let autoScrollInterval;
function startAutoScroll() {
  const container = document.querySelector(".reviews-slider-container");
  if (!container) return;
  clearInterval(autoScrollInterval);
  autoScrollInterval = setInterval(() => {
    if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 5) {
      container.scrollLeft = 0;
    } else {
      container.scrollBy({ left: 220, behavior: 'smooth' });
    }
  }, 3500);
}

// ADMIN PANEL LOGIC
const ADMIN_PIN = "1234";

function unlockAdmin(e) {
  e.preventDefault();
  if (document.getElementById("admin-pin-input").value === ADMIN_PIN) {
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
  // Update Analytics
  let totalRev = ordersList.reduce((acc, curr) => acc + curr.total, 0);
  document.getElementById("stat-total-revenue").innerText = `₦${totalRev.toLocaleString()}`;
  document.getElementById("stat-product-count").innerText = products.length;
  document.getElementById("stat-reviews-count").innerText = reviewsList.length;

  // Render Orders & Tracking Management
  const orderTable = document.getElementById("admin-orders-table");
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

  // Render Inventory
  const tbody = document.getElementById("admin-inventory-table");
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
  e.preventDefault();
  const name = document.getElementById("prod-name").value.trim();
  const category = document.getElementById("prod-category").value;
  const price = parseFloat(document.getElementById("prod-price").value);
  const image = document.getElementById("prod-image").value.trim();
  const desc = document.getElementById("prod-desc").value.trim();

  products.push({ id: Date.now(), name, category, price, image, description: desc, outOfStock: false });
  saveProducts();
  document.getElementById("add-product-form").reset();
  renderAdminDashboard();
  renderProducts();
  alert(`"${name}" published! 🎉`);
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

function filterCategory(cat, e) {
  if (e) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
  }
  renderProducts();
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

document.addEventListener("DOMContentLoaded", () => {
  switchTab("store");
  renderProducts();
  updateCartUI();
});
