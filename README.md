# Ankur Jaiswal — IT Design Enthusiast Portfolio

A high-end, immersive digital portfolio website built with cutting-edge visual layouts, micro-animations, and 3D WebGL particle effects. Designed to replicate the exact structure, fluidity, and aesthetic details of `aftabiq.com`, custom-tailored with brand content, professional metrics, and case studies for Ankur Jaiswal.

---

## 🚀 Tech Stack & Core Libraries

This site is engineered using a clean, light framework stack to ensure optimal speed, responsive scaling, and smooth visual rendering:

*   **Structure**: Semantic HTML5 markup optimized for accessibility (A11y) and SEO.
*   **Styling**: Vanilla CSS3 implementing a structured fluid design system, radial atmospheric overlays, texture grids, and customized keyframe transitions.
*   **Smooth Scroll**: [Lenis (by Studio Freight)](https://github.com/darkroomengineering/lenis) for physics-based inertial scrolling.
*   **Motion & Scroll Scrub**: [GSAP (GreenSock Animation Platform)](https://greensock.com/gsap/) & [ScrollTrigger](https://greensock.com/scrolltrigger/) for staggered reveals, metric count-ups, timeline tracking, and text transitions.
*   **3D Atmosphere**: [Three.js](https://threejs.org/) rendering a responsive WebGL point-cloud sine wave reacting to mouse coordinates.
*   **Typography**: Google Fonts pairing:
    *   **Inter** (modern geometric sans-serif for main headings & body)
    *   **Playfair Display** (classic high-contrast italic serif for editorial highlights)
    *   **JetBrains Mono** (clean monospace for labels, counters, and technical tags)

---

## 🎨 Interactive Features

1.  **Staggered Preloader Curtain**: Staggers top and bottom panels open upon reaching 100%, cycling keywords (`STRATEGY`, `DESIGN`, `AUTOMATION`, `PRODUCTS`) synced with a loading progress track.
2.  **Magnetic Elements**: Action buttons pull slightly toward the user’s cursor using physics-based offset tracking.
3.  **Dynamic Custom Cursor**: Trailing cursor ring with dynamic mix-blend difference mode that expands and adapts (displaying `VIEW` or `PLAY` labels) depending on hovered content metadata.
4.  **Spotlight Navbar**: Translucent navigation header tracking the user’s cursor coordinates with a radial lighting spotlight effect.
5.  **Interactive Expertise Accordions**:
    *   *Desktop*: Custom list rows with sticky visual previews on hover.
    *   *Mobile*: Gracefully refactors into tap-to-expand accordion panels.
6.  **Timeline Progress**: An automated line that fills up relative to your scroll-depth to guide the reader through the project process.
7.  **Testimonials Slider**: Infinite looping marquee slider with support for drag/swipe gestures, pagination, progress indicator, and keyboard controls.
8.  **Framed Showcase Screenshot Containers**: Excludes app screens (like *Founder Signal MVP* or *Swapiki Dashboard*) from scroll parallax shifting, framing them in a dark viewport bezel container to prevent text clipping.
9.  **Custom Selector Dropdown**: Fully customized custom dropdown inputs styled to support tab indexing, focus traps, and keyboard navigation.

---

## 📂 Project Structure

```bash
Ankur Jaiswal/
├── Images/
│   ├── founder.jpg          # Enhanced AI Executive Headshot
│   ├── showcase-1.jpg       # Founder Signal MVP screenshot
│   ├── showcase-2.jpg       # Workflow Automation node graph
│   ├── showcase-3.png       # Swapiki App Dashboard screenshot
│   └── showcase-4.jpg       # IT Strategy Consulting illustration
├── index.html               # Main landing page markup
├── index.css                # Fluid typography tokens & visual rules
├── index.js                 # Lenis ticker, Three.js, and GSAP timelines
└── README.md                # Project documentation
```

---

## 💻 Local Execution

To run the project locally, serve the directory via any standard HTTP server to avoid CORS warnings from CDNs or local image file pathways:

### Option A: Node.js (Recommended)
If you have Node.js installed, start the zero-config server directly:
```bash
npx http-server -p 8000
```
Then open `http://127.0.0.1:8000` in your web browser.

### Option B: Python
If you have Python installed, run:
```bash
python -m http.server 8000
```
Then open `http://127.0.0.1:8000` in your web browser.

---

## 📝 Next Steps (Integration Roadmap)
*   **Contact Form Backend**: In next phase, connect the simulated submission form to a mail endpoint (such as Web3Forms, Formspree, or a customized serverless function handler).
*   **Analytics Tracking**: Connect custom analytics tags to monitor clicks and visits.
