// owner.js - Owner dashboard functionality

// Load products for display in owner panel
async function loadProducts() {
  try {
    const res = await fetch("/products");
    const products = await res.json();

    const list = document.getElementById("productList");
    list.innerHTML = "";

    if (!products.length) {
      list.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No products added yet</td></tr>`;
      return;
    }

    products.forEach((p, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td><img src="${p.img || "https://via.placeholder.com/80"}" width="60" height="60" class="rounded"></td>
        <td>${p.name}</td>
        <td>₹${p.price}</td>
        <td><span class="badge bg-primary">${p.brand || "Index"}</span></td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="deleteProduct('${p.id}')">
            <i class="fas fa-trash"></i> Delete
          </button>
        </td>
      `;
      list.appendChild(row);
    });
  } catch (err) {
    console.error("Error loading products:", err);
  }
}

// Load customer orders
async function loadOrders() {
  try {
    const res = await fetch("/orders");
    const orders = await res.json();

    const list = document.getElementById("orderList");
    list.innerHTML = "";

    if (!orders.length) {
      list.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No orders placed yet</td></tr>`;
      return;
    }

    orders.forEach((order, index) => {
      const row = document.createElement("tr");
      
      // Format items list
      let itemsList = '';
      if (order.items && Array.isArray(order.items) && order.items.length > 0) {
        itemsList = order.items.map(item => 
          `${item.name} (x${item.quantity || 1})`
        ).join(', ');
      } else if (order.cartItems) {
        itemsList = order.cartItems;
      } else {
        itemsList = 'N/A';
      }

      // Get customer info
      const customerName = order.customerName || order.name || 'N/A';
      const phone = order.mobile || order.phone || 'N/A';
      const address = order.address || 'N/A';
      
      // Calculate total amount - if null, calculate from items
      let totalAmount = 0;
      if (order.totalAmount && order.totalAmount !== null) {
        totalAmount = parseFloat(order.totalAmount);
      } else if (order.total && order.total !== null) {
        totalAmount = parseFloat(order.total);
      } else if (order.items && Array.isArray(order.items)) {
        // Calculate from items array when totalAmount is null
        totalAmount = order.items.reduce((sum, item) => {
          return sum + ((item.price || 0) * (item.quantity || 1));
        }, 0);
      }
      
      // Get date
      const orderDate = order.date || 
                       (order.orderDate ? new Date(order.orderDate).toLocaleString() : 
                       (order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'));

      row.innerHTML = `
        <td>${index + 1}</td>
        <td><strong>${customerName}</strong></td>
        <td>
          ${phone !== 'N/A' ? `
            <a href="tel:${phone}" class="text-decoration-none">
              <i class="fas fa-phone me-1"></i>${phone}
            </a>
          ` : 'N/A'}
        </td>
        <td><small>${address}</small></td>
        <td><small>${itemsList}</small></td>
        <td><strong class="text-success">₹${totalAmount.toFixed(2)}</strong></td>
        <td><small class="text-muted">${orderDate}</small></td>
      `;
      list.appendChild(row);
    });
  } catch (err) {
    console.error("Error loading orders:", err);
    document.getElementById("orderList").innerHTML = `
      <tr><td colspan="7" class="text-center text-danger">Error loading orders</td></tr>
    `;
  }
}

// Add new product
document.getElementById("ownerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Adding...';

  try {
    const res = await fetch("/add-product", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    const status = document.getElementById("ownerStatus");
    status.textContent = data.message;
    status.classList.toggle("text-success", res.ok);
    status.classList.toggle("text-danger", !res.ok);

    if (res.ok) {
      form.reset();
      loadProducts();
      setTimeout(() => {
        status.textContent = '';
      }, 3000);
    }
  } catch (err) {
    console.error("Error adding product:", err);
    document.getElementById("ownerStatus").textContent = "Error adding product. Please check server.";
    document.getElementById("ownerStatus").classList.add("text-danger");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Add Product';
  }
});

// Delete product
async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    const res = await fetch(`/delete-product/${id}`, { method: "DELETE" });
    const data = await res.json();

    alert(data.message);
    if (res.ok) loadProducts();
  } catch (err) {
    console.error("Error deleting product:", err);
    alert("Error deleting product.");
  }
}

// Load prescriptions
async function loadPrescriptions() {
  try {
    const res = await fetch("/prescriptions");
    const prescriptions = await res.json();

    const list = document.getElementById("prescriptionList");
    list.innerHTML = "";

    if (!prescriptions.length) {
      list.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No prescriptions uploaded yet</td></tr>`;
      return;
    }

    prescriptions.forEach((p, index) => {
      const row = document.createElement("tr");
      const uploadedDate = p.uploadedAt ? new Date(p.uploadedAt).toLocaleString() : 'N/A';
      
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>
          <img src="${p.img}" width="80" height="60" class="rounded" 
               onclick="window.open('${p.img}', '_blank')" 
               style="cursor: pointer;"
               title="Click to view full image">
        </td>
        <td><strong>${p.name}</strong></td>
        <td>
          <a href="tel:${p.mobile}" class="text-decoration-none">
            <i class="fas fa-phone me-1"></i>${p.mobile}
          </a>
        </td>
        <td><small class="text-muted">${uploadedDate}</small></td>
      `;
      list.appendChild(row);
    });
  } catch (err) {
    console.error("Error loading prescriptions:", err);
  }
}

// Initialize
window.onload = () => {
  loadProducts();
  loadOrders();
  loadPrescriptions();
  
  // Refresh data every 30 seconds
  setInterval(() => {
    loadProducts();
    loadOrders();
    loadPrescriptions();
  }, 30000);
};