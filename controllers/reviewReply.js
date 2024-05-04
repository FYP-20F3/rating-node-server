import express from "express";
import ReviewReply from "../models/ReviewReply.js"; // Path to your ReviewReply model
import mongoose from "mongoose";

// POST route to create a reply
export const postReviewReply = async (req, res) => {
  try {
    const { reviewId, businessId, replyDescription } = req.body;

    // Check if a reply already exists for the given reviewId
    const existingReply = await ReviewReply.findOne({
      reviewId,
    });

    console.log(existingReply);
    if (existingReply) {
      return res
        .status(403)
        .send({ error: "A reply already exists for this review." });
    }

    const reply = new ReviewReply({
      reviewId,
      businessId,
      replyDescription,
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
