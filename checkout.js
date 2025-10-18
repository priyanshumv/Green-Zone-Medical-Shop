// Show cart summary
function loadOrderSummary() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const summaryEl = document.getElementById("orderSummary");
  const totalEl = document.getElementById("orderTotal");

  summaryEl.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    const qty = item.quantity || 1;
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <span>${item.name} <small class="text-muted">(x${qty})</small></span>
      <span>₹${item.price * qty}</span>
    `;
    summaryEl.appendChild(li);
    total += item.price * qty;
  });

  totalEl.textContent = total;
}

// Toast notification
function showToast(message, success = true) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.style.cssText = `
      visibility: hidden;
      min-width: 250px;
      margin-left: -125px;
      background-color: ${success ? '#28a745' : '#dc3545'};
      color: white;
      text-align: center;
      border-radius: 5px;
      padding: 16px;
      position: fixed;
      z-index: 9999;
      left: 50%;
      bottom: 30px;
      font-size: 17px;
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.visibility = "visible";
  toast.style.opacity = 1;

  setTimeout(() => {
    toast.style.transition = "opacity 0.5s ease-out";
    toast.style.opacity = 0;
    setTimeout(() => { toast.style.visibility = "hidden"; }, 500);
  }, 3000);
}

// Submit checkout form
document.getElementById("checkoutForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const customerName = document.getElementById("name").value;
  const mobile = document.getElementById("mobile").value;
  const address = document.getElementById("address").value;
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  const order = { customerName, mobile, address, items: cart };

  try {
    const res = await fetch("/add-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order)
    });

    const data = await res.json();

    localStorage.setItem("userMobile", order.mobile);


    // Show toast notification
    showToast(data.message);

    // Clear cart
    localStorage.removeItem("cart");

    // Redirect after toast
    setTimeout(() => { window.location.href = "thankyou.html"; }, 5000);

  } catch (err) {
    console.error("Order submission failed:", err);
    showToast("Something went wrong. Please try again!", false);
  }
});

// Load summary on page load
window.onload = loadOrderSummary;
