// Assuming we store mobile number when placing order
const mobile = localStorage.getItem("userMobile");

if (!mobile) {
  document.getElementById("ordersContainer").innerHTML = `
    <div class="alert alert-warning">No mobile number found. Please place an order first.</div>
  `;
} else {
  loadMyOrders();
}

async function loadMyOrders() {
  try {
    const res = await fetch(`/my-orders/${mobile}`);
    const orders = await res.json();

    const container = document.getElementById("ordersContainer");
    container.innerHTML = "";

    if (orders.length === 0) {
      container.innerHTML = `<div class="alert alert-info">You have no orders yet.</div>`;
      return;
    }

    orders.forEach(order => {
      const div = document.createElement("div");
      div.className = "card shadow-sm mb-3";
      div.innerHTML = `
        <div class="card-body">
          <h5> your Order :- ${order.items.map(i => `<li>${i.name} - ₹${i.price}</li>`).join("")}</h5>
          <p><strong>Date:</strong> ${order.date}</p>
          <ul>
            ${order.items.map(i => `<li>${i.name} - ₹${i.price}</li>`).join("")}
          </ul>
        </div>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Failed to load orders:", err);
  }
}
