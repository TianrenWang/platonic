const mongoose = require('mongoose');
const Schema = require('mongoose').Schema;

// channel schema
const SubscriptionSchema = Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  channel: {
    type: Schema.Types.ObjectId,
    ref: 'Channel',
    required: true
  },
});

SubscriptionSchema.index({user: 1, channel: 1}, { unique: true });
const Subscription = mongoose.model('Subscription', SubscriptionSchema);
module.exports = Subscription;
