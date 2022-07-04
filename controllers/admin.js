/** @format */

const AdminSchema = require("../models/admins/");

const AdminController = {
    create: async (props) => {
        const { email, firstname, lastname, password } = props;

        const newAdmin = new AdminSchema({
            fullname: firstname + " " + lastname,
            email: email,
            password: password,
        });

        let adminData = await newAdmin.save();
        if (!adminData) throw new Error("Database Error");

        return adminData;
    },
    update: async (props) => {},
    findAdmin: async (props) => {
        const { email } = props;

        let adminData = await AdminSchema.findOne({ email: email });

        return adminData;
    },
    findAdminNumber: async () => {
        let adminData = await AdminSchema.find({});

        return adminData.length;
    },
};

module.exports = { AdminController };
