/** Cart line shape used by checkout UI (data lives on the API). */
export interface CartItem {
  id: string;
  productId?: string;
  name: string;
  sku: string;
  quantity: number;
  /** USD — logged-in API cart legacy */
  unitPrice?: number;
  /** KES — display & guest cart */
  unitPriceKes: number;
  origin: string;
  imageUrl: string;
}
