# Dubiken API Specification (Frontend Contract)

Single source of truth for **backend implementation** and **frontend integration**. Maps every current UI screen, form field, list filter, and response shape in the Dubiken Next.js app.

**Code alignment (UI prepared for backend)**

| Path | Purpose |
|------|---------|
| `lib/contracts/enums.ts` | Canonical enum string values — **import in UI and validate in API** |
| `lib/contracts/types.ts` | Request/response TypeScript DTOs |
| `lib/contracts/validation.ts` | Field rules copied from form validation |
| `lib/contracts/index.ts` | Re-exports |
| `lib/api/client.ts` | `apiRequest()`, `ApiError`, bearer token helper |
| `lib/api/paths.ts` | `API_PATHS` route constants |
| `lib/api/config.ts` | `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_USE_API` |
| `.env.example` | Env template |

**Conventions**

| Item | Value |
|------|--------|
| Base URL | `NEXT_PUBLIC_API_BASE_URL` → default `http://localhost:3001/api/v1` |
| Auth | `Authorization: Bearer <access_token>` (store in session after login; extend `lib/auth-session.ts`) |
| JSON | `Content-Type: application/json` unless noted |
| Enum casing | **snake_case** in JSON bodies/query (e.g. `pending_quote`, `pending`) |
| Hub codes | `HubCode`: `KE` \| `AE` \| `CN` |
| Timestamps | ISO 8601 (`created_at`, `updated_at`) |
| Pagination | `?page=1&page_size=10` → `{ data, meta: { page, page_size, total } }` |
| List default `page_size` | `10` (admin sourcing); marketplace `24` |
| Errors | `{ "error": { "code": "string", "message": "string", "details": { "field": ["msg"] } } }` |
| Money | USD numbers in API (`unit_price: 45.00`); UI may display `"$45.00"` strings in quotes |

**Toggle mock → API:** set `NEXT_PUBLIC_USE_API=true` and implement fetch in `lib/data.ts` using `apiRequest` + `API_PATHS` (mock remains default).

---

## 0. Enum registry (backend + UI)

Import from `lib/contracts/enums.ts`. Backend MUST accept only listed values; UI MUST use these constants (no ad-hoc strings).

### 0.1 Core

| Enum | TypeScript | Values | Used in |
|------|------------|--------|---------|
| `HubCode` | `HubCode` | `KE`, `AE`, `CN` | Sourcing origin, category origins, inventory origin, marketplace hub filter |
| `MarketFilter` | `MarketFilter` | `all`, `KE`, `AE`, `CN` | Admin sourcing list filter (`all` = no market filter) |
| `StatusVariant` | `StatusVariant` | `orange`, `blue`, `gray`, `red` | Badges, pills, dots across dashboard |
| `UserRole` | `UserRole` | `buyer`, `admin`, `vendor` | Auth `user.role` |

### 0.2 Admin sourcing requests

| Enum | Values | UI route | Notes |
|------|--------|----------|-------|
| `AdminSourcingStatus` | `pending`, `quoted`, `shipping`, `delivered` | `/admin/sourcing`, `/admin/sourcing/[id]` | List filter buttons: `pending`, `quoted`, `shipping` only |
| Display labels | `ADMIN_SOURCING_STATUS_LABELS` | Table status column | |
| Detail badge | `ADMIN_SOURCING_STATUS_BADGE` | Detail header | e.g. `pending` → `ACTIVE REQUEST` |

**List query `status`:** repeat or comma-separated: `?status=pending&status=quoted`

**List query `market`:** `KE` \| `AE` \| `CN` (omit or `all` for all)

### 0.3 User sourcing (buyer dashboard)

| Enum | Values | UI | API recommendation |
|------|--------|-----|-------------------|
| `UserSourcingStatus` (canonical) | `pending`, `pending_quote`, `quoted`, `processing`, `active` | `/dashboard/sourcing` | Use in DB |
| `status_variant` | `orange`, `blue`, `gray` | List + detail dot color | Return from API; do not derive only on client |
| Legacy mock `status` strings | `PENDING`, `PENDING QUOTE`, `QUOTED`, `PROCESSING`, `ACTIVE REQUEST` | Mock data today | Prefer `status` + `status_label` in API response |

**Create request form enums**

