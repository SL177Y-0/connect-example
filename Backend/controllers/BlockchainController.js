const { fetchBlockchainData } = require("../services/moralisService");

exports.getWalletDetails = async (req, res) => {
    try {
        const address = req.params.address || req.query.address;
        if (!address) {
            return res.status(400).json({ error: "Wallet address is required" });
        }
        const data = await fetchBlockchainData(address);
        return res.json(data);
    } catch (error) {
        console.error("Error in getWalletDetails:", error);
        return res.status(500).json({ error: error.message });
    }
};
