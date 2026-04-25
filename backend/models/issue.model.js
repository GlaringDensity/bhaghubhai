import mongoose from "mongoose";
const { Schema, model } = mongoose;

const issueSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { 
      type: String, 
      enum: ["Infrastructure", "Sanitation", "Safety", "Greenery"], 
      required: true 
    },
    status: { 
      type: String, 
      enum: ["New", "In Progress", "Resolved"], 
      default: "New" 
    },
    votes: { type: Number, default: 0 },
    location: { type: String, required: true }, // State Name (legacy)
    state: { type: String },
    city: { type: String },
    town: { type: String },
    pinX: { type: Number },  // SVG x coordinate in town plane
    pinY: { type: Number },  // SVG y coordinate in town plane
    latlng: {
      lat: { type: Number },
      lng: { type: Number }
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

const Issue = model("Issue", issueSchema);
export default Issue;
