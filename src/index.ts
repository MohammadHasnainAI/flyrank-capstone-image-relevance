import express from "express";
import dotenv from "dotenv";
import { processImageWithVision } from "./visionProcessor.js";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 3000;

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Image Matching Engine" });
});

// Endpoint to analyze images
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