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

const upload = multer({
    limits: {
        fileSize: 1048576 // 1MB
    },
    fileFilter: imageFilter,
    storage: multerS3({
        s3: s3,
        bucket: 'platonic-dev',
        acl: 'public-read',
        cacheControl: 'max-age=31536000',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, callback) {
            callback(null, {fieldname: file.fieldname});
        },
        key: function (req, file, callback) {
            const key = `user-profile-photo/${req.user._id}.jpg`
            callback(null, key);
        }
    })
});

module.exports = upload;