export const config = {
    development: {
        uri: 'mongodb://localhost:27017/veenote',
    },
    production: {
        uri: process.env.DATABASE_URI || '',
    }
};