| Enum | Values | Form field |
|------|--------|------------|
| `SourcingUrgency` | `standard`, `express` | urgency |
| `SourcingShippingMethod` | `air`, `sea`, `flexible` | shipping_method |
| `SourcingUnit` | `units`, `pieces`, `kg`, `tons`, `containers`, `pallets` | unit |
| `UserSourcingCategoryOption` | see `USER_SOURCING_CATEGORY_OPTIONS` in enums.ts | category dropdown |
| Destinations | free string from `USER_SOURCING_DESTINATIONS` preset list | destination |

### 0.4 Admin official quote

| Enum | Values | UI |
|------|--------|-----|
| `TransportType` | `FOB Ningbo`, `CIF Mombasa`, `EXW Shenzhen`, `DAP Nairobi` | transport select (extendable on backend) |

**Rule:** Exactly **one** `official: true` quote per admin sourcing request (UI replaces on save).

### 0.5 Categories (admin)

| Enum | Values | UI |
|------|--------|-----|
| `CategoryStatus` | `draft`, `published` | CategoryForm publication status |
| `TrendVariant` | `up`, `stable`, `down` | Admin category cards (read-only analytics) |

**Active markets:** array of `HubCode` (min 1). No separate `primary_hub` field.

### 0.6 Marketplace & storefront

| Enum | Values | UI |
|------|--------|-----|
| `MarketplaceCta` | `cart`, `quote` | Marketplace product card button |

### 0.7 Cart & checkout

| Enum | Values | UI |
|------|--------|-----|
| `CheckoutStep` | `1`, `2`, `3` | `/checkout` stepper (client-only today) |
| `KenyaRegion` | `Nairobi County`, `Mombasa County`, `Kisumu County`, `Nakuru County` | checkout region select |
| `payment_method` (proposed) | `card`, `bank_transfer`, `wallet` | checkout step 2 (UI placeholder) |

### 0.8 Admin inventory product wizard

| Enum | Values | UI step |
|------|--------|---------|
| `InventoryCategoryOption` | 8 categories in `INVENTORY_CATEGORY_OPTIONS` | Step 1 category |
| `HubCode` | `primary_origin` | Step 1 |
| Wizard steps | `1` Product Info, `2` Pricing & Stock, `3` Photos, `4` Review | client state |

**Validation (UI):** name, sku, category, description required; `price_usd > 0`; `stock >= 1`; `main_image` required; up to **8** gallery images.

### 0.9 Admin dashboard, logistics, orders

| Enum | Values | UI |
|------|--------|-----|
| `DashboardTagVariant` | `orange`, `blue`, `red` | Dashboard sourcing row tags |
| `ActionButtonStyle` | `solid`, `outline` | Dashboard row actions |
| `LogisticsMode` | `Sea`, `Air`, `Land` | Admin dashboard pipeline cards |
| `LogisticsPipelineStatus` | `TRANSIT`, `CUSTOMS`, `PREPARING` | Pipeline card status text |
| `AdminSourcingOrderVariant` | `blue`, `orange` | `/admin/orders` sourcing tab |
| `MarketplaceOrderStatusIcon` | `transit`, `delivered`, `processing` | User orders marketplace tab |
| `OrderPrimaryStyle` | `navy`, `red` | Order card CTA styling |

### 0.10 Attachments & misc

| Enum | Values |
|------|--------|
| `AttachmentType` | `pdf`, `zip` |
| `LegacyOrderStatus` | `in_port`, `processing`, `dispatched`, `delivered`, `confirmed` (dashboard home widget) |
| `PdpTab` | `specs`, `logistics`, `reviews` (PDP tabs — UI only) |
| `PdpShippingDestination` | `mombasa`, `jebel` (PDP shipping selector — UI only) |

### 0.11 UI ↔ API status mapping (migration)

| UI mock display (legacy) | API `status` | `status_variant` |
|--------------------------|--------------|------------------|
| `PENDING QUOTE` | `pending_quote` | `gray` |
| `PENDING` | `pending` | `gray` |
| `QUOTED` | `quoted` | `orange` |
| `PROCESSING` | `processing` | `blue` |
| `ACTIVE REQUEST` | `active` | `blue` |

Admin sourcing: API `status` maps 1:1 (`pending`, `quoted`, `shipping`, `delivered`).

---

