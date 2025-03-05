const express = require("express");
const { calculateScore } = require("../controllers/scoreController.js");
const { updateWallet } = require("../controllers/updateWallet.js");

const router = express.Router();

router.get("/get-score/:username/:address", calculateScore);
router.post("/update-wallet", updateWallet);

module.exports = router;