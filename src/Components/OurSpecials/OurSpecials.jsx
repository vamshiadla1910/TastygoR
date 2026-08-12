import React, { useState } from "react";
import "../OurSpecials/OurSpecials.css";
import { useDispatch } from "react-redux";
import { addToCart } from "../../Slices/cartSlice";

function OurSpecials() {
  const specials = [
    {
      id: 1,
      category: "Specials",
      name: "Truffle Royale Pizza",
      tag: "Chef's Recommended",
      price: 188.99,
      image: "/pizza_imgs/Truffle_Royale_Pizza.jpg",
    },
    {
      id: 2,
      category: "Specials",
      name: "Smoky Flame Burger",
      tag: "Limited Time",
      price: 149.99,
      image: "/burger_imgs/Cheese_Burst_Burger.jpg",
    },
    {
      id: 3,
      category: "Specials",
      name: "Red Velvet Cake",
      tag: "Best Seller",
      price: 199.99,
      image: "/dessert/red-velvet-cake.jpg",
    },
    {
      id: 4,
      category: "Specials",
      name: "Garlic Fries",
      tag: "Cool Choice",
      price: 68.49,
      image: "/fries/Garlic_Fries.jpg",
    },
    {
      id: 5,
      category: "Specials",
      name: "Peri Peri Fries",
      tag: "Value Pack",
      price: 299.99,
      image: "/fries/Peri_Peri_Fries.jpg",
    },
    {
      id: 6,
      category: "Specials",
      name: "Crispy Chicken Burger",
      tag: "Limited Time",
      price: 78.49,
      image: "/burger_imgs/Crispy_Chicken_Burger.jpg",
    },
  ];

  return (
    <section className="section specials-section" id="specials">
      <div className="special-container">
        <div className="section-heading center">
          <p className="eyebrow">Handpicked for You</p>
          <h2>Our Specials</h2>
        </div>

        <div className="specials-grid">
          {specials.map((item) => (
            <FlipCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FlipCard({ item }) {
  const dispatch = useDispatch();
  const [flipped, setFlipped] = useState(false);

  return (
    <section
      className={`specials-card ${flipped ? "flipped" : ""}`}
    >
      <div className="card-inner">

        <div className="card-front">
          <div className="special-badge">
            {item.tag}
          </div>

          <img
            src={item.image}
            alt={item.name}
          />

          <div className="card-body">
            <div className="body-top">
              <h3>{item.name}</h3>
              <p>Price: ₹{item.price}</p>
            </div>

            <div className="body-bottom">
              <button
                className="special-button"
                onClick={() => setFlipped(true)}
              >
                View Details
              </button>

              <button
                className="cart-add"
                aria-label={`Add ${item.name} to cart`}
                onClick={() => dispatch(addToCart(item))}
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="card-back">
          <img
            src={item.image}
            alt={item.name}
          />

          <h3>{item.name}</h3>

          <p>Special: {item.tag}</p>

          <p>Price: ₹{item.price}</p>

          <p>Delicious choice handpicked for you!</p>

          <button
            className="go-back"
            onClick={() => setFlipped(false)}
          >
            Back
          </button>
        </div>

      </div>
    </section>
  );
}

export default OurSpecials;