## 0.12 Validation rules (forms)

From `lib/contracts/validation.ts` — backend should return `400` with `details` keyed by field name.

| Form | Key rules |
|------|-----------|
| Login | `email` required; `password` min 8 |
| Register | `company_name` min 2; `email`; `password` min 8 |
| User sourcing create | `description` min **20** chars; `quantity` positive number; `target_date` required; `accept_terms: true` |
| Admin quote | `unit_price`, `transport`, `lead_time_days` required; `lead_time_days` ≤ 365 |
| Admin category | `name`, `description`, `origins[]` min 1; `status` draft \| published |
| Admin product | `stock` ≥ 1; `price_usd` > 0; main image required |
| Checkout shipping | `full_name`, `phone`, `address`, `city`, `region` required |

---

## 0.13 TypeScript DTO index

All request/response interfaces: `lib/contracts/types.ts`

| DTO | HTTP |
|-----|------|
| `LoginRequest` / `RegisterRequest` / `AuthTokensResponse` | §1 |
| `ProductDetailDto`, `MarketplaceProductDto`, `ExploreCategoryDto` | §2 |
| `CartResponse`, `AddCartItemRequest`, `CheckoutShippingRequest` | §3 |
| `UserSourcingDashboardResponse`, `CreateSourcingRequestBody`, `UserSourcingRequestDetailDto` | §4 |
| `AdminCategoryDto`, `UpsertCategoryRequest` | §5 |
| `AdminInventoryKpisDto`, `CreateInventoryProductRequest` | §6 |
| `AdminSourcingRequestListItem`, `UpsertOfficialQuoteRequest` | §7 |

---

## 1. Authentication

### 1.1 Login — `POST /auth/login`

**UI:** `/auth/login`

**Request**

```json
{
  "email": "name@company.com",
  "password": "string"
}
```

**Response `200`**

```json
{
  "access_token": "string",
  "refresh_token": "string",
  "expires_in": 3600,
  "user": {
    "id": "usr_abc",
    "email": "name@company.com",
    "name": "John Doe",
    "company": "Premium Sourcing",
    "role": "buyer"
  }
}
```

`role` enum: `UserRole` → `buyer` | `admin` | `vendor`

**UI today:** `setAuthSession()` in `localStorage` only (no API).

---

### 1.2 Register — `POST /auth/register`

**UI:** `/auth/register`

**Request**

```json
{
  "company_name": "Acme Imports Ltd",
  "email": "name@company.com",
  "password": "string"
}
```

**Response `201`**

Same shape as login response.

---

### 1.3 Logout — `POST /auth/logout`

**Request:** empty or `{ "refresh_token": "string" }`

**Response `204`**

---

### 1.4 Session / Me — `GET /auth/me`

**Response `200`**

```json
{
  "id": "usr_abc",
  "email": "name@company.com",
  "name": "John Doe",
  "company": "Premium Sourcing",
  "role": "buyer"
}
```

---

## 2. Storefront — Products & Marketplace

### 2.1 Product detail — `GET /products/:id`

**UI:** `/product/[id]`

**Response `200`**

```json
{
  "id": "prod-1",
  "name": "Hyperion X8 100kW Inverter",
  "sku": "IND-SLR-8802",
  "price": 4250,
  "original_price": 4800,
  "origin": "CN",
  "image_url": "https://...",
  "images": ["https://...", "https://..."],
  "specs": {
    "nominalACPower": "100 kW",
    "maxInputVoltage": "1100V",
    "efficiency": "98.5%",
    "coolingSystem": "Liquid",
    "protectionClass": "IP65",
    "weight": "45 kg",
    "certification": "IEC 62109",
    "warranty": "10 Years"
  },
  "currency_ke": "KES 550,000",
  "currency_ae": "AED 15,600",
  "description": "string"
}
```

---

### 2.2 Related products — `GET /products/:id/related?limit=4`

**Response `200`**

```json
{
  "data": [
    {
      "id": "prod-2",
      "name": "string",
      "price": 870,
      "origin": "CN",
      "image_url": "https://..."
    }
  ]
}
```

---

### 2.3 Marketplace product list — `GET /marketplace/products`

**UI:** `/marketplace`

**Query (optional)**

