import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase limit for Base64 image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

// Standard initial state matching Autotopi Brand
const DEFAULT_LOGO_TEXT = "Autotopi";
const DEFAULT_TAGLINE = "Bangladesh's Leading Automotive TV Show & Media Platform";
const DEFAULT_ADDRESS = "House 44, Kayes Vobon (2nd Floor), Road: Kazi Nazrul Islam Avenue, Dhaka, Bangladesh. (Head Office)";
const DEFAULT_HELPLINE = "+880 1882-201114";
const DEFAULT_EMAIL = "autotopibd@gmail.com";
const DEFAULT_YOUTUBE = "https://www.youtube.com/@autotopi";
const DEFAULT_FACEBOOK = "https://web.facebook.com/profile.php?id=61576315877474";
const DEFAULT_INSTAGRAM = "https://instagram.com/autotopi";
const DEFAULT_COPYRIGHT = "© 2026 AUTOTOPI. All Rights Reserved.";

const INITIAL_DB = {
  banners: [
    {
      id: "banner-1",
      imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&auto=format&fit=crop&q=80",
      title: "Bangladesh's Premier Automotive TV Show",
      subtitle: "Bringing you in-depth car reviews, top-tier automotive news, and high-energy local coverage.",
      ctaText: "Read Latest News",
      ctaLink: "/news"
    },
    {
      id: "banner-2",
      imageUrl: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1600&auto=format&fit=crop&q=80",
      title: "Watch Autotopi Episodes in HD",
      subtitle: "Catch our dynamic reviews, launch test drives, and event logs directly from our official channels.",
      ctaText: "Watch Videos",
      ctaLink: "/videos"
    }
  ],
  news: [
    {
      id: "news-1",
      title: "Suzuki Swift 2026 launched in Bangladesh: Price & Specifications",
      excerpt: "The legendary compact city car undergoes a sporty evolution with hybrid assistance, upgraded security, and a digital console.",
      content: "Suzuki's long-standing champion, the Swift, has officially debuted its 2026 generation in Bangladesh. The new model is powered by a high-efficiency 1.2-litre petrol hybrid motor designed to extract maximum mileage in bumper-to-bumper Dhaka traffic. Equipped with modern features including ADAS-lite safety assists, a floating touchscreen console, and sleek LED daytime running lights, it represents a bold leap forward.\n\n### Key Highlights:\n- **Engine:** 1.2L Mild Hybrid 3-Cylinder engine\n- **Transmission:** Smooth CVT with sports-mode response\n- **Fuel Economy:** Promising up to 21 km/L under standard test conditions\n- **Safety:** Standard 6 Airbags, Lane Keep Assist, and Hill Start Control\n\nAuthorized distributors have commenced official bookings, with starting prices estimated from BDT 24.5 Lakhs. Deliveries are expected to begin early next quarter. Audiences can check our video tab shortly for the absolute full test drive in Dhaka.",
      category: "Launches",
      imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80",
      publishDate: "2026-05-28T09:00:00Z",
      author: "Autotopi Newsdesk"
    },
    {
      id: "news-2",
      title: "Toyota Corolla Cross Hybrid Road Test on Dhaka Streets",
      excerpt: "We evaluate the premium hybrid crossover under heavy traffic and severe highway conditions to check fuel economy and high-ground ride safety.",
      content: "The Toyota Corolla Cross has been a major volume driver for hybrid imports in Bangladesh. The face-lift model introduces a refreshed geometric front grille, sequential turn indicators, and panoramic sunroof options. In our testing on Dhaka-Mymensingh highway, the hybrid system transitioned seamlessly between battery and petrol power, achieving an astonishing average of 18.5 km/L under mixed city-highway conditions. Comfort is outstanding, making it a stellar family choice.\n\n### Our Verdict:\nFor Bangladeshi families seeking reliability, elevated road clearance for waterlogged monsoon streets, and low running costs, the Corolla Cross Hybrid remains the gold standard in its price bracket.",
      category: "Reviews",
      imageUrl: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&auto=format&fit=crop&q=80",
      publishDate: "2026-05-25T14:30:00Z",
      author: "Razeev Chowdhury"
    },
    {
      id: "news-3",
      title: "Electric Vehicle Charger Networks Open Along Main National Highways",
      excerpt: "Multiple fast-charging stations go operational on Dhaka-Chittagong-Cox's Bazar transport corridor to boost electric mobility.",
      content: "The dream of driving electric vehicles from Dhaka to Cox's Bazar is now a reality. Six multi-charger stations of 120kW DC fast capacity have been officially inaugurated along the Dhaka-Chittagong-Cox's Bazar transport corridor. These stations can charge modern EVs from 10% to 80% in less than 35 minutes.\n\nThis infrastructure expansion relieves the long-standing 'range anxiety' holding back prospective electric crossover owners in Dhaka. Industry experts anticipate a 40% surge in green vehicle registrations within the calendar year.",
      category: "Industry Insight",
      imageUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=80",
      publishDate: "2026-05-20T11:15:00Z",
      author: "Autotopi Tech"
    }
  ],
  videos: [
    {
      id: "video-1",
      title: "Toyota Crown Crossover Review - Premium Sophistication in Dhaka!",
      description: "We take the gorgeous new Toyota Crown Crossover out for a spin around the capital. Experience luxury, high ride height dynamics, and premium technology.",
      youtubeUrl: "https://www.youtube.com/watch?v=kYI9Ea_1u2c",
      youtubeId: "kYI9Ea_1u2c",
      publishDate: "2026-05-29"
    },
    {
      id: "video-2",
      title: "Sleek Audi e-tron GT Launch Review - Real Electric Muscle",
      description: "Step inside the futuristic electric daily touring supercar. Check out the spectacular acceleration and design lines under local conditions.",
      youtubeUrl: "https://www.youtube.com/watch?v=UqQ3ZWhuREc",
      youtubeId: "UqQ3ZWhuREc",
      publishDate: "2026-05-15"
    }
  ],
  services: [
    {
      id: "service-1",
      iconName: "Car",
      title: "Automotive Reviews",
      description: "Comprehensive test-drives, technical specifications analyses, and deep aesthetic commentary crafted specifically for local digital audiences in Bangladesh.",
      images: ["https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&auto=format&fit=crop&q=80"]
    },
    {
      id: "service-2",
      iconName: "Tv",
      title: "TV Show Production",
      description: "High-production-value TV show episodes and video clips displaying exquisite car visuals, interviews, and automotive lifestyle features.",
      images: ["https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&auto=format&fit=crop&q=80"]
    },
    {
      id: "service-3",
      iconName: "Megaphone",
      title: "Brand Promotion",
      description: "Custom branding support, promotional video clips, social media influencer activations, and high-conversion advertisement campaign placements.",
      images: ["https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80"]
    },
    {
      id: "service-4",
      iconName: "Camera",
      title: "Event Media & Photography",
      description: "In-depth photographic reports of launches and rallies combined with strategic social distribution across Autotopi's popular media network.",
      images: ["https://images.unsplash.com/photo-1542362567-b07eac79094d?w=600&auto=format&fit=crop&q=80"]
    }
  ],
  messages: [] as any[],
  settings: {
    logoText: DEFAULT_LOGO_TEXT,
    tagline: DEFAULT_TAGLINE,
    address: DEFAULT_ADDRESS,
    helpline: DEFAULT_HELPLINE,
    email: DEFAULT_EMAIL,
    youtubeUrl: DEFAULT_YOUTUBE,
    facebookUrl: DEFAULT_FACEBOOK,
    instagramUrl: DEFAULT_INSTAGRAM,
    copyright: DEFAULT_COPYRIGHT
  }
};

