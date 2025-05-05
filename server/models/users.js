
// User Document Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
{
    firstName:{
        type: String,
        required: true
    }, 
    lastName:{
        type: String,
        required: true
    },
    email:{ 
        type: String,
        required: true,     
        unique: true 
    },
    displayName:{
        type: String,
        required: true,     
        unique: true
    },
    passwordHash:{
        type: String,
        required: true 
    },
    joinedCommunities:[{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community' 
    }],
    createdPosts:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post' 
    }],
    createdComments:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment' 
    }],
    createdCommunities:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community' 
    }],
    reputation:{
        type: Number,
        required: true
    },
    createdAt:{
        type: Date, 
        default: Date.now 
    }
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

userSchema.virtual('url').get(function() {
    return `/users/${this._id}`;
});

module.exports = mongoose.model('Users', userSchema);
