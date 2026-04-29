import mongoose from "mongoose";

const paiementLoyerSchema = new mongoose.Schema({
  locataire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Locataire",
    required: true,
  },
  logementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Logement",
    required: true,
  },
  mois: { type: Number, required: true }, // 1 à 12
  annee: { type: Number, required: true },
  montant: { type: Number, required: true },
  statut: { type: String, enum: ["payé", "en_attente"], default: "en_attente" },
  datePaiement: { type: Date },
  quittanceUrl: { type: String }, // lien vers PDF quittance
}, { timestamps: true });

const PaiementLoyer = mongoose.model("PaiementLoyer", paiementLoyerSchema);
export default PaiementLoyer;
