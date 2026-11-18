document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const nav = document.getElementById("mainNav");
  menuToggle.addEventListener("click", () => nav.classList.toggle("open"));
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => nav.classList.remove("open"));
  });

  const categories = [
    { icon: "👗", name: "Women" },
    { icon: "👕", name: "Men" },
    { icon: "👟", name: "Shoes" },
    { icon: "👜", name: "Bags" },
    { icon: "⌚", name: "Accessories" },
    { icon: "🏠", name: "Home" }
  ];
  const categoryGrid = document.getElementById("categoryGrid");
  categories.forEach((cat) => {
    const card = document.createElement("div");
    card.className = "category-card";
    card.innerHTML = '<div class="category-icon">' + cat.icon + '</div><span class="cat-name">' + cat.name + '</span>';
    categoryGrid.appendChild(card);
  });

  const products = [
    { icon: "🧥", badge: "New", category: "Women", name: "Oversized Wool Coat", rating: 4.8, reviews: 124, price: 89.0, oldPrice: 129.0 },
    { icon: "👟", badge: "Sale", category: "Shoes", name: "Classic Canvas Sneakers", rating: 4.6, reviews: 89, price: 39.0, oldPrice: 59.0 },
    { icon: "👜", badge: null, category: "Bags", name: "Minimalist Tote Bag", rating: 4.9, reviews: 210, price: 54.0, oldPrice: null },
    { icon: "⌚", badge: "Sale", category: "Accessories", name: "Steel Chrono Watch", rating: 4.7, reviews: 156, price: 75.0, oldPrice: 110.0 },
    { icon: "👕", badge: null, category: "Men", name: "Everyday Cotton Tee", rating: 4.5, reviews: 302, price: 19.0, oldPrice: null },
    { icon: "🕶️", badge: "New", category: "Accessories", name: "Retro Sunglasses", rating: 4.4, reviews: 67, price: 29.0, oldPrice: 42.0 },
    { icon: "🎒", badge: null, category: "Bags", name: "Urban Backpack", rating: 4.8, reviews: 198, price: 64.0, oldPrice: null },
    { icon: "👖", badge: "Sale", category: "Men", name: "Slim Fit Denim Jeans", rating: 4.6, reviews: 143, price: 45.0, oldPrice: 68.0 }
  ];

  const productGrid = document.getElementById("productGrid");
  let cartCount = 0;
  const cartCountEl = document.getElementById("cartCount");

  function renderStars(rating) {
    const full = Math.round(rating);
    let stars = "";
    for (let i = 0; i < 5; i++) {
      stars += i < full ? "★" : "☆";
    }
    return stars;
  }

  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";

    const badgeHtml = product.badge ? '<span class="product-badge">' + product.badge + '</span>' : "";
    const oldPriceHtml = product.oldPrice ? '<span class="price-old">$' + product.oldPrice.toFixed(2) + '</span>' : "";

    card.innerHTML =
      '<div class="product-image">' + badgeHtml +
      '<button class="wishlist-toggle" aria-label="Add to wishlist">♡</button>' +
      product.icon +
      '</div>' +
      '<div class="product-info">' +
      '<div class="product-category">' + product.category + '</div>' +
      '<div class="product-name">' + product.name + '</div>' +
      '<div class="product-rating">' + renderStars(product.rating) + '<span>(' + product.reviews + ')</span></div>' +
      '<div class="product-price"><span class="price-current">$' + product.price.toFixed(2) + '</span>' + oldPriceHtml + '</div>' +
      '<button class="add-to-cart">Add to Cart</button>' +
      '</div>';

    const wishlistBtn = card.querySelector(".wishlist-toggle");
    wishlistBtn.addEventListener("click", () => {
      wishlistBtn.classList.toggle("active");
      wishlistBtn.textContent = wishlistBtn.classList.contains("active") ? "♥" : "♡";
    });

    const addBtn = card.querySelector(".add-to-cart");
    addBtn.addEventListener("click", () => {
      cartCount++;
      cartCountEl.textContent = cartCount;
      addBtn.textContent = "Added ✓";
      setTimeout(() => {
        addBtn.textContent = "Add to Cart";
      }, 1200);
    });

    productGrid.appendChild(card);
  });

  const testimonials = [
    { text: "The quality completely exceeded my expectations. Shipping was fast and the packaging felt premium.", name: "Amanda Reyes", role: "Verified Buyer", rating: 5 },
    { text: "Customer support helped me resize my order in minutes. This is how online shopping should feel.", name: "Daniel Cho", role: "Verified Buyer", rating: 5 },
    { text: "My go-to store for gifts now. Everything I have ordered has been exactly as described.", name: "Priya Nair", role: "Verified Buyer", rating: 4 }
  ];

  const testimonialGrid = document.getElementById("testimonialGrid");
  testimonials.forEach((t) => {
    const initials = t.name.split(" ").map((n) => n[0]).join("");
    const card = document.createElement("div");
    card.className = "testimonial-card";
    card.innerHTML =
      '<div class="testimonial-stars">' + renderStars(t.rating) + '</div>' +
      '<p class="testimonial-text">"' + t.text + '"</p>' +
      '<div class="testimonial-author">' +
      '<div class="author-avatar">' + initials + '</div>' +
      '<div><div class="author-name">' + t.name + '</div><div class="author-role">' + t.role + '</div></div>' +
      '</div>';
    testimonialGrid.appendChild(card);
  });

  const wishlistBtn = document.getElementById("wishlistBtn");
  wishlistBtn.addEventListener("click", () => {
    wishlistBtn.classList.toggle("active");
    wishlistBtn.textContent = wishlistBtn.classList.contains("active") ? "♥" : "♡";
  });

  const newsletterForm = document.getElementById("newsletterForm");
  const newsletterMsg = document.getElementById("newsletterMsg");
  newsletterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    newsletterMsg.textContent = "Thanks for subscribing! Check your inbox for your 10% off code.";
    newsletterForm.reset();
  });
});
