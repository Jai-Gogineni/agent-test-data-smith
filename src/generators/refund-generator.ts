export interface RefundRecord {
  refundId: string;
  orderId: string;
  type: "full" | "partial";
  status: "pending" | "approved" | "processed" | "rejected";
  originalAmount: number;
  refundAmount: number;
  currency: string;
  reason: string;
  lineItems?: RefundLineItem[];
  createdAt: string;
  processedAt?: string;
  paymentReference: string;
}

export interface RefundLineItem {
  sku: string;
  name: string;
  quantity: number;
  refundAmount: number;
}

interface RefundOptions {
  type: "full" | "partial";
  reason: string;
}

export class RefundGenerator {
  private reasons = [
    "customer_request",
    "damaged_in_transit",
    "wrong_item_sent",
    "item_not_as_described",
    "late_delivery",
    "duplicate_order",
  ];

  generate(count: number, options: RefundOptions): RefundRecord[] {
    return Array.from({ length: count }, () => this.generateOne(options));
  }

  private generateOne(options: RefundOptions): RefundRecord {
    const originalAmount = Math.round((Math.random() * 400 + 20) * 100) / 100;
    const refundAmount = options.type === "full"
      ? originalAmount
      : Math.round(originalAmount * (Math.random() * 0.7 + 0.1) * 100) / 100;

    const createdAt = new Date(Date.now() - Math.random() * 14 * 86400000);
    const processed = Math.random() > 0.3;

    const record: RefundRecord = {
      refundId: `RFD-${Date.now()}-${this.randomHex(6)}`,
      orderId: `ORD-${Date.now() - Math.floor(Math.random() * 1000000)}-${this.randomHex(6)}`,
      type: options.type,
      status: processed ? "processed" : "pending",
      originalAmount,
      refundAmount,
      currency: "USD",
      reason: options.reason || this.reasons[Math.floor(Math.random() * this.reasons.length)],
      createdAt: createdAt.toISOString(),
      processedAt: processed ? new Date(createdAt.getTime() + Math.random() * 3 * 86400000).toISOString() : undefined,
      paymentReference: `PAY-${this.randomHex(12)}`,
    };

    if (options.type === "partial") {
      record.lineItems = this.generateRefundLineItems(refundAmount);
    }

    return record;
  }

  private generateRefundLineItems(totalRefund: number): RefundLineItem[] {
    const items: RefundLineItem[] = [];
    let remaining = totalRefund;
    const count = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < count; i++) {
      const amount = i === count - 1 ? remaining : Math.round(remaining * Math.random() * 100) / 100;
      items.push({
        sku: `SKU-${this.randomHex(6)}`,
        name: `Product ${i + 1}`,
        quantity: Math.floor(Math.random() * 2) + 1,
        refundAmount: Math.round(amount * 100) / 100,
      });
      remaining -= amount;
    }

    return items;
  }

  private randomHex(length: number): string {
    return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join("").toUpperCase();
  }
}
