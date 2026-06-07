import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { OrderGenerator } from "./generators/order-generator.js";
import { PaymentGenerator } from "./generators/payment-generator.js";
import { RefundGenerator } from "./generators/refund-generator.js";

const server = new Server(
  { name: "agent-test-data-smith", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "generate_order",
      description: "Generate realistic e-commerce order test data with line items, promos, and addresses",
      inputSchema: {
        type: "object" as const,
        properties: {
          count: { type: "number", description: "Number of orders to generate (default: 1)" },
          region: { type: "string", enum: ["US", "UK", "EU", "APAC"], description: "Target region" },
          includePromos: { type: "boolean", description: "Include promotional discounts" },
        },
      },
    },
    {
      name: "generate_payment",
      description: "Generate payment reference data for Adyen/Braintree/Clearpay",
      inputSchema: {
        type: "object" as const,
        properties: {
          provider: { type: "string", enum: ["adyen", "braintree", "clearpay"], description: "Payment provider" },
          count: { type: "number", description: "Number of payment records" },
          status: { type: "string", enum: ["authorized", "captured", "failed", "refunded"] },
        },
        required: ["provider"],
      },
    },
    {
      name: "generate_refund",
      description: "Generate partial or full refund test data",
      inputSchema: {
        type: "object" as const,
        properties: {
          type: { type: "string", enum: ["full", "partial"], description: "Refund type" },
          count: { type: "number", description: "Number of refund records" },
          reason: { type: "string", description: "Refund reason" },
        },
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "generate_order": {
      const count = (args?.count as number) ?? 1;
      const region = (args?.region as string) ?? "US";
      const includePromos = (args?.includePromos as boolean) ?? true;
      const generator = new OrderGenerator();
      const orders = generator.generate(count, { region, includePromos });
      return { content: [{ type: "text", text: JSON.stringify(orders, null, 2) }] };
    }

    case "generate_payment": {
      const provider = args?.provider as "adyen" | "braintree" | "clearpay";
      const count = (args?.count as number) ?? 1;
      const status = (args?.status as string) ?? "authorized";
      const generator = new PaymentGenerator();
      const payments = generator.generate(count, { provider, status });
      return { content: [{ type: "text", text: JSON.stringify(payments, null, 2) }] };
    }

    case "generate_refund": {
      const type = (args?.type as "full" | "partial") ?? "full";
      const count = (args?.count as number) ?? 1;
      const reason = (args?.reason as string) ?? "customer_request";
      const generator = new RefundGenerator();
      const refunds = generator.generate(count, { type, reason });
      return { content: [{ type: "text", text: JSON.stringify(refunds, null, 2) }] };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Agent Test Data Smith MCP server running on stdio");
}

main().catch(console.error);
