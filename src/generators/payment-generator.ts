export interface PaymentRecord {
  paymentId: string;
  provider: "adyen" | "braintree" | "clearpay";
  status: string;
  amount: number;
  currency: string;
  reference: string;
  pspReference: string;
  createdAt: string;
  method: string;
  cardLast4?: string;
  metadata: Record<string, string>;
}

interface PaymentOptions {
  provider: "adyen" | "braintree" | "clearpay";
  status: string;
}

export class PaymentGenerator {
  generate(count: number, options: PaymentOptions): PaymentRecord[] {
    return Array.from({ length: count }, () => this.generateOne(options));
  }

  private generateOne(options: PaymentOptions): PaymentRecord {
    const amount = Math.round((Math.random() * 500 + 10) * 100) / 100;

    return {
      paymentId: `PAY-${this.randomHex(12)}`,
      provider: options.provider,
      status: options.status,
      amount,
      currency: "USD",
      reference: this.generateReference(options.provider),
      pspReference: this.generatePspReference(options.provider),
      createdAt: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
      method: this.randomPaymentMethod(options.provider),
      cardLast4: `${Math.floor(1000 + Math.random() * 9000)}`,
      metadata: this.generateMetadata(options.provider),
    };
  }

  private generateReference(provider: string): string {
    switch (provider) {
      case "adyen":
        return `ADYEN-${this.randomHex(16)}`;
      case "braintree":
        return `BT-${this.randomAlphaNum(8)}`;
      case "clearpay":
        return `CP-${Date.now()}-${this.randomHex(6)}`;
      default:
        return `REF-${this.randomHex(10)}`;
    }
  }

  private generatePspReference(provider: string): string {
    switch (provider) {
      case "adyen":
        return `${this.randomInt(8)}${this.randomInt(8)}`;
      case "braintree":
        return `${this.randomAlphaNum(6)}`;
      case "clearpay":
        return `${this.randomInt(10)}`;
      default:
        return this.randomHex(12);
    }
  }

  private randomPaymentMethod(provider: string): string {
    const methods: Record<string, string[]> = {
      adyen: ["visa", "mastercard", "amex", "ideal", "klarna"],
      braintree: ["visa", "mastercard", "paypal", "venmo", "apple_pay"],
      clearpay: ["clearpay_installments"],
    };
    const available = methods[provider] ?? ["visa"];
    return available[Math.floor(Math.random() * available.length)];
  }

  private generateMetadata(provider: string): Record<string, string> {
    return {
      provider_version: provider === "adyen" ? "v68" : provider === "braintree" ? "graphql" : "v2",
      merchant_account: `MERCHANT_${provider.toUpperCase()}`,
      environment: "test",
    };
  }

  private randomHex(length: number): string {
    return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join("").toUpperCase();
  }

  private randomAlphaNum(length: number): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  }

  private randomInt(digits: number): string {
    return Array.from({ length: digits }, () => Math.floor(Math.random() * 10)).join("");
  }
}
