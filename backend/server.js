const express = require("express");
const mongoose = require("mongoose");
const { spawn } = require("child_process");
const cors = require("cors");
const UrlSchema = require("./models/UrlSchema");
const QRCode = require("qrcode");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

const app = express();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://slashbyhash.vercel.app/"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

require("dotenv").config();

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const Url = UrlSchema;

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId: ... }
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

console.log("Hiiiiiii");
// Register new user
app.post("/api/register", async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    const user = new User({ name, email, password });
    await user.save();
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate email error
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// Login user
app.post("/api/login", async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "999999999d",
    });

    res.json({ token, email: user.email, name: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST: Shorten URL
// app.post("/api/shorten", async (req, res, next) => {
//   const { longUrl, customUrl } = req.body;
//   console.log("Call done!");
//   // CASE 1: User provided custom URL
//   if (customUrl) {
//     const existing = await Url.findOne({ customUrl });
//     if (existing)
//       return res.status(409).json({ error: "Custom URL already exists" });

//     const url = new Url({ longUrl, customUrl });
//     await url.save();
//     const fullShortUrl = `http://localhost:5173/${customUrl}`;
//     const qrCodeData = await QRCode.toDataURL(fullShortUrl);
//     return res.json({ shortUrl: customUrl, qrCode: qrCodeData });
//   }

//   console.log("before custom url!");

//   // CASE 2: Generate hash using Java
//   const javaProcess = spawn("java", ["HashGenerator", longUrl]);

//   let output = "";
//   let errorOutput = "";

//   javaProcess.stdout.on("data", (data) => {
//     output += data.toString();
//   });

//   javaProcess.stderr.on("data", (data) => {
//     errorOutput += data.toString();
//   });

//   javaProcess.on("close", async (code) => {
//     if (code !== 0) {
//       console.error("Java process exited with error:", errorOutput);
//       return res.status(500).json({ error: "Hash generation failed" });
//     }

//     const shortUrl = output.trim();

//     if (!shortUrl) {
//       return res.status(500).json({ error: "Empty shortUrl from Java" });
//     }

//     const existing = await Url.findOne({ shortUrl });
//     const fullShortUrl = `http://localhost:5173/${shortUrl}`;
//     const qrCodeData = await QRCode.toDataURL(fullShortUrl); // ✅ Always generate QR

//     if (existing) {
//       return res.json({ shortUrl: existing.shortUrl, qrCode: qrCodeData }); // ✅ include QR
//     }

//     const url = new Url({ longUrl, shortUrl, usageCount: 0 });
//     await url.save();

//     res.json({ shortUrl, qrCode: qrCodeData });
//   });
// });

app.post("/api/shorten", async (req, res, next) => {
  const { longUrl, customUrl } = req.body;

  // Optional: get userId if auth token exists & is valid
  let userId = null;
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (err) {
      // invalid token, ignore and proceed as guest
    }
  }

  try {
    if (customUrl) {
      const existing = await Url.findOne({ customUrl });
      if (existing)
        return res.status(409).json({ error: "Custom URL already exists" });

      const url = new Url({ longUrl, customUrl, userId });
      await url.save();

      const fullShortUrl = `https://slashbyhash.vercel.app/${customUrl}`;
      const qrCodeData = await QRCode.toDataURL(fullShortUrl);
      return res.json({ shortUrl: customUrl, qrCode: qrCodeData });
    }

    const javaProcess = spawn("java", ["HashGenerator", longUrl]);

    let output = "";
    let errorOutput = "";

    javaProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    javaProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    javaProcess.on("close", async (code) => {
      if (code !== 0) {
        console.error("Java process exited with error:", errorOutput);
        return res.status(500).json({ error: "Hash generation failed" });
      }

      const shortUrl = output.trim();

      if (!shortUrl) {
        return res.status(500).json({ error: "Empty shortUrl from Java" });
      }

      const existing = await Url.findOne({ shortUrl });
      const fullShortUrl = `https://slashbyhash.vercel.app/${shortUrl}`;
      const qrCodeData = await QRCode.toDataURL(fullShortUrl);

      if (existing) {
        return res.json({ shortUrl: existing.shortUrl, qrCode: qrCodeData });
      }

      const url = new Url({ longUrl, shortUrl, usageCount: 0, userId });
      await url.save();

      res.json({ shortUrl, qrCode: qrCodeData });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/urls", auth, async (req, res, next) => {
  const userId = req.user.userId;
  const urls = await Url.find({ userId });
  res.json(urls);
});

// GET: Redirect to long URL
app.get("/:shortUrl", async (req, res, next) => {
  const { shortUrl } = req.params;
  const url = await Url.findOne({
    $or: [{ shortUrl }, { customUrl: shortUrl }],
  });

  if (!url) return res.status(404).send("URL not found");

  url.usageCount += 1;
  await url.save();
  res.redirect(url.longUrl);
});

app.delete("/api/urls/:id", auth, async (req, res, next) => {
  const userId = req.user.userId;
  const url = await Url.findOne({ _id: req.params.id, userId });

  if (!url) return res.status(404).json({ error: "URL not found" });

  await Url.deleteOne({ _id: req.params.id, userId });

  res.json({ message: "URL deleted" });
});

// GET: Stats
app.get("/api/stats/:shortUrl", async (req, res, next) => {
  const url = await Url.findOne({
    $or: [
      { shortUrl: req.params.shortUrl },
      { customUrl: req.params.shortUrl },
    ],
  });

  if (!url) return res.status(404).send("URL not found");

  res.json({ usageCount: url.usageCount, longUrl: url.longUrl });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
