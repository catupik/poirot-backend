const { Router } = require("express");
const router = Router();
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  name: String,
  email: String,
  service: String,
  caseDescription: String,
  consultationType: String,
});

const Message = mongoose.model("MyMessages", messageSchema);

// GET
router.get("/getmessages", async (req, res) => {
  try {
    const messages = await Message.find({});
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});
// POST
router.post("/sendmessage", async (req, res) => {
  try {
    console.log("received data:", req.body);
    let newMessage = new Message({
      name: req.body.name,
      email: req.body.email,
      service: req.body.service,
      caseDescription: req.body.caseDescription,
      consultationType: req.body.consultationType,
    });
    const savedData = await newMessage.save();
    console.log("Saved message:", savedData);

    res.status(200).send("Form saved");
  } catch {
    (err) => {
      console.log(err);
      res.status(500).send("Server error");
    };
  }
});
// DELETE
router.post("/deletemessage", async (req, res) => {
  try {
    const { _id } = req.body;
    await Message.findByIdAndDelete(_id);
    res.send("Message deleted");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
