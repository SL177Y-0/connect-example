const { getUserDetails } = require("./twitterController.js");
const { getWalletDetails } = require("./BlockchainController.js");
const VeridaTelegramService = require("../Services/veridaTelegramService");

let userWallets = {};

async function updateWallet(req, res) {
    try {
        const { username, address, did } = req.body;

        if (!username) {
            return res.status(400).json({ error: "Provide Twitter username" });
        }
        if (!address) {
            return res.status(400).json({ error: "Provide wallet address" });
        }

        console.log(`📢 Updating Wallet for: Twitter(${username}) → Wallet(${address})`);

        if (!userWallets[username]) {
            userWallets[username] = new Set();
        }
        userWallets[username].add(address);

        const walletAddresses = Array.from(userWallets[username]);

        const userData = await getUserDetails(username);
        let allWalletData = [];

        for (let wallet of walletAddresses) {
            const walletData = await getWalletDetails(wallet);
            allWalletData.push(walletData);
        }

        let telegramMetrics = 0;
        if (did) {
            telegramMetrics = await VeridaTelegramService.getTelegramMetrics(did);
        }

        console.log("✅ Merged Wallet Data:", allWalletData);
        console.log("✅ Telegram Metrics:", telegramMetrics);

        const { score, title } = generateScore(userData, allWalletData[0], telegramMetrics); // Use first wallet for simplicity

        return res.json({ score, title, wallets: walletAddresses });
    } catch (error) {
        console.error("❌ Error updating wallet:", error);
        return res.status(500).json({ error: "Server Error" });
    }
}

module.exports = { updateWallet };