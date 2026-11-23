import { LicenseController } from "./controllers/licenseController.js";
import { PURCHASE_EVENT } from "./types/license.js";

const DATA_URL = "./data/licenses.json";
const PURCHASES_STORAGE_KEY = "keystore.purchases";
const PREVIEW_COUNT = 3;

/**
 * App: carga los datos y decide dónde y en qué orden se pinta cada sección.
 */
class App {
  #root;
  #controller;
  #purchases = [];
  #purchasesList;

  /**
   * @param {HTMLElement} root Elemento donde se pintan las secciones.
   */
  constructor(root) {
    this.#root = root;
  }

  async start() {
    try {
      const licensesData = await this.#loadLicenses();
      this.#controller = new LicenseController(licensesData);
      this.#purchases = loadPurchases();
      this.#renderSections();
      document.addEventListener(PURCHASE_EVENT, (event) => this.#addPurchase(event.detail));
    } catch (error) {
      console.error(error);
      this.#root.textContent = "No se pudieron cargar las licencias. Inténtalo más tarde.";
    }
  }

  async #loadLicenses() {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Error al cargar ${DATA_URL}: ${response.status}`);
    }
    return response.json();
  }

  #renderSections() {
    const controller = this.#controller;

    // El orden de este array es el orden en que aparecen las secciones en la página.
    const sections = [
      {
        id: "destacados",
        title: "Destacados",
        render: (section) => controller.renderFeatured(PREVIEW_COUNT, createGrid(section)),
      },
      {
        id: "ofertas",
        title: "Mejores ofertas",
        render: (section) => controller.renderOffers(PREVIEW_COUNT, createGrid(section)),
      },
      {
        id: "novedades",
        title: "Últimas versiones",
        render: (section) => controller.renderLatest(PREVIEW_COUNT, createGrid(section)),
      },
      {
        id: "catalogo",
        title: "Todas las licencias",
        render: (section) => this.#renderCatalog(section),
      },
      {
        id: "mis-licencias",
        title: "Mis licencias",
        render: (section) => this.#renderPurchases(section),
      },
    ];

    for (const { id, title, render } of sections) {
      render(this.#createSection(id, title));
    }
  }

  #createSection(id, title) {
    const section = createElement("section", "section");
    section.id = id;
    section.append(createElement("h2", "section__title", title));
    this.#root.append(section);
    return section;
  }

  /** Sección con todas las licencias en orden aleatorio y un formulario de filtros. */
  #renderCatalog(section) {
    const filtersFragment = document.querySelector("#filters-template").content.cloneNode(true);
    const form = filtersFragment.querySelector(".filters");
    const summary = filtersFragment.querySelector(".filters__summary");
    const clearButton = filtersFragment.querySelector(".filters__clear");

    for (const category of this.#controller.getCategories()) {
      form.elements.category.append(new Option(category, category));
    }
    section.append(filtersFragment);

    const grid = createGrid(section);
    const total = this.#controller.count;
    this.#controller.renderAll(total, grid);
    summary.textContent = formatSummary(total, total);

    const applyFilters = () => {
      grid.replaceChildren();
      const shown = this.#controller.renderFiltered(readFilters(form), grid);
      summary.textContent = formatSummary(shown, total);
    };

    form.addEventListener("input", applyFilters);
    form.addEventListener("submit", (event) => event.preventDefault());
    clearButton.addEventListener("click", () => {
      form.reset();
      applyFilters();
    });
  }

  /** Sección con el historial de compras guardado en el navegador. */
  #renderPurchases(section) {
    this.#purchasesList = createElement("ul", "purchases");
    section.append(this.#purchasesList);
    this.#updatePurchasesList();
  }

  #addPurchase(license) {
    const alreadyPurchased = this.#purchases.some((purchase) => purchase.id === license.id);
    if (alreadyPurchased) {
      return;
    }

    const { id, software, version, key } = license;
    this.#purchases.push({ id, software, version, key });
    savePurchases(this.#purchases);
    this.#updatePurchasesList();
  }

  #updatePurchasesList() {
    if (this.#purchases.length === 0) {
      const emptyMessage = createElement("li", "purchases__empty", "Aún no has comprado ninguna licencia.");
      this.#purchasesList.replaceChildren(emptyMessage);
      return;
    }

    const items = this.#purchases.map(({ software, version, key }) => {
      const item = createElement("li", "purchases__item");
      item.append(
        createElement("span", "purchases__name", `${software} ${version}`),
        createElement("code", "purchases__key", key)
      );
      return item;
    });
    this.#purchasesList.replaceChildren(...items);
  }
}

/** Lee los valores del formulario de filtros. */
function readFilters(form) {
  const { search, category, sortBy, onlyOffers } = form.elements;
  return {
    search: search.value,
    category: category.value,
    sortBy: sortBy.value,
    onlyOffers: onlyOffers.checked,
  };
}

function formatSummary(shown, total) {
  return shown === 0
    ? "Ninguna licencia coincide con los filtros."
    : `Mostrando ${shown} de ${total} licencias`;
}

/** Recupera las compras guardadas (el almacenamiento puede no estar disponible). */
function loadPurchases() {
  try {
    return JSON.parse(localStorage.getItem(PURCHASES_STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function savePurchases(purchases) {
  try {
    localStorage.setItem(PURCHASES_STORAGE_KEY, JSON.stringify(purchases));
  } catch {
    // Sin almacenamiento las compras solo duran mientras la página está abierta.
  }
}

function createGrid(section) {
  const grid = createElement("div", "product-grid");
  section.append(grid);
  return grid;
}

function createElement(tagName, className, text = "") {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}

const app = new App(document.querySelector("#app"));
app.start();
