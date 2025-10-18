// script.js - Main page functionality

let allProducts = [];

// Load products from backend
async function loadProducts() {
  try {
    const res = await fetch("/products");
    allProducts = await res.json();
    allProducts.sort((a, b) => a.name.localeCompare(b.name));
    renderProducts(allProducts);
    updateCartCount();
  } catch (err) {
    console.error("Failed to load products:", err);
    document.getElementById("productGrid").innerHTML = `
      <div class="col-12 text-center text-danger py-5">
        <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
        <p>Failed to load products. Please check if server is running.</p>
      </div>
    `;
  }
}

// Render products
function renderProducts(products) {
  const grid = document.getElementById("productGrid");
  grid.innerHTML = "";

  if (!products.length) {
    grid.innerHTML = `<div class="col-12 text-center text-muted">No products found.</div>`;
    return;
  }

  products.forEach((p, index) => {
    const col = document.createElement("div");
    col.className = "col-md-3 col-sm-6 mb-4";
    col.innerHTML = `
      <div class="card shadow-sm h-100 product-card">
        <img src="${p.img || 'https://via.placeholder.com/200x150?text=Product'}" 
             class="card-img-top product-image" 
             alt="${p.name}"
             onerror="this.src='https://via.placeholder.com/200x150?text=No+Image'">
        <div class="card-body d-flex flex-column">
          <h6 class="card-title">${p.name}</h6>
          <small class="text-muted mb-2">${p.brand || 'Featured'}</small>
          <p class="card-text text-success mb-2">₹${p.price}</p>
          <button class="btn btn-primary mt-auto add-to-cart-btn" data-index="${index}">
            Add to Cart
          </button>
        </div>
      </div>`;
    grid.appendChild(col);
  });

  // Attach Add to Cart handlers
  document.querySelectorAll(".add-to-cart-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = btn.dataset.index;
      addToCart(allProducts[idx]);
    });
  });
}

// Add to cart
function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let existing = cart.find(item => item.name === product.name);
  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  alert(`${product.name} added to cart!`);
}

// Update cart count
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  document.getElementById("cartCount").textContent = count;
}

// Search functionality
document.getElementById("searchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const q = document.getElementById("searchInput").value.trim().toLowerCase();
  if (!q) return renderProducts(allProducts);
  const matched = allProducts.filter(p => 
    p.name.toLowerCase().includes(q) || 
    (p.brand && p.brand.toLowerCase().includes(q))
  );
  renderProducts(matched);
});

// Search suggestions
document.getElementById("searchInput").addEventListener("input", (e) => {
  const q = e.target.value.trim().toLowerCase();
  const box = document.getElementById("searchSuggestions");
  if (!q) {
    box.classList.add("d-none");
    return;
  }
  const matches = allProducts.filter(p => p.name.toLowerCase().includes(q)).slice(0, 6);
  if (!matches.length) return box.classList.add("d-none");
  box.classList.remove("d-none");
  box.innerHTML = matches
    .map(m => `<div class="p-2 border-bottom" onclick="selectSuggestion('${m.name}')">${m.name} - ₹${m.price}</div>`)
    .join("");
});

function selectSuggestion(name) {
  document.getElementById("searchInput").value = name;
  document.getElementById("searchSuggestions").classList.add("d-none");
  document.getElementById("searchForm").dispatchEvent(new Event("submit"));
}

// Alphabet filter
function renderAlphabetFilter() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
  const container = document.getElementById("alphabetFilterDropdown");
  if (!container) return;
  container.innerHTML = '';
  
  let allBtn = document.createElement("li");
  allBtn.innerHTML = `<a class="dropdown-item" href="#">All</a>`;
  allBtn.querySelector("a").onclick = () => renderProducts(allProducts);
  container.appendChild(allBtn);

  alphabet.forEach(letter => {
    let li = document.createElement("li");
    li.innerHTML = `<a class="dropdown-item" href="#">${letter}</a>`;
    li.querySelector("a").onclick = () => {
      const filtered = allProducts.filter(p => p.name.toUpperCase().startsWith(letter));
      renderProducts(filtered);
    };
    container.appendChild(li);
  });
}

// Brand filtering
document.querySelectorAll('.brand-filter').forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Update active state
    document.querySelectorAll('.brand-filter').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    
    const brand = this.dataset.brand;
    
    if (brand === 'All') {
      renderProducts(allProducts);
    } else {
      const filtered = allProducts.filter(p => (p.brand || 'Index') === brand);
      renderProducts(filtered);
    }
  });
});

// Prescription upload
document.getElementById("prescriptionForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  
  try {
    const res = await fetch("/upload-prescription", { method: "POST", body: formData });
    const data = await res.json();
    const status = document.getElementById("prescriptionStatus");
    status.textContent = data.message || "Upload done.";
    status.classList.toggle("text-success", res.ok);
    status.classList.toggle("text-danger", !res.ok);
    if (res.ok) form.reset();
  } catch (err) {
    console.error("Error uploading prescription:", err);
    document.getElementById("prescriptionStatus").textContent = "Error uploading prescription.";
  }
});

// Initialize
window.onload = () => {
  loadProducts();
  updateCartCount();
  renderAlphabetFilter();
};