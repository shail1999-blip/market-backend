import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/", (req, res) => res.send("Backend OK"));
app.get("/api/quote
