const axios = require("axios");

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST;

// Function to delay execution (used for retrying)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Updated to handle both route handler and direct function call scenarios
exports.getUserDetails = async (req, res) => {
    let username;
    let retries = 3;
    let isDirectCall = false;
    
    // Check if this is a direct function call or route handler
    if (typeof req === 'string') {
        username = req;
        isDirectCall = true;
    } else {
        // This is a route handler call
        username = req.params.username;
    }
    
    if (!username) {
        const error = new Error("Username is required");
        if (isDirectCall) throw error;
        return res.status(400).json({ error: error.message });
    }

    console.log(`🔍 Fetching Twitter data for: ${username}`);
    
    const options = {
        method: "GET",
        url: "https://twitter241.p.rapidapi.com/user",
        headers: {
            "X-RapidAPI-Key": RAPIDAPI_KEY || 'f91ba3c075mshe69a83db1cb1c4bp1a506ejsn4a581f4789f9',
            "X-RapidAPI-Host": RAPIDAPI_HOST || 'twitter241.p.rapidapi.com',
            "Content-Type": "application/json"
        },
        params: { username }
    };

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await axios.request(options);
            console.log("✅ Twitter API Response:", response.data);

            if (!response.data || !response.data.result) {
                const error = new Error(`User not found: ${username}`);
                if (isDirectCall) throw error;
                return res.status(404).json({ error: error.message });
            }

            // Check if this is a direct call (from another controller)
            if (isDirectCall) {
                return response.data;
            }
            
            // Otherwise return as API response
            return res.json(response.data);
            
        } catch (error) {
            if (error.response && error.response.status === 429) {
                console.warn(`⏳ Rate limit hit. Retrying in 5 seconds... (Attempt ${attempt}/${retries})`);
                if (attempt < retries) {
                    await delay(5000); // Wait 5 seconds before retrying
                    continue; // Retry the request
                } else {
                    const rateError = new Error("Rate limit exceeded. Try again later.");
                    if (isDirectCall) throw rateError;
                    return res.status(429).json({ error: rateError.message });
                }
            } else {
                console.error("❌ Error fetching Twitter user data:", error.response?.data || error.message);
                const fetchError = new Error("Failed to fetch user data");
                if (isDirectCall) throw fetchError;
                return res.status(500).json({ error: fetchError.message });
            }
        }
    }
};
