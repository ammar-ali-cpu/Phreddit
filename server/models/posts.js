// Post Document Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    // postID:{
    //     type: String,
    //     unique: true,
    //     required: true
    // },
    title:{
        type: String,
        required: true,
        maxlength: 100
    },
    content:{
        type: String,
        required: true
    },
    linkFlairID:{
        type: Schema.Types.ObjectId,
        ref: 'LinkFlair'
    },
    postedBy:{
        type: String,
        required: true,
    },
    postedDate:{
        type: Date,
        required: true,
        default: Date.now
    },
    commentIDs:[{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    views:{
        type: Number,
        required: true,
        default: 0
    },

    voteCount: {
        type: Number,
        default: 0
      },
      voters: [{
        userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true},
        vote: { type: Number, required: true, validate: { validator: v => v === 1 || v === -1,}}
      }],

    votes:{
        type: Number,
        required: true,
        default: 0
    },
    communityID:{
        type: Schema.Types.ObjectId,
        ref: 'Community',
        //required: true,
    },
    

},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

postSchema.virtual('url').get(function() {
    return `/posts/${this._id}`;
});

module.exports = mongoose.model('Post', postSchema);
