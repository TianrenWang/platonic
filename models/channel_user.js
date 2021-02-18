exports.getAllChannelsByUser = function(model, userId, callback){
    model.find({user: userId}).populate({path: "channel", select: '-__v'}).exec((err, channel_users) => {
        if (err){
            callback(err, channel_users);
        } else {
            // Clean the object for response
            let channels = [];
            for (let index = 0; index < channel_users.length; index++) {
                channels.push(channel_users[index].channel);
            }
            callback(err, channels);
        }
    });
};;

exports.getAllUsersByChannel = function(model, channelId, callback){
    model.find({channel: channelId}).populate({path: "user", select: '-password -__v'}).exec((err, channel_users) => {
        if (err){
            callback(err, channel_users);
        } else {
            // Clean the object for response
            let users = [];
            for (let index = 0; index < channel_users.length; index++) {
                users.push(channel_users[index].user);
            }
            callback(err, users);
        }
    })
};;
