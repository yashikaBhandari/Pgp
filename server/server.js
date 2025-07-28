import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import auth from "./routes/auth.js";
import sessions from "./routes/sessions.js";

dotenv.config();
const app = express();

// ✅ Allow requests from frontend
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Use auth routes
app.use("/api/auth", auth);
app.use("/api", auth); // Also mount at /api for login compatibility

// ✅ Use session routes
app.use("/api/sessions", sessions);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    env: {
      mongoConnected: mongoose.connection.readyState === 1,
      hasAIKey: !!(process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY)
    }
  });
});

// ✅ MongoDB connection
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/component-generator";
mongoose.connect(mongoUri)
.then(() => console.log("✅ MongoDB connected to:", mongoUri))
.catch(err => {
  console.log("❌ MongoDB connection error:", err.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 API Documentation:`);
  console.log(`   - Auth: http://localhost:${PORT}/api/auth/`);
  console.log(`   - Sessions: http://localhost:${PORT}/api/sessions/`);
  console.log(`   - Health: http://localhost:${PORT}/api/health`);
});
