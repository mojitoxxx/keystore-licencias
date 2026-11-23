import { License } from "../types/license.js";

/** Criterios de ordenación disponibles en los filtros (cualquier otro valor = aleatorio). */
const SORTERS = {
  "price-asc": (a, b) => a.finalPrice - b.finalPrice,
  "price-desc": (a, b) => b.finalPrice - a.finalPrice,
  discount: (a, b) => b.discount - a.discount,
};

/**
 * Controller: selecciona y ordena las licencias y delega el pintado en cada License.
 */
export class LicenseController {
  #licenses;

  /**
   * @param {Object[]} licensesData Objetos de licencia sin procesar (p. ej. leídos del JSON).
   */
  constructor(licensesData) {
    this.#licenses = licensesData.map((data) => new License(data));
  }

  /** Número total de licencias. */
  get count() {
    return this.#licenses.length;
  }

  /** Categorías distintas, ordenadas alfabéticamente. */
  getCategories() {
    const categories = new Set(this.#licenses.map((license) => license.category));
    return [...categories].sort((a, b) => a.localeCompare(b, "es"));
  }

  /** Pinta las `count` primeras licencias destacadas. */
  renderFeatured(count, parent) {
    const featured = this.#licenses.filter((license) => license.featured);
    this.#renderList(featured, count, parent);
  }

  /** Pinta las `count` primeras licencias con descuento, de mayor a menor descuento. */
  renderOffers(count, parent) {
    const offers = this.#licenses
      .filter((license) => license.hasDiscount)
      .sort(SORTERS.discount);
    this.#renderList(offers, count, parent);
  }

  /** Pinta la última versión de cada software, hasta un máximo de `count` licencias. */
  renderLatest(count, parent) {
    const latestBySoftware = new Map();

    for (const license of this.#licenses) {
      const current = latestBySoftware.get(license.software);
      if (!current || compareVersions(license.version, current.version) > 0) {
        latestBySoftware.set(license.software, license);
      }
    }

    this.#renderList([...latestBySoftware.values()], count, parent);
  }

  /** Pinta `count` licencias en orden aleatorio. */
  renderAll(count, parent) {
    this.#renderList(shuffle(this.#licenses), count, parent);
  }

  /**
   * Pinta las licencias que cumplen los filtros y devuelve cuántas se han pintado.
   * @param {Object} filters
   * @param {string} [filters.search]      Texto a buscar en el nombre del software.
   * @param {string} [filters.category]    Categoría exacta ("" = todas).
   * @param {boolean} [filters.onlyOffers] Solo licencias con descuento.
   * @param {string} [filters.sortBy]      Clave de SORTERS o "random".
   * @param {HTMLElement} parent
   * @returns {number}
   */
  renderFiltered({ search = "", category = "", onlyOffers = false, sortBy = "random" }, parent) {
    const term = search.trim().toLowerCase();
    const matches = this.#licenses.filter(
      (license) =>
        (!term || license.software.toLowerCase().includes(term)) &&
        (!category || license.category === category) &&
        (!onlyOffers || license.hasDiscount)
    );

    const compare = SORTERS[sortBy];
    const sorted = compare ? matches.sort(compare) : shuffle(matches);
    this.#renderList(sorted, sorted.length, parent);
    return sorted.length;
  }

  #renderList(licenses, count, parent) {
    licenses.slice(0, count).forEach((license) => license.render(parent));
  }
}

/**
 * Compara numéricamente dos versiones separadas por puntos ("2024.3" > "2024.1", "10.8" > "10.7").
 * @returns {number} Positivo si a > b, negativo si a < b y 0 si son iguales.
 */
function compareVersions(a, b) {
  const partsA = a.split(".").map(Number);
  const partsB = b.split(".").map(Number);
  const length = Math.max(partsA.length, partsB.length);

  for (let i = 0; i < length; i++) {
    const difference = (partsA[i] ?? 0) - (partsB[i] ?? 0);
    if (difference !== 0) {
      return difference;
    }
  }
  return 0;
}

/** Devuelve una copia desordenada del array (algoritmo de Fisher-Yates). */
function shuffle(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
