# Homepage Audit Report

### Anti-Patterns Verdict
**PASS.** No AI-generated slop detected. The design is functional and utilitarian without decorative gradients, glassmorphism, or generic card-grid filler. The warm neutral + teal palette is coherent and the layout directly serves the collection-hub purpose.

---

### Executive Summary
| Severity | Count |
|----------|-------|
| Critical | 2 |
| High | 3 |
| Medium | 4 |
| Low | 2 |

**Top issues:**
1. **Actions button invisible on touch devices** — mobile users can't access move/remove on saved items
2. **Error message breaks layout on desktop** — `AddTweetForm` error text flows inline in the flex row
3. **Missing form label** — `AddTweetForm` input relies solely on placeholder
4. **Touch targets below 44px** — filter chips (26px) and item action buttons (28px)
5. **Filter chips lack state ARIA** — screen readers can't tell which filter is active

---

### Detailed Findings

#### Critical Issues

**1. Actions button relies on hover — completely broken on touch devices**
- **Location:** `saved-item-card.tsx:65-74`
- **Category:** Accessibility / Responsive
- **Description:** The More actions button uses `opacity-0 group-hover:opacity-100`. Touch devices have no hover state, so the button is permanently invisible.
- **Impact:** Mobile users cannot move or delete saved items.
- **Recommendation:** Always show the actions button on touch devices, or switch to a long-press / swipe pattern. At minimum, remove `opacity-0` and use a subtler always-visible treatment.
- **Suggested command:** `/adapt`

**2. Error message breaks desktop layout in `AddTweetForm`**
- **Location:** `add-tweet-form.tsx:51-72`
- **Category:** Responsive
- **Description:** The form is `flex flex-col gap-3 sm:flex-row sm:items-center`. The error `<p>` is a sibling in the flex container, so on desktop it renders inline next to the input and button instead of below them.
- **Impact:** Visual breakage and poor error readability on desktop.
- **Recommendation:** Wrap the input + button in their own flex container, or place the error in a separate block below the row.
- **Suggested command:** `/harden`

#### High-Severity Issues

**3. Form input lacks a visible label**
- **Location:** `add-tweet-form.tsx:55-64`
- **Category:** Accessibility
- **Description:** The URL input has only a placeholder (`"Paste a tweet or X post URL..."`). Placeholders disappear on input and do not satisfy WCAG labeling requirements.
- **Impact:** Screen reader users may not understand the field's purpose. Cognitive accessibility suffers when the hint vanishes.
- **WCAG:** 3.3.2 Labels or Instructions (A)
- **Recommendation:** Add a `<label>` (visually hidden if necessary) with `htmlFor` pointing to the input, or use `aria-label`.
- **Suggested command:** `/harden`

**4. Filter chip touch targets are too small**
- **Location:** `index.tsx:130-143`
- **Category:** Responsive / Accessibility
- **Description:** Filter chip buttons are `px-4 py-1.5` with 14px text. Total height is roughly 26–30px.
- **Impact:** Below the 44×44px WCAG 2.5.5 target size recommendation. Users with motor impairments or large fingers will struggle.
- **WCAG:** 2.5.5 Target Size (AAA) / 2.5.8 Target Size (Minimum) (AA)
- **Recommendation:** Increase to at least `py-2.5` (10px vertical padding) to reach ~40px total height, or add an invisible padding layer.
- **Suggested command:** `/adapt`

**5. Missing ARIA state on filter chips**
- **Location:** `index.tsx:130-143`
- **Category:** Accessibility
- **Description:** The filter chips are `<button>` elements that toggle a single active state, but they lack `aria-pressed` or `aria-current="true"`.
- **Impact:** Screen reader users cannot determine which filter is currently applied.
- **WCAG:** 4.1.2 Name, Role, Value (A)
- **Recommendation:** Add `aria-pressed={filter === tab.value}` to each button.
- **Suggested command:** `/harden`

#### Medium-Severity Issues

**6. Item actions button is 28×28px — too small**
- **Location:** `saved-item-card.tsx:65`
- **Category:** Responsive / Accessibility
- **Description:** The MoreHorizontal trigger is `size-7` (28px).
- **Impact:** Difficult to tap accurately, especially when adjacent to the card link which also captures touches.
- **Recommendation:** Increase to at least `size-9` (36px) or `size-10` (40px) with increased hit area.
- **Suggested command:** `/adapt`

