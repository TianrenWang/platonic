const mongoose = require('mongoose');

// channel schema
const SubscriptionSchema = mongoose.Schema({
  subscribeeName: {
    type: String,
    required: true
  },
  subscriberName: {
    type: String,
    required: true
  },
  subscriberEmail: {
    type: String,
    required: true
  }
});

SubscriptionSchema.statics.addSubscription = (subscription, callback) => {
  let subscriptionObj = new Subscription(subscription);
  subscriptionObj.save(callback);
};

const Subscription = mongoose.model('Subscription', SubscriptionSchema);

module.exports = Subscription;
