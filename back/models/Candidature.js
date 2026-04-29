import mongoose from "mongoose";

const candidatureSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true },
  telephone: { type: String, required: true },
  dateDeNaissance: Date,
  message: String,
  status: {
    type: String,
    enum: ["nouvelle", "en_attente", "accepter", "refuser"],
    default: "nouvelle",
  },
  logement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Logement",
    required: true,
  },
  proprietaireId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  rdvDate: { type: Date, default: null },
  rdvHeure: { type: String, default: null },
  notes: { type: String, default: "" },
  historique: [{
    action: String,
    date: { type: Date, default: Date.now },
    notes: String,
  }],
}, { timestamps: true });

const Candidature = mongoose.model("Candidature", candidatureSchema);
export default Candidature;
