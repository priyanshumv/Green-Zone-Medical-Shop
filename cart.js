function loadCart() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const container = document.getElementById("cart");
  const totalEl = document.getElementById("total");

  container.innerHTML = "";

  let total = 0;

  cart.forEach((item, index) => {
    if (!item.quantity) item.quantity = 1; // default quantity 1

    total += item.price * item.quantity;

    container.innerHTML += `
      <div class="d-flex justify-content-between align-items-center border-bottom py-2">
        <div>
          <strong>${item.name}</strong> - ₹${item.price}
        </div>
        <div>
          <button class="btn btn-sm btn-secondary me-1" onclick="changeQuantity(${index}, -1)">-</button>
          <span>${item.quantity}</span>
          <button class="btn btn-sm btn-secondary ms-1" onclick="changeQuantity(${index}, 1)">+</button>
        </div>
      </div>
    `;
  });

  totalEl.textContent = `Total: ₹${total}`;
}

function changeQuantity(index, delta) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (!cart[index].quantity) cart[index].quantity = 1;

  cart[index].quantity += delta;

  // If quantity <= 0 → remove the item completely
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart(); // refresh cart
}

// Load cart on page load
window.onload = loadCart;
