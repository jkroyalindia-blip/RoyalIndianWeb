const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
const currentPage = window.location.pathname.split("/").pop() || "index.html";

navLinks.forEach((link) => {
  const href = link.getAttribute("href");
  if (href === currentPage) {
    link.classList.add("active");
    link.setAttribute("aria-current", "page");
  }
});

const yearEl = document.querySelector("[data-current-year]");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const CART_KEY = "royalIndianCart";
const products = Array.isArray(window.RI_PRODUCTS) ? window.RI_PRODUCTS : [];

const formatInr = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value) || 0);

const formatUsd = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(Number(value) || 0);

const readCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || {};
  } catch (error) {
    return {};
  }
};

const writeCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
};

const cartItemCount = () => Object.values(readCart()).reduce((sum, qty) => sum + Number(qty || 0), 0);

const updateCartCount = () => {
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = cartItemCount();
  });
};

const setCartQuantity = (productId, quantity) => {
  const cart = readCart();
  const nextQuantity = Math.max(0, Number(quantity) || 0);
  if (nextQuantity === 0) {
    delete cart[productId];
  } else {
    cart[productId] = nextQuantity;
  }
  writeCart(cart);
};

const productById = (id) => products.find((product) => product.id === id);

const productCard = (product) => `
  <div class="col-md-6 col-xl-4 product-item" data-division="${product.division}" data-category="${product.category}">
    <article class="product-card catalog-card p-0">
      <img class="catalog-image" src="${product.image}" alt="${product.name}" loading="lazy">
      <div class="p-4">
        <div class="d-flex justify-content-between gap-3 align-items-start mb-2">
          <h3 class="h5 fw-bold mb-0">${product.name}</h3>
          <span class="availability-badge">${product.availability}</span>
        </div>
        <p class="product-tags mb-3">${product.code} | ${product.category}</p>
        <dl class="product-meta">
          <div><dt>Quantity</dt><dd>${product.quantity}</dd></div>
          <div><dt>Price</dt><dd>${formatInr(product.priceInr)} / ${formatUsd(product.priceUsd)}</dd></div>
          <div><dt>Courier</dt><dd>${product.courierCharges}</dd></div>
        </dl>
        <p>${product.description}</p>
        <div class="cart-actions" data-product-id="${product.id}">
          <button class="btn btn-outline-primary btn-sm" type="button" data-cart-decrease aria-label="Decrease quantity">-</button>
          <span class="cart-qty" data-product-qty>0</span>
          <button class="btn btn-outline-primary btn-sm" type="button" data-cart-increase aria-label="Increase quantity">+</button>
          <button class="btn btn-primary btn-sm ms-auto" type="button" data-add-cart>Add to Cart</button>
        </div>
      </div>
    </article>
  </div>
`;

const refreshProductQuantities = () => {
  const cart = readCart();
  document.querySelectorAll("[data-product-id]").forEach((el) => {
    const qtyEl = el.querySelector("[data-product-qty]");
    if (qtyEl) {
      qtyEl.textContent = cart[el.dataset.productId] || 0;
    }
  });
};

const initProductCatalog = () => {
  const catalog = document.getElementById("productCatalog");
  if (!catalog || products.length === 0) {
    return;
  }

  const divisionFilter = document.querySelector("[data-product-filter='division']");
  const categoryFilter = document.querySelector("[data-product-filter='category']");
  const divisions = ["All Divisions", ...new Set(products.map((product) => product.division))];
  const categories = ["All Categories", ...new Set(products.map((product) => product.category))];

  divisionFilter.innerHTML = divisions.map((item) => `<option value="${item}">${item}</option>`).join("");
  categoryFilter.innerHTML = categories.map((item) => `<option value="${item}">${item}</option>`).join("");
  catalog.innerHTML = products.map(productCard).join("");

  const applyFilters = () => {
    const selectedDivision = divisionFilter.value;
    const selectedCategory = categoryFilter.value;
    document.querySelectorAll(".product-item").forEach((item) => {
      const divisionMatch = selectedDivision === "All Divisions" || item.dataset.division === selectedDivision;
      const categoryMatch = selectedCategory === "All Categories" || item.dataset.category === selectedCategory;
      item.classList.toggle("d-none", !(divisionMatch && categoryMatch));
    });
  };

  divisionFilter.addEventListener("change", applyFilters);
  categoryFilter.addEventListener("change", applyFilters);
  catalog.addEventListener("click", (event) => {
    const action = event.target.closest("[data-add-cart], [data-cart-increase], [data-cart-decrease]");
    if (!action) {
      return;
    }
    const wrapper = action.closest("[data-product-id]");
    const productId = wrapper.dataset.productId;
    const currentQty = readCart()[productId] || 0;
    const nextQty = action.hasAttribute("data-cart-decrease") ? currentQty - 1 : currentQty + 1;
    setCartQuantity(productId, nextQty);
    refreshProductQuantities();
  });

  refreshProductQuantities();
};

const initCheckout = () => {
  const list = document.getElementById("checkoutItems");
  const summary = document.getElementById("checkoutSummary");
  if (!list || !summary) {
    return;
  }

  const entries = Object.entries(readCart())
    .map(([id, qty]) => ({ product: productById(id), qty: Number(qty) || 0 }))
    .filter((entry) => entry.product && entry.qty > 0);

  if (entries.length === 0) {
    list.innerHTML = '<p class="mb-0">Your cart is empty.</p>';
    summary.innerHTML = '<a class="btn btn-primary" href="products.html">View Products</a>';
    return;
  }

  list.innerHTML = entries.map(({ product, qty }) => `
    <div class="checkout-row">
      <img src="${product.image}" alt="${product.name}" loading="lazy">
      <div>
        <h3 class="h6 fw-bold mb-1">${product.name}</h3>
        <p class="mb-1 small text-muted">${product.code} | ${product.category} | ${product.quantity}</p>
        <p class="mb-0">${formatInr(product.priceInr)} / ${formatUsd(product.priceUsd)} | Courier: ${product.courierCharges}</p>
      </div>
      <strong>Qty: ${qty}</strong>
    </div>
  `).join("");

  const totalItems = entries.reduce((sum, entry) => sum + entry.qty, 0);
  const totalInr = entries.reduce((sum, entry) => sum + entry.product.priceInr * entry.qty, 0);
  const totalUsd = entries.reduce((sum, entry) => sum + entry.product.priceUsd * entry.qty, 0);
  summary.innerHTML = `
    <div><strong>Total items:</strong> ${totalItems}</div>
    <div><strong>Estimated product total:</strong> ${formatInr(totalInr)} / ${formatUsd(totalUsd)}</div>
    <p class="mb-0 mt-2">Courier charges are listed product-wise and confirmed directly by Royal Indian.</p>
  `;
};

updateCartCount();
initProductCatalog();
initCheckout();
