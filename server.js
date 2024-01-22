const express = require("express");
const app = express();
const cors = require("cors");
const messagesRoute = require("./routes/Messages.js");
const cartItemsRoute = require('./routes/Carts.js');


const mongoose = require("mongoose");
require("dotenv").config(); //connecting with DB
mongoose.set("strictQuery", false); //
const PORT = process.env.port || 4000;
app.use(express.json());
app.use(cors());
app.use(messagesRoute);
app.use(cartItemsRoute);





mongoose
  .connect(process.env.MONGODB_LINK)
  .then(() => console.log("CONNECTED TO MONGO"))
  .catch((err) => console.log(err));

app.listen(PORT, () => {
  console.log(`${PORT} works!`);
});
