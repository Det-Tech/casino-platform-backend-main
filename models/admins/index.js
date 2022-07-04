/** @format */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const AdminBasicSchema = new Schema({
    fullname: {
        type: String,
        default: "",
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
});

const AdminOtherSchema = new Schema({
    role: {
        type: Number,
        default: 0,
    },
    registryTime: {
        type: Date,
        default: Date.now,
    },
});

const AdminSchema = new Schema();
AdminSchema.add(AdminBasicSchema).add(AdminOtherSchema);

module.exports = Admin = mongoose.model("admins", AdminSchema);
