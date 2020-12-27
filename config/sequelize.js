const config = require('./index');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    'platonic',
    config.databaseUsername,
    config.databasePw,
    {
        host: 'localhost',
        dialect: 'mysql',
        logging: false
    }
);

module.exports = sequelize;