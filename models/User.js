const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Import your Sequelize instance

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    phoneVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    orderHistory: {
        type: DataTypes.ARRAY(DataTypes.JSONB),
        defaultValue: [],
    },
    byteBalance: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0,
    },
    bio: {
        type: DataTypes.STRING,
    },
    verificationCode: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // In your User model definition
    resetCode: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    resetCodeExpires: {
        type: DataTypes.DATE,
        allowNull: true,
    },

}, {
    timestamps: true, // Enables automatic `createdAt` and `updatedAt` fields
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
});

module.exports = User;
