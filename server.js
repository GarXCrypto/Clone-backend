console.log("Loading environment variables...");

require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require("cors");
const jwt = require("jsonwebtoken"); 
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000; 
const MONGO_URI = process.env.MONGO_URI;
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";  


app.use(cors());
app.use(express.json());


if (!MONGO_URI) {
    console.error("❌ MongoDB connection string (MONGO_URI) is missing in .env!");
    process.exit(1);
}


async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("✅ Connected to database!");
    } catch (err) {
        console.error("❌ Connection failed!", err);
        process.exit(1);
    }
}
connectDB();


app.get('/', (req, res) => {
    res.send("Welcome to the server!");
});


app.post('/register', async (req, res) => {
    try {
        console.log("Received Request Body:", req.body); 

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ success: false, message: "Invalid request body! Ensure you are sending JSON data." });
        }

        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required!" });
        }

        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: "Invalid email format!" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email is already registered!" });
        }
              
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ 
            username: username.trim(), 
            email: email.toLowerCase(), 
            password: hashedPassword 
        });

        await newUser.save();

        console.log("✅ Registered User:", { username, email });

        res.status(201).json({ success: true, message: "Registration successful!" });
    } catch (err) {
        console.error("❌ Error registering user:", err);
        res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        console.log("Received Request Body:", req.body); 

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ success: false, message: "Invalid request body! Ensure you are sending JSON data." });
        }

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required!" });
        }

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid password!" });
        }

        
        const token = jwt.sign(
            { email: existingUser.email, username: existingUser.username },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        console.log("✅ Logged in User:", { email });

        res.status(200).json({ success: true, message: "Login successful!", token, username: existingUser.username });
    } catch (err) {
        console.error("❌ Error logging in user:", err);
        res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
});


function authenticateToken(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(403).json({ success: false, message: "Access denied! Token missing." });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: "Invalid token!" });
        }
        req.user = user;
        next();
    });
}


app.get('/profile', authenticateToken, (req, res) => {
    res.json({ success: true, message: "Profile accessed!", user: req.user });
});


app.listen(PORT, () => {
    console.log("🚀 Server is running on port: ${PORT}");
});
