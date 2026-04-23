import mongoose from "mongoose";

const topicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  score: { type: Number, required: true },
  adjustedScore: { type: Number, required: true },
  frequency: { type: Number, required: true },
  priority: { type: String, required: true }
}, { _id: false });

const studySessionSchema = new mongoose.Schema({
  difficulty: { type: String, required: true },
  subjectType: { type: String, required: true },
  sourceSummary: { type: String },
  topics: [topicSchema],
  chartData: {
    labels: [String],
    values: [Number],
    topTopics: [String],
    cumulativeImportance: [Number]
  },
  playlist: { type: Array, default: [] },
  insights: {
    expectedQuestions: [String],
    revisionPlan: String
  }
}, { timestamps: true });

export const StudySession = mongoose.model("StudySession", studySessionSchema);
