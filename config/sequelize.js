const config = require('./env_vars');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    config.clearDB.host,
    {
        logging: false
    }
)

module.exports = sequelize;