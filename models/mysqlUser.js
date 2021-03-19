const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require("../config/sequelize");

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    timestamps: false
});

User.sync({ alter: true }).then(() => {
    console.log("Successfully synchronized User table with Sequelize model.");
}).catch(err => {
    console.log("An error occured while synchronizing Sequelize User model with database:", err);
})

module.exports = User;