const s3 = require("../../config/awsS3-config");

const MODULE = "aws-helper";
module.exports = {
  sendFile: async (key, data) => {
    /**
     * @param {String} key name of image
     * @param {Buffer} data buffer data of image = req.file.buffer
     * @returns error of data of uploaded image
     */
    try{
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
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: data,
      };
      //wrap in promise 
      return new Promise((resolve, reject) => {
          //call upload function
          s3.upload(params, function (err, data) {
          if (err) {
            console.log("s3.upload : ", err);
            //handle and log error
            return reject("File Upload Failed");
          }
          if (data) {
              
            return resolve(data); //potentially return resolve(data) if you need the data
          }
        });
      });
    } catch (error) {
      //! handle error      
      throw error;
    }
  },
  /**
   * @name  getFile
   * @description Fetches the url of file key
   * @param {string} Key key of file example: img_link
   * @returns {url} Url of file
   *
   */

  getFile: async (Key) => {
    try {
        
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key,
        // Expires: 60 * 60 * 1 //?url expires in 1 hr
      };
      //* Url of file
      const url = await s3.getSignedUrl("getObject", params);
      return url;
    } catch (error) {
      //! handle error
      
      throw error;
    }
  },
};
