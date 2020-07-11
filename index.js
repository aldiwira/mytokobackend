import Express from "express";
import Morgan from "morgan";
import Helmet from "helmet";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";

const app = Express();
const port = process.env.PORT || 2000;

app.use(cors());
app.use(helmet());
app.use(morgan("tiny"));
app.use(Express.json());

app.get("/", async (req, res) => {
  res.json({
    App: "My Toko",
    Version: "0.0.0",
    Massage: "Not Seriously project but worth it",
  });
});

app.listen(port, () => {
  console.log(`Magic at http://localhost:${port}`);
});
