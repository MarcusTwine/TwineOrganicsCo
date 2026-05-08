# Admin CRUD — Design Spec
**Date:** 2026-05-08
**Status:** Approved

---

## Overview

Add full CRUD management to the Twine Organics admin panel covering Products, Blog, Orders, and Stock. All forms follow a Shopify-style two-column layout (main content left, sidebar right). All mutations use Next.js Server Actions. Data reads remain in Server Components. A shared Tiptap rich text editor is used for both product descriptions and blog content.

---

## Architecture

### Pattern
- **Reads** — Server Components query the DB directly (existing pattern, unchanged)
- **Mutations** — Server Actions per resource, each in an `actions.ts` file co-located with the route
- **Auth guard** — Every action verifies `session.user.role === 'ADMIN'` before touching the DB
- **Revalidation** — Each action calls `revalidatePath` on the relevant admin and store routes
- **Image uploads** — `/api/admin/upload` route saves files to `public/uploads/`, returns URL. Used by products and blog.

### New files
```
app/(admin)/admin/products/new/page.tsx
app/(admin)/admin/products/[id]/edit/page.tsx
app/(admin)/admin/products/actions.ts
app/(admin)/admin/blog/new/page.tsx
app/(admin)/admin/blog/[id]/edit/page.tsx
app/(admin)/admin/blog/actions.ts
app/(admin)/admin/orders/[id]/page.tsx
app/(admin)/admin/orders/actions.ts
app/(admin)/admin/stock/[id]/page.tsx
app/(admin)/admin/stock/actions.ts
app/api/admin/upload/route.ts
components/admin/RichTextEditor.tsx
components/admin/ImageUpload.tsx
components/admin/TagInput.tsx
```

### Schema additions
Two new models added to `prisma/schema.prisma`:

```prisma
model OrderNote {
  id        String   @id @default(cuid())
  orderId   String
  authorId  String
  body      String
  createdAt DateTime @default(now())

  order  Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
  author User  @relation(fields: [authorId], references: [id], onDelete: Restrict)
}

model StockAdjustment {
  id        String   @id @default(cuid())
  productId String
  adminId   String
  type      String   // "ADD" | "REMOVE"
  quantity  Int
  reason    String   // "RESTOCK" | "SALE" | "DAMAGED" | "CORRECTION" | "OTHER"
  note      String?
  createdAt DateTime @default(now())

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  admin   User    @relation(fields: [adminId], references: [id], onDelete: Restrict)
}
```

Existing models also need back-relations added:
- `Order` — `notes OrderNote[]`
- `Product` — `stockAdjustments StockAdjustment[]`
- `User` — `orderNotes OrderNote[]`, `stockAdjustments StockAdjustment[]`

---

## Products CRUD

### List page (`/admin/products`)
- "Add product" button top-right → `/admin/products/new`
- Each row: **Edit** link → `/admin/products/[id]/edit`, **Delete** button (soft delete, sets `isActive = false`)

### Form layout (new + edit)
**Left column:**
- Title — text input
- Description — Tiptap rich text (bold, italic, underline, headings, links, tables). Output stored as HTML string in `description` field.
- Media — multi-image uploader, drag-to-reorder, stored as `String[]` in `images` field
- Price — decimal input prefixed with R
- Inventory — stock quantity input

**Right sidebar:**
- Status — Active / Inactive toggle (maps to `isActive`)
- Featured — toggle (maps to `isFeatured`)
- Product organisation — Category dropdown (populated from DB), Tags chip input (stored as `String[]` in `tags` field)
- Slug — auto-generated from title via `slugify`, manually editable

### Actions (`products/actions.ts`)
| Action | Behaviour |
|---|---|
| `createProduct` | Validates fields, slugifies name, writes to DB, revalidates `/admin/products` + `/products` |
| `updateProduct` | Validates, updates record, revalidates same paths |
| `deleteProduct` | Sets `isActive = false` (soft delete — preserves order history) |

---

## Blog CRUD

### List page (`/admin/blog`)
- "Add post" button top-right → `/admin/blog/new`
- Each row: **Edit** link, **Delete** button (hard delete, cascades to `PostToTag`)

### Form layout (new + edit)
**Left column:**
- Title — text input
- Content — Tiptap rich text (bold, italic, underline, headings, links, tables, code block). Serialised to JSON matching `content Json` schema field.
- Excerpt — plain textarea (shown on blog listing page)
- SEO — collapsible section, meta title + description (stored in excerpt field for now)

**Right sidebar:**
- Visibility — Visible (PUBLISHED) / Hidden (DRAFT) radio buttons
- Cover image — drag-and-drop upload to `public/uploads/blog/`, stored in `coverImage` field
- Organisation — Author (read-only, set to logged-in user's name), Tags chip input (creates/links `PostTag` records)
- Save button bottom-right

### Actions (`blog/actions.ts`)
| Action | Behaviour |
|---|---|
| `createPost` | Slugifies title, sets `authorId` from session, saves content JSON, sets `publishedAt` if PUBLISHED |
| `updatePost` | Updates all fields, sets `publishedAt = now()` when status changes to PUBLISHED for first time |
| `deletePost` | Hard delete (schema cascades to `PostToTag`) |

---

## Orders

### List page (`/admin/orders`)
- Existing table unchanged except each row gets a **View** link → `/admin/orders/[id]`
- No delete action (orders are financial records)

### Detail page (`/admin/orders/[id]`)
**Main content:**
- Order ID, date, customer name + email
- Delivery address (parsed from `deliveryAddress` JSON)
- Peach payment ID if present
- Items table: product name, quantity, unit price, line total, order total footer

**Right sidebar:**
- Current status badge
- Dropdown to select new status + "Update status" button
- Internal notes: list of existing notes (author, timestamp, body), textarea + "Add note" button

### Actions (`orders/actions.ts`)
| Action | Behaviour |
|---|---|
| `updateOrderStatus` | Validates transition, updates status, revalidates order detail + list |
| `addOrderNote` | Writes `OrderNote` with `authorId` from session, revalidates order detail |

---

## Stock

### List page (`/admin/stock`)
- Existing table unchanged except each row gets an **Adjust** link → `/admin/stock/[id]`
- Low stock badge: ≤ 5 units = yellow "Low", 0 = red "Out of stock"

### Adjustment page (`/admin/stock/[id]`)
**Product header:** name, current stock (large), category badge

**Adjustment form:**
- Type — radio: Add stock / Remove stock
- Quantity — positive integer input
- Reason — dropdown: Restock / Sale / Damaged / Correction / Other
- Note — optional free-text
- "Save adjustment" button

**Adjustment history table:** date, type, quantity, reason, note, admin name — all past adjustments for this product

### Actions (`stock/actions.ts`)
| Action | Behaviour |
|---|---|
| `adjustStock` | Validates quantity > 0, adds/subtracts from `product.stock` (floor at 0), writes `StockAdjustment` record, revalidates stock list + product |

---

## Shared Components

| Component | Purpose |
|---|---|
| `RichTextEditor` | Tiptap client component. Props: `value`, `onChange`. Used by products + blog. |
| `ImageUpload` | Drag-and-drop uploader. POSTs to `/api/admin/upload`, returns URL(s). Used by products + blog. |
| `TagInput` | Chip-style tag input. Props: `value: string[]`, `onChange`. Used by products + blog. |

---

## Implementation Order

1. Schema migrations (OrderNote, StockAdjustment)
2. Shared components (RichTextEditor, ImageUpload, TagInput) + upload API route
3. Products CRUD
4. Blog CRUD
5. Orders detail + actions
6. Stock adjustment page + actions
