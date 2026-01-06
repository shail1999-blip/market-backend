import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

// TODO: later - import KiteConnect and use your api_key, access_token here.

app.get("/api/quote", async (req, res) => {
  const symbol = req.query.symbol;
  if (!symbol) {
    return res.status(400).json({ error: "symbol query param required" });
  }

  // TEMP demo data; will be replaced by Kite Connect quote later.
  const base = 100 + Math.random() * 200;
  const change = (Math.random() - 0.5) * (base * 0.03);
  const price = base + change;
  const changePct = (change / base) * 100;

  res.json({
    symbol,
    price,
    change,
    changePct
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
