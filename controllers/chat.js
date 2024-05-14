import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import Customer from "../models/Customer.js";
import Business from "../models/Business.js";
import Complaint from "../models/Complaint.js";

export const userChats = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Convert user ID to ObjectId
    const objectId = new mongoose.Types.ObjectId(userId);

    // Find all chats where the user is a participant
    const chats = await Chat.find({
      $or: [
        { members: { $elemMatch: { customer: objectId } } },
        { members: { $elemMatch: { business: objectId } } },
      ],
    })
      .populate({
        path: "members.customer",
        model: Customer,
        select: "firstName lastName  picturePath",
      })
      .populate({
        path: "members.business",
        model: Business,
        select: "businessName businessLogoPath",
      })
      .populate({
        path: "members.complaintId",
        model: Complaint,
        select: "complaintStatus",
      });

    res.status(200).json(chats);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error retrieving chats" });
  }
};
