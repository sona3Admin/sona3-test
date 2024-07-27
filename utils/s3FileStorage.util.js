let AWS = require('aws-sdk');
const uuid = require("uuid").v4
const s3 = new AWS.S3();
process.env.AWS_ACCESS_KEY_ID = process.env.BUCKETEER_AWS_ACCESS_KEY_ID;
process.env.AWS_SECRET_ACCESS_KEY = process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY;
process.env.AWS_REGION = process.env.BUCKETEER_AWS_REGION;


exports.uploadFilesToS3 = async (folderName, files) => {
  try {
    const params = files.map((file) => {
      return {
        Bucket: process.env.BUCKETEER_BUCKET_NAME,
        Key: `public/${folderName}/${uuid()}-${file.originalname}`,
        Body: file.buffer,
      };
    });
    const uploadResults = await Promise.all(params.map((param) => s3.upload(param).promise()));
    return { success: true, result: uploadResults, code: 201 };
  } catch (err) {
    console.log(`err.message`, err.message);
    return {
      success: false,
      code: 500,
      error: err.message
    }
  }



};


exports.deleteFileFromS3 = async (fileName) => {
  try {
    const params = {
      Bucket: process.env.BUCKETEER_BUCKET_NAME,
      Key: fileName,
    };
    return await s3.deleteObject(params, function (err, data) {
      if (err) console.log(err, err.stack);  // error
      else console.log("file deleted successfully");                 // deleted
    }).promise();
  } catch (err) {
    console.log(`err.message`, err.message);
    return err.message
  }

}


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
        console.log(err, err.stack);
        reject(err);
      } else {
        // console.log("deleted the following",data.Deleted);
        resolve(data.Deleted);
      }
    });
  });
}



exports.uploadPDFtoS3 = async (fileContent) => {
  try {
    const params = {
      Bucket: process.env.BUCKETEER_BUCKET_NAME,
      Key: `public/barcodes/${uuid()}-barcodes.pdf`,
      Body: fileContent,
      ContentType: 'application/pdf'
    };

    return new Promise((resolve, reject) => {
      s3.upload(params, function (err, data) {
        if (err) {
          console.log('Error uploading file:', err);
          reject({
            success: false,
            error: err.message
          });
        } else {
          console.log('File uploaded successfully. URL:', data.Location);
          resolve({
            success: true,
            result: data
          });
        }
      });
    }).catch((err) => { console.log(`err.message`, err.message); return });
  } catch (err) {
    console.log(`err.message`, err.message);
  }
}


exports.uploadExceltoS3 = async (fileContent, fileName) => {
  try {
    const params = {
      Bucket: process.env.BUCKETEER_BUCKET_NAME,
      Key: `public/sheets/${fileName}.xlsx`,
      Body: fileContent,
      ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };

    return new Promise((resolve, reject) => {
      s3.upload(params, function (err, data) {
        if (err) {
          console.log('Error uploading file:', err);
          reject({
            success: false,
            error: err.message,
            code: 500
          });
        } else {
          console.log('File uploaded successfully. URL:', data.Location);
          resolve({
            success: true,
            result: data,
            code: 201
          });
        }
      });
    });
  } catch (err) {
    console.log(`err.message`, err.message);
  }
}