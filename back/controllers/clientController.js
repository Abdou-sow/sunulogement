import Client from "../models/Client.js";
import Logement from "../models/Logement.js";

export const getClients = async (req, res) => {
  try {
    const clients = await Client.find({ proprietaireId: req.user._id });
    res.status(200).json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const createClient = async (req, res) => {
  try {
    const { nom, prenom, email, telephone, adresse, notes } = req.body;
    const client = await Client.create({
      nom, prenom, email, telephone, adresse, notes,
      proprietaireId: req.user._id,
    });
    res.status(201).json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const updateClient = async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, proprietaireId: req.user._id });
    if (!client) return res.status(404).json({ message: "Client introuvable" });
    const { nom, prenom, email, telephone, adresse, notes } = req.body;
    if (nom !== undefined) client.nom = nom;
    if (prenom !== undefined) client.prenom = prenom;
    if (email !== undefined) client.email = email;
    if (telephone !== undefined) client.telephone = telephone;
    if (adresse !== undefined) client.adresse = adresse;
    if (notes !== undefined) client.notes = notes;
    await client.save();
    res.status(200).json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, proprietaireId: req.user._id });
    if (!client) return res.status(404).json({ message: "Client introuvable" });
    await Logement.updateMany({ clientId: req.params.id }, { $unset: { clientId: "" } });
    await client.deleteOne();
    res.status(200).json({ message: "Client supprimé" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const uploadClientDocument = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: "Client introuvable" });

    if (client.proprietaireId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    if (!req.file) return res.status(400).json({ message: "Fichier manquant" });
    client.documents.push({ nom: req.file.originalname, url: req.file.path });
    await client.save();
    res.status(201).json(client.documents[client.documents.length - 1]);
  } catch (error) {
    console.error("uploadClientDocument:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const deleteClientDocument = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: "Client introuvable" });

    if (client.proprietaireId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    client.documents.id(req.params.docId).deleteOne();
    await client.save();
    res.status(200).json({ message: "Document supprimé" });
  } catch (error) {
    console.error("deleteClientDocument:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
