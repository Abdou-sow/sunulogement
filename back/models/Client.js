import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: String,
  email: String,
  telephone: String,
  adresse: String,
  notes: String,
  proprietaireId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  documents: [{
    nom: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

export default mongoose.model("Client", clientSchema);
