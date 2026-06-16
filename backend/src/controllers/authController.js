const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// generate JWT web token

const generateToken = (userId) => {
    return jwt.sign({id : userId} , process.env.JWT_SECRET , {expiresIn : "7d"})
}

// Register a new user
// POST : /api/auth/register
// all can access

const registerUser = async (req, res) => {
    try {
        const { name, email, password, profileImageUrl, about } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            profileImageUrl,
            about,
        });

        return res.status(201).json({
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            profileImageUrl: newUser.profileImageUrl,
            about: newUser.about,
            createdAt: newUser.createdAt,
            token: generateToken(newUser._id),
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// login user
// POST : /api/auth/login
// all can access

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        return res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
            about: user.about,
            createdAt: user.createdAt,
            token: generateToken(user._id),
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// get user profile
// GET : api/auth/profile
// requires jwt

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password")
        if (!user) {
            return res.status(401).json({ message: 'User Not Found' });
        }
        return res.json(user);
    } catch (error) {
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// update user profile
// PUT : api/auth/update-profile
// requires jwt

const updateUserProfile = async (req, res) => {
    try {
        const { name, email, profileImageUrl, about } = req.body;
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User Not Found' });
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        // Update user fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (profileImageUrl !== undefined) user.profileImageUrl = profileImageUrl;
        if (about !== undefined) user.about = about;

        await user.save();

        return res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
            about: user.about,
            createdAt: user.createdAt,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID);

// google login
// POST : /api/auth/google
// all can access
const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub, email, name, picture } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name,
                email,
                googleId: sub,
                profileImageUrl: picture,
            });
        } else if (!user.googleId) {
            user.googleId = sub;
            if (!user.profileImageUrl) user.profileImageUrl = picture;
            await user.save();
        }

        return res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
            about: user.about,
            createdAt: user.createdAt,
            token: generateToken(user._id),
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server Error verifying Google token', error: error.message });
    }
};

module.exports = {registerUser,loginUser,getUserProfile,updateUserProfile,googleLogin};
