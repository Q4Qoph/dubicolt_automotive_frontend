# C# .NET Backend (v2) Integration Plan

## 1. Overview & Context
The Dubicolt backend has been re-architected with **C# .NET (v2)**, deployed at:
`https://dubicolt-v2.ambitiousrock-1ff861ef.eastus.azurecontainerapps.io`

This document details the schema changes, API endpoints comparison, DTO mappings, and a phase-by-phase implementation plan to consume the new .NET API in the Next.js frontend.

---

## 2. API Endpoint Matrix

| Module | Action | Old Endpoint | New .NET Endpoint (v2) | Auth Required | Request / Query Parameters | Response DTO |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | User Login | `POST /auth/login` | `POST /api/User/login` | No | `{ email, password }` | `{ token, message }` |
| **Auth** | User Register | `POST /auth/register` | `POST /api/User/register` | No | `{ name, email, password }` | `"User registered successfully"` |
| **Auth** | Get Profile | `GET /auth/profile` | `GET /user` | Yes (`Bearer`) | None | `User` object |
| **Parts / Products** | Catalog Search | `GET /products/search` | `GET /api/parts/parts` | No | `?page=&pageSize=&search=&model=&supplier=&sortBy=&sortDirection=` | `RecordResponse` (`items: PartRecord[]`, `totalCount`, etc.) |
| **Parts / Products** | Single Part | `GET /products/:id` | `GET /api/parts/PartsSeed/{id}` | No | Path: `id` (UUID) | `PartRecord` |
| **Cart** | Get Cart | `GET /cart` | `GET /api/Cart` | Yes (`Bearer`) | None | `CartItem[]` |
| **Cart** | Add Item | `POST /cart/items` | `POST /api/Cart` | Yes (`Bearer`) | `{ productId, quantity }` | 200 OK |
| **Cart** | Update Item | `PATCH /cart/items/:id` | `PUT /api/Cart` | Yes (`Bearer`) | `{ productId, quantity }` | 200 OK |
| **Cart** | Remove Item | `DELETE /cart/items/:id` | `DELETE /api/Cart/{id}` | Yes (`Bearer`) | Path: `id` (CartItem UUID) | 200 OK |
| **Orders** | Create Order | `POST /cart/checkout` | `POST /api/Order/create` | Yes (`Bearer`) | `{ deliveryAddress }` | Order confirmation string/ID |
| **Orders** | Get User Orders | `GET /orders` | `GET /api/Order/user` | Yes (`Bearer`) | None | `OrderResponseDto[]` |
| **Orders** | Get Order by ID | `GET /orders/:id` | `GET /api/Order/{orderId}` | Yes (`Bearer`) | Path: `orderId` (UUID) | `OrderResponseDto` |
| **Payment** | M-Pesa STK Push | `POST /payments/mpesa/stk-push` | `POST /api/Payment/initiateStkPush` | Yes (`Bearer`) | `?phoneNumber=...&Id={orderId}` | `StkPushResponseDto` |
| **Payment** | Validate Payment | `GET /payments/verify/:id` | `GET /api/Payment/validate/{orderId}` | Yes (`Bearer`) | Path: `orderId` (UUID) | Payment verification details |
| **Payment** | Payment by Checkout ID | N/A | `GET /api/Payment/{checkoutID}` | Yes (`Bearer`) | Path: `checkoutID` | `Payment` |

---

## 3. Data Transfer Objects (DTO) & Mappings

### 3.1 PartRecord $\rightarrow$ MarketplaceProduct / Product
```typescript
export interface PartRecord {
  id: string;                // UUID
  sourceFile?: string | null;
  supplier?: string | null;  // e.g. "Partsouq"
  rowNo?: number | null;
  partCode?: string | null;
  partName?: string | null;  // e.g. "HEATING & AIR CONDITIONING - COMPRESSOR"
  applicableModel?: string | null; // e.g. "LEXUS NX SERIES"
  price?: number | null;     // Price in double/number (or null)
  imageUrl?: string | null;  // Direct blob storage URL
  createdAtUtc: string;
}

export interface RecordResponse {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: PartRecord[];
}
```

