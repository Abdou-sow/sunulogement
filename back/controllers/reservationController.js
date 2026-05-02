import Reservation from "../models/Reservation.js";
import Candidature from "../models/Candidature.js";

export const createReservation = async (req, res) => {
  try {
    const { candidatureId } = req.params;
    const { demandeur, logement, proprietaire, rdvDate, rdvHeure, statut } = req.body;

    const candidature = await Candidature.findById(candidatureId);
    if (!candidature) return res.status(404).json({ message: "Candidature introuvable" });

    const reservation = await Reservation.create({
      candidatureId,
      demandeur,
      logement,
      proprietaire,
      rdvDate,
      rdvHeure,
      statut: statut || "validée",
    });

    res.status(201).json(reservation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getReservationsByProprietaire = async (req, res) => {
  try {
    const { proprietaireId } = req.params;

    const reservations = await Reservation.find({ "proprietaire.id": proprietaireId });
    res.status(200).json(reservations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: "Réservation introuvable" });

    res.status(200).json(reservation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const updateReservation = async (req, res) => {
  try {
    const { statut, rdvDate, rdvHeure } = req.body;

    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: "Réservation introuvable" });

    if (reservation.proprietaire.id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    if (statut !== undefined) reservation.statut = statut;
    if (rdvDate !== undefined) reservation.rdvDate = rdvDate;
    if (rdvHeure !== undefined) reservation.rdvHeure = rdvHeure;

    await reservation.save();
    res.status(200).json({ message: "Réservation mise à jour", reservation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: "Réservation introuvable" });

    if (reservation.proprietaire.id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    await reservation.deleteOne();
    res.status(200).json({ message: "Réservation supprimée avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
