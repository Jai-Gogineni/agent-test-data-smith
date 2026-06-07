import Anthropic from "@anthropic-ai/sdk";
export interface OrderData { orderId: string; items: { sku: string; qty: number; price: number }[]; total: number; }
export class TestDataSmithAgent {
  private client: Anthropic;
  constructor(apiKey: string) { this.client = new Anthropic({ apiKey }); }
  async generateOrders(count: number, brand: string): Promise<OrderData[]> {
    const response = await this.client.messages.create({
      model: "claude-sonnet-4-20250514", max_tokens: 2048,
      messages: [{ role: "user", content: `Generate ${count} realistic e-commerce orders for brand ${brand} as JSON array` }]
    });
    const text = response.content[0].type === "text" ? response.content[0].text : "[]";
    return JSON.parse(text);
  }
}
