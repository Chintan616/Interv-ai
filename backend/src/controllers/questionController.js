const Question = require('../models/Question')
const Session = require('../models/Session')
const User = require('../models/User')

// Subscription limits
const SUBSCRIPTION_LIMITS = {
    free: {
        maxPinnedQuestions: 5,
        canLoadMore: false,
    },
    plus: {
        maxPinnedQuestions: Infinity,
        canLoadMore: true,
    },
    pro: {
        maxPinnedQuestions: Infinity,
        canLoadMore: true,
    },
};


// add additional Questions to an existing session
// POST /api/questions/add

exports.addQuestionsToSession = async (req,res) => {
    try{
        const { sessionId,questions} = req.body;

        if(!sessionId || !questions || !Array.isArray(questions)){
            return res.status(400).json({message : "Inavalid Input of data"})
        }

        const session = await Session.findById(sessionId).populate('user');
        if(!session){
            return res.status(404).json({message : "Session not found"})
        }

        // Check user's subscription plan
        const userPlan = session.user?.subscription?.plan || 'free';
        const limits = SUBSCRIPTION_LIMITS[userPlan];

        // Check if user can load more questions
        if (!limits.canLoadMore) {
            return res.status(403).json({
                success: false,
                message: `Loading more questions is a premium feature. Upgrade to Plus or Pro plan to add more questions.`
            });
        }

        // create a new questions

        const createdQuestions = await Question.insertMany(
            questions.map((q) => ({
                session : sessionId,
                question : q.question,
                answer : q.answer,
            }))
        );

        // update session to include new question ids

    session.questions.push(...createdQuestions.map((q) => q._id));
        await session.save()

        res.status(201).json(createdQuestions)
    }catch(error){
        res.status(500).json({message : "Server Error.."})
    }
}

// pin or unpin a question
// POST /api/questions/:id/pin

exports.togglePinQuestion = async (req,res) => {
    try{
        const question = await Question.findById(req.params.id).populate({
            path: 'session',
            populate: { path: 'user' }
        });

        if(!question){
            return res.status(404).json({success : false,message : "Question NOt found"})
        }

        // If trying to pin (currently unpinned), check the limit
        if (!question.isPinned) {
            const session = question.session;
            const userPlan = session.user?.subscription?.plan || 'free';
            const limits = SUBSCRIPTION_LIMITS[userPlan];

            // Count current pinned questions in this session
            const pinnedCount = await Question.countDocuments({
                session: session._id,
                isPinned: true
            });

            if (pinnedCount >= limits.maxPinnedQuestions) {
                return res.status(403).json({
                    success: false,
                    message: `You have reached the maximum of ${limits.maxPinnedQuestions} pinned questions for your ${userPlan} plan. Upgrade to Plus or Pro for unlimited pinned questions.`
                });
            }
        }

        question.isPinned = !question.isPinned;
        await question.save()

        res.status(200).json({success : true , question})
    }catch(error){
        console.error('Toggle pin error:', error);
        res.status(500).json({message : "Server Error.."})
    }
}

// update a note for a question
// POST /api/questions/:id/note

exports.updateQuestionNote = async (req,res) => {
    try{
        const {note} = req.body
        const question = await Question.findById(req.params.id);

        if(!question) {
            return res.status(404).json({success : false , message : "Question Not Found"});
        }

        question.note = note || "";
        await question.save()

        res.status(200).json({success : true , question});
        
    }catch(error){
        res.status(500).json({message : "Server Error.."})
    }
}