| Param | Type | Example |
|-------|------|---------|
| `hub` | `KE \| AE \| CN` | `KE` |
| `category` | string | `Energy` |
| `search` | string | `inverter` |
| `page` | number | `1` |
| `page_size` | number | `24` |

**Response `200`**

```json
{
  "data": [
    {
      "id": "mp-1",
      "product_id": "prod-1",
      "name": "Industrial Solar Inverter V3",
      "vendor": "Longi Solar HK",
      "origin": "CN",
      "price_usd": 870,
      "price_kes": "KES 112,000",
      "price_aed": "AED 3,190",
      "image_url": "https://...",
      "cta": "cart"
    }
  ],
  "meta": { "page": 1, "page_size": 24, "total": 120 }
}
```

`cta` enum: `MarketplaceCta` → `cart` | `quote`

---

### 2.4 Explore categories (storefront) — `GET /categories`

**UI:** `/categories`, homepage category grid

**Response `200`**

```json
{
  "data": [
    {
      "id": "ac-1",
      "name": "Consumer Electronics",
      "origin": "CN",
      "product_count": 842,
      "image_url": "https://..."
    }
  ]
}
```

Only **published** admin categories should appear (see §5.2).

---

## 3. Cart & Checkout

Cart is **client-local today** (`lib/cart-storage.ts`). Backend should own cart for logged-in users.

### 3.1 Get cart — `GET /cart`

**Response `200`**

```json
{
  "items": [
    {
      "id": "line-1",
      "product_id": "prod-1",
      "name": "Industrial Grade Smartwatch Pro X",
      "sku": "DU-98234-CN",
      "quantity": 12,
      "unit_price": 45,
      "origin": "CN",
      "image_url": "https://..."
    }
  ],
  "item_count": 64,
  "subtotal": 2880
}
```

---

### 3.2 Add / update line — `POST /cart/items`

**UI:** Marketplace “Add to Cart”, PDP “ADD TO CART”

**Request**

```json
{
  "product_id": "prod-1",
  "quantity": 1
}
```

**Response `200`:** full cart object (§3.1).

---

### 3.3 Update quantity — `PATCH /cart/items/:lineId`

**UI:** `/checkout` +/- controls

**Request**

```json
{ "quantity": 13 }
```

---

### 3.4 Remove line — `DELETE /cart/items/:lineId`

---

### 3.5 Checkout — shipping step — `POST /checkout/shipping`

**UI:** `/checkout` step 1

**Request**

```json
{
  "full_name": "John Kamau",
  "phone": "+254700000000",
  "address": "Street, Building, Apartment",
  "city": "Nairobi",
  "region": "Nairobi County"
}
```

**Response `200`**

```json
{
  "checkout_id": "chk_abc",
  "shipping": { "...same fields..." },
  "summary": {
    "subtotal": 2880,
    "shipping": 85.2,
    "customs": 230.4,
    "insurance": 28.8,
    "total": 3224.4,
    "currency": "USD"
  }
}
```

---

### 3.6 Place order — `POST /checkout/complete`

**UI:** checkout steps 2–3 (payment/review — UI only today)

**Request**

```json
{
  "checkout_id": "chk_abc",
  "payment_method": "card"
}
```

**Response `201`**

```json
{
  "order_id": "ord-1",
  "order_number": "88291"
}
```

---

## 4. User Dashboard — Sourcing

### 4.1 Sourcing dashboard — `GET /me/sourcing`

**UI:** `/dashboard/sourcing`

**Response `200`**

```json
{
  "summary": {
    "active": 12,
    "pending_quotes": 4,
    "procured_total": "$42k"
  },
  "requests": [
    {
      "id": "usr-1",
      "request_number": "DBK-99021",
      "title": "High-Grade Photovoltaic Inverters (50 units)",
      "origin": "CN",
      "price": "$12,500.00",
      "status": "QUOTED",
      "status_variant": "orange"
    }
  ]
}
```

`status_variant`: `orange` | `blue` | `gray` (UI badge color).

---

### 4.2 Create sourcing request — `POST /me/sourcing/requests`

**UI:** `/dashboard/sourcing/new` (3-step wizard)

**Request**

