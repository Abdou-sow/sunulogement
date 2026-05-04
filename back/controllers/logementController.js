import Logement from "../models/Logement.js";

export const getAllLogements = async (_req, res) => {
  try {
    const logements = await Logement.find();
    res.status(200).json(logements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getLogementById = async (req, res) => {
  try {
    const logement = await Logement.findById(req.params.id);
    if (!logement) return res.status(404).json({ message: "Logement introuvable" });
    res.status(200).json(logement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getLogementsByProprietaire = async (req, res) => {
  try {
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({ message: "Accès refusé" });
    }
    const logements = await Logement.find({ proprietaireId: req.params.id })
      .populate("clientId", "nom prenom email telephone");
    res.status(200).json(logements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const createLogement = async (req, res) => {
  try {
    const { titre, type, region, commune, localisation, description, prix } = req.body;
    const images = req.files?.map((f) => f.path) || [];

    const logement = await Logement.create({
      titre,
      type: type || "Maison",
      region: region || "",
      commune: commune || "",
      localisation,
      description,
      prix,
      images,
      proprietaireId: req.user._id,
      clientId: req.body.clientId || null,
    });

    res.status(201).json(logement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const updateLogement = async (req, res) => {
  try {
    const logement = await Logement.findById(req.params.id);
    if (!logement) return res.status(404).json({ message: "Logement introuvable" });

    if (logement.proprietaireId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const { titre, type, region, commune, localisation, description, prix, etat } = req.body;
    const newImages = req.files?.map((f) => f.path) || [];

    // Images existantes à conserver (envoyées par le frontend)
    let keepImages = req.body.keepImages;
    if (keepImages !== undefined) {
      if (!Array.isArray(keepImages)) keepImages = [keepImages];
      logement.images = [...keepImages, ...newImages];
    } else if (newImages.length > 0) {
      logement.images = [...logement.images, ...newImages];
    }

    if (titre !== undefined) logement.titre = titre;
    if (type !== undefined) logement.type = type;
    if (region !== undefined) logement.region = region;
    if (commune !== undefined) logement.commune = commune;
    if (localisation !== undefined) logement.localisation = localisation;
    if (description !== undefined) logement.description = description;
    if (prix !== undefined) logement.prix = prix;
    if (etat !== undefined) logement.etat = etat;
    if (req.body.clientId !== undefined) logement.clientId = req.body.clientId || null;

    await logement.save();
    res.status(200).json(logement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const deleteLogement = async (req, res) => {
  try {
    const logement = await Logement.findById(req.params.id);
    if (!logement) return res.status(404).json({ message: "Logement introuvable" });

    if (logement.proprietaireId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    await logement.deleteOne();
    res.status(200).json({ message: "Logement supprimé" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
