import Candidature from "../models/Candidature.js";
import Logement from "../models/Logement.js";

export const createCandidature = async (req, res) => {
  try {
    const { nom, prenom, email, telephone, dateDeNaissance, message } = req.body;

    const logement = await Logement.findById(req.params.logementId);
    if (!logement) return res.status(404).json({ message: "Logement introuvable" });

    const doublon = await Candidature.findOne({ logement: req.params.logementId, email });
    if (doublon) {
      return res.status(400).json({ message: "Vous avez déjà envoyé une candidature pour ce logement." });
    }

    const candidature = await Candidature.create({
      nom,
      prenom,
      email,
      telephone,
      dateDeNaissance,
      message,
      logement: req.params.logementId,
      proprietaireId: logement.proprietaireId,
    });

    res.status(201).json(candidature);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCandidaturesByProprietaire = async (req, res) => {
  try {
    const candidatures = await Candidature.find({ proprietaireId: req.params.proprietaireId })
      .populate("logement", "titre localisation prix images etat description createdAt updatedAt");
    res.status(200).json(candidatures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCandidature = async (req, res) => {
  try {
    const { status, rdvDate, rdvHeure, notes } = req.body;

    const candidature = await Candidature.findById(req.params.id);
    if (!candidature) return res.status(404).json({ message: "Candidature introuvable" });

    if (status !== undefined) {
      const validStatuts = ["nouvelle", "en_attente", "accepter", "refuser"];
      if (!validStatuts.includes(status)) {
        return res.status(400).json({ message: "Statut invalide. Utiliser nouvelle/en_attente/accepter/refuser." });
      }
      if (status !== candidature.status) {
        candidature.historique.push({ action: status, notes: notes || "" });
      }
      candidature.status = status;
    }

    if (rdvDate !== undefined) candidature.rdvDate = rdvDate;
    if (rdvHeure !== undefined) candidature.rdvHeure = rdvHeure;
    if (notes !== undefined) candidature.notes = notes;

    await candidature.save();
    res.status(200).json({ message: "Candidature mise à jour", candidature });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const validerCandidature = async (req, res) => {
  try {
    const candidature = await Candidature.findById(req.params.id);
    if (!candidature) return res.status(404).json({ message: "Candidature introuvable" });

    candidature.status = "accepter";
    candidature.historique.push({ action: "accepter" });
    await candidature.save();

    res.status(200).json({ message: "Candidature validée", candidature });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const refuserCandidature = async (req, res) => {
  try {
    const candidature = await Candidature.findById(req.params.id);
    if (!candidature) return res.status(404).json({ message: "Candidature introuvable" });

    candidature.status = "refuser";
    candidature.historique.push({ action: "refuser" });
    await candidature.save();

    res.status(200).json({ message: "Candidature refusée", candidature });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCandidature = async (req, res) => {
  try {
    const candidature = await Candidature.findById(req.params.id);
    if (!candidature) return res.status(404).json({ message: "Candidature introuvable" });

    await candidature.deleteOne();
    res.status(200).json({ message: "Candidature supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
