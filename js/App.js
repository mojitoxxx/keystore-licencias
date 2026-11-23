import { LicenseController } from "./controllers/LicenseController.js";

const DATA_URL = "./data/licenses.json";

/**
 * App: carga los datos y decide dónde y en qué orden se pinta cada sección.
 */
export class App {
  #root;
  #controller;

  /**
   * @param {HTMLElement} root Elemento donde se pintan las secciones de productos.
   */
  constructor(root) {
    this.#root = root;
  }

  async start() {
    try {
      const licensesData = await this.#loadLicenses();
      this.#controller = new LicenseController(licensesData);
      this.#renderSections();
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
    // El orden de este array es el orden en que aparecen las secciones en la página.
    const sections = [
      { title: "Destacados", count: 4, render: (count, parent) => this.#controller.renderFeatured(count, parent) },
      { title: "Ofertas", count: 8, render: (count, parent) => this.#controller.renderOffers(count, parent) },
      { title: "Últimas versiones", count: 8, render: (count, parent) => this.#controller.renderLatest(count, parent) },
      { title: "Todas las licencias", count: 12, render: (count, parent) => this.#controller.renderAll(count, parent) },
    ];

    for (const { title, count, render } of sections) {
      const grid = this.#createSection(title);
      render(count, grid);
    }
  }

  /** Crea una sección con su título y devuelve el contenedor donde van las tarjetas. */
  #createSection(title) {
    const section = document.createElement("section");
    section.className = "products";

    const heading = document.createElement("h2");
    heading.className = "products__title";
    heading.textContent = title;

    const grid = document.createElement("div");
    grid.className = "products__grid";

    section.append(heading, grid);
    this.#root.append(section);
    return grid;
  }
}
