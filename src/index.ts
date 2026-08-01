import express from "express";
import dotenv from "dotenv";
import { processImageWithVision } from "./visionProcessor.js";
import { evaluateMismatchGuard, BlogPost, ImageRecord } from "./matchingEngine.js";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 3000;

// Sample Seed Posts
const samplePosts: BlogPost[] = [
  {
    id: "post-1",
    title: "The Behavior and Habitat of Red Foxes in the Wild",
    topic: "red fox",
    content: "Red foxes (Vulpes vulpes) are highly adaptable wild mammals known for their orange fur and bushy tails...",
  },
  {
    id: "post-2",
    title: "Understanding Deep Sea Coral Reefs",
    topic: "ocean biology",
    content: "Deep ocean ecosystems host complex coral structures thousands of feet below the surface...",
  },
];

// Sample Seed Images
const sampleImages: ImageRecord[] = [
  {
    id: "img-fox-1",
    filename: "red_fox.jpg",
    metadata: {
      subject: "red fox",
      category: "animal",
      attributes: ["orange fur", "forest", "wild"],
      caption: "A red fox sitting in a snowy forest",
      confidence: 0.95,
    },
  },
  {
    id: "img-wolf-1",
    filename: "gray_wolf.jpg",
    metadata: {
      subject: "gray wolf",
      category: "animal",
      attributes: ["gray fur", "pack", "forest"],
      caption: "A gray wolf standing on a rocky hill",
      confidence: 0.91,
    },
  },
];

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Image Matching Engine" });
});

// Endpoint 1: Fetch posts
app.get("/api/posts", (req, res) => {
  res.json(samplePosts);
});

// Endpoint 2: Fetch images for a post with Mismatch Guard protection
app.get("/api/posts/:id/images", (req, res) => {
  const post = samplePosts.find((p) => p.id === req.params.id);

  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const results = sampleImages.map((image) => {
    const isExactTopicMatch = image.metadata.subject.toLowerCase().includes(post.topic.toLowerCase());
    const simScore = isExactTopicMatch ? 0.92 : 0.62;

    const guardResult = evaluateMismatchGuard(post, image, simScore);

    return {
      imageId: image.id,
      imageSubject: image.metadata.subject,
      similarityScore: simScore,
      guardStatus: guardResult.allowed ? "ACCEPTED" : "REJECTED",
      reason: guardResult.reason,
    };
  });

  res.json({
    postId: post.id,
    postTopic: post.topic,
    recommendations: results,
  });
});

app.post("/api/analyze-image", async (req, res) => {
  try {
    const { base64Image, mimeType } = req.body;
    if (!base64Image) {
      return res.status(400).json({ error: "base64Image field is required" });
    }

    const result = await processImageWithVision(base64Image, mimeType);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});