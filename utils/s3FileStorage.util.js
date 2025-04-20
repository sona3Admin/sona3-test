let AWS = require('aws-sdk');
const uuid = require("uuid").v4
const s3 = new AWS.S3();
process.env.AWS_ACCESS_KEY_ID = process.env.BUCKETEER_AWS_ACCESS_KEY_ID;
process.env.AWS_SECRET_ACCESS_KEY = process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY;
process.env.AWS_REGION = process.env.BUCKETEER_AWS_REGION;
const { logInTestEnv } = require("../helpers/logger.helper");


exports.uploadFilesToS3 = async (folderName, files) => {
  try {
    const allowedMimeTypes = [
      "image/png",
      "image/jpg",
      "image/jpeg",
      "image/svg+xml"
    ];

    // Validate file types before upload
    const invalidFiles = files.filter(file => !allowedMimeTypes.includes(file.mimetype));
    if (invalidFiles.length > 0) {
      return {
        success: false,
        code: 400,
        error: `Invalid file type(s). Allowed types are: JPG, JPEG, PNG, and SVG`
      };
    }

    const params = files.map((file) => {
      const extension = file.mimetype.split('/').pop().replace('svg+xml', 'svg');
      logInTestEnv("extension", extension)
      return {
        Bucket: process.env.BUCKETEER_BUCKET_NAME,
        Key: `public/${folderName}/${uuid()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype, // Add content type to ensure proper handling by S3
      };
    });

    const uploadResults = await Promise.all(params.map((param) => s3.upload(param).promise()));
    return { success: true, result: uploadResults, code: 201 };
  } catch (err) {
    logInTestEnv(`err.message`, err.message);
    return {
      success: false,
      code: 500,
      error: err.message
    }
  }
};


exports.deleteFilesFromS3 = (arrayOfFiles) => {
  return new Promise((resolve, reject) => {
    const imageKeys = arrayOfFiles;

    // Construct the delete request
    const params = {
      Bucket: process.env.BUCKETEER_BUCKET_NAME,
      Delete: {
        Objects: imageKeys.map((key) => ({ Key: key })),
        Quiet: false
      }
    };

    // Call the deleteObjects method to delete the images
    s3.deleteObjects(params, (err, data) => {
      if (err) {
        logInTestEnv(err, err.stack);
        reject(err);
      } else {
        // logInTestEnv("deleted the following",data.Deleted);
        resolve(data.Deleted);
      }
    });
  });
}


exports.uploadPDFtoS3 = async (folderName, files) => {
  try {
    const uploadPromises = files.map((file) => {
      const params = {
        Bucket: process.env.BUCKETEER_BUCKET_NAME,
        Key: `public/pdf/${uuid()}-${folderName}.pdf`,
        Body: file.buffer,
        ContentType: file.mimetype
      };
      return s3.upload(params).promise();
    });

    const uploadResults = await Promise.all(uploadPromises);
    return {
      success: true,
      result: uploadResults // URLs of uploaded files
    };
  } catch (err) {
    console.error("Error uploading file:", err.message);
    return { success: false, error: err.message };
  }
};


exports.listFilesInS3Folder = async (folderPath) => {
  const params = {
    Bucket: process.env.BUCKETEER_BUCKET_NAME,
    Prefix: folderPath,
  };

  try {
    const data = await s3.listObjectsV2(params).promise();

    const fileKeys = data.Contents.map((item) => item.Key);
    return {
      success: true,
      result: fileKeys,
      code: 200
    };
  } catch (error) {
    console.error('Error listing files in S3 folder:', error);
    throw error;
  }
};