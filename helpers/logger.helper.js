exports.logInTestEnv = (...args) => {
    if (process.env.CURRENT_ENV === 'test') {
        console.log(...args);
    }
};