const express = require("express");
const { getWalletDetails } = require("../controllers/BlockchainController");

const router = express.Router();

// Fixed route to include address parameter
router.get("/fetch-blockchain-data/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const data = await getWalletDetails(address);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
