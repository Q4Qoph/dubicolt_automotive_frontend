/**
 * Field rules mirrored from UI forms — backend should enforce the same constraints.
 */

export const VALIDATION = {
  auth: {
    email: { required: true, format: 'email', maxLength: 255 },
    password: { required: true, minLength: 8, maxLength: 128 },
    name: { required: true, minLength: 2, maxLength: 120 },
  },
  userSourcingCreate: {
    product_name: { required: true, minLength: 1, maxLength: 200 },
    description: { required: true, minLength: 20, maxLength: 5000 },
    quantity: { required: true, pattern: 'positive_number' },
    target_date: { required: true, format: 'date' },
    accept_terms: { required: true, equals: true },
    budget: { required: false, maxLength: 50 },
    attachments: { required: false, maxFiles: 10, maxSizeMb: 25 },
  },
  adminQuote: {
    unit_price: { required: true, pattern: 'decimal' },
    shipping_cost: { required: false, pattern: 'decimal' },
    transport: { required: true, enum: 'TRANSPORT_TYPES' },
    lead_time_days: { required: true, pattern: 'positive_integer', max: 365 },
    notes: { required: false, maxLength: 2000 },
  },
  adminCategory: {
    name: { required: true, minLength: 1, maxLength: 120 },
    description: { required: true, minLength: 1, maxLength: 2000 },
    origins: { required: true, minItems: 1, maxItems: 3 },
    image_url: { required: true, format: 'url' },
    status: { required: true, enum: 'CATEGORY_STATUSES' },
  },
  adminProduct: {
    name: { required: true, minLength: 1, maxLength: 200 },
    sku: { required: true, minLength: 1, maxLength: 64 },
    category: { required: true, enum: 'INVENTORY_CATEGORY_OPTIONS' },
    description: { required: true, minLength: 1, maxLength: 5000 },
    price_kes: { required: true, min: 1, integer: true },
    stock: { required: true, min: 1, integer: true },
    main_image: { required: true },
    other_images: { required: false, maxItems: 8 },
    low_stock_threshold: 25,
  },
  checkoutShipping: {
    full_name: { required: true, minLength: 2, maxLength: 120 },
    phone: { required: true, minLength: 8, maxLength: 20 },
    address: { required: true, minLength: 5, maxLength: 300 },
    city: { required: true, maxLength: 80 },
    region: { required: true, enum: 'KENYA_REGIONS' },
  },
  cart: {
    quantity: { required: true, min: 1, max: 99999, integer: true },
  },
  list: {
    default_page_size: 10,
    max_page_size: 100,
  },
} as const;
