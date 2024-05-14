import Complaint from "../models/Complaint.js";
import cron from "node-cron";

// Controller function to update the status of a complaint
export const setComplaintStatus = async (req, res) => {
  try {
    const { complainId } = req.params;
    const { action } = req.body;

    // Find the complaint by its ID
    const complaint = await Complaint.findById(complainId);

    if (!complaint) {
      return res.status(404).json({ msg: "Complaint not found" });
    }

    // Update the complaint status based on the action
    switch (action) {
      case "resolved":
        complaint.complaintStatus = "resolved";
        break;
      case "unresolved":
        complaint.complaintStatus = "unresolved";
        break;
      case "reopened":
        complaint.complaintStatus = "reopened";
        break;
      default:
        return res.status(400).json({ msg: "Invalid action" });
    }

    // Save the updated complaint
    const updatedComplaint = await complaint.save();

    res.status(200).json(updatedComplaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// Import necessary modules

// Schedule the task to run once a day
cron.schedule("0 0 * * *", async () => {
  try {
    // Calculate the date one month ago
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Find complaints that are older than one month and have a status of "pending"
    const complaintsToUpdate = await Complaint.find({
      createdAt: { $lt: oneMonthAgo },
      complaintStatus: "pending",
    });

    // Update the status of each complaint to "unresolved"
    for (const complaint of complaintsToUpdate) {
      complaint.complaintStatus = "unresolved";
      await complaint.save();
    }

    console.log("Complaint statuses updated successfully.");
  } catch (error) {
    console.error("Error updating complaint statuses:", error);
  }
});
