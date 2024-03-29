// Setup connection 
const imageFilter = function(req, file, callback) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return callback(new Error('The file uploaded is not an image'), false);
    }
    callback(null, true);
};
  
const aws = require('aws-sdk');
aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new aws.S3();
const multer = require("multer");
const multerS3 = require('multer-s3');

const standardSettings = {
    limits: {
        fileSize: 1048576 * 5
    },
    fileFilter: imageFilter
};

const defaultMulterS3Settings = {
    s3: s3,
    bucket: 'platonic-dev',
    acl: 'public-read',
    cacheControl: 'no-cache',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, callback) {
        callback(null, {fieldname: file.fieldname});
    },
};

const userProfileKeyFunction = function (req, file, callback) {
    console.log(1)
    const key = `user-profile-photo/${req.user._id}.jpg`
    callback(null, key);
};

const channelBannerKeyFunction = function (req, file, callback) {
    const key = `channel-photo/${req.query.channelId}.jpg`
    callback(null, key);
};

const getMulter = (keyFunction) => {
    const uploadSettings = { ... standardSettings };
    const uploadMulterS3Settings = {
        ... defaultMulterS3Settings,
        key: keyFunction
    };
    uploadSettings.storage = multerS3(uploadMulterS3Settings);
    return multer(uploadSettings);
}

exports.uploadProfilePhoto = getMulter(userProfileKeyFunction);
exports.uploadChannelPhoto = getMulter(channelBannerKeyFunction);