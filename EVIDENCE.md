# Evidence Checklist

- [x] Vision output schema validation via Zod (`src/visionSchema.ts`)
- [x] Low-confidence classification flagging (`validateConfidence()`)
- [x] Mismatch Guard rejects wolf image on red fox post (`evaluateMismatchGuard()`)
- [x] Returns "No confident match" when similarity score is low (< 0.70)