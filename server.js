const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config(); //connecting with DB

const messagesRoute = require("./routes/Messages.js");
const cartItemsRoute = require('./routes/Carts.js');
const stripeRoute = require('./routes/StripeRoute.js')




mongoose.set("strictQuery", false); //
const PORT = process.env.port || 4000;

app.use(express.json());
app.use(cors());
app.use(messagesRoute);
app.use(cartItemsRoute);
app.use(stripeRoute);



mongoose
  .connect(process.env.MONGODB_LINK)
  .then(() => console.log("CONNECTED TO MONGO"))
  .catch((err) => console.log(err));

app.listen(PORT, () => {
  console.log(`${PORT} works!`);
});
