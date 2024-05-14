import Message from "../models/Message.js";

// Controller function to send a message
export const sendMessage = async (req, res) => {
  try {
    const { chatId, senderId, message, complaintId } = req.body;

    // Create a new message
    const newMessage = new Message({
      chatId,
      senderId,
      message,
      complaintId,
    });

    // Save the message
    const savedMessage = await newMessage.save();

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

// Controller function to get messages for a chat
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    // Query messages based on the chatId
    const messages = await Message.find({ chatId });

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};
