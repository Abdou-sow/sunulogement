import Client from "../models/Client.js";
import Logement from "../models/Logement.js";

export const getClients = async (req, res) => {
  try {
    const clients = await Client.find({ proprietaireId: req.user._id });
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
};
