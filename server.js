console.log("Loading environment variables...");

require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000; 
const MONGO_URI = process.env.MONGO_URI;

app.use(express.json());


if (!MONGO_URI) {
    console.error("❌ MongoDB connection string (MONGO_URI) is missing in .env!");
    process.exit(1);
}


app.get('/', (req, res) => {
    res.send("Welcome to the server!");
});


app.post('/register', async (req, res) => {
    try {
        console.log("Received Request Body:", req.body); 

        
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "Invalid request body! Ensure you are sending JSON data." });
        }

        const { username, email, password } = req.body;

      
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format!" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email is already registered!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ 
            username: username.trim(), 
            email: email.toLowerCase(), 
            password: hashedPassword 
        });

        await newUser.save();

        console.log("✅ Registered User:", { username, email });

        res.status(201).json({ message: "Registration successful!", data: { username, email } });
    } catch (err) {
        console.error("❌ Error registering user:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        console.log("Received Request Body:", req.body); 

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "Invalid request body! Ensure you are sending JSON data." });
        }

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required!" });
        }

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found!" });
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password!" });
        }

        console.log("✅ Logged in User:", { email });

        res.status(200).json({ message: "Login successful!", data: { email } });
    } catch (err) {
        console.error("❌ Error logging in user:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
}); 

async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to database!");
    } catch (err) {
        console.error("❌ Connection failed!", err);
        process.exit(1);
    }
}

connectDB();

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port: ${PORT}`);
});
