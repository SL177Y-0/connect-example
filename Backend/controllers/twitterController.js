const axios = require("axios");

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST;

// Function to delay execution (used for retrying)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

exports.getUserDetails = async (username, retries = 3) => {
    if (!username) {
        throw new Error("Username is required");
    }

    console.log(`🔍 Fetching Twitter data for: ${username}`);
 
        console.log(`Fetching data for username: ${username}`);

        const options = {
            method: "GET",
            url: "https://twitter241.p.rapidapi.com/user",
            headers: {
                "X-RapidAPI-Key": 'f91ba3c075mshe69a83db1cb1c4bp1a506ejsn4a581f4789f9',
                "X-RapidAPI-Host": 'twitter241.p.rapidapi.com',
                "Content-Type": "application/json"
            },
            params: { username } // ✅ Use params instead of body
        };

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response = await axios.request(options);
                console.log("✅ Twitter API Response:", response.data);
    
                if (!response.data || !response.data.result) {
                    throw new Error(`User not found: ${username}`);
                }
    
                return response.data.result; // ✅ Return user data
            } catch (error) {
                if (error.response && error.response.status === 429) {
                    console.warn(`⏳ Rate limit hit. Retrying in 5 seconds... (Attempt ${attempt}/${retries})`);
                    if (attempt < retries) {
                        await delay(5000); // Wait 5 seconds before retrying
                        continue; // Retry the request
                    } else {
                        throw new Error("Rate limit exceeded. Try again later.");
                    }
                } else {
                    console.error("❌ Error fetching Twitter user data:", error.response?.data || error.message);
                    throw new Error("Failed to fetch user data");
                }
            }
        }
    
    
};
