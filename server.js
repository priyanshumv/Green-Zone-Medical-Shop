const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = 5000;

// ----------------- FILE & UPLOAD SETUP -----------------
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/uploads", express.static(uploadsDir));

const PRODUCTS_FILE = path.join(__dirname, "products.json");
const ORDERS_FILE = path.join(__dirname, "orders.json");
const PRESCRIPTIONS_FILE = path.join(__dirname, "prescriptions.json");

function loadData(file) {
  if (!fs.existsSync(file)) return [];
  const content = fs.readFileSync(file, "utf-8");
  return content ? JSON.parse(content) : [];
}

function saveData(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ----------------- MULTER UPLOAD -----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ----------------- ROUTES -----------------

// Get all products
app.get("/products", (req, res) => {
  const products = loadData(PRODUCTS_FILE);
  res.json(products);
});

// Add product with brand support
app.post("/add-product", upload.single("image"), (req, res) => {
  let products = loadData(PRODUCTS_FILE);

  const product = {
    id: Date.now().toString(),
    name: req.body.name,
    price: parseFloat(req.body.price),
    brand: req.body.brand || 'Index',
    img: req.file ? `/uploads/${req.file.filename}` : null,
    createdAt: new Date().toISOString()
  };

  products.push(product);
  saveData(PRODUCTS_FILE, products);

  console.log(`Product added: ${product.name} (Brand: ${product.brand})`);
  res.json({ message: "Product added successfully!", product });
});

// Delete product
app.delete("/delete-product/:id", (req, res) => {
  let products = loadData(PRODUCTS_FILE);
  const productId = req.params.id;

  const updatedProducts = products.filter(p => p.id.toString() !== productId);

  if (updatedProducts.length === products.length) {
    return res.status(404).json({ message: "Product not found" });
  }

  saveData(PRODUCTS_FILE, updatedProducts);
  res.json({ message: "Product removed successfully!" });
});

// Get all orders
app.get("/orders", (req, res) => {
  const orders = loadData(ORDERS_FILE);
  res.json(orders);
});

// Add order
app.post("/add-order", async (req, res) => {
  let orders = loadData(ORDERS_FILE);

  const order = {
    id: Date.now().toString(),
    customerName: req.body.customerName || req.body.name,
    mobile: req.body.mobile || req.body.phone,
    address: req.body.address,
    items: req.body.items || [],
    cartItems: req.body.cartItems || '',
    totalAmount: parseFloat(req.body.totalAmount || req.body.total || 0),
    date: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    createdAt: new Date().toISOString()
  };

  orders.push(order);
  saveData(ORDERS_FILE, orders);

  console.log(`Order received: ${order.customerName} - ₹${order.totalAmount}`);
  res.json({ message: "Order placed successfully!", order });
});

// Get orders for a specific customer (My Orders)
app.get("/my-orders/:mobile", (req, res) => {
  const mobile = req.params.mobile;
  const orders = loadData(ORDERS_FILE).filter(o => o.mobile === mobile);
  res.json(orders);
});

// Upload prescription
app.post("/upload-prescription", upload.single("image"), (req, res) => {
  const { name, mobile } = req.body;
  if (!name || !mobile || !req.file) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  let prescriptions = loadData(PRESCRIPTIONS_FILE);

  const prescription = {
    id: Date.now().toString(),
    name,
    mobile,
    img: `/uploads/${req.file.filename}`,
    uploadedAt: new Date().toISOString()
  };

  prescriptions.push(prescription);
  saveData(PRESCRIPTIONS_FILE, prescriptions);

  res.json({ message: "Prescription uploaded successfully!", prescription });
});

// Get all prescriptions
app.get("/prescriptions", (req, res) => {
  const prescriptions = loadData(PRESCRIPTIONS_FILE);
  res.json(prescriptions);
});

// ----------------- START SERVER -----------------
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📊 Owner Dashboard: http://localhost:${PORT}/owner.html`);
  console.log(`🏥 Main Site: http://localhost:${PORT}/index.html`);
  
  // Create initial data files if they don't exist
  if (!fs.existsSync(PRODUCTS_FILE)) saveData(PRODUCTS_FILE, []);
  if (!fs.existsSync(ORDERS_FILE)) saveData(ORDERS_FILE, []);
  if (!fs.existsSync(PRESCRIPTIONS_FILE)) saveData(PRESCRIPTIONS_FILE, []);
});