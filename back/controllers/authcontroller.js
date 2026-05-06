import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    requireTLS: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS?.replace(/\s/g, "") },
    tls: { rejectUnauthorized: false },
  });

const validateRegister = ({ name, email, password }) => {
  if (!name || name.trim().length < 2)
    return "Le nom doit contenir au moins 2 caractères.";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return "Adresse email invalide.";
  if (!password || password.length < 6)
    return "Le mot de passe doit contenir au moins 6 caractères.";
  return null;
};

const normalizeTel = (tel) => tel ? tel.replace(/\s+/g, "").trim() : null;

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, telephone } = req.body;

    const validationError = validateRegister({ name, email, password });
    if (validationError) return res.status(400).json({ message: validationError });

    const tel = normalizeTel(telephone);

    const emailExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (emailExists) return res.status(400).json({ message: "Cet email est déjà utilisé." });

    if (tel) {
      const telExists = await User.findOne({ telephone: tel });
      if (telExists) return res.status(400).json({ message: "Ce numéro de téléphone est déjà utilisé." });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      telephone: tel,
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, telephone: user.telephone },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email et mot de passe requis." });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Email ou mot de passe invalide" });
    }

    if (user.role === "proprietaire" && !user.autorise) {
      const moderateur = await User.findOne({ role: "moderateur" }).select("name email");
      return res.status(403).json({
        blocked: true,
        message: "Votre compte n'est pas encore autorisé.",
        contact: {
          name: moderateur?.name || "le modérateur",
          email: moderateur?.email || "",
        },
      });
    }

    res.status(200).json({
      token: generateToken(user._id),
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, telephone: user.telephone, autorise: user.autorise },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Réponse identique que l'email existe ou non (sécurité)
    const successMsg = "Si cet email existe, un lien de réinitialisation a été envoyé.";

    if (!user) return res.status(200).json({ message: successMsg });

    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    user.resetToken = hashedToken;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: user.email,
        subject: "LogementPro — Réinitialisation de mot de passe",
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;border-radius:10px;border:1px solid #e0e0e0">
            <h2 style="color:#1a237e;margin-top:0">Réinitialisation de mot de passe</h2>
            <p>Bonjour <strong>${user.name}</strong>,</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous :</p>
            <a href="${resetUrl}" style="display:inline-block;margin:20px 0;padding:12px 28px;background:#1a237e;color:#fff;border-radius:8px;text-decoration:none;font-weight:700">
              Réinitialiser mon mot de passe
            </a>
            <p style="color:#888;font-size:13px">Ce lien expire dans <strong>1 heure</strong>. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
            <p style="color:#aaa;font-size:12px">LogementPro — Gestion immobilière</p>
          </div>
        `,
      });
    } catch (mailErr) {
      console.error("Erreur envoi email:", mailErr.message);
      // En développement : log le lien dans la console
      console.log("🔗 Lien de réinitialisation (dev):", resetUrl);
    }

    res.status(200).json({ message: successMsg });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Lien invalide ou expiré." });
    }

    user.password = password;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, telephone, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    if (name && name.trim().length >= 2) user.name = name.trim();

    if (email && email.toLowerCase().trim() !== user.email) {
      const exists = await User.findOne({ email: email.toLowerCase().trim() });
      if (exists) return res.status(400).json({ message: "Cet email est déjà utilisé par un autre compte." });
      user.email = email.toLowerCase().trim();
    }

    const tel = normalizeTel(telephone);
    if (tel !== undefined) {
      if (tel && tel !== user.telephone) {
        const telExists = await User.findOne({ telephone: tel, _id: { $ne: user._id } });
        if (telExists) return res.status(400).json({ message: "Ce numéro de téléphone est déjà utilisé par un autre compte." });
      }
      user.telephone = tel || null;
    }

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: "Mot de passe actuel requis." });
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) return res.status(401).json({ message: "Mot de passe actuel incorrect." });
      if (newPassword.length < 6) return res.status(400).json({ message: "Le nouveau mot de passe doit contenir au moins 6 caractères." });
      user.password = newPassword;
    }

    await user.save();
    res.status(200).json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role, telephone: user.telephone } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const verifyPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Mot de passe incorrect" });
    res.status(200).json({ valid: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
