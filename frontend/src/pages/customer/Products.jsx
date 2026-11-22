import { useState, useEffect } from "react"

const products_tags = [
  { id: 1, tag: "Organic", image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=300&h=200&fit=crop&auto=format" },
  { id: 2, tag: "Organic", image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=200&fit=crop&auto=format" },
  { id: 3, tag: "Organic", image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=300&h=200&fit=crop&auto=format" },
  { id: 4, tag: "Fresh", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=200&fit=crop&auto=format" },
  { id: 5, tag: "Fresh", image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&h=200&fit=crop&auto=format" },
  { id: 6, tag: "Fresh", image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&h=200&fit=crop&auto=format" }
]

const qtyBtnStyle = {
  width: 22,
  height: 22,
  border: "1px solid #ddd",
  borderRadius: 4,
  background: "white",
  cursor: "pointer",
  fontSize: 14,
  lineHeight: 1,
  padding: 0
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [added, setAdded] = useState(null)
  const [orderMsg, setOrderMsg] = useState("")
  const [cartOpen, setCartOpen] = useState(false)



useEffect(() => {
  fetch("/api/products", {
    headers: {
      Accept: "application/json"
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`)
      }
      return response.json()
    })
    .then(data => {
      console.log("Products received:", data)
      setProducts(data)
    })
    .catch(error => {
      console.error("Failed to load products:", error)
    })
}, [])



  function addToCart(product) {
    const already = cart.find(i => i.id === product.id)
    if (already) {
      setCart(cart.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i))
    } else {
      setCart([...cart, { ...product, qty: 1 }])
    }
    setAdded(product.id)
    setTimeout(() => setAdded(null), 1500)
  }

  function changeQty(productId, delta) {
    setCart(prev => prev
      .map(i => i.id === productId ? { ...i, qty: i.qty + delta } : i)
      .filter(i => i.qty > 0)
    )
  }

  function removeFromCart(productId) {
    setCart(prev => prev.filter(i => i.id !== productId))
  }

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0)
  const cartTotal = cart.reduce((sum, i) => sum + i.qty * i.price, 0)

  async function placeOrder() {
    if (cart.length === 0) return
    const orderItems = cart.flatMap(i => Array(i.qty).fill({ name: i.name }))
    const res = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: orderItems })
    })
    const data = await res.json()
    setOrderMsg(data.message)
    setCart([])
    setCartOpen(false)
    setTimeout(() => setOrderMsg(""), 4000)
  }

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", backgroundColor: "#f9fafb", minHeight: "100vh" }}>

      {/* Navbar */}
      <nav style={{ backgroundColor: "#1b4332", padding: "14px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "white", fontWeight: "bold", fontSize: 20 }}>🌿 FarmFresh</span>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{ color: "#b7e4c7", fontSize: 15 }}>Browse Produce</span>
          <button
            onClick={() => setCartOpen(o => !o)}
            style={{
              backgroundColor: "#52b788",
              color: "white",
              borderRadius: 20,
              padding: "6px 16px",
              fontSize: 14,
              fontWeight: "bold",
              cursor: "pointer",
              border: "none"
            }}>
            🛒 Cart ({cartCount})
          </button>
        </div>
      </nav>

      {/* Cart panel — toggled from the navbar button */}
      {cartOpen && (
        <div style={{
          position: "fixed",
          top: 60,
          right: 24,
          width: 320,
          backgroundColor: "white",
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          zIndex: 10,
          padding: 16
        }}>
          <h3 style={{ margin: "0 0 12px", color: "#1b4332" }}>Your Cart</h3>
          {cart.length === 0 ? (
            <p style={{ color: "#888", fontSize: 14 }}>Your cart is empty.</p>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontSize: 14, color: "#1b4332" }}>
                    <div>{item.name}</div>
                    <div style={{ color: "#888", fontSize: 12 }}>Rs. {item.price} / {item.unit}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button onClick={() => changeQty(item.id, -1)} style={qtyBtnStyle}>−</button>
                    <span style={{ minWidth: 18, textAlign: "center" }}>{item.qty}</span>
                    <button onClick={() => changeQty(item.id, 1)} style={qtyBtnStyle}>+</button>
                    <button onClick={() => removeFromCart(item.id)} style={{ ...qtyBtnStyle, color: "#c0392b", marginLeft: 4 }}>×</button>
                  </div>
                </div>
              ))}
              <div style={{ borderTop: "1px solid #eee", marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between", fontWeight: "bold", color: "#1b4332" }}>
                <span>Total</span>
                <span>Rs. {cartTotal}</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Hero */}
      <div style={{ backgroundColor: "#2d6a4f", padding: "36px 32px", color: "white" }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Fresh From the Farm — Order Now</h1>
        <p style={{ margin: "8px 0 0", color: "#b7e4c7" }}>Direct from farmers to your doorstep</p>
      </div>

      {/* Order success message */}
      {orderMsg && (
        <div style={{
          backgroundColor: "#d8f3dc",
          color: "#1b4332",
          padding: "14px 32px",
          fontWeight: "bold",
          fontSize: 15,
          textAlign: "center"
        }}>
          ✅ {orderMsg}
        </div>
      )}

      {/* Product Grid */}
      <div style={{ padding: "32px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
        {products.map(product => {
          const meta = products_tags.find(t => t.id === product.id) || {}
          const inCart = cart.find(i => i.id === product.id)
          return (
            <div key={product.id} style={{ backgroundColor: "white", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <div style={{ position: "relative" }}>
                <img src={meta.image} alt={product.name} style={{ width: "100%", height: 180, objectFit: "cover" }} />
                {meta.tag && (
                  <span style={{ position: "absolute", top: 10, left: 10, backgroundColor: "#2d6a4f", color: "white", padding: "3px 10px", borderRadius: 20, fontSize: 12 }}>
                    {meta.tag}
                  </span>
                )}
              </div>
              <div style={{ padding: 16 }}>
                <h3 style={{ margin: "0 0 6px", color: "#1b4332" }}>{product.name}</h3>
                <p style={{ margin: "0 0 2px", color: "#52b788", fontSize: 14 }}>👨‍🌾 {product.farmer}</p>
                <p style={{ margin: "0 0 10px", color: "#888", fontSize: 13 }}>📍 {product.farm}</p>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontWeight: "bold", color: "#1b4332", fontSize: 18 }}>Rs. {product.price} <span style={{ fontSize: 13, fontWeight: "normal" }}>/ {product.unit}</span></span>
                  <span style={{ color: "#52b788", fontSize: 13 }}>In stock<br /><strong>{product.quantity} {product.unit}</strong></span>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  style={{
                    width: "100%",
                    padding: 10,
                    backgroundColor: inCart ? "#95d5b2" : added === product.id ? "#52b788" : "#2d6a4f",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 15,
                    cursor: "pointer"
                  }}
                >
                  {inCart ? `✓ In Cart (${inCart.qty})` : added === product.id ? "✓ Added!" : "Add to Cart"}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Cart Bar — only shows when cart has items */}
      {cart.length > 0 && (
        <div style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#1b4332",
          color: "white",
          padding: "16px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 -4px 12px rgba(0,0,0,0.2)"
        }}>
          <div>
            <strong>{cartCount} item{cartCount > 1 ? "s" : ""} in cart</strong>{" "}
            <span style={{ color: "#b7e4c7" }}>— Rs. {cartTotal}</span>
          </div>
          <button
            onClick={placeOrder}
            style={{
              backgroundColor: "#52b788",
              color: "white",
              border: "none",
              padding: "10px 28px",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Place Order →
          </button>
        </div>
      )}

      {/* Footer */}
      <div style={{ backgroundColor: "#1b4332", color: "#b7e4c7", textAlign: "center", padding: "20px", marginTop: 60 }}>
        🌱 Farm Marketplace — Connecting farmers directly with customers
      </div>
    </div>
  )
}

