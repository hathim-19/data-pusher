const AccountMember = require("/models/AccountMember");
const User = require("/models/User");
const Role = require("/models/Role");
const { deleteCache } = require("../services/cacheService");

exports.inviteMember = async (req, res) => {
  try {
    const { account_id, user_email, role_name } = req.body;

    // Check if inviter is Admin of the account
    const inviterMember = await AccountMember.findOne({
      user_id: req.user._id,
      account_id: account_id,
    }).populate("role_id");

    if (!inviterMember || inviterMember.role_id.role_name !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Only Admin users can invite members",
      });
    }

    // Find user by email
    const user = await User.findOne({ email: user_email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
    }

    // Check if user is already a member
    const existingMember = await AccountMember.findOne({
      account_id: account_id,
      user_id: user._id,
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of this account",
      });
    }

    // Find role
    const role = await Role.findOne({ role_name: role_name });
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    const accountMember = await AccountMember.create({
      account_id: account_id,
      user_id: user._id,
      role_id: role._id,
      created_by: req.user._id,
      updated_by: req.user._id,
    });

    await deleteCache(`account_members:${account_id}`);

    res.status(201).json({
      success: true,
      data: accountMember,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error inviting member",
      error: error.message,
    });
  }
};

exports.getAccountMembers = async (req, res) => {
  try {
    const { account_id } = req.query;

    const accountMembers = await AccountMember.find({ account_id: account_id })
      .populate("user_id", "email")
      .populate("role_id", "role_name")
      .populate("created_by", "email")
      .populate("updated_by", "email");

    res.status(200).json({
      success: true,
      data: accountMembers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching account members",
      error: error.message,
    });
  }
};

exports.updateMemberRole = async (req, res) => {
  try {
    const { role_name } = req.body;

    // Check if updater is Admin
    const updaterMember = await AccountMember.findOne({
      user_id: req.user._id,
      account_id: req.body.account_id,
    }).populate("role_id");

    if (!updaterMember || updaterMember.role_id.role_name !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Only Admin users can update member roles",
      });
    }

    const role = await Role.findOne({ role_name: role_name });
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    const accountMember = await AccountMember.findByIdAndUpdate(
      req.params.id,
      {
        role_id: role._id,
        updated_by: req.user._id,
      },
      { new: true }
    )
      .populate("user_id", "email")
      .populate("role_id", "role_name");

    if (!accountMember) {
      return res.status(404).json({
        success: false,
        message: "Account member not found",
      });
    }

    await deleteCache(`account_members:${accountMember.account_id}`);

    res.status(200).json({
      success: true,
      data: accountMember,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating member role",
      error: error.message,
    });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const accountMember = await AccountMember.findById(req.params.id).populate(
      "role_id",
      "role_name"
    );

    if (!accountMember) {
      return res.status(404).json({
        success: false,
        message: "Account member not found",
      });
    }

    // Check if remover is Admin
    const removerMember = await AccountMember.findOne({
      user_id: req.user._id,
      account_id: accountMember.account_id,
    }).populate("role_id");

    if (!removerMember || removerMember.role_id.role_name !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Only Admin users can remove members",
      });
    }

    await AccountMember.findByIdAndDelete(req.params.id);
    await deleteCache(`account_members:${accountMember.account_id}`);

    res.status(200).json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error removing member",
      error: error.message,
    });
  }
};
