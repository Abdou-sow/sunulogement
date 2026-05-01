import Locataire from "../models/Locataire.js";
import Logement from "../models/Logement.js";
import Candidature from "../models/Candidature.js";
import Reservation from "../models/Reservation.js";

export const createLocataire = async (req, res) => {
  try {
    const {
      nom, prenom, email, telephone,
      logementId, proprietaireId,
      dateDebutLocation, dateFinLocation,
    } = req.body;

    const logement = await Logement.findById(logementId);
    if (!logement) return res.status(404).json({ message: "Logement introuvable" });

    const dejaOccupe = await Locataire.findOne({ logementId });
    if (dejaOccupe) {
      return res.status(400).json({ message: "Ce logement est déjà occupé par un locataire." });
    }

    const files = req.files || {};
    const pieceIdentite = files.pieceIdentite?.[0]
      ? files.pieceIdentite[0].path
      : undefined;
    const etatDesLieux = files.etatDesLieux?.[0]
      ? files.etatDesLieux[0].path
      : undefined;
    const contratBail = files.contratBail?.[0]
      ? files.contratBail[0].path
      : undefined;

    const locataire = await Locataire.create({
      nom, prenom, email, telephone,
      logementId, proprietaireId,
      dateDebutLocation, dateFinLocation,
      pieceIdentite, etatDesLieux, contratBail,
    });

    logement.etat = "indisponible";
    await logement.save();

    // Supprimer toutes les candidatures et réservations liées à ce logement
    await Candidature.deleteMany({ logement: logementId });
    await Reservation.deleteMany({ "logement._id": logementId });

    await locataire.populate("logementId", "titre localisation prix description");
    res.status(201).json(locataire);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLocatairesByProprietaire = async (req, res) => {
  try {
    const locataires = await Locataire.find({ proprietaireId: req.params.proprietaireId })
      .populate("logementId", "titre localisation prix description");
    res.status(200).json(locataires);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLocataire = async (req, res) => {
  try {
    const locataire = await Locataire.findById(req.params.id);
    if (!locataire) return res.status(404).json({ message: "Locataire introuvable" });

    const {
      nom, prenom, email, telephone,
      logementId, dateDebutLocation, dateFinLocation,
    } = req.body;
    const files = req.files || {};

    // Si changement de logement, valider et mettre à jour les états
    if (logementId && logementId !== locataire.logementId?.toString()) {
      const nouveauLogement = await Logement.findById(logementId);
      if (!nouveauLogement) return res.status(404).json({ message: "Nouveau logement introuvable" });

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
    res.status(500).json({ message: error.message });
  }
};

export const addPaiement = async (req, res) => {
  try {
    const { mois, annee, montant, statut } = req.body;

    const locataire = await Locataire.findById(req.params.locataireId);
    if (!locataire) return res.status(404).json({ message: "Locataire introuvable" });

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
    res.status(500).json({ message: error.message });
  }
};

export const marquerPaiementPaye = async (req, res) => {
  try {
    const { paiementId } = req.params;

    const locataire = await Locataire.findOne({ "paiements._id": paiementId });
    if (!locataire) return res.status(404).json({ message: "Paiement introuvable" });

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
    res.status(500).json({ message: error.message });
  }
};

export const marquerPaiementImpaye = async (req, res) => {
  try {
    const { paiementId } = req.params;
    const locataire = await Locataire.findOne({ "paiements._id": paiementId });
    if (!locataire) return res.status(404).json({ message: "Paiement introuvable" });
    const paiement = locataire.paiements.id(paiementId);
    paiement.statut = "impayé";
    await locataire.save();
    res.status(200).json({
      message: "Paiement marqué comme impayé",
      paiement: { _id: paiement._id, statut: paiement.statut, mois: paiement.mois, annee: paiement.annee, montant: paiement.montant },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

        // Seulement les mois entièrement passés (avant le mois actuel)
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
    res.status(500).json({ message: error.message });
  }
};

export const updateEtatDesLieux = async (req, res) => {
  try {
    const locataire = await Locataire.findById(req.params.id);
    if (!locataire) return res.status(404).json({ message: "Locataire introuvable" });
    if (!req.file) return res.status(400).json({ message: "Fichier manquant" });

    locataire.etatDesLieux = req.file.path;
    await locataire.save();

    res.status(200).json({
      message: "État des lieux mis à jour",
      etatDesLieux: locataire.etatDesLieux,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePaiement = async (req, res) => {
  try {
    const { paiementId } = req.params;
    const locataire = await Locataire.findOne({ "paiements._id": paiementId });
    if (!locataire) return res.status(404).json({ message: "Paiement introuvable" });
    locataire.paiements.id(paiementId).deleteOne();
    await locataire.save();
    res.status(200).json({ message: "Paiement supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
