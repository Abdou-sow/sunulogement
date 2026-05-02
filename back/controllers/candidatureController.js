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
      nom, prenom, email, telephone, dateDeNaissance, message,
      logement: req.params.logementId,
      proprietaireId: logement.proprietaireId,
    });

    res.status(201).json(candidature);
  } catch (error) {
    console.error("createCandidature:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getCandidaturesByProprietaire = async (req, res) => {
  try {
    if (req.params.proprietaireId !== req.user._id.toString()) {
      return res.status(403).json({ message: "Accès refusé" });
    }
    const candidatures = await Candidature.find({ proprietaireId: req.params.proprietaireId })
      .populate("logement", "titre localisation prix images etat description createdAt updatedAt");
    res.status(200).json(candidatures);
  } catch (error) {
    console.error("getCandidaturesByProprietaire:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const updateCandidature = async (req, res) => {
  try {
    const { status, rdvDate, rdvHeure, notes } = req.body;

    const candidature = await Candidature.findById(req.params.id);
    if (!candidature) return res.status(404).json({ message: "Candidature introuvable" });

    if (candidature.proprietaireId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Accès refusé" });
    }

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
    console.error("updateCandidature:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const validerCandidature = async (req, res) => {
  try {
    const candidature = await Candidature.findById(req.params.id);
    if (!candidature) return res.status(404).json({ message: "Candidature introuvable" });

    if (candidature.proprietaireId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    candidature.status = "accepter";
    candidature.historique.push({ action: "accepter" });
    await candidature.save();

    res.status(200).json({ message: "Candidature validée", candidature });
  } catch (error) {
    console.error("validerCandidature:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const refuserCandidature = async (req, res) => {
  try {
    const candidature = await Candidature.findById(req.params.id);
    if (!candidature) return res.status(404).json({ message: "Candidature introuvable" });

    if (candidature.proprietaireId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    candidature.status = "refuser";
    candidature.historique.push({ action: "refuser" });
    await candidature.save();

    res.status(200).json({ message: "Candidature refusée", candidature });
  } catch (error) {
    console.error("refuserCandidature:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const deleteCandidature = async (req, res) => {
  try {
    const candidature = await Candidature.findById(req.params.id);
    if (!candidature) return res.status(404).json({ message: "Candidature introuvable" });

    if (candidature.proprietaireId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    await candidature.deleteOne();
    res.status(200).json({ message: "Candidature supprimée avec succès" });
  } catch (error) {
    console.error("deleteCandidature:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
