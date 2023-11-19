
exports.generateDummyDataFromSchema = (schema) => {
    try {
        const data = {};

        for (const key in schema) {
            if (schema.hasOwnProperty(key)) {
                const fieldType = schema[key];

                switch (fieldType) {
                    case 'string':
                        data[key] = generateRandomString(5);
                        break;
                    case 'id':
                        data[key] = generateRandomUUID();
                        break;
                    case 'email':
                        data[key] = generateRandomEmail();
                        break;
                    case 'password':
                        data[key] = '123';
                    case 'phone':
                        data[key] = generateRandomPhoneNumber("+20")
                        break;
                    case 'number':
                        data[key] = generateRandomNumber(1, 80);
                        break;
                    case 'boolean':
                        data[key] = (Math.random() < 0.5);
                        break;
                    case 'date':
                        data[key] = generateRandomDate();
                        break;
                    case 'array':
                        data[key] = generateRandomArray(5);
                        break;

                    default:
                        data[key] = fieldType;
                        break;
                }
            }
        }

        return data;
    } catch (err) {
        console.log("err.message", err.message)
        return err.message
    }
}


function generateRandomString(stringLength) {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomString = '';

    for (let i = 0; i < stringLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
    }

    return randomString;
}


function generateRandomEmail() {
    const randomName = generateRandomString(8); // Using the previously defined function
    const randomDomain = generateRandomString(6) + '.com'; // Random domain

    return `${randomName}@${randomDomain}`;
}


function generateRandomNumber(min, max) {
    if (typeof min !== 'number' || typeof max !== 'number' || min >= max) {
        throw new Error('Invalid input. Please provide valid numeric min and max values.');
    }

    const range = max - min;
    return Math.floor(Math.random() * range) + min;
}


function generateRandomDate() {
    const minYear = 1970; // Minimum year
    const maxYear = new Date().getFullYear(); // Current year
    const randomYear = Math.floor(Math.random() * (maxYear - minYear + 1) + minYear);

    const randomMonth = Math.floor(Math.random() * 12) + 1; // 1-12 for months
    const randomDay = Math.floor(Math.random() * 31) + 1; // 1-31 for days

    return new Date(randomYear, randomMonth - 1, randomDay);
}


function generateRandomArray(length, elementType = 'string') {
    const randomArray = [];
    for (let i = 0; i < length; i++) {
        switch (elementType) {
            case 'string':
                randomArray.push(generateRandomString(5));
                break;
            case 'id':
                randomArray.push(generateRandomUUID());
                break;
            case 'number':
                randomArray.push(Math.floor(Math.random() * 100));
                break;
            case 'boolean':
                randomArray.push(Math.random() < 0.5);
                break;
            default:
                // Handle other data types as needed
                break;
        }
    }
    return randomArray;
}


function generateRandomPhoneNumber(countryCode) {
    let countryCodeValue = countryCode ? countryCode : '+971';

    const areaCode = String(Math.floor(Math.random() * 900) + 100); // Generates a random 3-digit area code
    const firstPart = String(Math.floor(Math.random() * 900) + 100); // Generates a random 3-digit number
    const secondPart = String(Math.floor(Math.random() * 9000) + 1000); // Generates a random 4-digit number

    return `${countryCodeValue}-${areaCode}-${firstPart}-${secondPart}`;
}


function generateRandomUUID() {
    const uuidCharacters = '0123456789abcdef';
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

    uuid = uuid.replace(/[xy]/g, (char) => {
        const randomValue = Math.floor(Math.random() * 16);
        const isHexChar = char === 'x';
        return isHexChar ? uuidCharacters[randomValue] : (uuidCharacters[randomValue] & 0x3 | 0x8).toString(16);
    });

    return uuid;
}


exports.chooseRandomEnumValue = (values) => {
    if (Array.isArray(values) && values.length > 0) {
        const randomIndex = Math.floor(Math.random() * values.length);
        return values[randomIndex];
    }
}
