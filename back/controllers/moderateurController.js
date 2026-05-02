import User from "../models/User.js";

export const getAllProprietaires = async (_req, res) => {
  try {
    const proprietaires = await User.find({ role: "proprietaire" }).select("-password");
    res.status(200).json(proprietaires);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const autoriserProprietaire = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== "proprietaire") {
      return res.status(404).json({ message: "Propriétaire introuvable" });
    }
    user.autorise = true;
    await user.save();
    res.status(200).json({ message: "Propriétaire autorisé", autorise: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const refuserProprietaire = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== "proprietaire") {
      return res.status(404).json({ message: "Propriétaire introuvable" });
    }
    user.autorise = false;
    await user.save();
    res.status(200).json({ message: "Propriétaire refusé", autorise: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
