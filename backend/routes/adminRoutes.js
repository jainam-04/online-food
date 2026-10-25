const router = require("express").Router();

const {
  adminLogin,
  addFood,
  getFoods,
  deleteFood
} = require("../controllers/adminController");

const {
  getAllUsers,
  deleteUserById
} = require("../controllers/userController");

const {
  getAllOrders,
  updateOrderStatus
} = require("../controllers/orderController");

const { protect, admin } = require("../middlewares/authMiddleware");

// Admin Login
router.post("/login", adminLogin);

// Get all users
router.get("/users", protect, admin, getAllUsers);

// Delete user
router.delete("/user/:id", protect, admin, deleteUserById);

// Get all orders
router.get("/orders", protect, admin, getAllOrders);

// Update order status
router.put("/order/:id/status", protect, admin, updateOrderStatus);

// Foods management
router.post("/food", protect, admin, addFood);
router.get("/foods", protect, admin, getFoods);
router.delete("/food/:id", protect, admin, deleteFood);

module.exports = router;