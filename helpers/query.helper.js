
exports.prepareQueryObjects = (filterObject, sortObject) => {
    try {
        let finalFilterObject = {}
        let finalSortObject = {}

        if (filterObject?.name) {
            finalFilterObject.$or = [
                { name: { $regex: filterObject.name, $options: 'i' } }
            ];
            delete filterObject["name"]
        }


        if (filterObject?.nameEn) {
            finalFilterObject.$or = [
                { nameEn: { $regex: filterObject.nameEn, $options: 'i' } }
            ];
            delete filterObject["nameEn"]
        }



        if (filterObject?.nameAr) {
            finalFilterObject.$or = [
                { nameAr: { $regex: filterObject.nameAr, $options: 'i' } }
            ];
            delete filterObject["nameAr"]
        }


        if (filterObject?.userName) {
            finalFilterObject.$or = [
                { userName: { $regex: filterObject.userName, $options: 'i' } }
            ];
            delete filterObject["userName"]
        }


        if (filterObject?.email) {
            finalFilterObject.$or = [
                { email: { $regex: filterObject.email, $options: 'i' } }
            ];
            delete filterObject["email"]
        }


        if (filterObject?.phone) {
            finalFilterObject.$or = [
                { phone: { $regex: filterObject.phone, $options: 'i' } }
            ];
            delete filterObject["phone"]
        }


        if (filterObject?.descriptionEn) {
            finalFilterObject.$or = [
                { descriptionEn: { $regex: filterObject.descriptionEn, $options: 'i' } }
            ];
            delete filterObject["descriptionEn"]
        }



        if (filterObject?.descriptionAr) {
            finalFilterObject.$or = [
                { descriptionAr: { $regex: filterObject.descriptionAr, $options: 'i' } }
            ];
            delete filterObject["descriptionAr"]
        }


        if (filterObject?.sortByAlpha) {
            let sortLanguage = filterObject?.sortByAlpha
            finalSortObject[`${sortLanguage}`] = 1
            delete filterObject["sortByAlpha"]
        }
        

        if (filterObject?.sortByRating) {
            finalSortObject.rating = filterObject?.sortByRating === 1 ? 1 : -1;
            delete filterObject["sortByRating"]
        }


        if (filterObject?.sortByStock) {
            finalSortObject.stock = filterObject?.sortByStock === 1 ? 1 : -1;
            delete filterObject["sortByStock"]
        }



        if (filterObject?.sortByPrice) {
            finalSortObject['minPackage.price'] = filterObject?.sortByPrice === 1 ? 1 : -1;
            delete filterObject["sortByPrice"]
        }


        if (filterObject?.priceFrom || filterObject?.priceTo) {
            let priceFilter = {};

            if (filterObject.priceFrom) {
                priceFilter.$gte = filterObject.priceFrom;
                delete filterObject["priceFrom"];
            }

            if (filterObject.priceTo) {
                priceFilter.$lte = filterObject.priceTo;
                delete filterObject["priceTo"];
            }

            finalFilterObject['minPackage.price'] = priceFilter;
        }


        if (filterObject?.sortByDate) {
            let dateField = filterObject?.sortByDate
            let sortOrder = filterObject?.sortOrder
            finalSortObject[`${dateField}`] = sortOrder || -1
            delete filterObject["sortByDate"]
            delete filterObject["sortOrder"]
        }


        if (filterObject?.dateFrom || filterObject?.dateTo) {
            let dateField = filterObject?.dateField
            finalFilterObject[`${dateField}`] = {};

            if (filterObject.dateFrom) {
                finalFilterObject[`${dateField}`].$gte = new Date(filterObject.dateFrom);
                delete filterObject["dateFrom"];
            }

            if (filterObject.dateTo) {
                finalFilterObject[`${dateField}`].$lte = new Date(filterObject.dateTo);
                delete filterObject["dateTo"];
            }
        }


        if (filterObject?.long || filterObject?.lat) {
            finalFilterObject.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [long, lat]
                    },
                    $minDistance: 0,
                }
            }
            finalSortObject.location = "asc"
            delete filterObject["long"]
            delete filterObject["lat"]
        }


        finalSortObject = { ...finalSortObject, ...sortObject }
        finalFilterObject = { ...finalFilterObject, ...filterObject }

        return {
            filterObject: finalFilterObject,
            sortObject: finalSortObject
        }

    } catch (err) {
        console.log(`err.message`, err.message);
        return {}
    }
}