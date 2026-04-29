import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
  candidatureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Candidature",
    required: true,
  },
  demandeur: {
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    dateDeNaissance: Date,
    email: { type: String, required: true },
    telephone: { type: String, required: true },
  },
  logement: {
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    titre: String,
    description: String,
    prix: Number,
    localisation: String,
    images: [String],
    etat: String,
  },
  proprietaire: {
    id: { type: mongoose.Schema.Types.ObjectId, required: true },
    nom: String,
    email: String,
  },
  rdvDate: { type: Date, default: null },
  rdvHeure: { type: String, default: null },
  statut: { type: String, default: "validée" },
}, { timestamps: true });

const Reservation = mongoose.model("Reservation", reservationSchema);
export default Reservation;
