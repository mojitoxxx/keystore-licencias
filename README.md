# KeyStore · Licencias de software

Web de venta de licencias de software construida en JavaScript vanilla (módulos ES) siguiendo la arquitectura **App → Controller → Type**.

## Estructura

```
├── index.html
├── css/styles.css
├── data/licenses.json              # 33 licencias, varias versiones por software
└── js/
    ├── main.js                     # Punto de entrada
    ├── App.js                      # App
    ├── controllers/
    │   └── LicenseController.js    # Controller
    └── types/
        └── License.js              # Type
```

| Capa | Responsabilidad |
| --- | --- |
| **`License`** (Type) | Datos de la licencia (`id`, `software`, `version`, `price`, `key`, `featured`, `discount`). `render(parent)` pinta la tarjeta del producto y `buy()` muestra la clave en una ventana modal (`<dialog>`). |
| **`LicenseController`** | Convierte el JSON en instancias de `License` y decide qué mostrar: `renderFeatured(count, parent)`, `renderOffers(count, parent)` (ordenadas por descuento), `renderLatest(count, parent)` (última versión de cada software) y `renderAll(count, parent)` (orden aleatorio). |
| **`App`** | Carga `licenses.json` y define dónde y en qué orden se renderiza cada sección. |

## Convenciones

- Nombres del código (clases, métodos, variables) en inglés; comentarios y textos de la interfaz en español.
- Clases en `PascalCase`, métodos y variables en `camelCase` (convención de JavaScript), constantes en `UPPER_SNAKE_CASE`.
- Campos privados (`#`) para el estado interno de `App` y `LicenseController`.
- El DOM se construye con `createElement` / `textContent` (sin `innerHTML`).

## Ejecutar en local

Al usar `fetch` y módulos ES, hay que servir los archivos por HTTP (no abrir `index.html` directamente):

```bash
npx serve .
# o
python -m http.server 8000
```

Las claves de licencia son ficticias.
