# FlyRank Capstone - Image Relevance & Mismatch Guard Engine

An automated image relevance and safety verification system built with TypeScript, Node.js, Express, and Zod schema validation.

## Features
- **Zod Schema Validation:** Structured parsing for image metadata and confidence scores.
- **Low-Confidence Flagging:** Automated flagging of low-confidence classification outputs.
- **Mismatch Guard Safety Layer:** Contextual evaluation engine preventing improper image assignments (e.g., rejecting a wolf image for a red fox post).
- **Automated Verification:** Self-contained evaluation test script.

## Setup & Running

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Run automated tests
npm run test