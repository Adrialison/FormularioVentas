const PRODUCTS = {
  "": null,
  molde_silicona: {
    name: "Molde silicona",
    minorista: 20,
    mayorista: 15,
    stock: 50,
    vencimiento: null,
  },
  colorante_rojo: {
    name: "Colorante rojo",
    minorista: 10,
    mayorista: 7,
    stock: 20,
    vencimiento: "12/2026",
  },
  cobertura_chocolate: {
    name: "Cobertura chocolate",
    minorista: 25,
    mayorista: 20,
    stock: 100,
    vencimiento: "10/2026",
  },
};

let clientType = "minorista";
let rows = [];
let invoiceNum = 1;

document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  setDate();
  setInvoiceNum();
  document.getElementById("footerYear").textContent = new Date().getFullYear();
  checkClientReady();
});

function setDate() {
  const now = new Date();
  const opts = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  document.getElementById("invoiceDate").textContent = now.toLocaleDateString(
    "es-PE",
    opts,
  );
}

function setInvoiceNum() {
  document.getElementById("invoiceNum").textContent =
    "VTA-" + String(invoiceNum).padStart(4, "0");
}

//  Tipo de cliente
function setClientType(type) {
  clientType = type;
  document.getElementById("clientType").value = type;
  document
    .getElementById("chipMinorista")
    .classList.toggle("active", type === "minorista");
  document
    .getElementById("chipMayorista")
    .classList.toggle("active", type === "mayorista");
  // Actualizar precios de todas las filas
  rows.forEach((r) => {
    const prod = PRODUCTS[r.product];
    if (prod) {
      r.price = prod[clientType];
      updateRowDisplay(r.id);
    }
  });
  updateSummary();
  lucide.createIcons();
}

//  Validar cliente
function checkClientReady() {
  const name = document.getElementById("clientName").value.trim();
  const ready = name.length > 0;
  const btn = document.getElementById("btnAddRow");
  const warn = document.getElementById("clientWarning");
  if (btn) {
    btn.disabled = !ready;
    btn.classList.toggle("opacity-40", !ready);
    btn.classList.toggle("cursor-not-allowed", !ready);
    btn.classList.toggle("cursor-pointer", ready);
  }
  if (warn) warn.style.display = ready ? "none" : "flex";
}

//  Agregar fila
function addRow() {
  const name = document.getElementById("clientName").value.trim();
  if (!name) return;
  const id = Date.now();
  rows.push({ id, product: "", price: 0, qty: 1 });
  renderRows();
  updateSummary();
}

//  Eliminar fila
function removeRow(id) {
  rows = rows.filter((r) => r.id !== id);
  renderRows();
  updateSummary();
}

function renderRows() {
  const container = document.getElementById("productRows");
  const empty = document.getElementById("emptyState");
  const count = document.getElementById("rowCount");

  container.innerHTML = "";
  empty.style.display = rows.length ? "none" : "flex";
  count.textContent = rows.length + " ítem(s)";

  rows.forEach((row, idx) => {
    const prod = PRODUCTS[row.product] || null;
    const subtotal = prod ? row.price * row.qty : 0;

    const div = document.createElement("div");
    div.id = "row-" + row.id;
    div.className = "prod-row row-enter transition-colors";
    div.style.animationDelay = idx * 0.04 + "s";

    // Stock
    const stockHtml = prod
      ? `<span class="stock-badge inline-block px-2 py-0.5 rounded-full font-medium ${prod.stock <= 20 ? "bg-red-50 text-red-600" : "bg-stone-100 text-stone-500"}">${prod.stock}</span>`
      : `<span class="stock-badge text-stone-300">—</span>`;

    // Vencimiento
    const vencHtml =
      prod && prod.vencimiento
        ? `<span class="stock-badge venc-warn inline-block px-2 py-0.5 rounded-full font-medium">${prod.vencimiento}</span>`
        : `<span class="stock-badge text-stone-300 text-xs">—</span>`;

    // Select
    const options = Object.keys(PRODUCTS)
      .map((k) => {
        const p = PRODUCTS[k];
        return `<option value="${k}" ${k === row.product ? "selected" : ""}>${p ? p.name : "— Seleccionar —"}</option>`;
      })
      .join("");

    div.innerHTML = `
        <div class="md:hidden py-3 space-y-2">
          <div>
            <label class="block text-xs text-stone-400 mb-1">Producto</label>
            <select onchange="onProductChange(${row.id}, this.value)"
              class="field w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 bg-stone-50 transition">
              ${options}
            </select>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <div><label class="block text-xs text-stone-400 mb-1">Precio</label>
              <span class="mono text-sm font-medium text-stone-700 block" id="price-${row.id}">${prod ? "S/ " + prod[clientType].toFixed(2) : "—"}</span></div>
            <div><label class="block text-xs text-stone-400 mb-1">Cant.</label>
              <input type="number" min="1" max="${prod ? prod.stock : 999}" value="${row.qty}" onchange="onQtyChange(${row.id}, this.value)"
                class="field w-full text-center border border-stone-200 rounded-xl px-2 py-1.5 text-sm text-stone-800 bg-stone-50 transition"/></div>
            <div><label class="block text-xs text-stone-400 mb-1">Stock</label>${stockHtml}</div>
          </div>
          <div class="flex items-center justify-between pt-1">
            <div class="flex items-center gap-1.5">${vencHtml}<span class="text-xs text-stone-400">venc.</span></div>
            <div class="flex items-center gap-3">
              <span class="mono text-sm font-semibold text-stone-700" id="sub-${row.id}">S/ ${subtotal.toFixed(2)}</span>
              <button onclick="removeRow(${row.id})" class="btn-remove w-7 h-7 flex items-center justify-center rounded-lg no-print">
                <i data-lucide="x" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="hidden md:flex items-center py-3.5" style="gap:0;">
          <div style="width:32%;padding-right:12px;">
            <select onchange="onProductChange(${row.id}, this.value)"
              class="field w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 bg-stone-50 transition">
              ${options}
            </select>
          </div>
          <div style="width:13%;" class="flex justify-center">
            <span class="mono text-sm font-medium text-stone-700" id="price-desk-${row.id}">${prod ? "S/ " + prod[clientType].toFixed(2) : "—"}</span>
          </div>
          <div style="width:13%;" class="flex justify-center">
            <input type="number" min="1" max="${prod ? prod.stock : 999}" value="${row.qty}"
              onchange="onQtyChange(${row.id}, this.value)"
              class="field w-16 text-center border border-stone-200 rounded-xl px-2 py-2 text-sm text-stone-800 bg-stone-50 transition"/>
          </div>
          <div style="width:13%;" class="flex justify-center">${stockHtml}</div>
          <div style="width:15%;" class="flex justify-center">${vencHtml}</div>
          <div style="width:14%;" class="flex items-center justify-end gap-2 pr-2">
            <span class="mono text-sm font-semibold text-stone-700" id="sub-desk-${row.id}">S/ ${subtotal.toFixed(2)}</span>
            <button onclick="removeRow(${row.id})" class="btn-remove w-6 h-6 flex items-center justify-center rounded-lg no-print">
              <i data-lucide="x" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>`;

    container.appendChild(div);
  });

  lucide.createIcons();
}

