const express = require('express');
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_TEST);
const bodyParser = require("body-parser");
const cors = require("cors");

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(cors());


router.post("/charge", cors(), async (req, res) => {
    let { amount, id } = req.body;
    try {
      const payment = await stripe.paymentIntents.create({
        amount: amount,
        currency: "USD",
        description: "Your Company Description",
        payment_method: id,
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never'
        },
        return_url: "https://herculepoirot.netlify.app/cart"
      });
      res.json({
        message: "Payment Successful",
        success: true,
      });
    } catch (error) {
      res.json({
        message: "Payment Failed",
        success: false,
      });
    }
  });
  
  module.exports = router;

module.exports = router;