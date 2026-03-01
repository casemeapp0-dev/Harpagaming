# Harpa Gaming - WordPress + Elementor Migration Guide

This guide provides a 1:1 mapping from the exported static HTML/CSS to the **Hello Elementor** theme using **Elementor Pro**.

## 1. Global Setup
Before building sections, configure the **Site Settings** in Elementor:

### Color Palette (Global Colors):
- **Primary**: `#D1FF19` (Volt Green)
- **Background**: `#050505` (Pure Dark)
- **Surface**: `#121212` (Elevated blocks)
- **Text**: `#FFFFFF` (White)
- **Muted**: `#A0A0A0` (Grey typography)

### Typography (Global Fonts):
- **Headings (Display)**: `Chakra Petch`, Weight: 700 (Style: Italic where needed)
- **Body/Mono**: `JetBrains Mono`, Weight: 400

---

## 2. Section Mapping

### [GLOBAL] Header / Navbar
- **Elementor Widget**: Theme Builder > Header
- **Structure**: 2-Column Container (Left: Logo + Menu, Right: Search + Bag Icons)
- **Mapping**:
  - Logo: Heading widget (Content: "HARPA GAMING", Style: Italic, 20px)
  - Menu: WordPress Menu widget (Font: JetBrains Mono, Size: 10px, Uppercase)

### [BLOCK] Hero_3D_Welcome
- **Elementor Widget**: Full-width Container
- **Min Height**: `100vh`
- **Background**: Use an **HTML Widget** for the Spline iframe.
  ```html
  <iframe src='https://my.spline.design/nexbotrobotcharacterconcept-gNEjvuxP15W5u3fu92BDu5ve/' frameborder='0' width='100%' height='100%' style='pointer-events: auto;'></iframe>
  ```
- **Overlay Content**: Heading Widget + Text Editor Widget.
- **Critical CSS (Add to Container > Advanced > Custom CSS)**:
  ```css
  selector {
    pointer-events: none; /* Allows Spline interaction through overlay */
    z-index: 10;
  }
  selector .elementor-widget-container {
    pointer-events: none;
  }
  selector .scroll-down {
    pointer-events: auto; /* Only buttons remain clickable */
  }
  ```

### [BLOCK] Shop_Preview / Featured
- **Elementor Widget**: Container with **Grid** or **Loop Grid**.
- **Structure**: 2 columns (70/30 split).
- **Widgets**:
  - Image Widget (Placeholder for tech visual)
  - CTA Card: Inner Container with tech-border styling.

### [BLOCK] Footer
- **Elementor Widget**: Theme Builder > Footer
- **Massive Logo**: Heading widget (`font-size: 200px`, opacity: 0.05).

---

## 3. Responsive Settings
- **Desktop**: 1600px Max Width.
- **Mobile**:
  - Hero Title: `clamp(42px, 6vw, 92px)`
  - Stacking: All el-col-xx blocks stack 100% via Elementor responsive controls.

## 4. Custom CSS
Add the following to **Appearance > Customize > Additional CSS** to maintain the global "Tech" feel:
```css
:root {
  --primary: #D1FF19;
  --font-mono: 'JetBrains Mono', monospace;
}

.tech-border::before, .tech-border::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border-color: var(--primary);
  border-style: solid;
}
```