// Safe DB reading and writing helpers
async function initDatabase() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    try {
      await fs.access(DB_FILE);
    } catch {
      await fs.writeFile(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), "utf-8");
      console.log("Database initialized successfully with mock seeds.");
    }
  } catch (error) {
    console.error("Failed to initialize database: ", error);
  }
}

async function readDb() {
  try {
    const content = await fs.readFile(DB_FILE, "utf-8");
    const db = JSON.parse(content);
    
    // Auto management: inquiries older than 7 days should be automatically deleted
    if (db.messages && db.messages.length > 0) {
      const now = Date.now();
      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
      const initialCount = db.messages.length;
      
      db.messages = db.messages.filter((msg: any) => {
        if (!msg.createdAt) return false;
        const msgTime = new Date(msg.createdAt).getTime();
        return (now - msgTime) < SEVEN_DAYS_MS;
      });
      
      if (db.messages.length !== initialCount) {
        await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
        console.log(`[Auto-cleanup] Purged ${initialCount - db.messages.length} messages older than 7 days.`);
      }
    }
    
    return db;
  } catch {
    return INITIAL_DB;
  }
}

async function writeDb(data: any) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// Database models are initialized on startup inside the server bootloader

// ---------------------- PUBLIC API ROUTES ----------------------

// Get public website information
app.get("/api/data", async (req, res) => {
  try {
    const db = await readDb();
    // Exclude private messages and admin passwords from general public view
    const { messages, ...publicData } = db;
    res.json(publicData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Submit a custom contact inquiry
app.post("/api/contact", async (req, res) => {
  try {
    const { name, phone, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required fields." });
    }

    const db = await readDb();
    const newMessage = {
      id: "msg-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
      name,
      phone: phone || "",
      email,
      subject: subject || "General Inquiry",
      message,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    if (!db.messages) db.messages = [];
    db.messages.unshift(newMessage);
    await writeDb(db);

    res.json({ success: true, message: "Thank you! Your message has been safely delivered." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Authentication login
app.post("/api/admin/login", async (req, res) => {
  try {
    const { password } = req.body;
    const environmentSecret = process.env.ADMIN_PASSWORD || "1234-5678-9012-3456";

    // Clean out spaces and hyphens to allow lenient exact inputs
    const cleanInput = (password || "").replace(/[-\s]/g, "");
    const cleanSecret = environmentSecret.replace(/[-\s]/g, "");

    if (cleanInput === cleanSecret && cleanInput.length >= 16) {
      return res.json({ success: true, token: environmentSecret });
    } else {
      return res.status(401).json({ error: "Invalid 16-digit administrator password." });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------------- ADMIN ENDPOINTS (SECURED) ----------------------

const authenticateAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers["x-admin-password"] as string;
  const environmentSecret = process.env.ADMIN_PASSWORD || "1234-5678-9012-3456";

  const cleanInput = (token || "").replace(/[-\s]/g, "");
  const cleanSecret = environmentSecret.replace(/[-\s]/g, "");

  if (cleanInput && cleanInput === cleanSecret) {
    next();
  } else {
    res.status(403).json({ error: "Access Denied. Invalid or missing administrator credentials." });
  }
};

// Get complete DB details including inquiries
app.get("/api/admin/data", authenticateAdmin, async (req, res) => {
  try {
    const db = await readDb();
    res.json(db);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update banners
app.post("/api/admin/banners", authenticateAdmin, async (req, res) => {
  try {
    const { banners } = req.body;
    if (!Array.isArray(banners)) {
      return res.status(400).json({ error: "Banners must be an array." });
    }
    const db = await readDb();
    db.banners = banners;
    await writeDb(db);
    res.json({ success: true, banners });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update news posts
app.post("/api/admin/news", authenticateAdmin, async (req, res) => {
  try {
    const { post } = req.body;
    if (!post || !post.title || !post.content) {
      return res.status(400).json({ error: "Post title and content are required parameters." });
    }

    const db = await readDb();
    if (!db.news) db.news = [];

    if (post.id) {
      const idx = db.news.findIndex((item: any) => item.id === post.id);
      if (idx !== -1) {
        db.news[idx] = { ...db.news[idx], ...post, publishDate: new Date().toISOString() };
      } else {
        db.news.unshift(post);
      }
    } else {
      const newId = "news-" + Date.now();
      db.news.unshift({
        ...post,
        id: newId,
        publishDate: new Date().toISOString()
      });
    }

    await writeDb(db);
    res.json({ success: true, news: db.news });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete news post
app.delete("/api/admin/news/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await readDb();
    db.news = (db.news || []).filter((item: any) => item.id !== id);
    await writeDb(db);
    res.json({ success: true, news: db.news });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update videos
app.post("/api/admin/videos", authenticateAdmin, async (req, res) => {
  try {
    const { video } = req.body;
    if (!video || !video.title || !video.youtubeUrl) {
      return res.status(400).json({ error: "Video title and YouTube URL are required." });
    }

    // Attempt to extract YouTube ID
    let youtubeId = "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = video.youtubeUrl.match(regExp);
    if (match && match[2].length === 11) {
      youtubeId = match[2];
    }

    const db = await readDb();
    if (!db.videos) db.videos = [];

    const videoData = {
      ...video,
      youtubeId,
      publishDate: video.publishDate || new Date().toISOString().split("T")[0]
    };

    if (video.id) {
      const idx = db.videos.findIndex((item: any) => item.id === video.id);
      if (idx !== -1) {
        db.videos[idx] = { ...db.videos[idx], ...videoData };
      } else {
        db.videos.unshift(videoData);
      }
    } else {
      videoData.id = "video-" + Date.now();
      db.videos.unshift(videoData);
    }

    await writeDb(db);
    res.json({ success: true, videos: db.videos });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete video
app.delete("/api/admin/videos/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await readDb();
    db.videos = (db.videos || []).filter((item: any) => item.id !== id);
    await writeDb(db);
    res.json({ success: true, videos: db.videos });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update services
app.post("/api/admin/services", authenticateAdmin, async (req, res) => {
  try {
    const { service } = req.body;
    if (!service || !service.title || !service.description) {
      return res.status(400).json({ error: "Service title and description are required." });
    }

    const db = await readDb();
    if (!db.services) db.services = [];

    if (service.id) {
      const idx = db.services.findIndex((item: any) => item.id === service.id);
      if (idx !== -1) {
        db.services[idx] = { ...db.services[idx], ...service };
      } else {
        db.services.unshift(service);
      }
    } else {
      service.id = "service-" + Date.now();
      db.services.push(service);
    }

    await writeDb(db);
    res.json({ success: true, services: db.services });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete service
app.delete("/api/admin/services/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await readDb();
    db.services = (db.services || []).filter((item: any) => item.id !== id);
    await writeDb(db);
    res.json({ success: true, services: db.services });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update inquiry message status
app.post("/api/admin/messages/:id/status", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (status !== "pending" && status !== "completed") {
      return res.status(400).json({ error: "Status must be either 'pending' or 'completed'." });
    }

    const db = await readDb();
    const idx = (db.messages || []).findIndex((msg: any) => msg.id === id);
    if (idx !== -1) {
      db.messages[idx].status = status;
      await writeDb(db);
      return res.json({ success: true, messages: db.messages });
    } else {
      return res.status(404).json({ error: "Inquiry message not found." });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete message
app.delete("/api/admin/messages/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await readDb();
    db.messages = (db.messages || []).filter((msg: any) => msg.id !== id);
    await writeDb(db);
    res.json({ success: true, messages: db.messages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update general settings
app.post("/api/admin/settings", authenticateAdmin, async (req, res) => {
  try {
    const { settings } = req.body;
    if (!settings) {
      return res.status(400).json({ error: "Settings parameters are required." });
    }

    const db = await readDb();
    db.settings = { ...db.settings, ...settings };
    await writeDb(db);
    res.json({ success: true, settings: db.settings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Upload direct static media using Base64 format
app.post("/api/admin/media", authenticateAdmin, async (req, res) => {
  try {
    const { name, type, data } = req.body;
    if (!name || !data) {
      return res.status(400).json({ error: "Media filename and Base64 data are required." });
    }

    // Strip header prefix if present (e.g. "data:image/png;base64,")
    const cleanBase64 = data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(cleanBase64, "base64");

    // Clean name from path injections
    const sanitizedName = path.basename(name).replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const uniqueName = Date.now() + "_" + sanitizedName;
    const destPath = path.join(UPLOADS_DIR, uniqueName);

    await fs.writeFile(destPath, buffer);

    // Return the accessible public URL
    const publicUrl = `/uploads/${uniqueName}`;
    res.json({ success: true, url: publicUrl });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

import https from "https";
import { createWriteStream } from "fs";

// Cache official CDN logo locally so Facebook link expiration can't disrupt rendering
async function downloadOfficialLogo() {
  const logoUrl = "https://scontent.fdac1-2.fna.fbcdn.net/v/t39.30808-6/512028982_122124880316877195_7489545040047953738_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeHDJ0-1xpOQcyRcLvNcxVIKOXZKRM9ZajU5dkpEz1lqNcAGFUTSTNEu1TW5snbdIg7BdFj46yd6ei1s8vo3Tw25&_nc_ohc=SpRivKw598IQ7kNvwFZQCT4&_nc_oc=AdrooC6bBj0KyJxPOQMFp1X0bBhHlTjwzvNY3x6XxHitP5LJIGnuqcHS7hVfXvO3X6E&_nc_zt=23&_nc_ht=scontent.fdac1-2.fna&_nc_gid=JckMexRB5m7D2Q41J9-Z6w&_nc_ss=7b2a8&oh=00_Af_P9JiBU8pz4FKTsuFPfzKDJtwUfajaHfhlo39AiTOKPg&oe=6A2205F2";
  const logoPath = path.join(process.cwd(), "public", "logo.png");
  
  try {
    const fileStream = createWriteStream(logoPath);
    https.get(logoUrl, (response) => {
      response.pipe(fileStream);
      fileStream.on("finish", () => {
        fileStream.close();
        console.log("Cached official high-res Facebook CDN logo locally to public/logo.png");
      });
    }).on("error", (err) => {
      console.warn("Failed to update logo over HTTPS (offline/firewall?):", err.message);
    });
  } catch (err: any) {
    console.warn("Skipped logo cache write sequence:", err.message);
  }
}

// Serve direct upload static files
app.use("/uploads", express.static(UPLOADS_DIR));

// ---------------------- FRONTEND ROUTING & VITE MIDDLEWARE ----------------------

async function startServer() {
  // Ensure database folders are live
  await initDatabase();
  await downloadOfficialLogo();

  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Autotopi Engine listening on port ${PORT}`);
  });
}

startServer();
