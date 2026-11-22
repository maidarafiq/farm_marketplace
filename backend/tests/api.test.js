const fs = require("fs")
const path = require("path")

// Point the app at a throwaway test database so we never touch marketplace.db
const TEST_DB_PATH = path.join(__dirname, "test-marketplace.db")
process.env.DB_PATH = TEST_DB_PATH

// Clean up any leftover test db from a previous run before loading the app,
// since the app seeds data only when the products table is empty.
if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH)

const request = require("supertest")
const app = require("../server")

describe("GET /api/health", () => {
  it("returns status ok and a version string", async () => {
    const res = await request(app).get("/api/health")
    expect(res.status).toBe(200)
    expect(res.body.status).toBe("ok")
    expect(typeof res.body.version).toBe("string")
  })
})

describe("GET /api/products", () => {
  it("returns the seeded list of products", async () => {
    const res = await request(app).get("/api/products")
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })

  it("returns products with the expected shape", async () => {
    const res = await request(app).get("/api/products")
    const product = res.body[0]
    expect(product).toHaveProperty("id")
    expect(product).toHaveProperty("name")
    expect(product).toHaveProperty("farmer")
    expect(product).toHaveProperty("price")
  })
})

describe("POST /api/order", () => {
  it("confirms an order and includes the item names in the message", async () => {
    const res = await request(app)
      .post("/api/order")
      .send({ items: [{ name: "Mangoes" }, { name: "Carrots" }] })
      .set("Content-Type", "application/json")

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.message).toContain("Mangoes")
    expect(res.body.message).toContain("Carrots")
  })
})

afterAll(() => {
  // Clean up the test database file
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH)
})
