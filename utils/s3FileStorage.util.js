const { S3Client, PutObjectCommand, DeleteObjectCommand,
  DeleteObjectsCommand } = require('@aws-sdk/client-s3');
  
const { fromIni } = require('@aws-sdk/credential-provider-ini');
const { v4: uuidv4 } = require('uuid');

const s3 = new S3Client({
  region: process.env.BUCKETEER_AWS_REGION,
  credentials: fromIni({
    accessKeyId: process.env.BUCKETEER_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.BUCKETEER_AWS_SECRET_ACCESS_KEY,
  }),
});


exports.uploadFilesToS3 = async (folderName, files) => {
  try {
    const uploadPromises = files.map((file) => {
      const params = {
        Bucket: process.env.BUCKETEER_BUCKET_NAME,
        Key: `public/${folderName}/${uuidv4()}-${file.originalname}`,
        Body: file.buffer,
      };
      const uploadCommand = new PutObjectCommand(params);
      return s3.send(uploadCommand);
    });

    return await Promise.all(uploadPromises);

  } catch (err) {
    console.error('Error uploading files:', err.message);
    return {
      success: false,
      error: err.message,
    };
  }
};


exports.deleteFileFromS3 = async (fileName) => {
  try {
    const params = {
      Bucket: process.env.BUCKETEER_BUCKET_NAME,
      Key: fileName,
    };
    const deleteCommand = new DeleteObjectCommand(params);
    const data = await s3.send(deleteCommand);

    console.log('File deleted successfully');
    return {
      success: true,
      record: data,
    };

  } catch (err) {
    console.error('Error deleting file:', err.message);
    return {
      success: false,
      error: err.message,
    };
  }
};


exports.deleteFilesFromS3 = async (arrayOfFiles) => {
  try {
    const params = {
      Bucket: process.env.BUCKETEER_BUCKET_NAME,
      Delete: {
        Objects: arrayOfFiles.map((key) => ({ Key: key })),
        Quiet: false,
      },
    };

    const deleteObjectsCommand = new DeleteObjectsCommand(params);
    const data = await s3.send(deleteObjectsCommand);

    console.log('Files deleted successfully');
    return {
      success: true,
      record: data.Deleted,
    };

  } catch (err) {
    console.error('Error deleting files:', err.message);
    return {
      success: false,
      error: err.message,
    };
  }
};