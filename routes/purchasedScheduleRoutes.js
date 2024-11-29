const express = require("express");
const { purchaseSchedule,getPurchasedSchedules } = require("../controllers/purchasedScheduleController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Route to handle purchasing a schedule
router.post("/purchase", authMiddleware,purchaseSchedule);
router.get("/purchased", authMiddleware,getPurchasedSchedules);

module.exports = router;
