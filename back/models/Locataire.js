import mongoose from "mongoose";

const paiementSchema = new mongoose.Schema({
  mois: { type: Number, required: true, min: 1, max: 12 },
  annee: { type: Number, required: true },
  montant: { type: Number, required: true },
  statut: {
    type: String,
    enum: ["en attente", "payé", "impayé"],
    default: "en attente",
  },
  datePaiement: Date,
});

const locataireSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: String,
  telephone: String,
  logementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Logement",
  },
  proprietaireId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  dateDebutLocation: Date,
  dateFinLocation: Date,
  pieceIdentite: String,
  etatDesLieux: String,
  contratBail: String,
  paiements: [paiementSchema],
  autorise: { type: Boolean, default: false },
}, { timestamps: true });

const Locataire = mongoose.model("Locataire", locataireSchema);
export default Locataire;
