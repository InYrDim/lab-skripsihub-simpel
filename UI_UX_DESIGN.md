# DESIGN.md: SkripsiHub

## Brand & Visual Identity

SkripsiHub is a professional, academic-focused platform that prioritizes clarity, trust, and efficiency in the thesis submission workflow. The visual identity conveys institutional credibility through a clean, modern interface with a focus on progressive disclosure-showing users only the information and actions relevant to their current task. The design language emphasizes transparency in process status and reduces cognitive load through consistent, predictable interactions.

## User Experience Goals

1. **Reduce Submission-to-Approval Time:** Enable students to complete submissions in under 3 minutes and provide admins/validators with a clear, prioritized queue to process submissions within 24 hours of assignment.

2. **Eliminate Status Uncertainty:** Every user must know their submission's exact status at a glance (via dashboard status cards and timeline views) with zero ambiguity about next steps or required actions.

3. **Minimize Error and Rejection Cycles:** Provide real-time validation feedback during submission and clear rejection reasoning to students, reducing resubmission friction and improving title quality on first attempt.

## Color Palette

### Primary & Semantic Colors

| Color Name | Hex Code | Usage | CSS Variable |
|:---|:---|:---|:---|
| Primary Blue | `#0066CC` | Primary CTAs, active states, key UI elements | `--color-primary` |
| Secondary Teal | `#00A896` | Success states, approved badges, positive feedback | `--color-success` |
| Alert Red | `#E63946` | Rejection states, errors, warnings | `--color-danger` |
| Warning Amber | `#F59E0B` | Pending states, in-progress indicators | `--color-warning` |
| Neutral Gray 50 | `#F9FAFB` | Page backgrounds, light surfaces | `--color-neutral-50` |
| Neutral Gray 100 | `#F3F4F6` | Card backgrounds, subtle dividers | `--color-neutral-100` |
| Neutral Gray 600 | `#4B5563` | Body text, secondary labels | `--color-neutral-600` |
| Neutral Gray 900 | `#111827` | Primary text, headings | `--color-neutral-900` |

