import Registre from "../models/Registre.js";

export const getRegistres = async (req, res) => {
  try {
    const registres = await Registre.find({ proprietaireId: req.user._id }).lean();
    res.json(registres);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const saveRegistre = async (req, res) => {
  try {
    const { moisNum, annee, documents } = req.body;

    if (!moisNum || !annee || !documents) {
      return res.status(400).json({ message: "Données manquantes." });
    }

    const registre = await Registre.findOneAndUpdate(
      { proprietaireId: req.user._id, moisNum, annee },
      { proprietaireId: req.user._id, moisNum, annee, documents },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json(registre);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteRegistre = async (req, res) => {
  try {
    const { moisNum, annee } = req.params;
    await Registre.findOneAndDelete({
      proprietaireId: req.user._id,
      moisNum: Number(moisNum),
      annee: Number(annee),
    });
    res.json({ message: "Registre supprimé." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
