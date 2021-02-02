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

MembershipSchema.index({user: 1, channel: 1}, { unique: true });
MembershipSchema.statics.createMembership = (userId, channelId, callback) => {
    let membershipObj = new Membership({
        user: userId,
        channel: channelId
    });
    membershipObj.save(callback);
};

MembershipSchema.statics.getAllMemberChannelsByUser = (userId, callback) => {
    Membership.find({user: userId}, (err, memberships) => {
        if (err){
            callback(err, memberships);
        } else {
            Membership.populate(memberships, {path: "channel"}, (populate_err, populatedMemberships) => {
                if (populate_err) {
                  callback(populate_err, populatedMemberships);
                } else {
                  // if the populating was successful, clean the object
                  let memberChannels = [];
                  for (let index = 0; index < populatedMemberships.length; index++) {
                      memberChannels.push(memberships[index].channel);
                  }
                  callback(populate_err, memberChannels);
                }
            })
        }
    })
};

const Membership = mongoose.model('Membership', MembershipSchema);

module.exports = Membership;
