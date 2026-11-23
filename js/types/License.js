/**
 * Type: una licencia de software a la venta en la tienda.
 */
export class License {
  /**
   * @param {Object} data
   * @param {number} data.id
   * @param {string} data.software
   * @param {string} data.version
   * @param {number} data.price     Precio base en euros.
   * @param {string} data.key       Clave de licencia que se muestra tras la compra.
   * @param {boolean} data.featured
   * @param {number} data.discount  Porcentaje de descuento (0-100).
   */
  constructor({ id, software, version, price, key, featured = false, discount = 0 }) {
    this.id = id;
    this.software = software;
    this.version = version;
    this.price = price;
    this.key = key;
    this.featured = featured;
    this.discount = discount;
  }

  get hasDiscount() {
    return this.discount > 0;
  }

  get finalPrice() {
    return this.price * (1 - this.discount / 100);
  }

  /**
   * Pinta la licencia como tarjeta de producto dentro del elemento padre.
   * @param {HTMLElement} parent
   */
  render(parent) {
    const card = createElement("article", "license-card");

    if (this.featured) {
      card.append(createElement("span", "badge badge--featured", "Destacado"));
    }
    if (this.hasDiscount) {
      card.append(createElement("span", "badge badge--discount", `-${this.discount}%`));
    }

    const title = createElement("h3", "license-card__title", this.software);
    const version = createElement("p", "license-card__version", `Versión ${this.version}`);
    const prices = createElement("p", "license-card__prices");

    if (this.hasDiscount) {
      prices.append(createElement("del", "license-card__old-price", formatPrice(this.price)));
    }
    prices.append(createElement("strong", "license-card__price", formatPrice(this.finalPrice)));

    const buyButton = createElement("button", "license-card__buy", "Comprar");
    buyButton.type = "button";
    buyButton.addEventListener("click", () => this.buy());

    card.append(title, version, prices, buyButton);
    parent.append(card);
  }

  /**
   * Simula la compra y muestra la clave de la licencia en una ventana modal.
   */
  buy() {
    const dialog = createElement("dialog", "key-dialog");
    const heading = createElement("h2", "key-dialog__title", "¡Gracias por tu compra!");
    const description = createElement(
      "p",
      "key-dialog__text",
      `Tu clave para ${this.software} ${this.version}:`
    );
    const key = createElement("code", "key-dialog__key", this.key);
    const closeButton = createElement("button", "key-dialog__close", "Cerrar");
    closeButton.type = "button";
    closeButton.addEventListener("click", () => dialog.close());

    dialog.append(heading, description, key, closeButton);
    // Al cerrar la ventana se elimina del DOM para no acumular diálogos.
    dialog.addEventListener("close", () => dialog.remove());
    document.body.append(dialog);
    dialog.showModal();
  }
}

const priceFormatter = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

/** Formatea un importe como precio en euros (p. ej. "110,49 €"). */
function formatPrice(amount) {
  return priceFormatter.format(amount);
}

/** Crea un elemento HTML con su clase y texto. */
function createElement(tagName, className, text = "") {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}
