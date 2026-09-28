// ADMIN PANEL STATE & LOGIC
const ADMIN_PIN = "1234"; // Default security PIN (Change as desired)

// Unlock Admin Panel
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

// Lock Admin Panel
function lockAdmin() {
  document.getElementById("admin-pin-input").value = "";
  document.getElementById("admin-login-screen").style.display = "block";
  document.getElementById("admin-dashboard").style.display = "none";
}

// Render Dashboard Data & Inventory Table
function renderAdminDashboard() {
  // Update Quick Stats
  document.getElementById("stat-product-count").innerText = products.length;
  document.getElementById("stat-gallery-count").innerText = galleryImages ? galleryImages.length : 0;
  document.getElementById("stat-reviews-count").innerText = reviewsList ? reviewsList.length : 0;

  // Populate Inventory Table
  const tbody = document.getElementById("admin-inventory-table");
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

// Add New Product
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
  if (typeof saveProducts === "function") saveProducts();
  
  document.getElementById("add-product-form").reset();
  renderAdminDashboard();
  if (typeof renderProducts === "function") renderProducts();
  alert(`"${name}" has been successfully added to the menu! 🎉`);
}

// Toggle Stock Status
function toggleStock(index) {
  products[index].outOfStock = !products[index].outOfStock;
  if (typeof saveProducts === "function") saveProducts();
  renderAdminDashboard();
  if (typeof renderProducts === "function") renderProducts();
}

// Delete Product
function deleteProduct(index) {
  if (confirm(`Are you sure you want to delete "${products[index].name}"?`)) {
    products.splice(index, 1);
    if (typeof saveProducts === "function") saveProducts();
    renderAdminDashboard();
    if (typeof renderProducts === "function") renderProducts();
  }
}