```json
{
  "product_name": "Custom CNC Parts",
  "category": "Industrial Machinery",
  "urgency": "standard",
  "description": "Detailed specs for suppliers (min 20 chars in UI)",
  "origin": "CN",
  "destination": "Nairobi, Kenya",
  "quantity": "500",
  "unit": "units",
  "target_date": "2025-06-15",
  "shipping_method": "flexible",
  "budget": "12000",
  "accept_terms": true
}
```

| Field | Required | Enum / type |
|-------|----------|-------------|
| `product_name` | yes | string, max 200 |
| `category` | yes | string (see `USER_SOURCING_CATEGORY_OPTIONS`) |
| `urgency` | yes | `SourcingUrgency`: `standard`, `express` |
| `description` | yes | string, min 20 |
| `origin` | yes | `HubCode`: `KE`, `AE`, `CN` |
| `destination` | yes | string |
| `quantity` | yes | string (numeric text in UI) |
| `unit` | yes | `SourcingUnit` |
| `target_date` | yes | ISO date `YYYY-MM-DD` |
| `shipping_method` | yes | `SourcingShippingMethod`: `air`, `sea`, `flexible` |
| `budget` | no | string |
| `accept_terms` | yes | boolean, must be `true` |

**Attachments (not wired in mock):** `multipart/form-data` on same request or `POST /me/sourcing/requests/:id/attachments` after create.

**Response `201`**

```json
{
  "id": "usr-4",
  "request_number": "DBK-90412",
  "title": "Custom CNC Parts",
  "origin": "CN",
  "price": "Pending quote",
  "status": "PENDING",
  "status_variant": "gray"
}
```

---

### 4.3 Sourcing request detail — `GET /me/sourcing/requests/:id`

**UI:** `/dashboard/sourcing/[id]`

**Response `200`**

```json
{
  "id": "usr-1",
  "request_number": "REQ-4029",
  "title": "Industrial Solar Inverters (500 Units)",
  "origin": "CN",
  "status": "ACTIVE REQUEST",
  "status_variant": "blue",
  "description": "string",
  "quantity": "500 Units",
  "voltage_range": "1100V - 1500V",
  "budget_total": "$12,500.00",
  "budget_subtitle": "Estimated Total (EXW/FOB)",
  "regional_targets": [
    { "code": "CN", "label": "China (CN)" },
    { "code": "KE", "label": "Kenya (KE)" }
  ],
  "attachments": [
    { "name": "Inverter_Specs_v2.pdf", "size": "1.4 MB", "type": "pdf", "url": "https://..." }
  ],
  "quotes": [
    {
      "id": "q-1",
      "unit_price": "$21.50",
      "shipping_cost": "$1,200.00",
      "lead_time": "14 Days",
      "shipment": "FOB Ningbo",
      "notes": "Verified manufacturer...",
      "official": true
    }
  ],
  "destination_port": "Mombasa (KE-MBA)",
  "estimated_budget_range": "$12,000 - $15,000 USD"
}
```

User sees **at most one** official quote in UI (`quotes[0]`).

---

## 5. Admin — Categories

### 5.1 List categories — `GET /admin/categories`

**UI:** `/admin/categories`

**Response `200`**

```json
{
  "data": [
    {
      "id": "ac-1",
      "name": "Consumer Electronics",
      "description": "string",
      "origins": ["KE", "CN"],
      "trend": "+12.5%",
      "trend_variant": "up",
      "total_skus": 842,
      "vendors": 124,
      "image_url": "https://...",
      "status": "published"
    }
  ]
}
```

`total_skus`, `vendors`, `trend` are **read-only analytics** in UI (not form fields).

---

### 5.2 Get category — `GET /admin/categories/:id`

**UI:** `/admin/categories/[id]/edit`

**Response `200`:** single category object (same fields as list item).

---

### 5.3 Create / update category — `POST /admin/categories` / `PUT /admin/categories/:id`

**UI:** `CategoryForm` — `/admin/categories/new`, `/admin/categories/[id]/edit`

**Request**

