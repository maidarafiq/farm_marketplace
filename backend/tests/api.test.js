const fs = require("fs")
const path = require("path")
const { test, describe, after } = require("node:test")
const assert = require("node:assert/strict")

// Point the app at a throwaway test database so we never touch marketplace.db
const TEST_DB_PATH = path.join(__dirname, "test-marketplace.db")
process.env.DB_PATH = TEST_DB_PATH

// Clean up any leftover test db from a previous run before loading the app,
// since the app seeds data only when the products table is empty.
if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH)

const request = require("supertest")
const app = require("../server")

describe("GET /api/health", () => {
  test("returns status ok and a version string", async () => {
    const res = await request(app).get("/api/health")
    assert.equal(res.status, 200)
    assert.equal(res.body.status, "ok")
    assert.equal(typeof res.body.version, "string")
  })
})

describe("GET /api/products", () => {
  test("returns the seeded list of products", async () => {
    const res = await request(app).get("/api/products")
    assert.equal(res.status, 200)
    assert.ok(Array.isArray(res.body))
    assert.ok(res.body.length > 0)
  })

  test("returns products with the expected shape", async () => {
    const res = await request(app).get("/api/products")
    const product = res.body[0]
    assert.ok("id" in product)
    assert.ok("name" in product)
    assert.ok("farmer" in product)
    assert.ok("price" in product)
  })
})

describe("POST /api/order", () => {
  test("confirms an order and includes the item names in the message", async () => {
    const res = await request(app)
      .post("/api/order")
      .send({ items: [{ name: "Mangoes" }, { name: "Carrots" }] })
      .set("Content-Type", "application/json")

    assert.equal(res.status, 200)
    assert.equal(res.body.success, true)
    assert.ok(res.body.message.includes("Mangoes"))
    assert.ok(res.body.message.includes("Carrots"))
  })
})

after(() => {
  // Clean up the test database file
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH)
})
