const express = require("express");
const { purchaseSchedule,getPurchasedSchedules } = require("../controllers/purchasedScheduleController");

const router = express.Router();

// Route to handle purchasing a schedule
router.post("/purchase", purchaseSchedule);
router.get("/purchased", getPurchasedSchedules);

module.exports = router;
