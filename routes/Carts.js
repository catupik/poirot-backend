const { Router } = require("express");
const router = Router();
const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  itemId: Number,
  quantity: Number,
  totalPrice: Number,
  pricePerItem: Number
});


const cartSchema = new mongoose.Schema({
  userId: String,
  items: [CartItemSchema],
});

const Cart = mongoose.model("Cart", cartSchema);


// purchase
const purchaseHistorySchema = new mongoose.Schema({
  userId: String,
  purchases: [{
    items: [CartItemSchema],
    purchaseDate: {
      type: Date,
      default: Date.now
    }
  }]
})

const PurchaseHistory = mongoose.model("PurchaseHistory", purchaseHistorySchema)

// POST create new user 
router.post('/cart/create', async (req, res) => {
    try {
        const { userId } = req.body;
        console.log('Received request to create cart for user:', userId);

        if (!userId) {
            return res.status(400).json({
                error: 'User doesnt exist'
            });
        }

        const existingCart = await Cart.findOne({ userId })
        if (existingCart) {
            console.log('User already has a cart');
            return res.status(200).json({ message: 'User has a cart' })
        }

        // empty ITEMS at creating a new user
        const newCart = new Cart({ userId, items: [] });
        await newCart.save();
        console.log('Cart created successfully');
        res.status(201).json({ message: 'Cart created successfully' })
    } catch (err) {
        console.error('Error when creating user cart', err)
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});


// POST - Add item to cart
router.post("/cart/add", async (req, res) => {
  try {
    const { userId, itemId, quantity, totalPrice, pricePerItem } = req.body;

    if (!userId || !itemId || !quantity || !totalPrice) {
      return res.status(400).json({
        error: "Bad request, missing required fields",
      });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const index = cart.items.findIndex((item) => item.itemId === itemId);
    if (index > -1) {
      cart.items[index].quantity += quantity;
      cart.items[index].totalPrice += totalPrice;
    } else {
      cart.items.push({ itemId, quantity, totalPrice, pricePerItem });
    }
    await cart.save();
    res.status(200).json({ message: "Item added successfully" });
  } catch (err) {
    console.error("Error adding item to cart:", err);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});


// UPDATE QUANTITY 
router.post('/cart/update-quantity', async (req, res) => {
  try {
    const { userId, itemId, newQuantity} = req.body;

    if(!userId || !itemId || newQuantity === undefined){
      return res.status(400).json({
        error: "Bad request, missing required fields"
      });
    }

    const cart = await Cart.findOne({ userId })
    if(!cart ){
      return res.status(404).json({ error: "Cart not found" });
    }

    const item = cart.items.find(item => item.itemId === itemId);
    if (!item) {
      return res.status(404).json({ error: "Item not found in cart" });
  }
  item.quantity = newQuantity;
  item.totalPrice = item.pricePerItem * newQuantity;
  await cart.save();
  res.status(200).json({ message: "Quantity updated successfully" });
} catch (err) {
  console.error("Error updating item quantity in cart:", err);
  res.status(500).json({
      error: "Internal server error",
  });
}
})


// DELETE ITEM FROM CART
router.post('/cart/delete/:userId/:itemId', async (req, res) => {
    try {
        const userId = req.body.userId;
        const itemId = req.body.itemId;
        console.log(`Received request to delete item from cart for user ${userId}, item ${itemId}`);
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            console.log('User not found', userId);
            return res.status(404).json({ error: 'User not found' });
        }

        const index = cart.items.findIndex((item) => item.itemId === Number(itemId));

        if (index > -1) {
            
            await removeItemFromCart(cart, index);
            console.log('Item deleted successfully');
            return res.status(200).json({ message: 'Item deleted successfully' });
        } else {
            console.log('Item not found in the cart');
            return res.status(404).json({ error: 'Item not found in the cart' });
        }
    } catch (err) {
        console.error('Error deleting item from cart', err);
        res.status(500).json({ error: 'Server error' });
    }
});


// delete item from cart
async function removeItemFromCart(cart, index) {
    cart.items.splice(index, 1);
    await cart.save();
}


// GET - Retrieve user's cart
router.get("/cart/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      console.log("Received request for user:", userId);

      const cart = await Cart.findOne({ userId });
        if(!cart) {
            console.log('user not found', userId);
            return res.status(404).json({
                error: 'user not found'
            });
        }

        if (!cart.items || cart.items.length === 0) {
        console.log("cart is empty for user:", userId);
        return res.status(200).json([]);
      }
  
      console.log("Found cart for user:", userId, cart);
      res.json(cart.items);
    } catch (err) {
      console.error("Error retrieving cart:", err);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  });
  

  // POST create purchase

  router.post('/purchase/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const cart = await Cart.findOne({ userId });
  
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }
  
      const purchaseHistory = await PurchaseHistory.findOne({ userId }) || new PurchaseHistory({ userId, purchases: [] });
      purchaseHistory.purchases.push({
        items: [...cart.items],
        purchaseDate: new Date()
      });
  
      await purchaseHistory.save();
  
      //clear the cart
      cart.items = [];
      await cart.save();
  
      res.status(200).json({ message: "Purchase completed" });
    } catch (err) {
      console.error("Error processing purchase:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET purchase history

  router.get('/purchase-history/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      console.log("Received request for user's purchase history:", userId);

      const history = await PurchaseHistory.findOne({ userId });
      if (!history) {
          console.log('Purchase history not found for user:', userId);
          return res.status(404).json({ error: 'Purchase history not found' });
      }

      console.log("Found purchase history for user:", userId, history);
      res.json(history.purchases);
  } catch (err) {
      console.error("Error retrieving purchase history:", err);
      res.status(500).json({ error: "Internal server error" });
  }


  })



module.exports = router;
