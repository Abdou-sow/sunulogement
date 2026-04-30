import mongoose from "mongoose";

const logementSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  type: { type: String, enum: ["Maison", "Studio", "T2", "T3", "T4", "Magasin"], default: "Maison" },
  region: { type: String, default: "" },
  commune: { type: String, default: "" },
  description: String,
  localisation: String,
  prix: Number,
  etat: {
    type: String,
    enum: ["disponible", "indisponible", "en renovation"],
    default: "disponible",
  },
  images: [String],
  proprietaireId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    default: null,
  },
}, { timestamps: true });

const Logement = mongoose.model("Logement", logementSchema);
export default Logement;
