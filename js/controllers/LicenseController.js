import { License } from "../types/License.js";

/**
 * Controller: selects and orders licenses, then delegates rendering to each License.
 */
export class LicenseController {
  #licenses;

  /**
   * @param {Object[]} licensesData Raw license objects (e.g. parsed from JSON).
   */
  constructor(licensesData) {
    this.#licenses = licensesData.map((data) => new License(data));
  }

  /** Renders the first `count` featured licenses. */
  renderFeatured(count, parent) {
    const featured = this.#licenses.filter((license) => license.featured);
    this.#renderList(featured, count, parent);
  }

  /** Renders the first `count` discounted licenses, highest discount first. */
  renderOffers(count, parent) {
    const offers = this.#licenses
      .filter((license) => license.hasDiscount)
      .sort((a, b) => b.discount - a.discount);
    this.#renderList(offers, count, parent);
  }

  /** Renders the latest version of each software, up to `count` licenses. */
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

  /** Renders `count` licenses in random order. */
  renderAll(count, parent) {
    this.#renderList(shuffle(this.#licenses), count, parent);
  }

  #renderList(licenses, count, parent) {
    licenses.slice(0, count).forEach((license) => license.render(parent));
  }
}

/**
 * Compares two dotted version strings numerically ("2024.3" > "2024.1", "10.8" > "10.7").
 * @returns {number} Positive if a > b, negative if a < b, 0 if equal.
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

/** Returns a shuffled copy of the array (Fisher–Yates). */
function shuffle(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
