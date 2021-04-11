const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

const reactionTypes = {LIKE: 'LIKE'};
Object.freeze(reactionTypes);

// channel schema
const ReactionSchema = Schema({
    type: {
        type: String,
        enum: Object.keys(reactionTypes),
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dialogue: {
        type: Schema.Types.ObjectId,
        ref: 'Dialogue',
        required: true
    }
});

ReactionSchema.index({user: 0, dialogue: 0, type: 0}, { unique: true });
const Reaction = mongoose.model('Reaction', ReactionSchema);
exports.Reaction = Reaction;
exports.reactionTypes = reactionTypes;
