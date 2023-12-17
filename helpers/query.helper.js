
exports.prepareQueryObjects = async (filterObject, sortObject) => {
    try {
        delete filterObject["page"], delete filterObject["limit"]
        let { locationFinalFilter, locationFinalSort } = handleLocationParams(filterObject);
        let finalFilterObject = handleSearchParams(filterObject);
        console.log(`finalFilterObject 1`, finalFilterObject);

        finalFilterObject = handleFilterByArrayOfIds(finalFilterObject)
        let finalSortObject = handleSortParams(filterObject);

        finalFilterObject = { ...filterObject, ...finalFilterObject, ...locationFinalFilter };
        finalSortObject = { ...sortObject, ...finalSortObject, ...locationFinalSort };

        console.log(`finalFilterObject 2`, finalFilterObject);
        console.log(`finalSortObject`, finalSortObject);
        return {
            filterObject: finalFilterObject,
            sortObject: finalSortObject,
        };

    } catch (err) {
        console.log(`err.message`, err.message);
        return {};
    }
};


function handleLocationParams(filterObject) {
    let locationFinalFilter = {};
    let locationFinalSort = {};

    if (filterObject?.long || filterObject?.lat) {
        const long = parseFloat(filterObject.long);
        const lat = parseFloat(filterObject.lat);

        locationFinalFilter.location = {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [long, lat]
                },
            }
        }
        locationFinalSort.location = "asc"
        delete filterObject["long"]
        delete filterObject["lat"]
    }

    return { locationFinalFilter, locationFinalSort }

}


function handleSearchParams(filterObject) {
    let finalFilterObject = {};

    finalFilterObject = handleRangeParams(filterObject, finalFilterObject)

    finalFilterObject = handleSearchProperty('name', filterObject, finalFilterObject);
    finalFilterObject = handleSearchProperty('nameEn', filterObject, finalFilterObject);
    finalFilterObject = handleSearchProperty('nameAr', filterObject, finalFilterObject);
    finalFilterObject = handleSearchProperty('userName', filterObject, finalFilterObject);
    finalFilterObject = handleSearchProperty('email', filterObject, finalFilterObject);
    finalFilterObject = handleSearchProperty('phone', filterObject, finalFilterObject);
    finalFilterObject = handleSearchProperty('descriptionEn', filterObject, finalFilterObject);
    finalFilterObject = handleSearchProperty('descriptionAr', filterObject, finalFilterObject);

    return finalFilterObject;
}


function handleRangeParams(filterObject, finalFilterObject) {

    if (filterObject?.dateFrom || filterObject?.dateTo) {
        let dateField = filterObject?.dateField;
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

    return finalFilterObject

}


function handleSortParams(filterObject) {
    let finalSortObject = {};

    finalSortObject = handleSortProperty('sortByAlpha', filterObject, finalSortObject, 1);
    finalSortObject = handleSortProperty('sortByRating', filterObject, finalSortObject, filterObject?.sortByRating === 1 ? 1 : -1);
    finalSortObject = handleSortProperty('sortByStock', filterObject, finalSortObject, filterObject?.sortByStock === 1 ? 1 : -1);
    finalSortObject = handleSortProperty('sortByPrice', filterObject, finalSortObject, filterObject?.sortByPrice === 1 ? 1 : -1);
    finalSortObject = handleSortProperty('sortByDate', filterObject, finalSortObject, filterObject?.sortOrder || -1);

    return finalSortObject;
}


function handleSearchProperty(property, filterObject, finalFilterObject) {
    if (filterObject?.[property]) {
        if (!finalFilterObject.$or) {
            finalFilterObject.$or = [];
        }
        finalFilterObject.$or.push({ [property]: { $regex: filterObject[property], $options: 'i' } });
        delete filterObject[property];
    }

    return finalFilterObject;
}


function handleSortProperty(property, filterObject, finalSortObject, sortOrder) {
    console.log(`property`, property);
    // console.log(`filterObject`, filterObject[property]);
    if (filterObject?.[property]) {
        finalSortObject[property] = sortOrder;
        if (property == "sortByDate") delete filterObject["sortOrder"];
        if (property == "sortByAlpha") {

            finalSortObject[`${filterObject[property]}`] = 1;
            delete finalSortObject["sortByAlpha"];

        }
        delete filterObject[property];
    }

    return finalSortObject;
}


function handleFilterByArrayOfIds(filterObject) {
    const modifiedFilterObject = { ...filterObject }; // Create a copy for modification
    console.log(`modifiedFilterObject 1`, modifiedFilterObject);

    for (const keyName in modifiedFilterObject) {
        console.log(`keyName`, keyName);
        if (modifiedFilterObject.hasOwnProperty(keyName)) {
            if (typeof modifiedFilterObject[keyName] === 'string') {
                const arrayValue = JSON.parse(modifiedFilterObject[keyName]);
                if (Array.isArray(arrayValue)) modifiedFilterObject[keyName] = { $in: arrayValue };
            }
        }
    }
    console.log(`modifiedFilterObject 2`, modifiedFilterObject);

    return modifiedFilterObject;
}
