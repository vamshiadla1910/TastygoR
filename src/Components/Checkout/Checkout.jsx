import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
//import { useCart } from "../../context/useCart";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../../Slices/cartSlice";
import "./Checkout.css";
import { addOrder } from "../../Slices/orderSlice";

function Checkout() {
  //const { cartItems, getTotalPrice, clearCart } = useCart();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cartItems);

  const navigate = useNavigate();

  const initialForm = {
    fullName: "",
    mobileNumber: "",
    email: "",
    houseNumber: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "Cash on Delivery",
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // modal state & order shown
  const [showModal, setShowModal] = useState(false);
  const [modalOrder, setModalOrder] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const orderSubmitted = sessionStorage.getItem("orderSubmitted");

    if (
      cartItems.length === 0 &&
      !showModal &&
      !orderSubmitted
    ) {
      navigate("/menu", { replace: true });
    }
  }, [cartItems, navigate, showModal]);

  //const subtotal = getTotalPrice();
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const deliveryCharge = subtotal > 0 ? 50 : 0;
  const gst = +(subtotal * 0.05).toFixed(2);
  const grandTotal = +(subtotal + deliveryCharge + gst).toFixed(2);

  const parsePrice = (value) => {
    if (typeof value === "number") return value;
    return Number(String(value).replace(/[^\d.]/g, "")) || 0;
  };

  const formatPrice = (value) => {
    const rounded = Number(value.toFixed(2));
    return `₹${rounded.toLocaleString("en-IN", {
      minimumFractionDigits: rounded % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full Name is required.";
    if (!/^\d{10}$/.test(form.mobileNumber))
      newErrors.mobileNumber = "Mobile Number must be 10 digits.";
    if (!form.email.trim()) newErrors.email = "Email is required.";
    if (!form.houseNumber.trim())
      newErrors.houseNumber = "House Number is required.";
    if (!form.street.trim()) newErrors.street = "Street is required.";
    if (!form.city.trim()) newErrors.city = "City is required.";
    if (!form.state.trim()) newErrors.state = "State is required.";
    if (!/^\d{6}$/.test(form.pincode))
      newErrors.pincode = "Pincode must be 6 digits.";
    if (!form.paymentMethod)
      newErrors.paymentMethod = "Please select a payment method.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // close modal on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setShowModal(false);
    }
    if (showModal) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showModal]);

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setShowModal(false);
    }
  };

  const handlePlaceOrder = async (event) => {
    if (event && typeof event.preventDefault === "function")
      event.preventDefault();

    // Prevent duplicate submissions
    if (isSubmitting || sessionStorage.getItem("orderProcessing") === "true")
      return;

    setSubmitError("");
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      sessionStorage.setItem("orderProcessing", "true");

      // build order
      const now = new Date();
      const randomOrderNumber = Math.floor(100000 + Math.random() * 900000);
      const orderId = `SV-${randomOrderNumber}`;

      const order = {
        id: orderId,
        date: now.toISOString(),
        customerName: form.fullName.trim(),
        paymentMethod: form.paymentMethod,
        contact: {
          mobileNumber: form.mobileNumber,
          email: form.email.trim(),
        },
        address: {
          houseNumber: form.houseNumber.trim(),
          street: form.street.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode,
        },
        items: cartItems,
        summary: {
          subtotal,
          deliveryCharge,
          gst,
          grandTotal,
        },
        estimatedDelivery: "30-45 Minutes",
        status: "Preparing Food",
      };

      // persist the order (orders array + latestOrder)
      // Save order to localStorage
      const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      existingOrders.unshift(order);

      localStorage.setItem("orders", JSON.stringify(existingOrders));
      localStorage.setItem("myOrders", JSON.stringify(existingOrders));
      localStorage.setItem("latestOrder", JSON.stringify(order));

      // Add order to Redux Store
      dispatch(addOrder(order));

      // Show success modal
      setModalOrder(order);
      setShowModal(true);

      // Clear cart
      dispatch(clearCart());
      // mark finalized to prevent duplicates via back button
      sessionStorage.setItem("orderSubmitted", order.id);
    } catch (err) {
      console.error("Failed to place order:", err);
      setSubmitError("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
      sessionStorage.removeItem("orderProcessing");
    }
  };

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [upiOption, setUpiOption] = useState("");
  const [cardDetails, setCardDetails] = useState({
    holderName: "",
    lastFour: "",
    cvv: "",
  });
  return (
    <section className="checkout-page">
      <div className="checkout-heading">
        <p>Checkout</p>
        <h1>Confirm Your Order</h1>
      </div>

      <div className="checkout-layout">
        <main className="checkout-form-panel">
          <div className="checkout-card">
            <h2>Customer Details</h2>
            <form onSubmit={handlePlaceOrder} noValidate>
              <div className="field-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={handleChange}
                />
                {errors.fullName && (
                  <p className="field-error">{errors.fullName}</p>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="mobileNumber">Mobile Number</label>
                <input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  value={form.mobileNumber}
                  onChange={handleChange}
                />
                {errors.mobileNumber && (
                  <p className="field-error">{errors.mobileNumber}</p>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                />
                {errors.email && <p className="field-error">{errors.email}</p>}
              </div>

              <div className="field-group">
                <label htmlFor="houseNumber">House Number</label>
                <input
                  id="houseNumber"
                  name="houseNumber"
                  type="text"
                  value={form.houseNumber}
                  onChange={handleChange}
                />
                {errors.houseNumber && (
                  <p className="field-error">{errors.houseNumber}</p>
                )}
              </div>

              <div className="field-group">
                <label htmlFor="street">Street</label>
                <input
                  id="street"
                  name="street"
                  type="text"
                  value={form.street}
                  onChange={handleChange}
                />
                {errors.street && (
                  <p className="field-error">{errors.street}</p>
                )}
              </div>

              <div className="field-group half">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={form.city}
                  onChange={handleChange}
                />
                {errors.city && <p className="field-error">{errors.city}</p>}
              </div>
              <div className="field-group half">
                <label htmlFor="state">State</label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  value={form.state}
                  onChange={handleChange}
                />
                {errors.state && <p className="field-error">{errors.state}</p>}
              </div>

              <div className="field-group">
                <label htmlFor="pincode">Pincode</label>
                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  value={form.pincode}
                  onChange={handleChange}
                />
                {errors.pincode && (
                  <p className="field-error">{errors.pincode}</p>
                )}
              </div>
            </form>
          </div>
        </main>

        <aside className="checkout-summary-panel">
          <div className="checkout-card summary-card">
            <h2>Order Summary</h2>
            <div className="summary-item-list">
              {cartItems.map((item) => {
                const price = parsePrice(item.price);
                const total = price * item.quantity;
                return (
                  <div
                    className="summary-item"
                    key={`${item.id}-${item.category}`} /*key={item.key}*/
                  >
                    <div>
                      <p>{item.name}</p>
                      <span>
                        {item.quantity} x {formatPrice(price)}
                      </span>
                    </div>
                    <strong>{formatPrice(total)}</strong>
                  </div>
                );
              })}
            </div>

            <div className="checkout-totals">
              <div className="checkout-total-row">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <div className="checkout-total-row">
                <span>Delivery Charge</span>
                <strong>{formatPrice(deliveryCharge)}</strong>
              </div>
              <div className="checkout-total-row">
                <span>GST (5%)</span>
                <strong>{formatPrice(gst)}</strong>
              </div>
              <div className="checkout-total-row grand">
                <span>Grand Total</span>
                <strong>{formatPrice(grandTotal)}</strong>
              </div>

              <div className="field-group payment-group">
                <h5>Payment Method</h5>
                <div className="payment-grid">
                  <div className="payment-options">
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      Cash On Delivery
                    </label>

                    <label className="payment-option">
                      <input
                        type="radio"
                        name="payment"
                        value="upi"
                        checked={paymentMethod === "upi"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      UPI Payment
                    </label>

                    <label className="payment-option">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      Credit / Debit Card
                    </label>
                  </div>

                  {paymentMethod === "upi" && (
                    <div className="upi-dropdown">
                      <label>
                        <input type="radio" name="upiOption" />
                        PhonePe
                      </label>

                      <label>
                        <input type="radio" name="upiOption" />
                        Google Pay
                      </label>

                      <label>
                        <input type="radio" name="upiOption" />
                        Paytm
                      </label>
                    </div>
                  )}

                  {paymentMethod === "card" && (
                    <div className="card-payment-form">
                      <div className="form-group">
                        <label>Card Holder Name</label>
                        <input type="text" placeholder="John Doe" />
                      </div>

                      <div className="form-group">
                        <label>Card Last 4 Digits</label>
                        <input type="text" placeholder="1234" />
                      </div>

                      <div className="form-group">
                        <label>CVV</label>
                        <input type="password" placeholder="123" />
                      </div>
                    </div>
                  )}
                </div>
                {errors.paymentMethod && (
                  <p className="field-error">{errors.paymentMethod}</p>
                )}
              </div>

              {submitError && <p className="field-error">{submitError}</p>}

              <button
                type="button"
                className="place-order-btn"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 50 50"
                      style={{ animation: "spin 1s linear infinite" }}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="25"
                        cy="25"
                        r="20"
                        stroke="#fff"
                        strokeWidth="5"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray="31.4 31.4"
                      />
                    </svg>
                    Placing...
                  </span>
                ) : (
                  "Place Order"
                )}
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Success Modal */}
      {showModal && modalOrder && (
        <div className="order-modal-overlay" onMouseDown={handleOverlayClick}>
          <div
            className="order-modal"
            ref={modalRef}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              aria-label="Close"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>

            <div className="modal-content" style={{ textAlign: "center" }}>
              

              <h2 style={{ margin: "6px 0" }}>Order Placed Successfully!</h2>
              <p style={{ margin: "8px 0 16px", color: "#666" }}>
                Thank you! Your order has been placed successfully.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  textAlign: "left",
                }}
              >
                <div>
                  <p className="label">Order ID</p>
                  <p className="value">{modalOrder.id}</p>
                </div>
                <div>
                  <p className="label">Total Amount</p>
                  <p className="value">
                    {formatPrice(modalOrder.summary?.grandTotal ?? grandTotal)}
                  </p>
                </div>
                <div>
                  <p className="label">Order Date & Time</p>
                  <p className="value">
                    {new Date(modalOrder.date).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="label">Estimated Delivery</p>
                  <p className="value">30–45 minutes</p>
                </div>
                <div className="order-details-grid">
                  <p className="label">Payment Method</p>
                  <p className="value">{modalOrder.paymentMethod}</p>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="primary"
                  onClick={() => {
                    setShowModal(false);
                    navigate("/my-orders");
                  }}
                  style={{
                    background: "#ff8a3d",
                    color: "#fff",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "none",
                  }}
                >
                  View My Orders
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    navigate("/menu");
                  }}
                  style={{
                    background: "#fff",
                    color: "#333",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #E6E6E6",
                  }}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Checkout;
// ...existing code...