const Session = require('../models/Session')
const Question = require('../models/Question')
const User = require('../models/User')

// Subscription limits
const SUBSCRIPTION_LIMITS = {
    free: {
        maxSessions: 3,
        maxQuestionsPerSession: 10,
    },
    plus: {
        maxSessions: Infinity,
        maxQuestionsPerSession: Infinity,
    },
    pro: {
        maxSessions: Infinity,
        maxQuestionsPerSession: Infinity,
    },
};

// create a new session and linked questions
// POST /api/sessions/create
// need login


exports.createSession = async(req,res) => {
    try{
        const {role , experience , topicToFocus,description ,questions} = req.body;

        const userId = req.user._id

        // Get user's subscription plan
        const user = await User.findById(userId);
        const userPlan = user?.subscription?.plan || 'free';
        const limits = SUBSCRIPTION_LIMITS[userPlan];

        // Check session count limit
        const sessionCount = await Session.countDocuments({ user: userId });
        if (sessionCount >= limits.maxSessions) {
            return res.status(403).json({
                success: false,
                message: `You have reached the maximum number of sessions (${limits.maxSessions}) for your ${userPlan} plan. Please upgrade to create more sessions.`
            });
        }

        // Limit questions based on plan
        const questionsToCreate = questions.slice(0, limits.maxQuestionsPerSession);

        const session = await Session.create({
            user : userId,
            role,
            experience,
            topicToFocus,
            description,
        });

        const questionDocs = await Promise.all(
            questionsToCreate.map(async (q) => {
                const question = await Question.create({
                    session : session._id,
                    question : q.question,
                    answer : q.answer
                });
                return question._id
            })
        );

        session.questions = questionDocs
        await session.save()

        res.status(201).json({success : true , session})

    }catch(error){
        res.status(500).json({success : false , message : "Server Error"});
    }
}

// get all sessions for the logged-in user
// GET /api/sessions/my-sessions
// need login

exports.getMySessions = async (req,res) => {
    try{
        const sessions = await Session.find({user : req.user.id})
                                            .sort({createdAt : -1})
                                        .populate("questions");
        res.status(200).json(sessions)
    }catch(error){
        res.status(500).json({success : false , message : "Server Error"});
    }
}

// get a session by id with populated questions
// GET /api/sessions/:id
// need login

exports.getSessionById = async (req,res) => {
    try{
        const session = await Session.findById(req.params.id)
                                    .populate({
                                        path : "questions",
                                        options : {sort : {isPinned : -1 , createdAt : 1}},
                                    })
                                    .exec();

        if(!session){
            return res.status(404).json({success : false,message : "Session not found"})
        }

        res.status(200).json({success : true,session})
    }catch(error){
        res.status(500).json({success : false , message : "Server Error"});
    }
}


// delete a session and its questions
// DELETE /api/sessions/:id
// need login

exports.deleteSession = async (req,res) => {
    try{
        const session = await Session.findById(req.params.id);

        if(!session){
            return res.status(404).json({message : "Session not found"})
        }

        if(session.user.toString() !== req.user.id){
            return res.status(401).json({message : "Not Authorized to delete This session"})
        }


    await Question.deleteMany({session : session._id})
    await session.deleteOne();

        res.status(200).json({message : "Session deleted Sucessfully"})
        
    }catch(error){
        res.status(500).json({success : false , message : "Server Error"});
    }
}
