import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import JournalEntry from "@/models/JournalEntry";
import Mood from "@/models/Mood";
import Conversation from "@/models/Conversation";
import mongoose from "mongoose";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const email = session.user.email?.toLowerCase();
    const user = await User.findOne({ email }).select("-password");
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  console.log("POST /api/user/settings - ROUTE HIT");
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { name, bio, jobTitle, location, image, notifications, appearance } = data;

    await connectDB();
    const email = session.user.email?.toLowerCase();
    
    console.log("DEBUG: Received update data:", data);
    console.log("DEBUG: User model fields:", Object.keys(User.schema.paths));
    
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
    if (location !== undefined) updateData.location = location;
    if (image !== undefined) updateData.image = image;
    if (notifications !== undefined) updateData.notifications = notifications;
    if (appearance !== undefined) updateData.appearance = appearance;

    const user = await User.findOneAndUpdate(
      { email },
      { $set: updateData },
      { returnDocument: 'after', runValidators: true, upsert: true, strict: false }
    ).select("-password");

    console.log("DEBUG: Updated user result:", user);

    return NextResponse.json({ message: "Settings updated successfully", user });
  } catch (error) {
    console.error("Settings POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const email = session.user.email?.toLowerCase();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user._id;

    // 1. Delete NextAuth associated records (accounts and sessions)
    // These are managed by the MongoDB adapter but we can delete them manually
    await mongoose.connection.db?.collection('accounts').deleteMany({ userId: userId });
    await mongoose.connection.db?.collection('sessions').deleteMany({ userId: userId });

    // 2. Delete feature-specific data
    await JournalEntry.deleteMany({ userId: userId });
    await Mood.deleteMany({ userId: userId });
    
    // Note: Conversation model has userId as a String in the schema
    await Conversation.deleteMany({ userId: userId.toString() });

    // 3. Finally delete the user record
    await User.findByIdAndDelete(userId);

    return NextResponse.json({ message: "Account and all associated data deleted permanently" });
  } catch (error) {
    console.error("Settings DELETE error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
