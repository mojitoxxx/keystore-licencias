/** Evento que se lanza en `document` cuando se compra una licencia. */
export const PURCHASE_EVENT = "license:purchase";

/**
 * Type: una licencia de software a la venta en la tienda.
 */
export class License {
  /**
   * @param {Object} data
   * @param {number} data.id
   * @param {string} data.software
   * @param {string} data.version
   * @param {number} data.price         Precio base en euros.
   * @param {string} data.key           Clave de licencia que se muestra tras la compra.
   * @param {boolean} data.featured
   * @param {number} data.discount      Porcentaje de descuento (0-100).
   * @param {string} [data.category]
   * @param {string} [data.platform]
   * @param {string} [data.description]
   * @param {string} [data.image]       Ruta del icono del producto.
   */
  constructor({
    id,
    software,
    version,
    price,
    key,
    featured = false,
    discount = 0,
    category = "",
    platform = "",
    description = "",
    image = "",
  }) {
    this.id = id;
    this.software = software;
    this.version = version;
    this.price = price;
    this.key = key;
    this.featured = featured;
    this.discount = discount;
    this.category = category;
    this.platform = platform;
    this.description = description;
    this.image = image;
  }

  get hasDiscount() {
    return this.discount > 0;
  }

  get finalPrice() {
    return this.price * (1 - this.discount / 100);
  }

  get savings() {
    return this.price - this.finalPrice;
  }

  /**
   * Pinta la licencia como tarjeta de producto dentro del elemento padre.
   * @param {HTMLElement} parent
   */
  render(parent) {
    const card = createElement("article", "license-card");
    card.append(this.#createMedia(), this.#createBody());
    parent.append(card);
  }

  /**
   * Simula la compra, muestra la clave en una ventana modal y avisa a la App.
   */
  buy() {
    const dialog = createElement("dialog", "key-dialog");
    const heading = createElement("h2", "key-dialog__title", "¡Gracias por tu compra!");
    const text = createElement("p", "key-dialog__text", `Tu clave para ${this.software} ${this.version}:`);
    const key = createElement("code", "key-dialog__key", this.key);

    const copyButton = createButton("Copiar clave", "button button--secondary");
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(this.key);
        copyButton.textContent = "¡Copiada!";
      } catch {
        copyButton.textContent = "No se pudo copiar";
      }
    });

    const closeButton = createButton("Cerrar", "button");
    closeButton.addEventListener("click", () => dialog.close());

    const actions = createElement("div", "key-dialog__actions");
    actions.append(copyButton, closeButton);

    dialog.append(heading, text, key, actions);
    // Al cerrar la ventana se elimina del DOM para no acumular diálogos.
    dialog.addEventListener("close", () => dialog.remove());
    document.body.append(dialog);
    dialog.showModal();

    document.dispatchEvent(new CustomEvent(PURCHASE_EVENT, { detail: this }));
  }

  /** Zona superior de la tarjeta: icono y etiquetas de destacado / descuento. */
  #createMedia() {
    const media = createElement("div", "license-card__media");

    if (this.image) {
      const image = createElement("img", "license-card__image");
      image.src = this.image;
      image.alt = "";
      media.append(image);
    }
    if (this.featured) {
      media.append(createElement("span", "badge badge--featured", "Destacado"));
    }
    if (this.hasDiscount) {
      media.append(createElement("span", "badge badge--discount", `-${this.discount}%`));
    }
    return media;
  }

  /** Cuerpo de la tarjeta: datos del producto, precios y botón de compra. */
  #createBody() {
    const body = createElement("div", "license-card__body");
    const category = createElement("p", "license-card__category", this.category);
    const title = createElement("h3", "license-card__title", this.software);
    const details = createElement(
      "p",
      "license-card__details",
      [`Versión ${this.version}`, this.platform].filter(Boolean).join(" · ")
    );
    const description = createElement("p", "license-card__description", this.description);

    const buyButton = createButton("Comprar", "button license-card__buy");
    buyButton.addEventListener("click", () => this.buy());

    body.append(category, title, details, description, this.#createPrices(), buyButton);
    return body;
  }

  #createPrices() {
    const prices = createElement("div", "license-card__prices");

    if (this.hasDiscount) {
      prices.append(createElement("del", "license-card__old-price", formatPrice(this.price)));
    }
    prices.append(createElement("strong", "license-card__price", formatPrice(this.finalPrice)));

    if (this.hasDiscount) {
      prices.append(createElement("span", "license-card__savings", `Ahorras ${formatPrice(this.savings)}`));
    }
    return prices;
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

function createButton(text, className) {
  const button = createElement("button", className, text);
  button.type = "button";
  return button;
}
