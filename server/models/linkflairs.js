
// LinkFlair Document Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const linkFlairSchema = new Schema({
    // linkFlairID:{
    //     type: String,
    //     unique: true,
    //     required: true
    // },
    content:{
        type: String,
        required: true,
        maxlength: 30
    }
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

linkFlairSchema.virtual('url').get(function() {
    return `/linkFlairs/${this._id}`;
});

module.exports = mongoose.model('LinkFlair', linkFlairSchema);
