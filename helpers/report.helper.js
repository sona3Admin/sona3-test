

exports.countObjectsByArrayOfFilters = (arrayOfObjects, arrayOfFilters) => {
    if (!Array.isArray(arrayOfObjects)) throw new Error('First parameter must be an array');
    if (!Array.isArray(arrayOfFilters)) throw new Error('Second parameter must be an array');

    const result = {};

    arrayOfFilters.forEach(filterObject => {
        if (typeof filterObject !== 'object' || filterObject === null)
            throw new Error('Each filterObject must be an object with conditions property');

        const { conditions, label } = filterObject;

        if (!Array.isArray(conditions))
            throw new Error('conditions must be an array of {fieldName, fieldValue} objects');

        result[label] = arrayOfObjects.reduce((count, object) => {
            const matchesAllConditions = conditions.every(condition => {
                const { fieldName, fieldValue } = condition;
                return typeof object === 'object' &&
                    object !== null &&
                    Object.prototype.hasOwnProperty.call(object, fieldName) &&
                    object[fieldName] === fieldValue;
            });

            return matchesAllConditions ? count + 1 : count;
        }, 0);
    });

    result.total = arrayOfObjects.length;
    return { success: true, code: 200, result };
}