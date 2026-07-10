# Qline Host Dashboard: Reimagined Toast-Inspired Design Rationale

This document outlines the UX philosophy, architectural decisions, and visual styling choices behind the reimagined Qline Host Screen (`ToastHostScreen.jsx`). 

The goal of this redesign is to transition Qline's Host stand from a standard "web application feel" into an **information-dense, tactile, high-speed restaurant command center**—greatly inspired by industry-leading POS systems like **Toast**.

---

## 1. Core UX Patterns (The "Command Center" Shift)

### Main View is the Floor Plan (Not a Tab)
*   **The Toast Pattern:** In a fast-paced environment, FOH (Front-Of-House) hosts cannot afford extra clicks to switch between tabs. The physical restaurant state *is* the layout.
*   **Decision:** The Floor Plan Grid is now the main backdrop canvas, acting as the permanent "north star" of the screen.

### Slide-Out Waitlist (Overlay Navigation)
*   **The Toast Pattern:** Slide-out drawers or contextual overlays maximize screenspace when needed while maintaining visual anchors behind.
*   **Decision:** The Waitlist occupies a collapsible slide-out drawer on the right side (~30% screen width). 
    *   *Expanded:* Offers a stacked, information-dense feed of waiting guests with drag-and-drop affordances.
    *   *Collapsed:* Overlays are hidden, allowing a full-screen focus on table occupancy status during peak rush.

### Tactile Large-Type Cards (No Clutter)
*   **The Toast Pattern:** High physical readability on table screens from a distance of 3–5 feet. Heavy font weights, crisp borders, and distinct color-coded glows.
*   **Decision:** Table names/numbers are displayed in an extra-large format (`text-xl font-black`). Card corner radii are tightened to `16px` (down from Qline's current loose `40px`) to maximize data density and reinforce the "tablet-native POS" feel.

---

## 2. Interactive Seating & Assignment Flow

The mockup simulates real-world host interactions in real-time:
1.  **Direct Seating Workflow:** A host can click a waiting guest in the slide-out waitlist panel to put them in "Active Seating Mode". The system highlights available tables (`Available` status, green glowing border) with a clear dashboard helper indicator. Clicking any open table assigns the guest, updates table parameters, and removes them from the waitlist immediately.
2.  **Table Occupancy Modifiers:** Clicking any table tile displays a contextual **Table Management Action Panel** at the bottom. This allows the host to manually override table states (Available, Seated, Reserved, or Needs Attention) to keep BOH and FOH synchronized.
3.  **Real-Time Queue Addition:** The **Add Guest** modal allows hosts to instantly append newly arrived parties directly to the live waitlist queue with dietary filters.

---

## 3. Visual Visual Token & Color Mapping

| Table Status | Tailwind Tokens | Visual Meaning & Feel |
| :--- | :--- | :--- |
| **Available** | `border-green-500/50 bg-green-500/5` | Low cognitive load, inviting green glow representing open seating. |
| **Occupied** | `border-orange-500 bg-orange-500/10` | Distinct filled orange hue matching Qline's core identity (`#F36D21`). |
| **Reserved** | `border-dashed border-blue-400 bg-blue-500/5` | High visual distinction, dashed blue line denoting upcoming tables. |
| **Needs Attention** | `border-red-600 bg-red-600/10 animate-pulse` | Pulsing red border, demanding immediate action (e.g. table needs bussing). |

---

## 4. Advanced Color Modes: Dual Background Themes

To satisfy the request for warm dark (`#1a1a1a`) vs. Qline's standard light canvas (`#FFFDF9`), we implemented a **top-bar toggle** allowing real-time switching between:
*   **Warm Dark Mode (`bg-[#121212] bg-[#1e1a18]`):** Best suited for high-density, low-glare evening operations inside dimly lit dining rooms. Reduces host eye fatigue.
*   **Qline Light Mode (`bg-[#FFFDF9] bg-white`):** High contrast, warm cream canvas designed for day-time operations, patio check-ins, or bright hostess areas.

---

## 5. Seamless Dietary Integration

This design incorporates the core **Dietary & Allergy Mapping** directly onto active table cards and waitlist profiles:
*   Utilizes the `DietaryIcons` component wrapper for color-pill badges.
*   Instantly lets FOH staff identify critical allergens (such as Gluten-Free `GF` or Vegan `V` pills) on a table tile without needing to tap into sub-menus, significantly reducing allergen exposure risks and enhancing kitchen coordination.
