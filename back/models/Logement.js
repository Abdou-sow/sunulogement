import mongoose from "mongoose";

const logementSchema = new mongoose.Schema({
  titre: { type: String, required: true },
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