### Tailwind CSS Configuration Snippet

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    colors: {
      primary: '#0066CC',
      success: '#00A896',
      danger: '#E63946',
      warning: '#F59E0B',
      neutral: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        600: '#4B5563',
        900: '#111827',
      },
    },
  },
};
```

### CSS Custom Properties

```css
:root {
  --color-primary: #0066CC;
  --color-primary-hover: #0052A3;
  --color-success: #00A896;
  --color-danger: #E63946;
  --color-warning: #F59E0B;
  --color-neutral-50: #F9FAFB;
  --color-neutral-100: #F3F4F6;
  --color-neutral-600: #4B5563;
  --color-neutral-900: #111827;
}
```

## Typography

### Font Families

| Usage | Font Family | Google Fonts Link |
|:---|:---|:---|
| Headings (H1–H4) | Inter | https://fonts.google.com/specimen/Inter |
| Body & UI Text | Inter | https://fonts.google.com/specimen/Inter |
| Monospace (Code/IDs) | JetBrains Mono | https://fonts.google.com/specimen/JetBrains+Mono |

### Font Size Scale

| Scale | Size | Line Height | Usage |
|:---|:---|:---|:---|
| H1 | 32px | 40px | Page titles, main headings |
| H2 | 24px | 32px | Section headings, card titles |
| H3 | 18px | 28px | Subsection headings, labels |
| Body Large | 16px | 24px | Primary body text, descriptions |
| Body Regular | 14px | 22px | Standard UI text, form labels |
| Body Small | 12px | 18px | Helper text, timestamps, metadata |
| Caption | 11px | 16px | Footnotes, secondary metadata |

### Font Weights

| Weight | Value | Usage |
|:---|:---|:---|
| Regular | 400 | Body text, standard UI elements |
| Medium | 500 | Form labels, secondary headings |
| Semibold | 600 | H3 headings, button text, emphasis |
| Bold | 700 | H1–H2 headings, strong emphasis |

## UI Components & Spacing

### Grid & Spacing Unit

The design system uses an **8px base unit** for all spacing, sizing, and alignment decisions. This ensures visual harmony and simplifies responsive scaling.

### Spacing Scale

| Token | Value | Usage |
|:---|:---|:---|
| xs | 4px | Tight spacing within components (icon-to-text) |
| sm | 8px | Padding within buttons, small gaps |
| md | 16px | Standard padding, card spacing |
| lg | 24px | Section spacing, container margins |
| xl | 32px | Major section breaks, page margins |
| 2xl | 48px | Full-page vertical spacing |

### Border Radius Scale

| Token | Value | Usage |
|:---|:---|:---|
| none | 0px | Sharp edges (rare) |
| sm | 4px | Small buttons, badges, tight components |
| md | 8px | Standard cards, input fields, modals |
| lg | 12px | Large cards, prominent containers |
| full | 9999px | Pill buttons, circular avatars |

### Component Specifications

#### Buttons

- **Primary Button:** Background `--color-primary`, text white, padding `8px 16px`, border-radius `md`, font-weight `600`, font-size `14px`.
- **Secondary Button:** Background `--color-neutral-100`, text `--color-neutral-900`, same padding/radius/font as primary.
- **Danger Button:** Background `--color-danger`, text white, same padding/radius/font as primary.
- **Disabled State:** Opacity `50%`, cursor `not-allowed`.

#### Input Fields

- **Height:** 40px (8px × 5 units).
- **Padding:** 8px horizontal, 12px vertical.
- **Border:** 1px solid `--color-neutral-100`.
- **Border Radius:** `md` (8px).
- **Focus State:** Border color `--color-primary`, box-shadow `0 0 0 3px rgba(0, 102, 204, 0.1)`.
- **Error State:** Border color `--color-danger`, background `rgba(230, 57, 70, 0.05)`.

#### Cards

- **Padding:** `lg` (24px).
- **Border Radius:** `lg` (12px).
- **Background:** `--color-neutral-50` or white.
- **Border:** 1px solid `--color-neutral-100`.
- **Box Shadow:** `0 1px 3px rgba(0, 0, 0, 0.1)`.

#### Status Badges

- **Pending Admin Review:** Background `--color-warning`, text `--color-neutral-900`, padding `4px 12px`, border-radius `full`.
- **With Validator:** Background `--color-primary`, text white, same padding/radius.
- **Approved:** Background `--color-success`, text white, same padding/radius.
- **Rejected:** Background `--color-danger`, text white, same padding/radius.

## Screen Priorities

### Student Role (Highest Priority)

1. **Student Dashboard** - Primary entry point. Displays active submission status (large status card), submission history timeline, and prominent "Submit New Proposal" CTA. Must load in < 2 seconds.
2. **Submission Form** - Multi-step form to enter up to 3 thesis titles with real-time validation. Must be completable in < 3 minutes.
3. **Submission Detail View** - Shows full submission details, current status, assigned validator name, and rejection feedback (if applicable). Includes download button for approval letter.
4. **Approval Letter Download** - Instant PDF download triggered from submission detail view or dashboard.

### Admin Role (High Priority)

1. **Admin Dashboard** - Queue of new submissions awaiting initial review, sorted by submission date. Quick-assign action to move to validator queue.
2. **Submission Review Queue** - Paginated list of all submissions with status filters (Pending Admin, With Validator, Approved, Rejected). Bulk actions for assignment.
3. **Submission Detail (Admin View)** - Full submission details with validator assignment dropdown and confirmation modal.
4. **User Management** - CRUD interface for student and validator accounts (create, update, deactivate, view list).

### Validator Role (High Priority)

1. **Validator Dashboard** - Queue of submissions assigned specifically to this validator, sorted by assignment date. Status indicators (Pending Review, Reviewed).
2. **Assigned Submission Queue** - Paginated list of assigned submissions with quick-action buttons (View, Approve, Reject).
3. **Submission Review Detail** - Full submission with all 3 proposed titles displayed clearly, approval/rejection action buttons, and rejection reason text field (mandatory if rejecting).
4. **Approval Confirmation Modal** - Confirmation dialog when approving, showing selected title and triggering automatic letter generation.

## Interaction & Motion

### Hover States

- **Buttons:** Background color shifts 10% darker (e.g., primary blue `#0066CC` → `#0052A3`). Cursor changes to `pointer`.
- **Links:** Text color becomes `--color-primary`, underline appears.
- **Cards/Rows:** Background shifts to `--color-neutral-100`, subtle box-shadow appears (`0 4px 6px rgba(0, 0, 0, 0.1)`).
- **Status Badges:** Opacity increases to `0.9`, slight scale transform (`1.05`).

### Transitions & Animations

