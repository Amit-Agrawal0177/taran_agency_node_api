const AWS = require("aws-sdk");

const S3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION 
});

function s3Upload(file, key) {
  if (!file || !key) {
    return new Error("file or key is not provided");
  }
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME ?? 'ecomtrails-test',
      Key: key,
      Body: file.buffer,
    };

    S3.upload(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

async function getS3File(key) {
  if (!key) {
    return new Error("file or key is not provided");
  }
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME ?? 'ecomtrails-test',
    Key: key,
    // Expires: 60 * 60 * 1, //?url expires in 1 hr
  };
  return await S3.getSignedUrlPromise("getObject", params);
}

async function sendFile(data, key) {
  console.log("inside sendFile");
  /**
   * @param {String} key name of image
   * @param {Buffer} data buffer data of image = req.file.buffer
   * @returns error of data of uploaded image
   */
  // check if both key and data are present
  if (
    key === null ||
    key === undefined ||
    key === "" ||
    data === null ||
    data === undefined
  ) {
    // construct an error
    const error = new Error();
    error.status = 500;
    error.message = "Bad Parameters";
    throw error;
  }
  //construct options
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME ?? 'ecomtrails-test',
    Key: key,
    Body: data,
  };
  //wrap in promise
  return new Promise((resolve, reject) => {
    //call upload function
    S3.upload(params, function (err, data) {
      if (err) {
        //handle and log error
        return reject(err);
      }
      if (data) {
        //log and send Location data
        return resolve(data); //potentially return resolve(data) if you need the data
      }
    });
  });
}

async function getFile(Key) {  
  try {      
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME ?? 'ecomtrails-test',
      Key,
      // Expires: 60 * 60 * 1 //?url expires in 1 hr
    };
    //* Url of file
    const url = await S3.getSignedUrl("getObject", params);
    return url;
  } catch (error) {
    //! handle error
    
    throw error;
  }
}
module.exports = { s3Upload, getS3File, sendFile, getFile };
