var async = require('async');
var path = require('path');
var AWS = require('aws-sdk');
var sharp = require('sharp');
var util = require('util');

var s3 = new AWS.S3();

exports.handler = function(event, context) {

  // Read options from the event.
  console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));
  var srcBucket = event.Records[0].s3.bucket.name;

  // Object key may have spaces or unicode non-ASCII characters.
  var srcKey    = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
  var dstBucket = srcBucket;
  var dstKey    = srcKey.replace('originals', 'resized');
  var extension = path.extname(dstKey);
  var filename  = path.basename(dstKey, extension);
  var directory = path.dirname(dstKey);
  console.log('Dumping resized file to: ' + dstKey);

  // Infer the image type.
  var typeMatch = srcKey.match(/\.([^.]*)$/);
  if (!typeMatch) {
    console.error('unable to infer image type for key ' + srcKey);
    return;
  }

  // Sizes
  var _half = {
    command: "scale",
    max_width: 0.5,
    max_height: 0.5,
    version: "large"
  }

  var _sizesArray = [_half];
  var len = _sizesArray.length;

  // Download the image from S3, transform, and upload.
  async.eachOf(_sizesArray, function(value, key, callback) {
    console.log(key)
    async.waterfall([
      function download(next) {
        // Download the image from S3 into a buffer.
        s3.getObject({
          Bucket: srcBucket,
          Key: srcKey
        },
        next);
      },
      function transform(response, next) {
        var image = sharp(response.Body)
        image.metadata()
             .then(function(metadata) {
               switch(_sizesArray[key].command) {
                 case "scale":
                   var width = Math.round(_sizesArray[key].max_width * metadata.width);
                   var height = Math.round(_sizesArray[key].max_height * metadata.height);

                   return image.resize(width, height)
                               .png()
                               .toBuffer();
                 case "fixed":
               }
             })
             .then(function(data) {
               next(null, data, key);
             })
             .catch(function(err) {
               nxt(err);
             })
      },
      function upload(data, key, next) {
        var resized_version = _sizesArray[key].version
        dstKey = directory + '/' + resized_version + "/" + resized_version  + "_" + filename + extension;

        s3.putObject({
          Bucket: dstBucket,
          Key: dstKey,
          Body: data,
          ContentType: 'PNG'
        }, next);
      }
    ], function (err) {
        if (err) {
          console.error(
            'Unable to resize ' + srcBucket + '/' + srcKey +
            ' and upload to ' + dstBucket + '/' + dstKey +
            ' due to an error: ' + err
          );
        } else {
          console.log(
            'Successfully resized ' + srcBucket + '/' + srcKey +
            ' and uploaded to ' + dstBucket + '/' + dstKey
          );
        }

        context.done();
      }
    );
  })
};
