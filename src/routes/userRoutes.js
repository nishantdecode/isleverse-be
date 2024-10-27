const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
  verifyUser,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, allUsers);
router.get("/verify", protect, verifyUser);

router.post("/", registerUser);
router.post("/login", authUser);

module.exports = router;
