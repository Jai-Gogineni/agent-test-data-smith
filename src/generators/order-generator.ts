export interface OrderLineItem {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
}

export interface Address {
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface PromoDiscount {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  appliedAmount: number;
}

export interface Order {
  orderId: string;
  createdAt: string;
  status: string;
  currency: string;
  lineItems: OrderLineItem[];
  shippingAddress: Address;
  billingAddress: Address;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  promos?: PromoDiscount[];
}

interface OrderOptions {
  region: string;
  includePromos: boolean;
}

export class OrderGenerator {
  private products = [
    { name: "Wireless Headphones", sku: "WH-1000XM5", price: 349.99, category: "Electronics" },
    { name: "Running Shoes", sku: "NK-AIR-MAX-90", price: 129.99, category: "Footwear" },
    { name: "Organic Coffee Beans 1kg", sku: "COF-ORG-1KG", price: 24.99, category: "Grocery" },
    { name: "Yoga Mat Premium", sku: "YM-PRO-6MM", price: 59.99, category: "Fitness" },
    { name: "USB-C Hub 7-in-1", sku: "USB-HUB-7P", price: 44.99, category: "Electronics" },
    { name: "Stainless Water Bottle", sku: "WB-SS-750ML", price: 32.99, category: "Lifestyle" },
    { name: "Bluetooth Speaker", sku: "BT-SPK-360", price: 89.99, category: "Electronics" },
    { name: "Cotton T-Shirt", sku: "TS-CTN-BLK-M", price: 29.99, category: "Apparel" },
  ];

  private promoCodes = [
    { code: "SAVE20", type: "percentage" as const, value: 20 },
    { code: "FLAT10", type: "fixed" as const, value: 10 },
    { code: "WELCOME15", type: "percentage" as const, value: 15 },
    { code: "SUMMER25", type: "percentage" as const, value: 25 },
  ];

  generate(count: number, options: OrderOptions): Order[] {
    return Array.from({ length: count }, () => this.generateOne(options));
  }

  private generateOne(options: OrderOptions): Order {
    const itemCount = this.randomInt(1, 5);
    const lineItems = this.generateLineItems(itemCount);
    const subtotal = lineItems.reduce((sum, item) => sum + item.totalPrice, 0);

    let discount = 0;
    let promos: PromoDiscount[] | undefined;

    if (options.includePromos && Math.random() > 0.3) {
      const promo = this.promoCodes[this.randomInt(0, this.promoCodes.length - 1)];
      const appliedAmount = promo.type === "percentage"
        ? Math.round(subtotal * (promo.value / 100) * 100) / 100
        : Math.min(promo.value, subtotal);
      discount = appliedAmount;
      promos = [{ ...promo, appliedAmount }];
    }

    const taxRate = this.getTaxRate(options.region);
    const tax = Math.round((subtotal - discount) * taxRate * 100) / 100;
    const total = Math.round((subtotal - discount + tax) * 100) / 100;

    return {
      orderId: `ORD-${Date.now()}-${this.randomHex(6)}`,
      createdAt: this.randomRecentDate(),
      status: "confirmed",
      currency: this.getCurrency(options.region),
      lineItems,
      shippingAddress: this.generateAddress(options.region),
      billingAddress: this.generateAddress(options.region),
      subtotal: Math.round(subtotal * 100) / 100,
      discount,
      tax,
      total,
      promos,
    };
  }

  private generateLineItems(count: number): OrderLineItem[] {
    const selected = this.shuffle([...this.products]).slice(0, count);
    return selected.map((product) => {
      const quantity = this.randomInt(1, 3);
      return {
        sku: product.sku,
        name: product.name,
        quantity,
        unitPrice: product.price,
        totalPrice: Math.round(product.price * quantity * 100) / 100,
        category: product.category,
      };
    });
  }

  private generateAddress(region: string): Address {
    const addresses: Record<string, () => Address> = {
      US: () => ({
        firstName: "John", lastName: "Smith",
        line1: `${this.randomInt(100, 9999)} ${this.pick(["Oak", "Maple", "Cedar", "Elm"])} St`,
        city: this.pick(["Austin", "Portland", "Denver", "Seattle"]),
        state: this.pick(["TX", "OR", "CO", "WA"]),
        postalCode: `${this.randomInt(10000, 99999)}`,
        country: "US",
      }),
      UK: () => ({
        firstName: "James", lastName: "Wilson",
        line1: `${this.randomInt(1, 200)} ${this.pick(["High", "Church", "London", "Park"])} Road`,
        city: this.pick(["London", "Manchester", "Bristol", "Leeds"]),
        state: this.pick(["Greater London", "Greater Manchester", "Somerset", "West Yorkshire"]),
        postalCode: `${this.pick(["SW1", "EC2", "M1", "BS1"])} ${this.randomInt(1, 9)}${this.pick(["AB", "CD", "EF"])}`,
        country: "GB",
      }),
      EU: () => ({
        firstName: "Marie", lastName: "Dubois",
        line1: `${this.randomInt(1, 100)} Rue de la Paix`,
        city: this.pick(["Paris", "Berlin", "Amsterdam", "Munich"]),
        state: "", postalCode: `${this.randomInt(10000, 99999)}`, country: "FR",
      }),
      APAC: () => ({
        firstName: "Yuki", lastName: "Tanaka",
        line1: `${this.randomInt(1, 50)}-${this.randomInt(1, 20)} Shibuya`,
        city: this.pick(["Tokyo", "Sydney", "Singapore", "Seoul"]),
        state: "", postalCode: `${this.randomInt(100, 999)}-${this.randomInt(1000, 9999)}`, country: "JP",
      }),
    };

    return (addresses[region] ?? addresses.US)();
  }

  private getTaxRate(region: string): number {
    const rates: Record<string, number> = { US: 0.0825, UK: 0.2, EU: 0.21, APAC: 0.1 };
    return rates[region] ?? 0.08;
  }

  private getCurrency(region: string): string {
    const currencies: Record<string, string> = { US: "USD", UK: "GBP", EU: "EUR", APAC: "JPY" };
    return currencies[region] ?? "USD";
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private randomHex(length: number): string {
    return Math.random().toString(16).slice(2, 2 + length).toUpperCase();
  }

  private randomRecentDate(): string {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(Date.now() - daysAgo * 86400000);
    return date.toISOString();
  }

  private pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
