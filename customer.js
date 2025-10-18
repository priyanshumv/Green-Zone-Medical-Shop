if (localStorage.getItem("isOwner") !== "true") {
  alert("Unauthorized access!");
  window.location.href = "index.html"; // redirect to customer homepage
}


async function loadOrders() {
  const res = await fetch("/orders");
  const orders = await res.json();

  const container = document.getElementById("orders");
  container.innerHTML = "";

  orders.forEach((order, index) => {
    container.innerHTML += `
      <div class="card shadow-sm mb-3">
        <div class="card-body">
          <h5>${order.customerName} (${order.mobile})</h5>
          <p>${order.address}</p>
          <ul>
            ${order.items.map(i => `<li>${i.name} - ₹${i.price}</li>`).join("")}
          </ul>
          <button class="btn btn-danger btn-sm" onclick="removeOrder(${index})">Remove</button>
        </div>
      </div>
    `;
  });
}

async function removeOrder(index) {
  if (!confirm("Are you sure you want to delete this order?")) return;

  const res = await fetch(`/order/${index}`, {
    method: "DELETE"
  });

  const data = await res.json();
  alert(data.message);
  loadOrders(); // refresh the list
}

window.onload = loadOrders;
