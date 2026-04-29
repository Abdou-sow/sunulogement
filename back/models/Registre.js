import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  content: { type: String, default: "" },
  titre:   { type: String, default: "" },
}, { _id: false });

const clientDocSchema = new mongoose.Schema({
  content:   { type: String, default: "" },
  titre:     { type: String, default: "" },
  clientNom: { type: String, default: "" },
}, { _id: false });

const registreSchema = new mongoose.Schema({
  proprietaireId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  moisNum:  { type: Number, required: true, min: 1, max: 12 },
  annee:    { type: Number, required: true },
  documents: {
    global:    { type: documentSchema,  default: () => ({}) },
    personnel: { type: documentSchema,  default: () => ({}) },
    clients:   { type: Map, of: clientDocSchema, default: () => new Map() },
  },
}, { timestamps: true });

registreSchema.index({ proprietaireId: 1, moisNum: 1, annee: 1 }, { unique: true });

export default mongoose.model("Registre", registreSchema);
