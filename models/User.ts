import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  profilePicUrl?: string; // Cloudinary URL for profile picture
  resumeUrl?: string;     // Cloudinary URL for resume PDF
  skills: string[];       // Skills extracted from resume
  savedJobs: mongoose.Types.ObjectId[];
  appliedJobs: mongoose.Types.ObjectId[];
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
    },
    profilePicUrl: {
      type: String,
      default: null,
    },
    resumeUrl: {
      type: String,
      default: null,
    },
    skills: {
      type: [String],
      default: [],
    },
    savedJobs: [{
      type: Schema.Types.ObjectId,
      ref: 'Job',
    }],
    appliedJobs: [{
      type: Schema.Types.ObjectId,
      ref: 'Job',
    }],
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation during hot reload
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
