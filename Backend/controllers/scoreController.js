const { getUserDetails } = require("./twitterController.js");
const { getWalletDetails } = require("./BlockchainController.js");
const VeridaTelegramService = require("../Services/veridaTelegramService");

async function calculateScore(req, res) {
    try {
        console.log("🔍 Request Params Received:", req.params);

        let { username, address } = req.params;
        const did = req.query.did; // Verida DID from query parameter

        if (!username) {
            return res.status(400).json({ error: "Provide Twitter username" });
        }

        if (address === "null") {
            address = null;
        }

        console.log(`📢 Fetching data for: Twitter(${username}), Wallet(${address || "None"})`);

        const userData = await getUserDetails(username);
        if (!userData) {
            return res.status(500).json({ error: "Error fetching Twitter user data" });
        }

        let walletData = {};
        if (address) {
            walletData = await getWalletDetails(address);
        }

        let telegramMetrics = 0;
        if (did) {
            telegramMetrics = await VeridaTelegramService.getTelegramMetrics(did);
        }

        console.log("✅ User Data:", userData);
        console.log("✅ Wallet Data:", walletData);
        console.log("✅ Telegram Metrics:", telegramMetrics);

        // Use the generateScore function here
        const { score, title } = generateScore(userData, walletData, telegramMetrics);

        res.json({
            score: score,
            title: title
        });
    } catch (error) {
        console.error("Error calculating score:", error);
        res.status(500).json({ error: "Server Error" });
    }
}

function generateScore(userData, walletData = {}, telegramMetrics = 0) {
    let socialScore = 0;
    const user = userData?.data?.user?.result || {};

    const followers = user.followers_count || 0;
    socialScore += followers > 10000000 ? 40 : followers > 1000000 ? 30 : followers > 100000 ? 20 : 10;

    const engagement = (user.favourites_count || 0) + (user.media_count || 0) + (user.listed_count || 0);
    socialScore += engagement > 50000 ? 10 : engagement > 10000 ? 5 : 0;

    if (user.is_blue_verified) socialScore += 5;
    socialScore = Math.min(socialScore, 40);

    let cryptoScore = 0;
    const activeChains = walletData?.activeChains?.length || 0;
    cryptoScore += activeChains > 1 ? 20 : activeChains === 1 ? 10 : 0;

    if ((walletData?.nativeBalance || 0) > 1) cryptoScore += 10;
    if ((walletData?.defiPositionsSummary?.length || 0) > 0) cryptoScore += 10;

    let nftScore = (walletData?.walletNFTs?.length || 0) > 0 ? 20 : 0;

    let communityScore =
        (user.creator_subscriptions_count || 0) >= 5
            ? 10
            : (user.creator_subscriptions_count || 0) > 0
            ? 5
            : 0;

    let telegramScore = telegramMetrics * 10; // Scale Telegram metrics (0-1) to 0-10

    const totalScore = socialScore + cryptoScore + nftScore + communityScore + telegramScore;

    let title = "ALL ROUNDOOR";
    if (totalScore >= 100) title = "ALPHA TRADOOR"; // Adjusted threshold for Telegram
    else if (totalScore >= 80) title = "NFT EXPLOROOR";
    else if (totalScore >= 60) title = "DAO DIPLOMAT";
    else if (totalScore >= 40) title = "COMMUNITY ANALYST";

    return { score: totalScore, title };
}

module.exports = { calculateScore, generateScore };