**7. "See all" button does nothing meaningful when already on "All"**
- **Location:** `index.tsx:153-158`
- **Category:** UX
- **Description:** When the user is on the "All" filter, clicking "See all" re-applies the same filter. It only has purpose when viewing "Links" filter.
- **Impact:** Confusing micro-interaction that feels broken.
- **Recommendation:** Hide "See all" when `filter !== "all"`, or change its behavior to navigate to a dedicated collections list page.
- **Suggested command:** `/clarify`

**8. `FolderPicker` still uses old terminology**
- **Location:** `folder-picker.tsx:48, 67`
- **Category:** UX / Consistency
- **Description:** Dialog label says "Move tweet to folder" and button says "Inbox". The rest of the app now says "links", "collections", and "Saved".
- **Impact:** Inconsistent terminology breaks user mental model.
- **Recommendation:** Update label to "Move link to collection" and "Saved" for the inbox option.
- **Suggested command:** `/clarify`

**9. External link lacks indicator and accessible name**
- **Location:** `saved-item-card.tsx:33-62`
- **Category:** Accessibility
- **Description:** The card link opens `target="_blank"` but has no visual or programmatic indicator that it opens externally.
- **Impact:** Users may be unexpectedly navigated away. Screen readers won't announce the external behavior.
- **WCAG:** 3.2.5 Change on Request (AAA)
- **Recommendation:** Add an external-link icon or add `aria-label` like "Open post by @handle on X.com (opens in new tab)".
- **Suggested command:** `/harden`

#### Low-Severity Issues

**10. Skeleton loaders don't match final grid column count**
- **Location:** `index.tsx:197-205`
- **Category:** UX
- **Description:** Skeleton placeholders use `grid-cols-3 sm:grid-cols-4 md:grid-cols-5`, but on large screens the final content might have fewer items, making the skeleton look busier than the real state.
- **Impact:** Minor layout shift perception issue.
- **Recommendation:** Ensure skeleton count and grid match the loaded state. Consider reducing skeleton count to 3–4 to avoid a "wall of gray".
- **Suggested command:** `/polish`

**11. Mobile back button uses X icon instead of back arrow**
- **Location:** `app-shell.tsx:136`
- **Description:** The `showBack` prop renders an `<X>` icon that calls `history.back()`. An X implies "close/dismiss" not "navigate back".
- **Impact:** Minor cognitive dissonance on mobile.
- **Recommendation:** Swap `X` for `ChevronLeft` or `ArrowLeft`.
- **Suggested command:** `/clarify`

---

### Patterns & Systemic Issues

- **Touch-first hover reliance:** `group-hover` is used for revealing actions, but this pattern fails across all touch devices. Any hover-only affordance should be re-evaluated for mobile.
- **Form accessibility gaps:** Error messages are not associated with inputs via `aria-describedby`, and inputs lack proper labels. This is a recurring pattern.
- **ARIA state omissions:** Toggle buttons (filter chips) and expandable menus (item actions) don't communicate their state to assistive tech.

---

### Positive Findings

- **Semantic HTML:** Proper `<main>`, `<section>`, and `<h1>` / `<h2>` hierarchy in `SavedView`.
- **Lazy loading:** `CollectionCard` thumbnails use `loading="lazy"`.
- **Keyboard support:** `AppSheet` handles Escape key for closing overlays.
- **Design tokens:** No hardcoded colors; everything uses CSS custom properties that adapt to dark mode.
- **Responsive grids:** Good breakpoint progression (`grid-cols-3` → `sm:grid-cols-4` → `md:grid-cols-5`).

---

### Recommendations by Priority

**Immediate (fix this week):**
1. Make SavedItemCard actions visible on touch devices
2. Fix `AddTweetForm` error layout on desktop
3. Add `aria-pressed` to filter chips

**Short-term (next sprint):**
4. Add proper input label to `AddTweetForm`
5. Increase touch targets on filter chips and action buttons
6. Update `FolderPicker` terminology to match new UI

**Medium-term:**
7. Add external-link indicators and accessible names
8. Fix "See all" button behavior when on "All" tab

**Long-term:**
9. Skeleton grid polish
10. Back button icon swap

---

### Suggested Commands for Fixes

- `/adapt` — Fix touch targets, hover-only actions, and responsive behavior
- `/harden` — Add labels, ARIA states, error associations, and external-link indicators
- `/clarify` — Fix "See all" behavior, back button icon, and `FolderPicker` terminology
- `/polish` — Skeleton loader refinement and minor spacing tweaks