```json
{
  "name": "Industrial Textiles",
  "description": "string",
  "origins": ["KE", "AE"],
  "image_url": "https://...",
  "status": "draft"
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `name` | yes | |
| `description` | yes | |
| `origins` | yes | min 1 hub code |
| `image_url` | yes | or multipart upload → URL |
| `status` | yes | `CategoryStatus`: `draft` \| `published` |
| `origins` | yes | `HubCode[]`, min length 1 |

**Publish:** same endpoint with `"status": "published"` (UI: “Publish Category” vs “Save Draft”).

**Response `200` / `201`:** full `AdminCategoryCard` object.

**Side effect:** published categories sync to `GET /categories` (storefront).

---

## 6. Admin — Inventory (Marketplace SKUs)

### 6.1 Inventory KPIs — `GET /admin/inventory/kpis`

**UI:** `/admin/inventory` header cards

**Response `200`**

```json
{
  "total_active_products": 1248,
  "new_this_week": 12,
  "total_inventory_value": "$2.4M",
  "hubs_label": "Across 3 Hubs",
  "low_stock_count": 24
}
```

---

### 6.2 Inventory list — `GET /admin/inventory`

**UI:** `/admin/inventory` table

**Query (optional):** `search`, `category`, `low_stock`, `page`, `page_size`

**Response `200`**

```json
{
  "data": [
    {
      "id": "inv-1",
      "sku": "DBK-INV-0891",
      "name": "Industrial Power Inverters",
      "category": "Consumer Electronics",
      "origin": "CN",
      "image_url": "https://...",
      "stock": 842,
      "low_stock": false,
      "value": "$12,400",
      "marketplace_price": "$320.00 USD",
      "stock_levels": [
        { "hub": "CN", "percent": 55, "low": false },
        { "hub": "KE", "percent": 40, "low": false }
      ]
    }
  ],
  "meta": { "page": 1, "page_size": 20, "total": 1248 }
}
```

---

### 6.3 Create product (wizard) — `POST /admin/inventory/products`

**UI:** `/admin/inventory/new` (4 steps: Product Info → Pricing & Stock → Photos → Review)

**Not persisted in mock today** — redirect only.

**Request**

```json
{
  "name": "Hyperion X8 100kW Inverter",
  "sku": "IND-SLR-8802",
  "category": "Renewable Energy",
  "brand": "Suzhou Solar-Tech",
  "description": "string",
  "primary_origin": "CN",
  "price_usd": 4250,
  "stock": 120,
  "image_url": "https://...",
  "images": ["https://...", "https://..."],
  "attributes": [
    { "feature": "Nominal AC Power", "value": "100 kW" }
  ]
}
```

| Step | Fields |
|------|--------|
| 1 Product Info | `name`, `sku`, `category`, `brand`, `description`, `primary_origin` |
| 2 Pricing & Stock | `price_usd`, `stock` (single global stock in UI) |
| 3 Photos | `image_url` (main), `images[]` (gallery) |
| 4 Review | — |

**Images:** prefer `multipart/form-data` with `main_image` + `gallery[]` → server returns URLs.

**Response `201`**

```json
{
  "id": "inv-11",
  "sku": "IND-SLR-8802",
  "name": "Hyperion X8 100kW Inverter",
  "marketplace_price": "$4,250.00 USD",
  "stock": 120,
  "low_stock": false
}
```

---

### 6.4 Update product — `PUT /admin/inventory/products/:id`

Same body as create (partial updates allowed).

**UI:** edit link goes to `/admin/inventory/new?sku=...` (prefill not implemented).

---

## 7. Admin — Sourcing Requests

### 7.1 List sourcing requests — `GET /admin/sourcing/requests`

**UI:** `/admin/sourcing`

**Query**

| Param | Type | Example |
|-------|------|---------|
| `market` | `KE \| AE \| CN \| all` | `KE` |
| `status` | comma-separated | `pending,quoted,shipping` |
| `page` | number | `1` |
| `page_size` | number | `10` |

**Response `200`**

```json
{
  "data": [
    {
      "id": "sr-1",
      "request_number": "SR-2024-0891",
      "client_name": "Jared Maina",
      "client_initials": "JM",
      "product_title": "Industrial Power Inverters",
      "description": "string",
      "destination": "Nairobi, KE",
      "destination_label": "Kenya",
      "status": "pending",
      "market": "KE",
      "reference_images": ["https://...", "https://..."],
      "reference_extra": 2,
      "has_document": false,
      "created_at": "2024-09-24T08:00:00Z"
    }
  ],
  "meta": { "page": 1, "page_size": 10, "total": 258 }
}
```

`status` enum: `AdminSourcingStatus` → `pending` | `quoted` | `shipping` | `delivered`

`market` enum: `HubCode` on each row

**UI actions:** list shows only **View** → `GET /admin/sourcing/requests/:id`

---

### 7.2 Sourcing request detail — `GET /admin/sourcing/requests/:id`

**UI:** `/admin/sourcing/[id]`

**Response `200`:** extends list item with:

```json
{
  "...SourcingRequest fields...",
  "quantity": "500 Units",
  "material_grade": "Aluminum Grade 6061",
  "voltage_range": "1100V - 1500V",
  "budget_total": "$12,500.00",
  "budget_subtitle": "Estimated Total (EXW/FOB)",
  "regional_targets": [{ "code": "CN", "label": "China (CN)" }],
  "attachments": [{ "name": "...", "size": "1.4 MB", "type": "pdf" }],
  "quotes": [],
  "requester_location": "Nairobi, Kenya",
  "product_image_url": "https://..."
}
```

---

### 7.3 Issue / update official quote — `PUT /admin/sourcing/requests/:id/quote`

**UI:** Official Quote form on detail page (`AdminOfficialQuoteForm`)

**One quote per request** in UI (create or replace).

**Request**

```json
{
  "unit_price": "21.50",
  "shipping_cost": "1200.00",
  "transport": "FOB Ningbo",
  "lead_time_days": "14",
  "notes": "Quality certifications, packaging, warranty..."
}
```

| Field | Required | Enum / type |
|-------|----------|-------------|
| `unit_price` | yes | decimal string (UI without `$`) |
| `shipping_cost` | no | decimal string |
| `transport` | yes | `TransportType` or string |
| `lead_time_days` | yes | integer string, 1–365 |
| `notes` | no | string, max 2000 |
| `draft` | no | boolean; `true` = save draft without publishing |

**Response `200`**

```json
{
  "quote": {
    "id": "q-1",
    "unit_price": "$21.50",
    "shipping_cost": "$1,200.00",
    "lead_time": "14 Days",
    "shipment": "FOB Ningbo",
    "notes": "string",
    "official": true
  },
  "request_status": "quoted"
}
```

**Side effect:** sync to linked user request (`admin_user_request_map` or `user_request_id` on admin row). UI maps `sr-1` → `usr-1` in mock.

**Draft:** optional `POST .../quote/draft` with same body + `"draft": true` (UI “Save Draft” — not wired).

---

## 8. Admin — Dashboard, Orders, Logistics

### 8.1 Admin dashboard — `GET /admin/dashboard`

**UI:** `/admin`

**Response `200`**

```json
{
  "kpis": {
    "global_sales_usd": 412890,
    "global_sales_change": "+12.4% vs LW",
    "active_requests": 142,
    "pending_quotes": 8,
    "otd_percent": 94,
    "delayed_shipments": 2
  },
  "sourcing_rows": [
    {
      "id": "dash-sr-1",
      "origin": "CN",
      "destination": "KE",
      "product_title": "Industrial Solar Inverters",
      "quantity": "50 units",
      "vendor": "Longi Solar HK",
      "status_tags": [{ "label": "Pending Quote", "variant": "orange" }],
      "time_ago": "2 hours ago",
      "primary_action": { "label": "Provide Quote", "style": "solid" },
      "secondary_action": { "label": "View Details", "style": "outline" }
    }
  ],
  "logistics": [
    {
      "tracking_id": "DBK-8829",
      "mode": "Sea",
      "status": "TRANSIT",
      "status_variant": "orange",
      "route_from": "Shenzhen",
      "route_to": "Mombasa",
      "eta": "Oct 12"
    }
  ]
}
```

---

### 8.2 Admin sourcing orders — `GET /admin/orders?sourcing=true`

**UI:** `/admin/orders` (sourcing tab)

**Response `200`**

```json
{
  "data": [
    {
      "id": "so-1",
      "order_number": "SRC-9921",
      "customer_name": "Jamal Abdulla",
      "customer_detail": "Textile Sourcing (B2B)",
      "route": "CN → AE",
      "estimated_value": 12450,
      "status": "Quoted",
      "status_variant": "blue",
      "primary_action": "Review Docs",
      "secondary_action": "Approve"
    }
  ]
}
```

---

### 8.3 User marketplace orders — `GET /me/orders/marketplace`

**UI:** `/dashboard/orders` (marketplace tab)

**Response `200`**

```json
{
  "data": [
    {
      "id": "mo-1",
      "order_number": "DBK-882910",
      "title": "Aero-Max Pro Running Shoes",
      "vendor": "Shenzhen Footwear Co.",
      "origin_flag": "CN",
      "image_url": "https://...",
      "status": "In Transit",
      "status_icon": "transit",
      "progress_step": 2,
      "price_kes": "KES 45,000",
      "price_secondary": "$320 USD",
      "date_label": "ETA",
      "date_value": "Oct 12",
      "primary_action": "Track Shipment",
      "secondary_action": "View Invoice",
      "primary_style": "navy"
    }
  ]
}
```

---

### 8.4 Shipment tracking — `GET /shipments/:trackingId`

**Response `200`**

```json
{
  "id": "shp-1",
  "tracking_id": "DBK-8829",
  "current_status": "In transit",
  "origin_city": "Shenzhen",
  "destination_city": "Mombasa",
  "vessel": "MSC Aurora",
  "milestones": [
    {
      "label": "Departed origin",
      "detail": "Shenzhen port",
      "date": "2024-09-01",
      "done": true,
      "active": false
    }
  ]
}
```

---

## 9. Implementation status (mock layer)

| Feature | UI route | Mock / local today |
|---------|----------|-------------------|
| Login / register | `/auth/login`, `/auth/register` | `localStorage` session |
| Cart badge & checkout | `/checkout`, header | `localStorage` cart |
| User sourcing create | `/dashboard/sourcing/new` | `createUserSourcingRequest()` |
| User sourcing list/detail | `/dashboard/sourcing` | `userSourcingRequestsList` |
| Admin sourcing list/detail | `/admin/sourcing` | `mockSourcingRequests` |
| Admin official quote | detail `#official-quote` | `saveAdminOfficialQuote()` |
| Admin categories CRUD | `/admin/categories/*` | `saveAdminCategory()` in memory |
| Admin inventory create | `/admin/inventory/new` | **not saved** (redirect only) |
| Marketplace add to cart | `/marketplace`, PDP | `addCartItem()` local |
| Explore categories | `/categories` | derived from published admin categories |

