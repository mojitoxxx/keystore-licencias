# KeyStore · Licencias de software

Web de venta de licencias de software en JavaScript vanilla (módulos ES), siguiendo la arquitectura **App → Controller → Type**.

## Estructura de carpetas

```
├── index.html
├── style.css
├── data/
│   └── licenses.json               # 33 licencias de 14 programas, con varias versiones de cada uno
├── resources/                      # Logo e iconos por categoría (SVG)
└── scripts/
    ├── app.js                      # App
    ├── controllers/
    │   └── licenseController.js    # Controller
    └── types/
        └── license.js              # Type
```

## Arquitectura

| Capa | Responsabilidad |
| --- | --- |
| **`License`** (Type) | Datos de la licencia (`id`, `software`, `version`, `price`, `key`, `featured`, `discount`, y además `category`, `platform`, `description`, `image`). `render(parent)` pinta la tarjeta del producto y `buy()` muestra la clave en una ventana modal (`<dialog>`). |
| **`LicenseController`** | Convierte el JSON en instancias de `License` y decide qué mostrar: `renderFeatured(count, parent)`, `renderOffers(count, parent)` (ordenadas por descuento), `renderLatest(count, parent)` (última versión de cada software), `renderAll(count, parent)` (orden aleatorio) y `renderFiltered(filters, parent)`. |
| **`App`** | Carga `licenses.json` y define dónde y en qué orden se pinta cada sección: Destacados (3), Mejores ofertas (3), Últimas versiones (3), Todas las licencias (todas, con filtros) y Mis licencias. |

## Extras

- **Filtros** en «Todas las licencias»: búsqueda por nombre, categoría, solo ofertas y ordenación (aleatorio, precio, descuento), con contador de resultados.
- **Más datos e imágenes**: categoría, plataforma, descripción e icono por producto, además del ahorro en euros de cada oferta.
- **Copiar clave** al portapapeles desde la ventana de compra.
- **Mis licencias**: historial de compras guardado en el navegador (`localStorage`).
- Navegación por secciones, diseño adaptable a móvil y respeto de `prefers-reduced-motion`.
- CSS organizado por bloques (variables, base, layout, componentes, accesibilidad) con nombres BEM.

## Convenciones

- Nombres del código (clases, métodos, variables) en inglés; comentarios y textos de la interfaz en español.
- Clases en `PascalCase`, métodos y variables en `camelCase`, constantes en `UPPER_SNAKE_CASE` y archivos en `camelCase`.
- Campos y métodos privados (`#`) para el estado interno.
- El DOM se construye con `createElement` / `textContent` (sin `innerHTML`).
- La compra se comunica a la App con un evento (`license:purchase`), sin acoplar el Type a la App.

## Ejecutar en local

Al usar `fetch` y módulos ES hay que servir los archivos por HTTP (no abrir `index.html` directamente):

```bash
python -m http.server 8000
```

Las claves de licencia son ficticias.
