const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// channel schema
const MembershipSchema = mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: 'Channel',
        required: true
    }
});

MembershipSchema.statics.createMembership = (userId, channelId, callback) => {
    let membershipObj = new Membership({
        user: userId,
        channel: channelId
    });
    membershipObj.save(callback);
};

const Membership = mongoose.model('Membership', MembershipSchema);

module.exports = Membership;
