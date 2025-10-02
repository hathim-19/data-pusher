const mongoose = require("mongoose");
const Role = require("/models/Role");
require("dotenv").config();

const initializeRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const roles = [{ role_name: "Admin" }, { role_name: "Normal User" }];

    for (const roleData of roles) {
      const existingRole = await Role.findOne({
        role_name: roleData.role_name,
      });
      if (!existingRole) {
        await Role.create(roleData);
        console.log(`Created role: ${roleData.role_name}`);
      } else {
        console.log(`Role already exists: ${roleData.role_name}`);
      }
    }

    console.log("Roles initialization completed");
    process.exit(0);
  } catch (error) {
    console.error("Error initializing roles:", error);
    process.exit(1);
  }
};

initializeRoles();
