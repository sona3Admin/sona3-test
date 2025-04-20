let scheduler = require("node-schedule");
const s3StorageHelper = require("./s3FileStorage.util");
let batchRepo = require("../modules/Batch/batch.repo");
const sellerRepo = require("../modules/Seller/seller.repo");
const shopRepo = require("../modules/Shop/shop.repo");
const serviceRepo = require("../modules/Service/service.repo");
const productRepo = require("../modules/Product/product.repo");
const { logInTestEnv } = require("../helpers/logger.helper");

let rule = new scheduler.RecurrenceRule();
rule.dayOfWeek = [0, 1, 2, 3, 4, 5, 6]; // every day
rule.hour = 5; // at 05.00 AM
rule.minute = 0;
rule.second = 0;



// const now = new Date();
// rule.second = (now.getSeconds() + 5) % 60; // Schedule 5 seconds from now

// if (now.getSeconds() + 5 >= 60) {
//   rule.minute = now.getMinutes() + 1;
//   rule.second = (now.getSeconds() + 5) - 60;
// } else {
//   rule.minute = now.getMinutes();
// }

const dateFormat = () => {
  return new Date(Date.now()).toLocaleString();
};


exports.executeBatchJobs = async () => {
  return new Promise((resolve, reject) => {
    scheduler.scheduleJob(rule, async () => {
      try {
        logInTestEnv("==> Started Batch Jobs at ", dateFormat());
        await this.deleteAllFiles();
        await batchRepo.removeMany({});
        await this.checkExpiredSubscriptionsOfSellers();
        await this.generateDailyReports();
        await this.checkForTrustedShops()
        logInTestEnv("==> Finished Executing Batch Jobs...")
        resolve();
      } catch (err) {
        logInTestEnv("err.message", err.message);
        reject(err);
      }
    });
  });
};


exports.deleteAllFiles = async () => {
  try {
    logInTestEnv("==> Deleting Files...");
    const operationResultObject = await batchRepo.list({ operationName: "deleteFiles" }, {}, {}, 1, 0);
    const filesBatchesArray = operationResultObject.result;

    for (const batchFilesArray of filesBatchesArray) {
      await s3StorageHelper.deleteFilesFromS3(batchFilesArray.filesToDelete);
    }
    logInTestEnv("==> Deleted All Files...");
  } catch (err) {
    logInTestEnv("==> Deleting Files...", err.message);
  }
};


exports.checkExpiredSubscriptionsOfSellers = async () => {
  try {
    logInTestEnv("==> Checking for expired subscriptions...");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find sellers whose subscriptions have expired
    const expiredSellers = await sellerRepo.list({
      tier: { $ne: "lifetime" },
      subscriptionEndDate: { $lt: today },
      isSubscribed: true
    });

    for (const seller of expiredSellers.result) {
      logInTestEnv(`==> Processing expired subscription for seller: ${seller._id}`);

      await sellerRepo.updateDirectly(seller._id.toString(), { isSubscribed: false });
      await shopRepo.updateMany({ seller: seller._id.toString() }, { isActive: false });

      if (seller.type === "product") await productRepo.updateMany({ seller: seller._id.toString() }, { isActive: false });
      else if (seller.type === "service") await serviceRepo.updateMany({ seller: seller._id.toString() }, { isActive: false });

      logInTestEnv(`==> Subscription expired for seller: ${seller._id}`);
    }

    logInTestEnv("==> Finished processing expired subscriptions...");
  } catch (err) {
    console.error("==> Error processing expired subscriptions:", err.message);
  }
};



exports.checkForTrustedShops = async () => {
  try {
    logInTestEnv("==> Checking for trusted shops...");
    await shopRepo.updateMany({ rating: { $gte: 4, $lte: 5 }, orderCount: { $gte: 100 } }, { isTrusted: true })
    await shopRepo.updateMany({ rating: { $lte: 4 } }, { isTrusted: false })
    logInTestEnv("==> Finished checking trusted shops...");

  } catch (err) {
    console.error("==> Error Generating Daily Reports:", err.message);

  }
}