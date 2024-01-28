let scheduler = require("node-schedule");
const s3StorageHelper = require("./s3FileStorage.util");
let batchRepo = require("../modules/Batch/batch.repo");
let rule = new scheduler.RecurrenceRule();
rule.dayOfWeek = [0, 1, 2, 3, 4, 5, 6]; // every day
rule.hour = 5; // at 05.00 AM
rule.minute = 0;
rule.second = 0;

const dateFormat = () => {
  return new Date(Date.now()).toLocaleString();
};


exports.executeBatchJobs = async () => {
  return new Promise(async (resolve, reject) => {
    scheduler.scheduleJob(rule, async () => {
      try {
        console.log("==> Started Batch Jobs at ", dateFormat());
        await this.deleteAllFiles();
        await batchRepo.removeMany({});
        resolve();
      } catch (err) {
        console.log(err.message, err.message);
        reject(err);
      }
    });
  });
};

exports.deleteAllFiles = async () => {
  try {
    const operationResultObject = await batchRepo.list({ operationName: "deleteFiles" }, {}, {}, 1, 0);
    const filesBatchesArray = operationResultObject.result;

    for (const batchFilesArray of filesBatchesArray) {
      await s3StorageHelper.deleteFilesFromS3(batchFilesArray.filesToDelete);
    }
    console.log("==> Deleted All Target Files");
  } catch (err) {
    console.log(err.message, err.message);
  }
};