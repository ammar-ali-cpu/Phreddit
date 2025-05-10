// Community Document Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const communitiesSchema = new Schema({
    // communityID:{
    //     type: String,
    //     unique: true,
    //     required: true
    // },
    name:{
        type: String,
        required: true,
        maxlength: 100
    },
    description:{
        type: String,
        required: true,
        maxlength: 500
    },
    postIDs:[{
        type: Schema.Types.ObjectId, 
        ref: 'Post'
    }], 
    startDate:{
        type: Date,
        default: Date.now
    },
    members:[{
        type: String
    }],
    createdBy:{
        type: Schema.Types.ObjectId, 
        ref: 'Users'
    }
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

communitiesSchema.virtual('memberCount').get(function() {
    return this.members.length;
});

communitiesSchema.virtual('url').get(function() {
    return `/communities/${this._id}`;
});

module.exports = mongoose.model('Community', communitiesSchema);