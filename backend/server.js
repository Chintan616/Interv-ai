require('dotenv').config();
const express = require('express');
const cors = require('cors')
const path = require('path');
const connectDB = require('./src/config/db');
const {protect} = require('./src/middlewares/authMiddleware');
const setupSecurityHeaders = require('./src/middlewares/securityHeaders');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./src/routes/authRoutes')
const sessionRoutes = require('./src/routes/sessionRoutes')
const questionRoutes = require('./src/routes/questionRoutes')
const paymentRoutes = require('./src/routes/paymentRoutes')
const webhookRoutes = require('./src/routes/webhookRoutes')
const {generateConceptExplanation,generateInterviewQuestions} = require('./src/controllers/aiController')
const app = express()

// Global rate limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Payment-specific rate limiting
const paymentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 payment requests per hour
    message: 'Too many payment attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// CORS Configuration for Production & Development
const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? (process.env.ALLOWED_ORIGINS || '').split(',').map(origin => origin.trim())
    : ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"];

// middleware to handle cors
app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (mobile apps, Postman, etc.)
            if (!origin) return callback(null, true);
            
            if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
                callback(null, true);
            } else {
                console.warn(`CORS blocked request from origin: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods : ["GET","POST","PUT","DELETE"],
        allowedHeaders : ["Content-Type","Authorization"],
    })
);

connectDB()

// Apply security headers
setupSecurityHeaders(app);

// Webhook route (must be before express.json() to use raw body)
app.use('/api/webhooks', webhookRoutes);

// middleware
app.use(express.json())

// Apply global rate limiting to all API routes
app.use('/api/', globalLimiter);

// Health check route
app.get("/", (req, res) => {
    res.json({ 
        message: "Interv.ai API is running",
        status: "success",
        timestamp: new Date().toISOString()
    });
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/sessions",sessionRoutes);
app.use("/api/questions",questionRoutes);
app.use("/api/payments", paymentLimiter, paymentRoutes); // Apply payment-specific rate limiting

const multer = require('multer');
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

app.use("/api/ai/generate-questions", protect, upload.single('resume'), generateInterviewQuestions);
app.use("/api/ai/generate-explanation",protect,generateConceptExplanation);




// serve uploads folder (actual uploads live under src/uploads)
app.use("/uploads", express.static(path.join(__dirname, "src", "uploads"), {}))

const PORT = process.env.PORT || 5000

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})