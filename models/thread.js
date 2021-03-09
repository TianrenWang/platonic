const mongoose = require('mongoose');

// conversation schema
const ThreadSchema = mongoose.Schema({
    originMessage: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Message"
    }
});

const Thread = mongoose.model('Thread', ThreadSchema);
exports.Thread = Thread;
