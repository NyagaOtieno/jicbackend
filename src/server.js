import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";

const port = Number(process.env.PORT || 5005);
app.listen(port, () => {
  console.log(`JENDiE Inspection API running on :${port}`);
});