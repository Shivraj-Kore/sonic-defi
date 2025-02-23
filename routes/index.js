const express = require('express');
const { requiresAuth } = require('express-openid-connect');
const axios = require('axios');
const User = require('../models/User'); 
const router = express.Router();
const usernameCache = {}; // In-memory cache

router.get('/api/user', async function (req, res) {
    if (!req.oidc.isAuthenticated()) {
        return res.json({ isAuthenticated: false });
    }

    const userProfile = req.oidc.user || {};
    let twitterUsername = "stev3raj_";

    if (userProfile.sub && userProfile.sub.startsWith("twitter|")) {
        const twitterId = userProfile.sub.split("|")[1];

        // Check cache first
        if (usernameCache[twitterId]) {
            return res.json({
                isAuthenticated: true,
                userProfile,
                twitterUsername: usernameCache[twitterId]
            });
        }

        try {
            const bearerToken = "AAAAAAAAAAAAAAAAAAAAAGr%2FzQEAAAAA4vZdfQ6gM5LHD8nvu1oyC2W4V1w%3DQMFs6K3ev4pch1q6DEXo3ZpygHJLw6nElxB4yDCCDyWMFLJZKi"; // Replace with actual token
            const url = `https://api.twitter.com/2/users/${twitterId}?user.fields=username`;

            const response = await axios.get(url, {
                headers: { "Authorization": `Bearer ${bearerToken}` }
            });

            if (response.data.data && response.data.data.username) {
                twitterUsername = response.data.data.username;
                usernameCache[twitterId] = twitterUsername; // Store in cache
            }
        } catch (error) {
            console.error("Error fetching Twitter username:", error.response?.data || error.message);
        }
    }

    res.json({
        isAuthenticated: true,
        userProfile,
        twitterUsername
    });
});

router.post('/api/saveUser', async (req, res) => {
  try {
      const { sid, name, username, twitterId, walletAddress } = req.body;

      const newUser = new User({
          sid,
          name,
          username,
          twitterId,
          walletAddress
      });

      await newUser.save();
      res.json({ message: "User saved successfully!" });
  } catch (error) {
      console.error("Error saving user:", error);
      res.status(500).json({ message: "Error saving user" });
  }
});

router.get('/api/checkUser', async (req, res) => {
  try {
      const { username } = req.query;
      const user = await User.findOne({ username });

      if (user) {
          res.json({ exists: true, walletAddress: user.walletAddress });
      } else {
          res.json({ exists: false });
      }
  } catch (error) {
      console.error("Error checking user:", error);
      res.status(500).json({ message: "Error checking user" });
  }
});


router.get('/login', (req, res) => {
    res.redirect('/'); // Redirect after login
});

router.get('/logout', (req, res) => {
    req.oidc.logout();
});

module.exports = router;