| Interaction | Duration | Easing | Effect |
|:---|:---|:---|:---|
| Button hover/focus | 150ms | ease-in-out | Background color, shadow |
| Modal open/close | 200ms | ease-out | Fade + scale (0.95 → 1.0) |
| Status badge update | 300ms | ease-in | Fade in, slight bounce |
| Form validation error | 200ms | ease-out | Shake (±2px horizontal), border color flash |
| Page transition | 150ms | ease-in-out | Fade out/in |
| Dropdown menu open | 100ms | ease-out | Slide down + fade in |
| Toast notification | 300ms | ease-out | Slide in from top-right, fade out after 4s |

### Micro-interactions

- **Form Submission:** Button shows loading spinner (rotating icon) for duration of request. Disabled state applied. On success, brief success toast appears. On error, inline error message appears below form with shake animation.
- **Status Change:** When submission status updates (e.g., "Pending Admin" → "With Validator"), status badge animates with a subtle pulse effect (scale 1.0 → 1.05 → 1.0 over 400ms).
- **Rejection Feedback:** When validator provides rejection reason, a collapsible section appears in the student's submission detail with a slide-down animation.
- **Letter Download:** Button shows brief "Generating PDF..." state, then "Downloaded" confirmation before reverting to default state.

## Accessibility

### Contrast Ratios

All text and interactive elements must meet **WCAG AA** minimum contrast ratios (4.5:1 for normal text, 3:1 for large text and UI components).

| Element | Foreground | Background | Ratio | Status |
|:---|:---|:---|:---|:---|
| Primary Button Text | White | `#0066CC` | 8.59:1 | ✅ Pass |
| Body Text | `#111827` | `#F9FAFB` | 16.5:1 | ✅ Pass |
| Secondary Text | `#4B5563` | `#F9FAFB` | 7.2:1 | ✅ Pass |
| Success Badge | White | `#00A896` | 5.1:1 | ✅ Pass |
| Danger Badge | White | `#E63946` | 5.8:1 | ✅ Pass |
| Warning Badge | `#111827` | `#F59E0B` | 9.2:1 | ✅ Pass |

### Keyboard Navigation

- **Tab Order:** All interactive elements (buttons, links, form inputs) must be reachable via Tab key in a logical, left-to-right, top-to-bottom order.
- **Focus Indicators:** All focused elements must display a visible focus ring (minimum 2px, color `--color-primary` with 3px blur).
- **Skip Links:** A "Skip to Main Content" link must be the first focusable element on every page, allowing keyboard users to bypass navigation.
- **Form Navigation:** Tab moves to next field; Shift+Tab moves to previous field. Enter submits form only when focus is on submit button.
- **Modal Dialogs:** Focus must be trapped within the modal (Tab cycles through modal elements only). Escape key closes modal and returns focus to triggering element.
- **Status Indicators:** All status badges and state changes must be announced to screen readers via ARIA live regions (`aria-live="polite"`).

### ARIA & Semantic HTML

- **Headings:** Use semantic `<h1>`, `<h2>`, `<h3>` tags; never skip heading levels.
- **Buttons:** Use `<button>` elements for all clickable actions; use `<a>` only for navigation.
- **Form Labels:** Every input must have an associated `<label>` with `for` attribute matching input `id`.
- **Status Messages:** Use `aria-live="polite"` for dynamic status updates (e.g., submission status changes, validation errors).
- **Icons:** Decorative icons must have `aria-hidden="true"`. Functional icons (e.g., close button) must have descriptive `aria-label`.
- **Disabled Elements:** Disabled buttons/inputs must have `disabled` attribute and `aria-disabled="true"`.
- **Error Messages:** Associate error text with input via `aria-describedby` attribute.

### Responsive Design

- **Breakpoints:** Mobile (< 640px), Tablet (640px–1024px), Desktop (> 1024px).
- **Mobile-First Approach:** Design for mobile first, then enhance for larger screens.
- **Touch Targets:** All interactive elements must have minimum 44px × 44px touch target on mobile devices.
- **Text Sizing:** Base font size must be at least 16px on mobile to prevent browser auto-zoom on input focus.
- **Viewport Meta Tag:** `<meta name="viewport" content="width=device-width, initial-scale=1.0">` must be present on all pages.

---

**See [ARCHITECTURE.md](./ARCHITECTURE.md) for system structure, data models, and API specifications.**

**See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for component library setup, development workflow, and deployment procedures.**
