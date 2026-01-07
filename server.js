import express from "express";
import cors from "cors";
import { KiteConnect } from "kiteconnect";

const app = express();
app.use(cors());

// ====== KITE CONNECT CONFIG ======
const apiKey = "ip2gr6e6353j09o7"; // your Kite API key
const accessToken = process.env.KITE_ACCESS_TOKEN; // must be set in Render

if (!accessToken) {
  console.error("ERROR: KITE_ACCESS_TOKEN is not set in environment.");
}

const kc = new KiteConnect({ api_key: apiKey });
if (accessToken) {
  kc.setAccessToken(accessToken);
}

// ====== HELPER: fetch quote from Kite ======
async function getQuoteFromKite(exchangeSymbol) {
  // exchangeSymbol like "NSE:RELIANCE"
  const quotes = await kc.getQuote([exchangeSymbol]); // [web:182]
  const q = quotes[exchangeSymbol];
  if (!q || typeof q.last_price !== "number") {
    throw new Error("No quote for " + exchangeSymbol);
  }

  const price = q.last_price;
  const prevClose =
    q.ohlc && typeof q.ohlc.close === "number" ? q.ohlc.close : price;
  const change = price - prevClose;
  const changePct = prevClose ? (change / prevClose) * 100 : 0;

  return {
    symbol: exchangeSymbol,
    price,
    change,
    changePct
  };
}

// ====== API: /api/quote?symbol=RELIANCE ======
app.get("/api/quote", async (req, res) => {
  try {
    const symbol = (req.query.symbol || "").trim().toUpperCase();
    if (!symbol) {
      return res.status(400).json({ error: "symbol query param required" });
    }

    if (!accessToken) {
      return res
        .status(500)
        .json({ error: "KITE_ACCESS_TOKEN not set on server" });
    }

    const exchangeSymbol = "NSE:" + symbol; // assume NSE
    const data = await getQuoteFromKite(exchangeSymbol);
    res.json(data);
  } catch (err) {
    console.error("Error in /api/quote:", err.message);
    res.status(500).json({ error: "Failed to fetch quote" });
  }
});

// Simple health check
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    kiteConfigured: !!accessToken
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Backend running on port", PORT);
});
