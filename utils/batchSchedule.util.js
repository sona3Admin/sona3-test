let scheduler = require("node-schedule");
const s3StorageHelper = require("./s3FileStorage.util");
let batchRepo = require("../modules/Batch/batch.repo");
const sellerRepo = require("../modules/Seller/seller.repo");
const shopRepo = require("../modules/Shop/shop.repo");
const serviceRepo = require("../modules/Service/service.repo");
const productRepo = require("../modules/Product/product.repo");
const reportHelper = require("../helpers/report.helper");


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
  return new Promise(async (resolve, reject) => {
    scheduler.scheduleJob(rule, async () => {
      try {
        console.log("==> Started Batch Jobs at ", dateFormat());
        await this.deleteAllFiles();
        await batchRepo.removeMany({});
        await this.checkExpiredSubscriptionsOfSellers();
        await this.generateDailyReports();
        await this.checkForTrustedShops()
        console.log("==> Finished Executing Batch Jobs...")
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
    console.log("==> Deleting Files...");
    const operationResultObject = await batchRepo.list({ operationName: "deleteFiles" }, {}, {}, 1, 0);
    const filesBatchesArray = operationResultObject.result;

    for (const batchFilesArray of filesBatchesArray) {
      await s3StorageHelper.deleteFilesFromS3(batchFilesArray.filesToDelete);
    }
    console.log("==> Deleted All Files...");
  } catch (err) {
    console.log("==> Deleting Files...", err.message);
  }
};


exports.checkExpiredSubscriptionsOfSellers = async () => {
  try {
    console.log("==> Checking for expired subscriptions...");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find sellers whose subscriptions have expired
    const expiredSellers = await sellerRepo.list({
      tier: { $ne: "lifetime" },
      subscriptionEndDate: { $lt: today },
      isSubscribed: true
    });

    for (const seller of expiredSellers.result) {
      console.log(`==> Processing expired subscription for seller: ${seller._id}`);

      await sellerRepo.updateDirectly(seller._id.toString(), { isSubscribed: false });
      await shopRepo.updateMany({ seller: seller._id.toString() }, { isActive: false });

      if (seller.type === "product") await productRepo.updateMany({ seller: seller._id.toString() }, { isActive: false });
      else if (seller.type === "service") await serviceRepo.updateMany({ seller: seller._id.toString() }, { isActive: false });

      console.log(`==> Subscription expired for seller: ${seller._id}`);
    }

    console.log("==> Finished processing expired subscriptions...");
  } catch (err) {
    console.error("==> Error processing expired subscriptions:", err.message);
  }
};


exports.generateDailyReports = async () => {
  try {
    console.log("==> Generating Daily Reports...");
    await reportHelper.generateReports();
    console.log("==> Finished Generating Daily Reports...");

  } catch (err) {
    console.error("==> Error Generating Daily Reports:", err.message);

  }
}


exports.checkForTrustedShops = async () => {
  try {
    console.log("==> Checking for trusted shops...");
    await shopRepo.updateMany({ rating: { $gte: 4, $lte: 5 } }, { isTrusted: true })
    await shopRepo.updateMany({ rating: { $lte: 4 } }, { isTrusted: false })
    console.log("==> Finished checking trusted shops...");

  } catch (err) {
    console.error("==> Error Generating Daily Reports:", err.message);

  }
}