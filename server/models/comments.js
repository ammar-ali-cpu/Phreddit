// Comment Document Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentsSchema = new Schema({
    // commentID:{
    //     type: String,
    //     unique: true,
    //     required: true
    // },
    content:{
        type: String,
        required: true,
        maxlength: 500 
    },
    commentIDs:[{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }], 
    commentedBy:{
        type: String,
        required: true
    },
    commentedDate:{
        type: Date,
        default: Date.now
    }
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

commentsSchema.virtual('url').get(function() {
    return `/comments/${this._id}`;
});

module.exports = mongoose.model('Comment', commentsSchema);