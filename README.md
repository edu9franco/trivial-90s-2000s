# Trivial 90s/2000s

App tipo Trivial Pursuit con tablero clásico de quesitos y **102 preguntas** (17 por categoría) sobre cultura, historia, ciencia y deportes de los años **1990–2009**.

- **Jugadores:** Guille, Ana, Edu (con avatares personalizados)
- **Mecánica:** tablero circular con 6 categorías oficiales, 4 opciones por pregunta, ganas un quesito por categoría, juntas los 6 + final → ganas
- **Stack:** React 18 + Vite, CSS puro mobile-first, sin dependencias pesadas
- **Estética:** "Vintage Y2K" — tipografía Bungee + Fraunces + DM Sans, paleta cartón/pergamino con los 6 colores oficiales del Trivial, sombras duras de packaging 90s, microanimaciones tipo flip de carta

## Cómo correrlo en local

```bash
npm install
npm run dev
```

Abre el navegador en la URL que te dé Vite (normalmente http://localhost:5173).

## Build de producción

```bash
npm run build      # genera /dist
npm run preview    # previsualiza el build localmente
```

## Avatares de jugadores

Las fotos se sirven desde `public/players/`. Los nombres de archivo deben ser exactos:

- `public/players/guille.jpeg`
- `public/players/ana.jpeg`
- `public/players/edu.jpeg`

Si una imagen falta o falla al cargar, la app muestra automáticamente un círculo de color como fallback. Para cambiar las fotos, solo reemplaza estos archivos.

## Cómo añadir / cambiar preguntas

Las preguntas viven en `src/data/questions.js`. Cada pregunta tiene este formato:

```js
{
  category: 'geografia',          // geografia | historia | arte | ciencia | entretenimiento | deportes
  question: '¿Cuál es la capital de Australia?',
  options: ['Sídney', 'Canberra', 'Melbourne', 'Perth'],
  correct: 1                       // índice 0-based de la respuesta correcta
}
```

Añade/quita preguntas en el array `questions` y la app las cogerá automáticamente.

## Categorías y colores oficiales

| Categoría        | Color    |
|------------------|----------|
| Geografía        | Azul     |
| Entretenimiento  | Rosa     |
| Historia         | Amarillo |
| Arte y Literatura| Marrón   |
| Ciencia y Naturaleza | Verde |
| Deportes y Ocio  | Naranja  |

## Reglas del juego

1. Cada jugador tira el dado en su turno y avanza por el tablero exterior.
2. La casilla donde caes determina la categoría de la pregunta. Tienes 4 opciones.
3. Si **aciertas**, repites turno.
4. Si caes en una **casilla quesito** (las 6 grandes con el icono de la categoría) y aciertas, ganas el quesito de esa categoría.
5. Cuando tienes los **6 quesitos**, en tu siguiente caída en cualquier HQ los demás eligen la categoría de la pregunta final.
6. Si aciertas la final → **ganas la partida**. Si fallas, vuelve a intentarlo en tu próximo turno.

## Deploy en GitHub + Vercel

### 1. Subir a GitHub

```bash
cd "Trivial App"
git init
git add .
git commit -m "Trivial 90s/2000s — versión inicial"
git branch -M main
git remote add origin git@github.com:TU_USUARIO/trivial-90s-2000s.git
git push -u origin main
```

### 2. Deploy en Vercel

1. Entra en https://vercel.com → **Add New → Project**.
2. Importa el repo de GitHub que acabas de crear.
3. Vercel detecta Vite automáticamente. No hay que tocar nada (el `vercel.json` ya está incluido).
4. Pulsa **Deploy**.

En 30 segundos tendrás una URL pública tipo `https://trivial-90s-2000s.vercel.app`.

## Estructura del proyecto

```
Trivial App/
├── public/
│   ├── favicon.svg
│   └── players/
│       ├── guille.jpeg
│       ├── ana.jpeg
│       └── edu.jpeg
├── src/
│   ├── main.jsx                  ← entrada React
│   ├── App.jsx                   ← lógica del juego (turnos, dado, victoria)
│   ├── components/
│   │   ├── Board.jsx             ← tablero circular SVG
│   │   ├── PlayerHUD.jsx         ← cards de los 3 jugadores con quesitos
│   │   ├── Dice.jsx              ← dado animado
│   │   ├── QuestionModal.jsx     ← modal pregunta + 4 opciones
│   │   ├── CategoryPicker.jsx    ← elegir categoría final
│   │   └── Confetti.jsx          ← animación victoria
│   ├── data/
│   │   └── questions.js          ← banco de 102 preguntas
│   └── styles/
│       └── index.css             ← sistema de diseño "Vintage Y2K"
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
└── README.md
```
