const faker = require('faker');

function generateDummyData(schema) {
    const data = {};

    for (const key in schema) {
        if (schema.hasOwnProperty(key)) {
            const type = schema[key];
            switch (type) {
                case 'string':
                    data[key] = faker.lorem.word();
                    break;
                case 'email':
                    data[key] = faker.internet.email();
                    break;
                case 'number':
                    data[key] = faker.random.number();
                    break;
                case 'boolean':
                    data[key] = faker.random.boolean();
                    break;
                case 'date':
                    data[key] = faker.date.past(); // Generates a past date
                    break;
                case 'float':
                    data[key] = faker.random.float();
                    break;
                case 'array':
                    data[key] = [faker.lorem.word(), faker.lorem.word()];
                    break;
                case 'object':
                    data[key] = {
                        field1: faker.lorem.word(),
                        field2: faker.random.number(),
                    };
                    break;
                case 'enum':
                    const enumValues = ['value1', 'value2', 'value3'];
                    data[key] = faker.random.arrayElement(enumValues);
                    break;
                case 'file':
                    // In this case, you can generate a placeholder file path or URL.
                    data[key] = faker.internet.url(); // Replace with the appropriate file reference.
                    break;
                // Add more cases for other data types as needed
            }
        }
    }

    return data;
}

module.exports = generateDummyData;