**UI Adaptation Rules:**
- **Product Name**: Display `partName` (fallback to `"Automotive Replacement Part"` if null).
- **Price**: Format `price` (if null or 0, fallback to standard mock/catalog estimation or `"Request Quote"`).
- **Make/Model Matching**: Extracted dynamically from `applicableModel` (e.g. "LEXUS NX SERIES" $\rightarrow$ Make: "Lexus", Model: "NX Series").
- **Image**: Use `imageUrl` from Azure Blob Storage with fallback to category default image.
- **SKU/OEM**: Use `partCode` or `id.slice(0, 8).toUpperCase()`.

---

### 3.2 Cart & Orders
```typescript
export interface CartItemDto {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  product?: PartRecord;
}

export interface OrderItemResponseDto {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: PartRecord;
}

export interface OrderResponseDto {
  id: string;
  userId: string;
  deliveryAddress: string;
  orderStatus: number; // 0=Pending, 1=Confirmed, 2=InTransit, 3=Delivered, etc.
  total: number;
  orderItems: OrderItemResponseDto[];
}
```

---

### 3.3 Payments (M-Pesa STK Push)
```typescript
export interface StkPushResponseDto {
  merchantRequestID: string;
  checkoutRequestID: string;
  responseCode: string;
  responseDescription: string;
  customerMessage: string;
  isSuccessful: boolean;
}
```

---

## 4. Step-by-Step Implementation Roadmap

### Phase 1: Environment & Config Update
1. Update `.env` with new backend target:
   `API_PROXY_TARGET=https://dubicolt-v2.ambitiousrock-1ff861ef.eastus.azurecontainerapps.io`
   `NEXT_PUBLIC_API_BASE_URL=https://dubicolt-v2.ambitiousrock-1ff861ef.eastus.azurecontainerapps.io/api`
2. Update `lib/api/paths.ts` with all new C# .NET API route paths.

### Phase 2: Contracts & Domain Types
1. Add TypeScript interface definitions in `lib/contracts/types.ts` for all .NET DTOs (`PartRecord`, `RecordResponse`, `OrderResponseDto`, `StkPushResponseDto`, `LoginResponse`, etc.).
2. Create mapping functions in `lib/dubicolt/mappers.ts` to seamlessly convert backend `PartRecord` into UI `MarketplaceProduct` and `Product` models.

### Phase 3: Service Layer & React Query Hooks
1. Update `lib/api/services.ts`:
   - `apiLogin()` and `apiRegister()` adapting to `.NET` JWT response format.
   - `apiGetParts(params)` consuming `GET /api/parts/parts` with pagination, search, supplier, and model filters.
   - `apiGetPartById(id)` consuming `GET /api/parts/PartsSeed/{id}`.
   - Cart endpoints (`GET /api/Cart`, `POST /api/Cart`, `PUT /api/Cart`, `DELETE /api/Cart/{id}`).
   - Order endpoints (`POST /api/Order/create`, `GET /api/Order/user`, `GET /api/Order/{id}`).
   - M-Pesa STK push (`POST /api/Payment/initiateStkPush`).
2. Update React Query hooks in `lib/api/hooks.ts`.

### Phase 4: UI Screen Integration
1. **Catalog & Search (`app/marketplace/page.tsx`, `app/page.tsx`)**:
   - Wire up live search against 36,000+ parts using query parameters `search`, `model`, `page`, and `pageSize`.
   - Update vehicle filter dropdowns to leverage real applicable models.
2. **Product Details (`app/product/[id]/page.tsx`)**:
   - Fetch single part record from `GET /api/parts/PartsSeed/{id}`.
3. **Cart & Checkout (`app/checkout/page.tsx`)**:
   - Create order via `/api/Order/create` with delivery address.
   - Trigger M-Pesa payment prompt via `/api/Payment/initiateStkPush`.
4. **User Dashboard (`app/dashboard/orders/page.tsx`)**:
   - Render authenticated buyer orders from `GET /api/Order/user`.
5. **Auth Pages (`app/auth/login`, `app/auth/register`)**:
   - Connect login and registration directly to `/api/User/login` and `/api/User/register`.

### Phase 5: Verification & End-to-End Testing
1. Run `npm run typecheck` to ensure full TypeScript compilation.
2. Test auth login flow with token persistence.
3. Test catalog filtering, search, pagination, and single part retrieval.
4. Test order creation and checkout integration.
