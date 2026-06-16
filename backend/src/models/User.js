const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
    {
        name : {
            type : String,
            required : true
        },
        email : {
            type : String,
            required : true,
            unique : true
        },
        password : {
            type : String,
            required : false
        },
        googleId : {
            type: String,
            default: null
        },
        profileImageUrl : {
            type : String,
            default : null
        },
        about : {
            type : String,
            default : null
        },
        subscription : {
            plan : {
                type : String,
                enum : ['free', 'plus', 'pro'],
                default : 'free'
            },
            status : {
                type : String,
                enum : ['active', 'inactive', 'expired'],
                default : 'active'
            },
            startDate : {
                type : Date,
                default : Date.now
            },
            endDate : {
                type : Date,
                default : null
            },
            hasHadPaidPlan : {
                type : Boolean,
                default : false
            }
        }
    },
    {timestamps : true}
);

module.exports = mongoose.model("User",UserSchema)

