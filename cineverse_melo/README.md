# 🎬 Cineverse

A modern, fully responsive movie ticketing web application built with vanilla HTML, CSS, and JavaScript. Cineverse lets users browse movies, select showtimes, pick seats, and complete bookings — all through a sleek, cinema-inspired dark UI.

---

## ✨ Features

- **Movie Discovery** — Browse a curated grid of currently showing and upcoming films with genre filters
- **Movie Detail Pages** — Full synopsis, cast, ratings, and a sticky booking CTA
- **Theater & Showtime Selection** — Filter by city and date; browse showtimes across multiple theaters
- **Interactive Seat Picker** — Visual seat map with category tiers (Premium, Standard, Economy)
- **Payment Flow** — Card, UPI, and net banking payment options with a live card preview
- **Booking Confirmation** — Animated confirmation screen with a downloadable ticket
- **User Profile** — View booking history and manage account settings
- **Fully Responsive** — Optimized for mobile (375px+), tablet, and desktop screens

---

## 📁 Project Structure

```
cineverse/
├── index.html          # Home page — hero banner + movie grid
├── movie.html          # Movie detail page
├── booking.html        # Theater & showtime selection
├── seats.html          # Seat selection
├── payment.html        # Payment form
├── confirmation.html   # Booking confirmation
├── profile.html        # User profile & booking history
│
├── base.css            # CSS variables, resets, shared utilities
├── header-footer.css   # Navigation bar and site footer
├── home.css            # Home page styles
├── movie.css           # Movie detail page styles
├── booking.css         # Booking/theater page styles
├── seats.css           # Seat map styles
├── payment.css         # Payment form styles
├── confirmation.css    # Confirmation page styles
├── profile.css         # Profile page styles
│
├── layout.js           # Shared layout: header scroll, hamburger menu, dropdowns
├── home.js             # Hero carousel, movie grid, filters
├── movie.js            # Movie detail, sticky CTA, cast rendering
├── booking.js          # City/date filters, showtime selection
├── seats.js            # Interactive seat map logic
├── payment.js          # Payment tabs, card preview, form handling
├── confirmation.js     # Confirmation animation, ticket display
├── profile.js          # Profile tabs, booking history
├── utils.js            # Shared helpers (formatting, localStorage, etc.)
│
└── data/
    ├── movies.json     # Movie catalog
    ├── theaters.json   # Theater listings
    └── cities.json     # City data
```

---

## 🚀 Getting Started

No build tools or dependencies required. Just open the project in a browser.

**Option 1 — Open directly:**
```
Open index.html in any modern browser
```

**Option 2 — Local server (recommended to avoid CORS issues with JSON data):**
```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# Then visit http://localhost:8000
```

---

## 📱 Responsive Design

Cineverse is fully responsive across all screen sizes:

| Breakpoint | Target |
|---|---|
| 960px | Tablet landscape — single-column seat layout |
| 900px | Tablet — hamburger menu appears, footer reflows |
| 768px | Tablet portrait — stacked layouts across most pages |
| 600px | Large phone — confirmation page adjustments |
| 480px | Small phone (iPhone SE etc.) — compact grids, hidden search bar |

All pages include the `<meta name="viewport">` tag and use flexbox/CSS Grid for fluid layouts.

---

## 🎨 Design System

The UI is built on a consistent design token system defined in `base.css`:

- **Colors** — Deep void background (`#050508`), gold accent (`#f0c040`), layered surface tones
- **Typography** — Display font for titles, serif for body text, sans-serif for UI
- **Spacing** — 8-point scale (`--space-1` through `--space-10`)
- **Radius** — Consistent border radius tokens (`--r-sm`, `--r-md`, `--r-lg`, `--r-xl`, `--r-pill`)
- **Shadows & Animations** — Smooth transitions with custom easing curves

---

## 🛠️ Tech Stack

- **HTML5** — Semantic markup
- **CSS3** — Custom properties, Flexbox, CSS Grid, `@media` queries, `clamp()` for fluid type
- **Vanilla JavaScript** — No frameworks or libraries
- **JSON** — Static data files for movies, theaters, and cities

---

## 🗺️ User Flow

```
Home (index.html)
  └─▶ Movie Detail (movie.html)
        └─▶ Select Theater & Showtime (booking.html)
              └─▶ Pick Seats (seats.html)
                    └─▶ Payment (payment.html)
                          └─▶ Confirmation (confirmation.html)
```

---

## 📄 License

This project is for educational and portfolio purposes.
