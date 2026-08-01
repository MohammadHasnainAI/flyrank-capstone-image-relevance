import { z } from "zod";

// Schema to strictly validate Gemini output
export const ImageMetadataSchema = z.object({
  subject: z.string(),
  category: z.string(),
  attributes: z.array(z.string()),
  caption: z.string(),
  confidence: z.number().min(0).max(1),
});

export type ImageMetadata = z.infer<typeof ImageMetadataSchema>;

// Function to check confidence score
export function validateConfidence(metadata: ImageMetadata) {
  const CONFIDENCE_THRESHOLD = 0.75;
  const isFlagged = metadata.confidence < CONFIDENCE_THRESHOLD;

  return {
    ...metadata,
    flaggedForReview: isFlagged,
    reviewReason: isFlagged
      ? `Low confidence score (${metadata.confidence}). Needs manual review.`
      : null,
  };
}