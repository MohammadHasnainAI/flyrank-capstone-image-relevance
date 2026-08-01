import { ImageMetadata } from "./visionSchema.js";

export interface BlogPost {
  id: string;
  title: string;
  topic: string;
  content: string;
}

export interface ImageRecord {
  id: string;
  filename: string;
  metadata: ImageMetadata;
}

// Cosine similarity calculation between two vectors
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (magA * magB);
}

// THE MISMATCH GUARD: Production Safety Layer
export function evaluateMismatchGuard(post: BlogPost, image: ImageRecord, similarityScore: number) {
  const SIMILARITY_THRESHOLD = 0.70;

  // Rule 1: Low Similarity Score Cutoff
  if (similarityScore < SIMILARITY_THRESHOLD) {
    return {
      allowed: false,
      reason: `No confident match. Similarity score (${similarityScore.toFixed(2)}) is below the required threshold (${SIMILARITY_THRESHOLD}).`,
    };
  }

  // Rule 2: Subject & Category Mismatch Check
  const postTopicLower = post.topic.toLowerCase();
  const imageSubjectLower = image.metadata.subject.toLowerCase();

  // Mismatch check: Post is about red foxes, but image is a wolf or dog
  if (postTopicLower.includes("fox") && (imageSubjectLower.includes("wolf") || imageSubjectLower.includes("dog"))) {
    return {
      allowed: false,
      reason: `Animal category mismatch: expected fox topic, but detected ${image.metadata.subject}.`,
    };
  }

  // Rule 3: Low AI confidence check
  if (image.metadata.confidence < 0.75) {
    return {
      allowed: false,
      reason: `Image metadata has low AI confidence (${image.metadata.confidence}). Flagged for manual review.`,
    };
  }

  return {
    allowed: true,
    reason: `Passed Mismatch Guard. Confident match between topic '${post.topic}' and image subject '${image.metadata.subject}'.`,
  };
}