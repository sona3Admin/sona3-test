let scheduler = require("node-schedule");
const s3StorageHelper = require("./s3FileStorage.util");
let batchRepo = require("../modules/Batch/batch.repo");
const sellerRepo = require("../modules/Seller/seller.repo");
const shopRepo = require("../modules/Shop/shop.repo");
const serviceRepo = require("../modules/Service/service.repo");
const productRepo = require("../modules/Product/product.repo");


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
        await this.checkExpiredSubscriptionsOfSellers()
        resolve();
      } catch (err) {
        console.log("err.message", err.message);
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


exports.checkExpiredSubscriptionsOfSellers = async () => {
  try {
    console.log("Checking for expired subscriptions...");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find sellers whose subscriptions have expired
    const expiredSellers = await sellerRepo.list({
      subscriptionEndDate: { $lt: today },
      isSubscribed: true
    });

    for (const seller of expiredSellers.result) {
      console.log(`Processing expired subscription for seller: ${seller._id}`);

      await sellerRepo.updateDirectly(seller._id.toString(), { isSubscribed: false });
      await shopRepo.updateMany({ seller: seller._id.toString() }, { isActive: false });

      if (seller.type === "product") await productRepo.updateMany({ seller: seller._id.toString() }, { isActive: false });
      else if (seller.type === "service") await serviceRepo.updateMany({ seller: seller._id.toString() }, { isActive: false });

      console.log(`Subscription expired for seller: ${seller._id}`);
    }

    console.log("Finished processing expired subscriptions");
  } catch (error) {
    console.error("Error processing expired subscriptions:", error);
  }
};
