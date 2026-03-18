import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin for server-side access
// Note: In a real app, you'd use a service account. 
// For this applet, we'll use environment variables if available or mock for now.
// Since we don't have a service account JSON, we'll use the client SDK or mock the DB calls.
// Actually, for simplicity in this environment, we'll use the client SDK in the frontend
// and only use the server for OAuth redirects and Cron triggers.

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // FB OAuth Redirect
  app.get("/api/auth/fb/url", (req, res) => {
    const clientId = process.env.FB_CLIENT_ID;
    const redirectUri = `${process.env.APP_URL}/api/auth/fb/callback`;
    const scope = "public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts,pages_read_user_content,publish_video";
    const url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
    res.json({ url });
  });

  // FB OAuth Callback
  app.get("/api/auth/fb/callback", async (req, res) => {
    const { code } = req.query;
    const clientId = process.env.FB_CLIENT_ID;
    const clientSecret = process.env.FB_CLIENT_SECRET;
    const redirectUri = `${process.env.APP_URL}/api/auth/fb/callback`;

    try {
      // 1. Exchange code for access token
      const tokenRes = await axios.get(`https://graph.facebook.com/v18.0/oauth/access_token`, {
        params: {
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code,
        },
      });

      const shortToken = tokenRes.data.access_token;

      // 2. Exchange for long-lived token
      const longTokenRes = await axios.get(`https://graph.facebook.com/v18.0/oauth/access_token`, {
        params: {
          grant_type: "fb_exchange_token",
          client_id: clientId,
          client_secret: clientSecret,
          fb_exchange_token: shortToken,
        },
      });

      const longToken = longTokenRes.data.access_token;

      // 3. Get user info
      const meRes = await axios.get(`https://graph.facebook.com/v18.0/me`, {
        params: { access_token: longToken, fields: "id,name,email" },
      });

      // 4. Get Pages
      const pagesRes = await axios.get(`https://graph.facebook.com/v18.0/me/accounts`, {
        params: { access_token: longToken, fields: "id,name,access_token,category" },
      });

      // Redirect back to app with data (or store in session/DB)
      // For this demo, we'll pass it in the URL and let the frontend store it in Firestore
      const data = encodeURIComponent(JSON.stringify({
        fbId: meRes.data.id,
        name: meRes.data.name,
        email: meRes.data.email,
        accessToken: longToken,
        pages: pagesRes.data.data
      }));

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'FB_AUTH_SUCCESS', data: '${data}' }, '*');
                window.close();
              } else {
                window.location.href = '/?fb_data=${data}';
              }
            </script>
            <p>Authentication successful. Closing window...</p>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("FB Auth Error:", error.response?.data || error.message);
      res.status(500).send("Authentication failed. Please check your FB App settings.");
    }
  });

  // Cron Endpoint
  app.get("/api/cron", async (req, res) => {
    console.log("Cron job triggered at", new Date().toISOString());
    // In a real app, this would:
    // 1. Fetch all active pairs from Firestore
    // 2. For each pair, check if it's time to post
    // 3. If yes, fetch new video from source (TikTok/IG)
    // 4. Download (yt-dlp) and post to FB Page
    // 5. If no new video, recycle old one
    
    res.json({ status: "success", message: "Cron job triggered" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
