const express = require("express")
const cors = require("cors")
const Database = require("better-sqlite3")
const app = express()
app.use(cors())
app.use(express.json())

// App version - bump this to demonstrate a visible change through the pipeline
const APP_VERSION = "1.0.0"

// Connect to database (creates the file if it doesn't exist)
const path = require("path")

const dbPath = process.env.DB_PATH ||
  path.join(__dirname, "marketplace.db")

const db = new Database(dbPath)

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT,
    farmer TEXT,
    farm TEXT,
    price INTEGER,
    quantity INTEGER,
    unit TEXT
  )
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    items TEXT,
    placed_at TEXT
  )
`)

// Seed products if table is empty
const count = db.prepare("SELECT COUNT(*) as c FROM products").get()
if (count.c === 0) {
  const insert = db.prepare("INSERT INTO products VALUES (?, ?, ?, ?, ?, ?, ?)")
  insert.run(1, "Mangoes", "Fatima Malik", "River Side Farm, Multan", 120, 60, "dozen")
  insert.run(2, "Carrots", "Sana Tariq", "Hilltop Farm, Islamabad", 45, 90, "kg")
  insert.run(3, "Fresh Tomatoes", "Ali Hassan", "Green Valley Farm, Lahore", 50, 120, "kg")
  insert.run(4, "Spinach", "Bilal Ahmed", "Fresh Green Farm, Karachi", 35, 75, "kg")
  insert.run(5, "Red Onions", "Usman Raza", "Golden Fields, Faisalabad", 40, 180, "kg")
  insert.run(6, "Potatoes", "Tariq Mehmood", "Sunrise Farm, Okara", 30, 200, "kg")
  console.log("Database seeded with products.")
}

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    version: APP_VERSION
  })
})

app.get("/api/products", (req, res) => {
  console.log("Fetching products from database...")
  const products = db.prepare("SELECT * FROM products").all()
  res.json(products)
})

app.post("/api/order", (req, res) => {
  const { items } = req.body
  const itemNames = items.map(i => i.name).join(", ")
  const placedAt = new Date().toISOString()

  db.prepare("INSERT INTO orders (items, placed_at) VALUES (?, ?)").run(itemNames, placedAt)

  console.log(`Order saved to database: ${itemNames}`)
  res.json({ success: true, message: `Order confirmed for: ${itemNames}` })
})

const PORT = process.env.PORT || 5000

// Only start listening when this file is run directly (node server.js),
// not when it's required by a test file.
if (require.main === module) {
  app.listen(PORT, "127.0.0.1", () => {
    console.log(`Backend running on port ${PORT}`)
  })
}

module.exports = app
