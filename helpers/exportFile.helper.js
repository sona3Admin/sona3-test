const excel = require('exceljs');
const s3StorageHelper = require("../utils/s3FileStorage.util")
const batchRepo = require("../modules/Batch/batch.repo");


exports.exportExcelSheetWithProducts = async (arrayOfProducts) => {
    return new Promise((resolve, reject) => {
        (async () => {
            try {
                const shopObject = arrayOfProducts[0].shop
                const workbook = new excel.Workbook();
                const worksheet = workbook.addWorksheet('Products');

                worksheet.addRow([shopObject.nameEn]);
                worksheet.addRow([shopObject.nameAr]);
                worksheet.addRow([]);

                worksheet.columns = [
                    { header: 'Product Name (English)', key: 'productNameEn' },
                    { header: 'Product Name (Arabic)', key: 'productNameAr' },
                    { header: 'Description (English)', key: 'descriptionEn' },
                    { header: 'Description (Arabic)', key: 'descriptionAr' },
                    { header: 'Variation Description (English)', key: 'variationDescriptionEn' },
                    { header: 'Variation Description (Arabic)', key: 'variationDescriptionAr' },
                ];

                arrayOfProducts.forEach((product) => {
                    worksheet.addRow({
                        'Product Name (English)': product.nameEn,
                        'Product Name (Arabic)': product.nameAr,
                        'Description (English)': product.descriptionEn,
                        'Description (Arabic)': product.descriptionAr,
                        'Variation Description (English)': '', // Leave variation description empty for product rows
                        'Variation Description (Arabic)': '', // Leave variation description empty for product rows

                    });

                    product.variations.forEach(variation => {
                        worksheet.addRow({
                            'Variation Description (English)': variation.descriptionEn,
                            'Variation Description (Arabic)': variation.descriptionAr,
                        });
                    });
                })

                const fileContent = await workbook.xlsx.writeBuffer();
                console.log('Excel file generated successfully.');
                let file = await s3StorageHelper.uploadExceltoS3(fileContent, `${shopObject.nameEn}-products-${Date.now()}`);
                batchRepo.create({ filesToDelete: [file.result.key] })
                resolve({
                    success: true,
                    code: 201,
                    result: file.result
                });
            } catch (err) {
                console.log(`err.message`, err.message);
                reject({
                    success: false,
                    code: 500,
                    error: "Unexpected Error!"
                });
            }
        })();
    });

}