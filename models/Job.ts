import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJob extends Document {
  title: string;
  company: string;
  location: string;
  salary: string;
  experience: string;
  jobType: string;
  source: string;
  applyLink: string;
  description: string;
  postedDate: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema<IJob> = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    salary: {
      type: String,
      default: 'Not disclosed',
      trim: true,
    },
    experience: {
      type: String,
      default: 'Not specified',
      trim: true,
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary', 'Freelance', 'Other'],
      default: 'Full-time',
    },
    source: {
      type: String,
      required: true,
      enum: ['Adzuna', 'JSearch', 'Jooble', 'Indeed', 'Internshala', 'TimesJobs'],
    },
    applyLink: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    postedDate: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound unique index to prevent duplicate jobs
JobSchema.index({ title: 1, company: 1, location: 1 }, { unique: true });

// Add additional indexes for faster queries
JobSchema.index({ source: 1 });
JobSchema.index({ jobType: 1 });
JobSchema.index({ createdAt: -1 });
JobSchema.index({ title: 'text', company: 'text', location: 'text', description: 'text' });

// Prevent model recompilation during hot reload in development
const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);

export default Job;
