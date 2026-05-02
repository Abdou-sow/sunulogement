import Locataire from "../models/Locataire.js";
import Logement from "../models/Logement.js";
import Candidature from "../models/Candidature.js";
import Reservation from "../models/Reservation.js";

const ownsLocataire = (locataire, userId) =>
  locataire.proprietaireId.toString() === userId.toString();

export const createLocataire = async (req, res) => {
  try {
    const {
      nom, prenom, email, telephone,
      logementId, dateDebutLocation, dateFinLocation,
    } = req.body;

    const logement = await Logement.findById(logementId);
    if (!logement) return res.status(404).json({ message: "Logement introuvable" });

    if (logement.proprietaireId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const dejaOccupe = await Locataire.findOne({ logementId });
    if (dejaOccupe) {
      return res.status(400).json({ message: "Ce logement est déjà occupé par un locataire." });
    }

    const files = req.files || {};
    const pieceIdentite = files.pieceIdentite?.[0]?.path;
    const etatDesLieux = files.etatDesLieux?.[0]?.path;
    const contratBail = files.contratBail?.[0]?.path;

    const locataire = await Locataire.create({
      nom, prenom, email, telephone,
      logementId,
      proprietaireId: req.user._id,
      dateDebutLocation, dateFinLocation,
      pieceIdentite, etatDesLieux, contratBail,
    });

    logement.etat = "indisponible";
    await logement.save();

    await Candidature.deleteMany({ logement: logementId });
    await Reservation.deleteMany({ "logement._id": logementId });

    await locataire.populate("logementId", "titre localisation prix description");
    res.status(201).json(locataire);
  } catch (error) {
    console.error("createLocataire:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getLocatairesByProprietaire = async (req, res) => {
  try {
    if (req.params.proprietaireId !== req.user._id.toString()) {
      return res.status(403).json({ message: "Accès refusé" });
    }
    const locataires = await Locataire.find({ proprietaireId: req.params.proprietaireId, archivé: { $ne: true } })
      .populate("logementId", "titre localisation prix description");
    res.status(200).json(locataires);
  } catch (error) {
    console.error("getLocatairesByProprietaire:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const updateLocataire = async (req, res) => {
  try {
    const locataire = await Locataire.findById(req.params.id);
    if (!locataire) return res.status(404).json({ message: "Locataire introuvable" });

    if (!ownsLocataire(locataire, req.user._id)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const {
      nom, prenom, email, telephone,
      logementId, dateDebutLocation, dateFinLocation,
    } = req.body;
    const files = req.files || {};

    if (logementId && logementId !== locataire.logementId?.toString()) {
      const nouveauLogement = await Logement.findById(logementId);
      if (!nouveauLogement) return res.status(404).json({ message: "Nouveau logement introuvable" });

      if (nouveauLogement.proprietaireId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Accès refusé sur ce logement" });
      }

      const autreLocataire = await Locataire.findOne({ logementId, _id: { $ne: locataire._id } });
      if (autreLocataire) {
        return res.status(400).json({ message: "Le logement est déjà occupé par un autre locataire." });
      }

      const ancienLogement = await Logement.findById(locataire.logementId);
      if (ancienLogement) {
        ancienLogement.etat = "disponible";
        await ancienLogement.save();
      }

      nouveauLogement.etat = "indisponible";
      await nouveauLogement.save();
      locataire.logementId = logementId;
    }

    if (nom !== undefined) locataire.nom = nom;
    if (prenom !== undefined) locataire.prenom = prenom;
    if (email !== undefined) locataire.email = email;
    if (telephone !== undefined) locataire.telephone = telephone;
    if (dateDebutLocation !== undefined) locataire.dateDebutLocation = dateDebutLocation;
    if (dateFinLocation !== undefined) locataire.dateFinLocation = dateFinLocation;

    if (files.pieceIdentite?.[0]) locataire.pieceIdentite = files.pieceIdentite[0].path;
    if (files.etatDesLieux?.[0]) locataire.etatDesLieux = files.etatDesLieux[0].path;
    if (files.contratBail?.[0]) locataire.contratBail = files.contratBail[0].path;

    await locataire.save();
    await locataire.populate("logementId", "titre localisation prix description");
    res.status(200).json(locataire);
  } catch (error) {
    console.error("updateLocataire:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const addPaiement = async (req, res) => {
  try {
    const { mois, annee, montant, statut } = req.body;

    const locataire = await Locataire.findById(req.params.locataireId);
    if (!locataire) return res.status(404).json({ message: "Locataire introuvable" });

    if (!ownsLocataire(locataire, req.user._id)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    if (typeof montant !== "number" || montant < 0) {
      return res.status(400).json({ message: "Montant invalide" });
    }

    locataire.paiements.push({ mois, annee, montant, statut });
    await locataire.save();

    const newPaiement = locataire.paiements[locataire.paiements.length - 1];
    res.status(201).json({
      _id: newPaiement._id,
      mois: newPaiement.mois,
      annee: newPaiement.annee,
      montant: newPaiement.montant,
      statut: newPaiement.statut,
    });
  } catch (error) {
    console.error("addPaiement:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const marquerPaiementPaye = async (req, res) => {
  try {
    const { paiementId } = req.params;

    const locataire = await Locataire.findOne({ "paiements._id": paiementId });
    if (!locataire) return res.status(404).json({ message: "Paiement introuvable" });

    if (!ownsLocataire(locataire, req.user._id)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const paiement = locataire.paiements.id(paiementId);
    paiement.statut = "payé";
    paiement.datePaiement = new Date();

    await locataire.save();
    res.status(200).json({
      message: "Paiement marqué comme payé",
      paiement: {
        _id: paiement._id,
        statut: paiement.statut,
        datePaiement: paiement.datePaiement,
        mois: paiement.mois,
        annee: paiement.annee,
        montant: paiement.montant,
      },
    });
  } catch (error) {
    console.error("marquerPaiementPaye:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const marquerPaiementImpaye = async (req, res) => {
  try {
    const { paiementId } = req.params;

    const locataire = await Locataire.findOne({ "paiements._id": paiementId });
    if (!locataire) return res.status(404).json({ message: "Paiement introuvable" });

    if (!ownsLocataire(locataire, req.user._id)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const paiement = locataire.paiements.id(paiementId);
    paiement.statut = "impayé";
    await locataire.save();

    res.status(200).json({
      message: "Paiement marqué comme impayé",
      paiement: { _id: paiement._id, statut: paiement.statut, mois: paiement.mois, annee: paiement.annee, montant: paiement.montant },
    });
  } catch (error) {
    console.error("marquerPaiementImpaye:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const autoMarkUnpaid = async (req, res) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const locataires = await Locataire.find({ proprietaireId: req.user._id })
      .populate("logementId", "prix");

    for (const locataire of locataires) {
      if (!locataire.dateDebutLocation || !locataire.dateFinLocation) continue;

      const start = new Date(locataire.dateDebutLocation);
      const end = new Date(locataire.dateFinLocation);
      let modified = false;

      let current = new Date(start.getFullYear(), start.getMonth(), 1);

      while (current <= end) {
        const moisNum = current.getMonth() + 1;
        const annee = current.getFullYear();

        const hasPassed = annee < currentYear || (annee === currentYear && moisNum < currentMonth);
        if (!hasPassed) break;

        const existing = locataire.paiements.find(
          (p) => p.mois === moisNum && p.annee === annee
        );

        if (!existing) {
          locataire.paiements.push({
            mois: moisNum,
            annee,
            montant: locataire.logementId?.prix || 0,
            statut: "impayé",
          });
          modified = true;
        } else if (existing.statut === "en attente") {
          existing.statut = "impayé";
          modified = true;
        }

        current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
      }

      if (modified) await locataire.save();
    }

    res.json({ message: "ok" });
  } catch (error) {
    console.error("autoMarkUnpaid:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const updateEtatDesLieux = async (req, res) => {
  try {
    const locataire = await Locataire.findById(req.params.id);
    if (!locataire) return res.status(404).json({ message: "Locataire introuvable" });

    if (!ownsLocataire(locataire, req.user._id)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    if (!req.file) return res.status(400).json({ message: "Fichier manquant" });

    locataire.etatDesLieux = req.file.path;
    await locataire.save();

    res.status(200).json({
      message: "État des lieux mis à jour",
      etatDesLieux: locataire.etatDesLieux,
    });
  } catch (error) {
    console.error("updateEtatDesLieux:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const deleteLocataire = async (req, res) => {
  try {
    const locataire = await Locataire.findById(req.params.id);
    if (!locataire) return res.status(404).json({ message: "Locataire introuvable" });

    if (!ownsLocataire(locataire, req.user._id)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const { rendreDisponible } = req.body;
    if (rendreDisponible && locataire.logementId) {
      await Logement.findByIdAndUpdate(locataire.logementId, { etat: "disponible" });
    }

    // Archiver au lieu de supprimer pour conserver l'historique des paiements
    locataire.archivé = true;
    locataire.logementId = null;
    await locataire.save();

    res.status(200).json({ message: "Locataire archivé" });
  } catch (error) {
    console.error("deleteLocataire:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const updateEtatDesLieuxSortie = async (req, res) => {
  try {
    const locataire = await Locataire.findById(req.params.id);
    if (!locataire) return res.status(404).json({ message: "Locataire introuvable" });

    if (!ownsLocataire(locataire, req.user._id)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    if (!req.file) return res.status(400).json({ message: "Fichier manquant" });

    locataire.etatDesLieuxSortie = req.file.path;
    await locataire.save();

    res.status(200).json({ message: "État des lieux de sortie mis à jour", etatDesLieuxSortie: locataire.etatDesLieuxSortie });
  } catch (error) {
    console.error("updateEtatDesLieuxSortie:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const deletePaiement = async (req, res) => {
  try {
    const { paiementId } = req.params;

    const locataire = await Locataire.findOne({ "paiements._id": paiementId });
    if (!locataire) return res.status(404).json({ message: "Paiement introuvable" });

    if (!ownsLocataire(locataire, req.user._id)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    locataire.paiements.id(paiementId).deleteOne();
    await locataire.save();
    res.status(200).json({ message: "Paiement supprimé" });
  } catch (error) {
    console.error("deletePaiement:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