function onProductChange(id, value) {
  const row = rows.find((r) => r.id === id);
  if (!row) return;
  row.product = value;
  const prod = PRODUCTS[value];
  row.price = prod ? prod[clientType] : 0;
  row.qty = 1;
  renderRows();
  updateSummary();
}

function onQtyChange(id, value) {
  const row = rows.find((r) => r.id === id);
  if (!row) return;
  const prod = PRODUCTS[row.product];
  let qty = parseInt(value) || 1;
  if (qty < 1) qty = 1;
  if (prod && qty > prod.stock) qty = prod.stock;
  row.qty = qty;
  const val = "S/ " + (row.price * qty).toFixed(2);
  ["sub-", "sub-desk-"].forEach(function (prefix) {
    const el = document.getElementById(prefix + id);
    if (el) el.textContent = val;
  });
  updateSummary();
}

function updateRowDisplay(id) {
  const row = rows.find((r) => r.id === id);
  if (!row) return;
  const priceVal = "S/ " + row.price.toFixed(2);
  const subVal = "S/ " + (row.price * row.qty).toFixed(2);
  ["price-", "price-desk-"].forEach(function (prefix) {
    const el = document.getElementById(prefix + id);
    if (el) el.textContent = priceVal;
  });
  ["sub-", "sub-desk-"].forEach(function (prefix) {
    const el = document.getElementById(prefix + id);
    if (el) el.textContent = subVal;
  });
}

function updateSummary() {
  const subtotal = rows.reduce((acc, r) => {
    const prod = PRODUCTS[r.product];
    return acc + (prod ? r.price * r.qty : 0);
  }, 0);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  document.getElementById("summarySubtotal").textContent =
    "S/ " + subtotal.toFixed(2);
  document.getElementById("summaryIgv").textContent = "S/ " + igv.toFixed(2);

  const totalEl = document.getElementById("summaryTotal");
  totalEl.textContent = "S/ " + total.toFixed(2);
  totalEl.classList.remove("total-pop");
  void totalEl.offsetWidth; // reflow
  totalEl.classList.add("total-pop");
}

//  Limpiar
function clearAll() {
  rows = [];
  document.getElementById("clientName").value = "";
  renderRows();
  updateSummary();
  checkClientReady();
}

//  Confirmar venta
function confirmSale() {
  const name = document.getElementById("clientName").value.trim();
  if (!name) {
    document.getElementById("clientName").focus();
    document.getElementById("clientName").style.borderColor = "#f87171";
    setTimeout(
      () => (document.getElementById("clientName").style.borderColor = ""),
      1500,
    );
    return;
  }
  if (!rows.some((r) => PRODUCTS[r.product])) {
    const btn = document.querySelector(".btn-add");
    btn.style.background = "#b91c1c";
    setTimeout(() => (btn.style.background = "#7c5c3a"), 1500);
    return;
  }

  const totalEl = document.getElementById("summaryTotal");
  document.getElementById("modalClient").textContent =
    name + " · " + (clientType === "minorista" ? "Minorista" : "Mayorista");
  document.getElementById("modalTotal").textContent = totalEl.textContent;
  document.getElementById("modalOverlay").classList.remove("hidden");
  lucide.createIcons();
}

function closeModal() {
  document.getElementById("modalOverlay").classList.add("hidden");
  invoiceNum++;
  setInvoiceNum();
  clearAll();
  setClientType("minorista");
}
