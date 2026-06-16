const express = require('express')
const {registerUser , loginUser, getUserProfile, updateUserProfile, googleLogin} = require('../controllers/authController')
const {protect} = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router()

// auth routes

router.post("/register",registerUser);
router.post("/login",loginUser)
router.post("/google",googleLogin)
router.get("/profile",protect,getUserProfile)
router.put("/update-profile",protect,updateUserProfile)

router.post("/upload-image",upload.single("image"),(req,res) => {
    if(!req.file){
        return res.status(400).json({message : "No file uploaded"});
    }
    // Use environment variable for base URL or construct from request
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    
    console.log('Uploaded file:', req.file.filename);
    console.log('Image URL:', imageUrl);
    
    res.status(200).json({imageUrl})
})

module.exports = router