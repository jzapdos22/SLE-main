const CART_KEY = "biteme_cart";
const TAX_RATE = 0.0725;

const $ = (sel) => document.querySelector(sel);
const money = (n) => `$${n.toFixed(2)}`;

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || "{}");
}
function setCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/* ✅ NEW: Toast function */
function showAddedToast(name) {
  const toastEl = document.getElementById("cartToast");
  const toastBody = document.getElementById("cartToastBody");
  if (!toastEl || !toastBody) return;

  toastBody.textContent = `Added to cart: ${name}`;

  const toast = bootstrap.Toast.getOrCreateInstance(toastEl, {
    delay: 1200
  });
  toast.show();
}

function addItem(id, name, price) {
  const cart = getCart();
  if (!cart[id]) cart[id] = { id, name, price: Number(price), qty: 1 };
  else cart[id].qty++;
  setCart(cart);
  renderCart();

  /* ✅ SHOW TOAST */
  showAddedToast(name);
}

function renderCart() {
  const cart = getCart();
  const items = Object.values(cart);

  const count = items.reduce((s, it) => s + it.qty, 0);
  const sub = items.reduce((s, it) => s + it.price * it.qty, 0);
  const tx = sub * TAX_RATE;
  const tot = sub + tx;

  const badge = $("#cartCountBadge");
  if (badge) badge.textContent = count;

  const area = $("#cartItemsArea");
  if (!area) return;

  if (items.length === 0) {
    area.innerHTML = `<div class="text-muted">Your cart is empty.</div>`;
    if ($("#subtotalText")) $("#subtotalText").textContent = money(0);
    if ($("#taxText")) $("#taxText").textContent = money(0);
    if ($("#totalText")) $("#totalText").textContent = money(0);
    return;
  }

  area.innerHTML = items
    .map(
      (it) => `
      <div class="d-flex align-items-center justify-content-between border-bottom py-3">
        <div>
          <div class="fw-semibold">${it.name}</div>
          <div class="text-muted small">${money(it.price)} each</div>
        </div>

        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-outline-secondary btn-sm" data-dec="${it.id}">-</button>
          <span class="fw-semibold" style="min-width:24px;text-align:center;">${it.qty}</span>
          <button class="btn btn-outline-secondary btn-sm" data-inc="${it.id}">+</button>
        </div>

        <div class="text-end" style="min-width:120px;">
          <div class="fw-semibold">${money(it.price * it.qty)}</div>
          <button class="btn btn-link text-danger p-0 small" data-remove="${it.id}">Remove</button>
        </div>
      </div>
    `
    )
    .join("");

  $("#subtotalText").textContent = money(sub);
  $("#taxText").textContent = money(tx);
  $("#totalText").textContent = money(tot);

  area.querySelectorAll("[data-inc]").forEach((b) => {
    b.onclick = () => {
      const cart = getCart();
      cart[b.dataset.inc].qty++;
      setCart(cart);
      renderCart();
    };
  });

  area.querySelectorAll("[data-dec]").forEach((b) => {
    b.onclick = () => {
      const cart = getCart();
      const id = b.dataset.dec;
      cart[id].qty = Math.max(1, cart[id].qty - 1);
      setCart(cart);
      renderCart();
    };
  });

  area.querySelectorAll("[data-remove]").forEach((b) => {
    b.onclick = () => {
      const cart = getCart();
      delete cart[b.dataset.remove];
      setCart(cart);
      renderCart();
    };
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.onclick = () =>
      addItem(btn.dataset.id, btn.dataset.name, btn.dataset.price);
  });

  const clearBtn = $("#clearCartBtn");
  if (clearBtn) {
    clearBtn.onclick = () => {
      setCart({});
      renderCart();
    };
  }

  renderCart();
});
