import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ["user", "ai"],
    },
    content: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const conversationSchema = new mongoose.Schema(
    {
        userId: String,
        messages: [messageSchema],
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.Conversation ||
    mongoose.model("Conversation", conversationSchema);