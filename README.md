# agent-test-data-smith

[![CI](https://github.com/Jai-Gogineni/agent-test-data-smith/actions/workflows/ci.yml/badge.svg)](https://github.com/Jai-Gogineni/agent-test-data-smith/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

Test data generation agent that creates realistic e-commerce data (orders, payments, refunds, users) using context-aware LLM prompting. Designed for commerce and payment system testing.

## How It Works

```mermaid
graph LR
    A[Schema + Context] --> B[LLM Generator]
    B --> C[Data Validator]
    C --> D{Valid?}
    D -->|Yes| E[Test Data]
    D -->|No| B
```

## Quick Start

```bash
git clone https://github.com/Jai-Gogineni/agent-test-data-smith.git
cd agent-test-data-smith
npm install
cp .env.example .env  # Add your API keys
npm run build
```

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | For intelligent data generation |
| `BRAND_CONTEXT` | No | Brand name for domain-specific data |

## Example Usage

```typescript
import { TestDataSmithAgent } from "./src/agent";

const smith = new TestDataSmithAgent(process.env.ANTHROPIC_API_KEY!);
const orders = await smith.generateOrders(10, "luxury-beauty");
// Returns realistic orders with SKUs, quantities, promotions, totals
console.log(orders[0]);
```

## Architecture

Built with TypeScript for type safety, uses the Anthropic SDK for LLM capabilities, and follows a single-responsibility pattern where each agent has one clear job. Designed to be composable — agents can be chained together for complex workflows.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Author

**Jai Gogineni** — [jaigogineni.com](https://jaigogineni.com) · [LinkedIn](https://uk.linkedin.com/in/jai-gogineni-9a396654)