---

## 10. Suggested endpoint index

```
POST   /auth/login
POST   /auth/register
POST   /auth/logout
GET    /auth/me

GET    /products/:id
GET    /products/:id/related
GET    /marketplace/products
GET    /categories

GET    /cart
POST   /cart/items
PATCH  /cart/items/:lineId
DELETE /cart/items/:lineId
POST   /checkout/shipping
POST   /checkout/complete

GET    /me/sourcing
POST   /me/sourcing/requests
GET    /me/sourcing/requests/:id
GET    /me/orders/marketplace

GET    /admin/dashboard
GET    /admin/categories
POST   /admin/categories
GET    /admin/categories/:id
PUT    /admin/categories/:id
GET    /admin/inventory/kpis
GET    /admin/inventory
POST   /admin/inventory/products
PUT    /admin/inventory/products/:id
GET    /admin/sourcing/requests
GET    /admin/sourcing/requests/:id
PUT    /admin/sourcing/requests/:id/quote
GET    /admin/orders
GET    /shipments/:trackingId
```

---

---

## 11. Frontend integration checklist

1. Add `.env.local` from `.env.example`.
2. Import enums in pages: `import { HUB_CODES, AdminSourcingStatus, ... } from '@/lib/contracts'`.
3. Replace inline string unions in forms with contract types (`CreateSourcingRequestBody`, etc.).
4. In `lib/data.ts`, branch on `USE_API` and call `apiRequest(API_PATHS....)` returning typed DTOs.
5. Extend `setAuthSession` to store `access_token` from `AuthTokensResponse` for `getAccessToken()`.
6. Map API errors: catch `ApiError` and show `details[field]` on form fields.

**Files to wire first (highest value):** `createUserSourcingRequest`, `saveAdminOfficialQuote`, `saveAdminCategory`, `getSourcingRequests`, cart `GET/POST/PATCH`.

---

*Maintained alongside `lib/contracts/*`, `lib/api/*`, `lib/mock-data.ts`, `lib/data.ts`, `lib/cart-storage.ts`, and all routes under `app/`.*
