import express from "express";
import ReviewReply from "../models/ReviewReply.js"; // Path to your ReviewReply model

// POST route to create a reply
export const postReviewReply = async (req, res) => {
  try {
    const reply = new ReviewReply({
      reviewId: req.body.reviewId,
      businessId: req.body.businessId,
      replyDescription: req.body.replyDescription
      // replyDate is automatically set to now
    });

    await reply.save();
    res.status(201).send(reply);
  } catch (error) {
    res.status(400).send(error);
  }
};

// GET route to fetch replies for a specific review 
export const getReviewReply = async (req, res) => {
    try {
      const replies = await ReviewReply.find({ reviewId: req.params.reviewId });
      res.send(replies);
    } catch (error) {
      res.status(500).send();
    }
};
  