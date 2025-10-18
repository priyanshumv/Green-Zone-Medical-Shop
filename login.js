document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
  
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
  
    // Hardcoded owner login (can be improved later)
    if (username === "priyanshu" && password === "8291") {
      localStorage.setItem("isOwner", "true");
      window.location.href = "owner.html";
    } else {
      alert("Invalid credentials!");
    }
  });
  