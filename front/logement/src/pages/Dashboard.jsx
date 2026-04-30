import React, { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import { TYPES_LOGEMENT, REGIONS, REGIONS_COMMUNES } from "../data/senegal";
import { getImageUrl } from "../services/api";
import EtatDesLieux from "../components/EtatDesLieux";
import {
  getClients,
  createClient as createClientService,
  updateClient as updateClientService,
  deleteClient as deleteClientService,
} from "../services/clients";
import {
  getLogementsByProprietaireId,
  createLogement,
  updateLogementById,
  deleteLogement,
  getLocatairesByProprietaireId,
  addLocataire,
  validerPaiement,
  marquerPaiementImpaye,
  updateLocataireById,
  createPaiement,
  // candidatures
  getCandidaturesByProprietaireId,
  deleteCandidature,
  // reservations
  getReservationsByProprietaireId,
  createReservationByCandidatureId,
  updateReservation,
  deleteReservation,
} from "../services/logements";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getRegistres, saveRegistre, deleteRegistre as deleteRegistreApi } from "../services/registres";
import { useToast } from "../components/Toast";
import "../styles/Dashboard.css";
import "../styles/DashboardLayout.css";

function Dashboard() {
  const { user, logout } = useUser();
  const toast = useToast();

  const [mesAnnonces, setMesAnnonces] = useState([]);
  const [locataires, setLocataires] = useState([]);
  const [paiements, setPaiements] = useState([]);
  // candidatures
  const [candidatures, setCandidatures] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [moisSelectionne, setMoisSelectionne] = useState(null);

  // --- États pour ajout logement ---
  const [titre, setTitre] = useState("");
  const [typeLogement, setTypeLogement] = useState("Maison");
  const [region, setRegion] = useState("");
  const [commune, setCommune] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [description, setDescription] = useState("");
  const [prix, setPrix] = useState("");
  const [images, setImages] = useState([]);

  // --- États édition logement ---
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editType, setEditType] = useState("Maison");
  const [editRegion, setEditRegion] = useState("");
  const [editCommune, setEditCommune] = useState("");
  const [editEtat, setEditEtat] = useState("");
  const [editPrix, setEditPrix] = useState("");
  const [editLocalisation, setEditLocalisation] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImages, setEditImages] = useState([]);

  // --- Tri / recherche locataires ---
  const [searchLoc, setSearchLoc] = useState("");
  const [sortLocBy, setSortLocBy] = useState("nom");
  const [sortLocDir, setSortLocDir] = useState("asc");

  // --- États locataires ---
  const [locNom, setLocNom] = useState("");
  const [locPrenom, setLocPrenom] = useState("");
  const [locEmail, setLocEmail] = useState("");
  const [locTelephone, setLocTelephone] = useState("");
  const [locLogement, setLocLogement] = useState("");
  const [locDebut, setLocDebut] = useState("");
  const [locFin, setLocFin] = useState("");
  const [locPieceIdentite, setLocPieceIdentite] = useState(null);
  const [locEtatDesLieux, setLocEtatDesLieux] = useState(null);
  const [locContratBail, setLocContratBail] = useState(null);

  // --- États pour gestion/édition locataire ---
  const [editingLocataireId, setEditingLocataireId] = useState(null);
  const [editLocNom, setEditLocNom] = useState("");
  const [editLocPrenom, setEditLocPrenom] = useState("");
  const [editLocEmail, setEditLocEmail] = useState("");
  const [editLocTelephone, setEditLocTelephone] = useState("");
  const [editLocDebut, setEditLocDebut] = useState("");
  const [editLocFin, setEditLocFin] = useState("");
  const [editLocPieceIdentite, setEditLocPieceIdentite] = useState(null);
  const [editLocEtatDesLieux, setEditLocEtatDesLieux] = useState(null);
  const [editLocContratBail, setEditLocContratBail] = useState(null);
  const [showEditLocModal, setShowEditLocModal] = useState(false);

  // --- Modal voir dossier ---
  const [selectedLocataireDossier, setSelectedLocataireDossier] = useState(null);
  const [showDossierModal, setShowDossierModal] = useState(false);


  // --- États modal réservation ---
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [editReservationMode, setEditReservationMode] = useState(false);
  const [editRdvDate, setEditRdvDate] = useState("");
  const [editRdvHeure, setEditRdvHeure] = useState("");
  // Nettoyage après acceptation depuis réservation (candidatureId + logementId)
  const [pendingCleanup, setPendingCleanup] = useState(null);

  // --- État des lieux ---
  const [showEtatDesLieux, setShowEtatDesLieux] = useState(false);
  const [edlLocataire, setEdlLocataire] = useState(null);

  // --- États quittances & notifications ---
  const [showQuittancePreviewModal, setShowQuittancePreviewModal] = useState(false);
  const [quittancePreviewData, setQuittancePreviewData] = useState({ text: "", title: "" });
  const [notifications, setNotifications] = useState([]);
  const [moisClotures, setMoisClotures] = useState([]);

  // --- États clients (bailleurs) ---
  const [activePage, setActivePage] = useState("accueil");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [filtreClient, setFiltreClient] = useState("all"); // "all" | "mine" | clientId
  const [showAddClient, setShowAddClient] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [clientForm, setClientForm] = useState({ nom: "", prenom: "", email: "", telephone: "", adresse: "", notes: "" });
  const [locClientId, setLocClientId] = useState(""); // client sélectionné lors de l'ajout d'un logement

  // --- États pour gestion avancée candidatures ---
  const [showCandidatureDetailModal, setShowCandidatureDetailModal] = useState(false);
  const [currentCandidatureDetail, setCurrentCandidatureDetail] = useState(null);
  const [candidatureNotes, setCandidatureNotes] = useState("");
  const [candidatureRdvDate, setCandidatureRdvDate] = useState("");
  const [candidatureRdvHeure, setCandidatureRdvHeure] = useState("");
  const [candidatureHistorique, setCandidatureHistorique] = useState([]);

  const mois = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const getMoisLocation = (debut, fin) => {
    if (!debut || !fin) return [];
    const start = new Date(debut);
    const end = new Date(fin);
    const result = [];
    let current = new Date(start.getFullYear(), start.getMonth(), 1);
    while (current <= end) {
      result.push({ moisNum: current.getMonth() + 1, annee: current.getFullYear() });
      current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }
    return result;
  };

  const proprietaireId = user?._id || user?.id;

  // --- Charger données ---
  const fetchData = async () => {
    if (!proprietaireId) return;
    try {
      const safeFetch = async (fn, id) => {
        try {
          const res = await fn(id);
          return Array.isArray(res) ? res : [];
        } catch (error) {
          console.error(`Erreur fetch ${fn.name}:`, error);
          return [];
        }
      };

      const [dataAnnonces, dataLocataires, dataCandidatures, dataReservations, dataClients] =
        await Promise.all([
          safeFetch(getLogementsByProprietaireId, proprietaireId),
          safeFetch(getLocatairesByProprietaireId, proprietaireId),
          safeFetch(getCandidaturesByProprietaireId, proprietaireId),
          safeFetch(getReservationsByProprietaireId, proprietaireId),
          getClients().catch(() => []),
        ]);

      setMesAnnonces(dataAnnonces);
      setLocataires(dataLocataires);
      setCandidatures(dataCandidatures);
      setReservations(dataReservations);
      setClients(Array.isArray(dataClients) ? dataClients : []);

      let tousPaiements = [];
      dataLocataires.forEach((l) => {
        if (l.paiements) {
          const nomLoc = `${l.nom || ""} ${l.prenom || ""}`.trim() || l.email || "-";
          const logementTitre = l.logementId?.titre || "-";
          const enriched = l.paiements.map((p) => ({
            ...p,
            locataireNom: nomLoc,
            logementTitre,
            locataireId: String(l._id),
            locataireEmail: l.email || null,
            logementId: l.logementId?._id ? String(l.logementId._id) : null,
          }));
          tousPaiements = [...tousPaiements, ...enriched];
        }
      });
      setPaiements(tousPaiements);
      checkReminders(dataLocataires, tousPaiements);
    } catch (err) {
      console.error("Erreur fetchData globale :", err);
    }
  };

  useEffect(() => {
    fetchData();
    if (proprietaireId) {
      getRegistres()
        .then((data) => setMoisClotures(Array.isArray(data) ? data : []))
        .catch(() => setMoisClotures([]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proprietaireId]);

  if (!user) return <p>Accès refusé, connectez-vous.</p>;

  // --- Vues filtrées (computed — dépend de filtreClient) ---
  // Un logement est "personnel" s'il n'est assigné à aucun client connu de la liste
  const clientIdSet = new Set(clients.map((c) => String(c._id)));
  const isPersonnelLogement = (a) => {
    const cid = a.clientId?._id || a.clientId;
    return !cid || !clientIdSet.has(String(cid));
  };
  const annoncesAffichees = (() => {
    if (filtreClient === "all") return mesAnnonces;
    if (filtreClient === "mine") return mesAnnonces.filter(isPersonnelLogement);
    return mesAnnonces.filter((a) => String(a.clientId?._id || a.clientId) === filtreClient);
  })();
  const annoncesAffichemesIds = new Set(annoncesAffichees.map((a) => String(a._id)));
  const locatairesAffiches = filtreClient === "all"
    ? locataires
    : locataires.filter((l) => annoncesAffichemesIds.has(String(l.logementId?._id || l.logementId)));
  const locatairesAffichemesIds = new Set(locatairesAffiches.map((l) => String(l._id)));

  const locatairesFiltresTries = [...locatairesAffiches]
    .filter((l) => {
      if (!searchLoc) return true;
      const q = searchLoc.toLowerCase();
      return (
        (l.nom || "").toLowerCase().includes(q) ||
        (l.prenom || "").toLowerCase().includes(q) ||
        (l.telephone || "").includes(q)
      );
    })
    .sort((a, b) => {
      let va = "", vb = "";
      if (sortLocBy === "nom") {
        va = `${a.nom} ${a.prenom}`.toLowerCase();
        vb = `${b.nom} ${b.prenom}`.toLowerCase();
      } else if (sortLocBy === "telephone") {
        va = a.telephone || "";
        vb = b.telephone || "";
      }
      return sortLocDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  const paiementsAffiches = filtreClient === "all"
    ? paiements
    : paiements.filter((p) => locatairesAffichemesIds.has(String(p.locataireId)));

  // --- Gestion des paiements pour graphique ---
  const getRevenuAnnuel = () => {
    return mois.map((m, i) => {
      const revenusMois = paiementsAffiches
        .filter((p) => p.mois === i + 1 && p.statut === "payé")
        .reduce((sum, p) => sum + p.montant, 0);
      return { mois: m, revenu: revenusMois };
    });
  };

  // --- Graphique paiements du mois actuel ---
  const getMoisActuel = () => new Date().getMonth() + 1;
  const getPaiementsMoisActuel = () => {
    const moisActuel = getMoisActuel();
    const paiementsMois = paiementsAffiches.filter((p) => p.mois === moisActuel);
    const payes = paiementsMois.filter((p) => p.statut === "payé").length;
    const nonPayes = paiementsMois.filter((p) => p.statut !== "payé").length;
    return [
      { name: "Payés", value: payes, fill: "#4CAF50" },
      { name: "En attente", value: nonPayes, fill: "#FF9800" }
    ];
  };
  const dataPaiements = getPaiementsMoisActuel();
  const totalPaiementsMois = dataPaiements.reduce((sum, d) => sum + d.value, 0);

  const dataGraph = getRevenuAnnuel();
  const logementsDuMois = (moisIndex) =>
    paiementsAffiches.filter((p) => p.mois === moisIndex + 1 && p.statut === "payé");

  // --- Ajouter logement ---
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!titre || !region || !commune || !description || !prix) {
      toast("Remplir tous les champs obligatoires", "warning");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("titre", titre);
      formData.append("type", typeLogement);
      formData.append("region", region);
      formData.append("commune", commune);
      formData.append("localisation", localisation);
      formData.append("description", description);
      formData.append("prix", prix);
      if (locClientId) formData.append("clientId", locClientId);
      Array.from(images).forEach((file) => formData.append("images", file));
      const newAnnonce = await createLogement(formData);
      setMesAnnonces((prev) => [newAnnonce, ...prev]);
      setTitre("");
      setTypeLogement("Maison");
      setRegion("");
      setCommune("");
      setLocalisation("");
      setDescription("");
      setPrix("");
      setLocClientId("");
      setImages([]);
    } catch (err) {
      console.error(err);
      toast("Erreur ajout logement", "error");
    }
  };

  // --- Supprimer logement ---
  const handleDelete = async (_id) => {
    if (!window.confirm("Supprimer ce logement ?")) return;
    try {
      await deleteLogement(_id);
      setMesAnnonces((prev) => prev.filter((a) => a._id !== _id));
    } catch (err) {
      console.error(err);
      toast("Erreur suppression", "error");
    }
  };

  // --- Modifier logement ---
  const startEditing = (annonce) => {
    setEditingId(annonce._id);
    setEditTitle(annonce.titre);
    setEditType(annonce.type || "Maison");
    setEditRegion(annonce.region || "");
    setEditCommune(annonce.commune || "");
    setEditEtat(annonce.etat);
    setEditPrix(annonce.prix);
    setEditLocalisation(annonce.localisation || "");
    setEditDescription(annonce.description || "");
    setEditImages(annonce.images || []);
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("titre", editTitle);
      formData.append("type", editType);
      formData.append("region", editRegion);
      formData.append("commune", editCommune);
      formData.append("etat", editEtat);
      formData.append("prix", editPrix);
      formData.append("localisation", editLocalisation);
      formData.append("description", editDescription);
      // For images, append new ones, but for delete, assume backend handles or send list
      // For simplicity, append all current images as strings, and new files
      editImages.forEach((img) => {
        formData.append("images", img);
      });
      const res = await updateLogementById(editingId, formData);
      setMesAnnonces((prev) =>
        prev.map((a) => (a._id === editingId ? res : a))
      );
      setShowEditModal(false);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      toast("Erreur modification", "error");
    }
  };

  // --- Ajouter locataire ---
  const handleAddLocataire = async (e) => {
    e.preventDefault();
    if (!locNom || !locPrenom || !locLogement || !locDebut || !locFin) {
      toast("Remplir tous les champs locataire", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("nom", locNom);
    formData.append("prenom", locPrenom);
    formData.append("email", locEmail);
    formData.append("telephone", locTelephone);
    formData.append("logementId", locLogement);
    formData.append("dateDebutLocation", locDebut);
    formData.append("dateFinLocation", locFin);
    formData.append("proprietaireId", user._id || user.id);
    if (locPieceIdentite) formData.append("pieceIdentite", locPieceIdentite);
    if (locEtatDesLieux) formData.append("etatDesLieux", locEtatDesLieux);
    if (locContratBail) formData.append("contratBail", locContratBail);

    try {
      const newLoc = await addLocataire(formData);
      setLocataires((prev) => [...prev, newLoc]);
      setLocNom("");
      setLocPrenom("");
      setLocEmail("");
      setLocTelephone("");
      setLocLogement("");
      setLocDebut("");
      setLocFin("");
      setLocPieceIdentite(null);
      setLocEtatDesLieux(null);
      setLocContratBail(null);

      // Nettoyage automatique si dossier issu d'une réservation
      if (pendingCleanup) {
        const { candidatureId, logementId } = pendingCleanup;
        // Supprimer toutes les candidatures du logement (dont celle acceptée)
        const aSupprimer = candidatures.filter(
          (c) => String(c.logement?._id) === String(logementId)
        );
        await Promise.allSettled(aSupprimer.map((c) => deleteCandidature(c._id)));
        // Supprimer aussi la candidature liée si elle n'est pas déjà dans la liste
        if (candidatureId && !aSupprimer.find((c) => c._id === candidatureId)) {
          await deleteCandidature(candidatureId).catch(() => {});
        }
        setCandidatures((prev) =>
          prev.filter((c) => String(c.logement?._id) !== String(logementId))
        );
        setPendingCleanup(null);
        toast("Locataire ajouté. Toutes les candidatures pour ce logement ont été supprimées.", "success");
      }

      await fetchData();
    } catch (err) {
      console.error(err);
      toast("Erreur ajout locataire", "error");
    }
  };

  // --- Valider paiement ---
  const handleValiderPaiement = async (paiementId) => {
    try {
      const res = await validerPaiement(paiementId);
      setPaiements((prev) =>
        prev.map((p) => (p._id === paiementId ? { ...p, ...res.paiement } : p))
      );
      await fetchData();
    } catch (err) {
      console.error(err);
      toast("Erreur validation paiement", "error");
    }
  };

  // --- Créer paiement mensuel ---
  const handleCreerPaiement = async (locataireId, moisIndex, annee = new Date().getFullYear()) => {
    try {
      const locataire = locataires.find(l => l._id === locataireId);
      const montant = locataire?.logementId?.prix || 0;

      const paiementData = {
        mois: moisIndex,
        montant: montant,
        annee,
        statut: "en attente"
      };

      const nouveauPaiement = await createPaiement(locataireId, paiementData);
      setPaiements((prev) => [...prev, nouveauPaiement]);
      await fetchData();
      toast(`Paiement pour ${mois[moisIndex - 1]} ${annee} créé avec succès !`, "success");
    } catch (err) {
      console.error(err);
      toast("Erreur création paiement", "error");
    }
  };

  // --- Ouvrir modal édition locataire ---
  const openEditLocataire = (l) => {
    setEditingLocataireId(l._id);
    setEditLocNom(l.nom || "");
    setEditLocPrenom(l.prenom || "");
    setEditLocEmail(l.email || "");
    setEditLocTelephone(l.telephone || "");
    setEditLocDebut(l.dateDebutLocation || "");
    setEditLocFin(l.dateFinLocation || "");
    setEditLocPieceIdentite(l.pieceIdentite || null);
    setEditLocEtatDesLieux(l.etatDesLieux || null);
    setEditLocContratBail(l.contratBail || null);
    setShowEditLocModal(true);
  };

  // --- Ouvrir modal voir dossier ---
  const openDossierLocataire = (l) => {
    setSelectedLocataireDossier(l);
    setShowDossierModal(true);
  };

  // --- Ouvrir état des lieux ---
  const openEtatDesLieux = (l) => {
    setEdlLocataire(l);
    setShowEtatDesLieux(true);
  };

  // --- Archiver état des lieux (appelé après génération PDF) ---
  const handleArchiveEDL = async (formData, nomFichier) => {
    try {
      const api = (await import("../services/api")).default;
      await api.patch(`/locataires/${edlLocataire._id}/etat-des-lieux`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchData();
      toast(`État des lieux "${nomFichier}" archivé dans le dossier du locataire.`, "success");
    } catch (err) {
      console.error("Erreur archivage EDL:", err);
      // Pas bloquant — le PDF a quand même été téléchargé
    }
  };

  // --- Enregistrer modifications locataire ---
  const handleSaveLocataire = async () => {
    if (!editingLocataireId) return;
    const formData = new FormData();
    formData.append("nom", editLocNom);
    formData.append("prenom", editLocPrenom);
    formData.append("email", editLocEmail);
    formData.append("telephone", editLocTelephone);
    formData.append("dateDebutLocation", editLocDebut);
    formData.append("dateFinLocation", editLocFin);
    if (editLocPieceIdentite && typeof editLocPieceIdentite !== "string") {
      formData.append("pieceIdentite", editLocPieceIdentite);
    }
    if (editLocEtatDesLieux && typeof editLocEtatDesLieux !== "string") {
      formData.append("etatDesLieux", editLocEtatDesLieux);
    }
    if (editLocContratBail && typeof editLocContratBail !== "string") {
      formData.append("contratBail", editLocContratBail);
    }

    try {
      const updatedLocataire = await updateLocataireById(editingLocataireId, formData);
      setLocataires((prev) =>
        prev.map((l) =>
          l._id === editingLocataireId ? updatedLocataire : l
        )
      );
      await fetchData();
      setShowEditLocModal(false);
      setEditingLocataireId(null);
      toast("Locataire modifié avec succès ✅", "success");
    } catch (err) {
      console.error(err);
      toast("Erreur sauvegarde locataire", "error");
    }
  };

  // --- Récupérer locataires qui ont payé ---
  // --- Helper pour afficher une date lisible (JJ/MM/AAAA) ---
  const formatDate = (d) => {
    if (!d) return "-";
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("fr-FR");
  };

  // --- Générer quittance de loyer (PDF simple) ---
  const generateQuittance = (locataire) => {
    const moisActuel = getMoisActuel();
    const moisNom = mois[moisActuel - 1];
    const annee = new Date().getFullYear();
    const montant = paiements.find((p) => String(p.locataireId) === String(locataire._id) && Number(p.mois) === Number(moisActuel))?.montant || 0;

    const text = `
================== QUITTANCE DE LOYER ==================

Date: ${new Date().toLocaleDateString("fr-FR")}
Mois: ${moisNom} ${annee}

--- PROPRIÉTAIRE ---
Nom: ${user.name}
Email: ${user.email || "-"}

--- LOCATAIRE ---
Nom: ${locataire.nom} ${locataire.prenom}
Email: ${locataire.email || "-"}
Téléphone: ${locataire.telephone || "-"}

--- LOGEMENT ---
Titre: ${locataire.logementId?.titre || "-"}
Adresse: ${locataire.logementId?.localisation || "-"}

--- PAIEMENT ---
Montant: ${montant} €
Statut: Payé
Date de paiement: ${new Date().toLocaleDateString("fr-FR")}

Signature du propriétaire: _______________

Cette quittance vaut preuve de paiement du loyer pour le mois de ${moisNom} ${annee}.

=========================================================
    `;

    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `Quittance_${locataire.nom}_${moisNom}_${annee}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // --- Système de relances & notifications ---
  const checkReminders = (dataLocataires, tousPaiements) => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate();
    if (currentDay <= 5) return;

    const newNotifs = [];
    dataLocataires.forEach((l) => {
      const p = tousPaiements.find(
        (p) => String(p.locataireId) === String(l._id) && Number(p.mois) === currentMonth
      );
      if (p?.statut === "payé") return;

      const nom = `${l.nom || ""} ${l.prenom || ""}`.trim();
      const moisNom = mois[currentMonth - 1];
      const key = `reminder_${l._id}_${currentYear}_${currentMonth}`;
      const lastStr = localStorage.getItem(key);
      const lastDate = lastStr ? new Date(lastStr) : null;
      const daysSince = lastDate ? Math.floor((today - lastDate) / 86400000) : null;

      if (currentDay >= lastDayOfMonth) {
        newNotifs.push({
          id: `nonpaye_${l._id}`,
          type: "non_paye",
          message: `⚠️ ${nom} — loyer de ${moisNom} ${currentYear} non payé (fin de mois atteinte).`,
        });
      } else if (!lastDate || daysSince >= 5) {
        localStorage.setItem(key, today.toISOString());
        newNotifs.push({
          id: `relance_${l._id}`,
          type: "relance",
          message: `🔔 Relance : ${nom} n'a pas payé le loyer de ${moisNom} (dû avant le 5). Prochain rappel dans 5 jours.`,
        });
      }
    });
    setNotifications(newNotifs);
  };

  // --- Clôture mensuelle ---
  const handleCloturerMois = async (moisNum) => {
    const annee = new Date().getFullYear();
    const moisNom = mois[moisNum - 1];

    // 1. Marquer les paiements "en attente" du mois comme "impayé"
    const enAttente = paiements.filter(
      (p) => p.mois === moisNum && (p.annee || annee) === annee && p.statut === "en attente"
    );
    let paiementsUpdated = [...paiements];
    for (const p of enAttente) {
      try {
        await marquerPaiementImpaye(p._id);
        paiementsUpdated = paiementsUpdated.map((up) =>
          up._id === p._id ? { ...up, statut: "impayé" } : up
        );
      } catch (err) {
        console.error("Erreur marquage impayé:", err);
      }
    }
    setPaiements(paiementsUpdated);

    // 2. Catégories (sur tous les paiements, pas filtrés)
    const payesDuMois = paiementsUpdated.filter(
      (p) => p.mois === moisNum && (p.annee || annee) === annee && p.statut === "payé"
    );
    const arrieresDuMois = paiementsUpdated.filter(
      (p) =>
        p.mois !== moisNum && p.statut === "payé" && p.datePaiement &&
        new Date(p.datePaiement).getMonth() + 1 === moisNum &&
        new Date(p.datePaiement).getFullYear() === annee
    );
    const impayesDuMois = paiementsUpdated.filter(
      (p) => p.mois === moisNum && (p.annee || annee) === annee && p.statut === "impayé"
    );

    // Helper : filtre paiements par set de locataireIds
    const filtrerParLocIds = (lst, locIds) => lst.filter((p) => locIds.has(String(p.locataireId)));

    // Helper : locataireIds pour un set de logementIds
    const locIdsForLogs = (logIds) =>
      new Set(locataires.filter((l) => logIds.has(String(l.logementId?._id || l.logementId))).map((l) => String(l._id)));

    // 3. Registre GLOBAL
    const globalContent = buildRegistreLines(payesDuMois, arrieresDuMois, impayesDuMois, moisNom, annee, "REGISTRE DE RECOUVREMENT MENSUEL GLOBAL");

    // 4. Registre PERSONNEL (logements n'appartenant à aucun client connu)
    const propLogIds = new Set(mesAnnonces.filter(isPersonnelLogement).map((a) => String(a._id)));
    const propLocIds = locIdsForLogs(propLogIds);
    const personnelContent = buildRegistreLines(
      filtrerParLocIds(payesDuMois, propLocIds),
      filtrerParLocIds(arrieresDuMois, propLocIds),
      filtrerParLocIds(impayesDuMois, propLocIds),
      moisNom, annee, "REGISTRE DE RECOUVREMENT PERSONNEL"
    );

    // 5. Registres PAR CLIENT
    const clientsDocuments = {};
    for (const client of clients) {
      const clientLogIds = new Set(
        mesAnnonces.filter((a) => String(a.clientId?._id || a.clientId) === String(client._id)).map((a) => String(a._id))
      );
      if (!clientLogIds.size) continue;
      const clientLocIds = locIdsForLogs(clientLogIds);
      const cp = filtrerParLocIds(payesDuMois, clientLocIds);
      const ca = filtrerParLocIds(arrieresDuMois, clientLocIds);
      const ci = filtrerParLocIds(impayesDuMois, clientLocIds);
      if (!cp.length && !ca.length && !ci.length) continue;
      const clientNom = `${client.nom} ${client.prenom || ""}`.trim();
      const clientLogements = mesAnnonces.filter((a) => clientLogIds.has(String(a._id)));
      clientsDocuments[String(client._id)] = {
        content: buildRegistreClient(client, clientLogements, cp, ca, ci, moisNom, annee),
        titre: `Releve_${client.nom}_${moisNom}_${annee}`,
        clientNom,
      };
    }

    // 6. Sauvegarder (nouveau format avec tous les documents)
    const newEntry = {
      moisNum,
      documents: {
        global: { content: globalContent, titre: `Registre_Global_${moisNom}_${annee}` },
        personnel: { content: personnelContent, titre: `Registre_Personnel_${moisNom}_${annee}` },
        clients: clientsDocuments,
      },
    };
    try {
      const saved = await saveRegistre({ moisNum, annee, documents: newEntry.documents });
      setMoisClotures((prev) => [...prev.filter((c) => c.moisNum !== moisNum || c.annee !== annee), saved]);
    } catch {
      setMoisClotures((prev) => [...prev.filter((c) => c.moisNum !== moisNum), newEntry]);
    }
    const nbDocs = 2 + Object.keys(clientsDocuments).length;
    toast(`${moisNom} ${annee} clôturé — ${nbDocs} registre(s) disponibles dans la colonne Action.`, "success");
  };

  // --- Quittances ---
  const buildQuittanceText = (locataire, paiement) => {
    const moisNom = mois[(paiement.mois || 1) - 1];
    const annee = paiement.annee || new Date().getFullYear();
    const datePaiement = paiement.datePaiement
      ? new Date(paiement.datePaiement).toLocaleDateString("fr-FR")
      : new Date().toLocaleDateString("fr-FR");
    return `
================== QUITTANCE DE LOYER ==================

Date d'émission : ${new Date().toLocaleDateString("fr-FR")}
Période         : ${moisNom} ${annee}

--- PROPRIÉTAIRE ---
Nom    : ${user.name || "-"}
Email  : ${user.email || "-"}

--- LOCATAIRE ---
Nom    : ${locataire.nom} ${locataire.prenom}
Email  : ${locataire.email || "-"}
Tél.   : ${locataire.telephone || "-"}

--- LOGEMENT ---
Titre  : ${locataire.logementId?.titre || "-"}
Adresse: ${locataire.logementId?.localisation || "-"}

--- PAIEMENT ---
Montant        : ${paiement.montant} €
Statut         : Payé
Date paiement  : ${datePaiement}

Signature du propriétaire : _______________

Quittance valant preuve de paiement du loyer pour ${moisNom} ${annee}.

=========================================================
    `.trim();
  };

  const handlePreviewQuittance = (locataire, paiement) => {
    const moisNom = mois[(paiement.mois || 1) - 1];
    const annee = paiement.annee || new Date().getFullYear();
    setQuittancePreviewData({
      text: buildQuittanceText(locataire, paiement),
      title: `Quittance ${moisNom} ${annee}`,
    });
    setShowQuittancePreviewModal(true);
  };

  const handleDownloadQuittance = (locataire, paiement) => {
    const text = buildQuittanceText(locataire, paiement);
    const moisNom = mois[(paiement.mois || 1) - 1];
    const annee = paiement.annee || new Date().getFullYear();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    a.download = `Quittance_${locataire.nom}_${moisNom}_${annee}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrintQuittance = (locataire, paiement) => {
    const text = buildQuittanceText(locataire, paiement);
    const w = window.open("", "_blank");
    w.document.write(`<pre style="font-family:monospace;padding:2rem;font-size:14px">${text}</pre>`);
    w.document.close();
    w.print();
  };

  // --- Graphe comportement de paiement ---
  const getPaymentBehaviorData = (locataireId) => {
    const currentMonth = new Date().getMonth() + 1;
    return mois.map((m, i) => {
      const moisIndex = i + 1;
      const p = paiements.find(
        (p) => String(p.locataireId) === String(locataireId) && Number(p.mois) === moisIndex
      );
      const isFutur = moisIndex > currentMonth;
      if (!p) {
        return { mois: m.substring(0, 3), jour: 0, statut: isFutur ? "futur" : "non_paye" };
      }
      if (p.statut !== "payé") {
        return { mois: m.substring(0, 3), jour: 0, statut: isFutur ? "en_attente" : "non_paye" };
      }
      const day = p.datePaiement ? new Date(p.datePaiement).getDate() : 1;
      return { mois: m.substring(0, 3), jour: day, statut: day <= 5 ? "bon_payeur" : "retard" };
    });
  };

  const getBehaviorColor = (statut) => {
    switch (statut) {
      case "bon_payeur": return "#4CAF50";
      case "retard":     return "#FF9800";
      case "non_paye":   return "#f44336";
      case "en_attente": return "#2196F3";
      default:           return "#e0e0e0";
    }
  };

  // --- Accepter / Refuser candidature avec notes et RDV ---
  // Convertir les statuts base de données en statuts UI
  const mapStatusToUI = (status) => {
    const statusMap = {
      "accepter": "accepted",
      "refuser": "rejected",
      "en_attente": "en-attente"
    };
    return statusMap[status] || status;
  };

  const respondToCandidature = async (candidatureId, newStatus) => {
    if (newStatus === "rejected") {
      const confirmDelete = window.confirm("Êtes-vous sûr de refuser cette candidature ? Cette action est définitive et supprimera la candidature.");
      if (!confirmDelete) return;
      try {
        await deleteCandidature(candidatureId);
        setCandidatures((prev) => prev.filter((c) => c._id !== candidatureId));
        toast("Candidature refusée et supprimée.", "success");
      } catch (err) {
        console.error("Erreur suppression candidature", err);
        toast("Erreur lors de la suppression de la candidature", "error");
      }
    } else if (newStatus === "accepted") {
      // 1. Vérifier que la date et l'heure du RDV sont renseignées
      if (!candidatureRdvDate || !candidatureRdvHeure) {
        toast("Veuillez renseigner la date ET l'heure du RDV avant de valider la candidature.", "warning");
        return;
      }

      // 2. Vérifier qu'aucune réservation n'occupe déjà ce créneau
      const newRdv = new Date(`${candidatureRdvDate}T${candidatureRdvHeure}`);
      const conflict = reservations.some((r) => {
        if (!r.rdvDate) return false;
        const existing = new Date(r.rdvDate);
        return (
          existing.getFullYear() === newRdv.getFullYear() &&
          existing.getMonth() === newRdv.getMonth() &&
          existing.getDate() === newRdv.getDate() &&
          existing.getHours() === newRdv.getHours() &&
          existing.getMinutes() === newRdv.getMinutes()
        );
      });

      if (conflict) {
        toast(`Un RDV est déjà prévu le ${newRdv.toLocaleString("fr-FR", "warning")}. Veuillez choisir un autre créneau.`);
        return;
      }

      try {
        const candidature = candidatures.find((c) => c._id === candidatureId) || currentCandidatureDetail;
        const reservationData = {
          candidatureId: candidatureId,
          demandeur: {
            nom: candidature?.nom,
            prenom: candidature?.prenom,
            dateDeNaissance: candidature?.dateDeNaissance,
            email: candidature?.email,
            telephone: candidature?.telephone,
          },
          logement: {
            _id: candidature?.logement?._id,
            titre: candidature?.logement?.titre,
            description: candidature?.logement?.description,
            prix: candidature?.logement?.prix,
            localisation: candidature?.logement?.localisation,
            images: candidature?.logement?.images,
            etat: candidature?.logement?.etat,
            createdAt: candidature?.logement?.createdAt,
            updatedAt: candidature?.logement?.updatedAt,
          },
          proprietaire: {
            id: user?._id,
            nom: user?.nom,
            email: user?.email,
          },
          rdvDate: newRdv,
          rdvHeure: candidatureRdvHeure,
          statut: "validée",
        };

        // 3. Créer la réservation puis supprimer automatiquement la candidature
        await createReservationByCandidatureId(candidatureId, reservationData);
        await deleteCandidature(candidatureId);
        setCandidatures((prev) => prev.filter((c) => c._id !== candidatureId));

        await fetchData();
        toast("Candidature acceptée, réservation créée et candidature supprimée.", "success");
        setShowCandidatureDetailModal(false);
        setCandidatureNotes("");
        setCandidatureRdvDate("");
        setCandidatureRdvHeure("");
      } catch (err) {
        console.error("Erreur validation candidature", err);
        toast("Erreur lors de la validation de la candidature", "error");
      }
    }
  };

  // --- Handlers modal réservation ---
  const openReservationModal = (r) => {
    setSelectedReservation(r);
    if (r.rdvDate) {
      const d = new Date(r.rdvDate);
      setEditRdvDate(d.toISOString().split("T")[0]);
      setEditRdvHeure(
        r.rdvHeure ||
        `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
      );
    } else {
      setEditRdvDate("");
      setEditRdvHeure("");
    }
    setEditReservationMode(false);
    setShowReservationModal(true);
  };

  const handleDeleteReservation = async () => {
    if (!window.confirm("Supprimer cette réservation ? La candidature associée sera aussi supprimée.")) return;
    try {
      await deleteReservation(selectedReservation._id);
      setReservations((prev) => prev.filter((r) => r._id !== selectedReservation._id));
      if (selectedReservation.candidatureId) {
        try {
          await deleteCandidature(selectedReservation.candidatureId);
          setCandidatures((prev) => prev.filter((c) => c._id !== selectedReservation.candidatureId));
        } catch {}
      }
      setShowReservationModal(false);
      toast("Réservation supprimée.", "success");
    } catch (err) {
      console.error(err);
      toast("Erreur suppression réservation", "error");
    }
  };

  const handleUpdateReservation = async () => {
    if (!editRdvDate || !editRdvHeure) {
      toast("Veuillez renseigner la date et l'heure du RDV.", "warning");
      return;
    }
    try {
      const updated = await updateReservation(selectedReservation._id, {
        rdvDate: new Date(`${editRdvDate}T${editRdvHeure}`),
        rdvHeure: editRdvHeure,
      });
      setReservations((prev) =>
        prev.map((r) => (r._id === selectedReservation._id ? { ...r, ...updated } : r))
      );
      setSelectedReservation((prev) => ({ ...prev, ...updated }));
      setEditReservationMode(false);
      toast("Réservation modifiée.", "success");
    } catch (err) {
      console.error(err);
      toast("Erreur modification réservation", "error");
    }
  };

  const handleAccepterCandidatureFromReservation = () => {
    const d = selectedReservation?.demandeur;
    setLocNom(d?.nom || "");
    setLocPrenom(d?.prenom || "");
    setLocEmail(d?.email || "");
    setLocTelephone(d?.telephone || "");
    if (selectedReservation?.logement?._id) {
      setLocLogement(selectedReservation.logement._id);
    }
    setPendingCleanup({
      candidatureId: selectedReservation?.candidatureId || null,
      logementId: selectedReservation?.logement?._id || null,
    });
    setShowReservationModal(false);
    setTimeout(() => {
      document.getElementById("ajouter-locataire")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // --- Gestion clients ---
  const handleSaveClient = async () => {
    if (!clientForm.nom.trim()) { toast("Le nom est requis.", "warning"); return; }
    try {
      if (editingClient) {
        const updated = await updateClientService(editingClient._id, clientForm);
        setClients((prev) => prev.map((c) => (c._id === editingClient._id ? updated : c)));
      } else {
        const created = await createClientService(clientForm);
        setClients((prev) => [...prev, created]);
      }
      setShowAddClient(false);
      setEditingClient(null);
      setClientForm({ nom: "", prenom: "", email: "", telephone: "", adresse: "", notes: "" });
    } catch (err) {
      console.error(err);
      toast("Erreur sauvegarde client", "error");
    }
  };

  const handleDeleteClient = async (id) => {
    if (!window.confirm("Supprimer ce client ? Ses logements resteront mais ne seront plus liés à lui.")) return;
    try {
      await deleteClientService(id);
      setClients((prev) => prev.filter((c) => c._id !== id));
      if (filtreClient === id) setFiltreClient("all");
    } catch (err) {
      toast("Erreur suppression client", "error");
    }
  };

  const openEditClient = (c) => {
    setEditingClient(c);
    setClientForm({ nom: c.nom || "", prenom: c.prenom || "", email: c.email || "", telephone: c.telephone || "", adresse: c.adresse || "", notes: c.notes || "" });
    setShowAddClient(true);
  };

  // --- Helper construction registre texte ---
  const buildRegistreLines = (payesList, arrieresList, impayesList, moisNom, annee, titreDoc) => {
    const totalRecouvre =
      payesList.reduce((s, p) => s + p.montant, 0) +
      arrieresList.reduce((s, p) => s + p.montant, 0);
    const ligneLocataire = (p, i, suffix = "") => {
      const loc = locataires.find((l) => String(l._id) === String(p.locataireId));
      const nom = loc ? `${loc.nom || ""} ${loc.prenom || ""}`.trim() : (p.locataireNom || "-");
      const date = p.datePaiement ? new Date(p.datePaiement).toLocaleDateString("fr-FR") : "-";
      return ` ${String(i + 1).padStart(2)} | ${nom.substring(0, 23).padEnd(23)} | ${date.padEnd(13)} | ${p.montant} €${suffix}`;
    };
    const lignes = [
      `====================================================`,
      `   ${titreDoc.toUpperCase()}`,
      `   ${moisNom.toUpperCase()} ${annee}`,
      `====================================================`,
      ``,
      `Propriétaire : ${user.name}`,
      `Email        : ${user.email || "-"}`,
      `Date clôture : ${new Date().toLocaleDateString("fr-FR")}`,
      ``,
      `--- ENCAISSEMENTS DU MOIS ---`,
      `----------------------------------------------------`,
      ` N° | Locataire               | Date paiement | Montant`,
      `----------------------------------------------------`,
      ...(payesList.length > 0 ? payesList.map((p, i) => ligneLocataire(p, i)) : [" Aucun encaissement."]),
    ];
    if (arrieresList.length > 0) {
      lignes.push(``, `--- ARRIÈRES ENCAISSÉS CE MOIS ---`, `----------------------------------------------------`);
      arrieresList.forEach((p, i) => {
        const moisArr = mois[(p.mois || 1) - 1];
        lignes.push(ligneLocataire(p, i, ` [Arrière ${moisArr}]`));
      });
    }
    if (impayesList.length > 0) {
      lignes.push(``, `--- IMPAYÉS ---`, `----------------------------------------------------`);
      impayesList.forEach((p, i) => {
        const loc = locataires.find((l) => String(l._id) === String(p.locataireId));
        const nom = loc ? `${loc.nom || ""} ${loc.prenom || ""}`.trim() : (p.locataireNom || "-");
        lignes.push(` ${String(i + 1).padStart(2)} | ${nom.substring(0, 23).padEnd(23)} | NON PAYÉ      | ${p.montant} €`);
      });
    }
    lignes.push(
      `----------------------------------------------------`,
      ``,
      ` TOTAL RECOUVRÉ  : ${totalRecouvre.toLocaleString("fr-FR")} FCFA`,
      ` Encaissements   : ${payesList.length + arrieresList.length}`,
      ` Impayés         : ${impayesList.length}`,
      ``,
      `====================================================`,
      `   Document généré le ${new Date().toLocaleString("fr-FR")}`,
      `====================================================`
    );
    return lignes.join("\n");
  };

  const buildRegistreClient = (client, clientLogements, payesList, arrieresList, impayesList, moisNom, annee) => {
    const totalRecouvre =
      payesList.reduce((s, p) => s + p.montant, 0) +
      arrieresList.reduce((s, p) => s + p.montant, 0);
    const clientNomComplet = `${client.nom} ${client.prenom || ""}`.trim();

    const getLogTitre = (locataireId) => {
      const loc = locataires.find((l) => String(l._id) === String(locataireId));
      if (!loc) return "-";
      const log = clientLogements.find((a) => String(a._id) === String(loc.logementId?._id || loc.logementId));
      return log ? (log.titre || log.adresse || "-") : "-";
    };

    const ligne = (p, i, suffix = "") => {
      const loc = locataires.find((l) => String(l._id) === String(p.locataireId));
      const nom = loc ? `${loc.nom || ""} ${loc.prenom || ""}`.trim() : (p.locataireNom || "-");
      const logTitre = getLogTitre(p.locataireId);
      const date = p.datePaiement ? new Date(p.datePaiement).toLocaleDateString("fr-FR") : "-";
      return ` ${String(i + 1).padStart(2)} | ${logTitre.substring(0, 18).padEnd(18)} | ${nom.substring(0, 18).padEnd(18)} | ${date.padEnd(12)} | ${p.montant} €${suffix}`;
    };

    const lignes = [
      `====================================================`,
      `   RELEVÉ DE RECOUVREMENT MENSUEL`,
      `   ${moisNom.toUpperCase()} ${annee}`,
      `====================================================`,
      ``,
      ` Gérant       : ${user.name}`,
      ` Bailleur     : ${clientNomComplet}`,
      ...(client.email ? [` Email        : ${client.email}`] : []),
      ...(client.telephone ? [` Téléphone    : ${client.telephone}`] : []),
      ...(client.adresse ? [` Adresse      : ${client.adresse}`] : []),
      ` Date clôture : ${new Date().toLocaleDateString("fr-FR")}`,
      ``,
      `--- LOGEMENTS GÉRÉS (${clientLogements.length}) ---`,
      ...clientLogements.map((a) => `   • ${a.titre || a.adresse || String(a._id)}`),
      ``,
      `--- ENCAISSEMENTS DU MOIS ---`,
      `----------------------------------------------------`,
      ` N° | Logement           | Locataire          | Date         | Montant`,
      `----------------------------------------------------`,
      ...(payesList.length > 0 ? payesList.map((p, i) => ligne(p, i)) : [" Aucun encaissement."]),
    ];

    if (arrieresList.length > 0) {
      lignes.push(``, `--- ARRIÈRES ENCAISSÉS CE MOIS ---`, `----------------------------------------------------`);
      arrieresList.forEach((p, i) => {
        const moisArr = mois[(p.mois || 1) - 1];
        lignes.push(ligne(p, i, ` [Arrière ${moisArr}]`));
      });
    }

    if (impayesList.length > 0) {
      lignes.push(``, `--- IMPAYÉS ---`, `----------------------------------------------------`);
      impayesList.forEach((p, i) => {
        const loc = locataires.find((l) => String(l._id) === String(p.locataireId));
        const nom = loc ? `${loc.nom || ""} ${loc.prenom || ""}`.trim() : (p.locataireNom || "-");
        const logTitre = getLogTitre(p.locataireId);
        lignes.push(` ${String(i + 1).padStart(2)} | ${logTitre.substring(0, 18).padEnd(18)} | ${nom.substring(0, 18).padEnd(18)} | NON PAYÉ     | ${p.montant} €`);
      });
    }

    lignes.push(
      `----------------------------------------------------`,
      ``,
      ` TOTAL RECOUVRÉ  : ${totalRecouvre.toLocaleString("fr-FR")} FCFA`,
      ` Encaissements   : ${payesList.length + arrieresList.length}`,
      ` Impayés         : ${impayesList.length}`,
      ``,
      `====================================================`,
      `   Document établi par ${user.name}`,
      `   le ${new Date().toLocaleString("fr-FR")}`,
      `====================================================`
    );
    return lignes.join("\n");
  };

  // --- Récupérer couleur selon statut UI ---
  const getStatusColor = (uiStatus) => {
    switch (uiStatus) {
      case "accepted":
        return { bg: "#4CAF50", text: "#fff", label: "✅ Acceptée" };
      case "rejected":
        return { bg: "#f44336", text: "#fff", label: "❌ Refusée" };
      case "rdv-prevu":
        return { bg: "#2196F3", text: "#fff", label: "📅 RDV prévu" };
      case "en-attente":
        return { bg: "#FF9800", text: "#fff", label: "⏸️ En attente" };
      default:
        return { bg: "#1976d2", text: "#fff", label: "🆕 Nouvelle" };
    }
  };

  const openCandidature = (c) => {
    setCurrentCandidatureDetail(c);
    setCandidatureNotes(c.notes || "");
    setCandidatureRdvDate(c.rdvDate ? c.rdvDate.split("T")[0] : "");
    setCandidatureRdvHeure(c.rdvHeure || "");
    setCandidatureHistorique(c.historique || []);
    setShowCandidatureDetailModal(true);
  };

  // --- Rendu principal ---
  const navItems = [
    { id: "accueil",      icon: "🏠", label: "Tableau de bord" },
    { id: "logements",   icon: "🏢", label: "Mes logements" },
    { id: "locataires",  icon: "👥", label: "Mes locataires" },
    { id: "finances",    icon: "💰", label: "Revenus & Finances" },
    { id: "clients",     icon: "🤝", label: "Mes clients", badge: clients.length || null },
    { id: "reservations",icon: "📅", label: "Réservations", badge: candidatures.length || null },
  ];

  const pageTitles = {
    accueil:      "Tableau de bord",
    logements:    "Mes logements",
    locataires:   "Mes locataires",
    finances:     "Revenus & Finances",
    clients:      "Mes clients (bailleurs)",
    reservations: "Réservations & Candidatures",
  };

  return (
    <div className="dash-shell">

      {/* Overlay mobile */}
      <div className={`dash-overlay${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* ===== SIDEBAR ===== */}
      <aside className={`dash-sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="dash-sidebar-logo">
          <h2>LogementPro</h2>
          <span>Gestion immobilière</span>
        </div>
        <nav className="dash-sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`dash-nav-item${activePage === item.id ? " active" : ""}`}
              onClick={() => { setActivePage(item.id); setSidebarOpen(false); }}
            >
              <span className="dash-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge ? <span className="dash-nav-badge">{item.badge}</span> : null}
            </button>
          ))}
        </nav>
        <div className="dash-sidebar-footer">
          <div className="dash-user-block">
            <div className="dash-avatar">{(user.name || "U").charAt(0).toUpperCase()}</div>
            <div className="dash-user-info">
              <div className="dash-user-name">{user.name}</div>
              <div className="dash-user-role">Propriétaire</div>
            </div>
          </div>
          <button className="dash-logout-btn" onClick={logout}>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ===== CONTENU PRINCIPAL ===== */}
      <div className="dash-content">
        {/* Topbar */}
        <div className="dash-topbar">
          <button className="dash-hamburger" onClick={() => setSidebarOpen((v) => !v)}>☰</button>
          <span className="dash-topbar-title">{pageTitles[activePage]}</span>
        </div>

        {/* Zone de page */}
        <div className="dash-page">

          {/* Notifications (visibles sur toutes les pages) */}
          {notifications.length > 0 && (
            <div className="dash-notifications">
              {notifications.map((n) => (
                <div key={n.id} style={{
                  background: n.type === "non_paye" ? "#fdecea" : "#fff8e1",
                  border: `1px solid ${n.type === "non_paye" ? "#f44336" : "#FF9800"}`,
                  borderRadius: 8, padding: "10px 14px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ fontSize: 14 }}>{n.message}</span>
                  <button
                    onClick={() => setNotifications((prev) => prev.filter((x) => x.id !== n.id))}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#888" }}
                  >✕</button>
                </div>
              ))}
            </div>
          )}

          {/* ===== PAGE : ACCUEIL ===== */}
          {activePage === "accueil" && (
            <div>
              <div className="dash-stat-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                {[
                  { label: "Logements total", value: mesAnnonces.length, color: "#1a237e", icon: "🏢", page: "logements" },
                  { label: "Occupés", value: mesAnnonces.filter((a) => a.etat === "indisponible").length, color: "#c62828", icon: "🔴", page: "logements" },
                  { label: "Disponibles", value: mesAnnonces.filter((a) => a.etat === "disponible").length, color: "#2e7d32", icon: "🟢", page: "logements" },
                  { label: "Locataires", value: locataires.length, color: "#6a1b9a", icon: "👥", page: "locataires" },
                  { label: "Clients bailleurs", value: clients.length, color: "#e65100", icon: "🤝", page: "clients" },
                  { label: "Candidatures", value: candidatures.length, color: "#00695c", icon: "📝", page: "reservations" },
                ].map(({ label, value, color, icon, page }) => (
                  <div key={label} onClick={() => setActivePage(page)}
                    style={{ background: "#fff", borderRadius: 10, padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", textAlign: "center", borderTop: `4px solid ${color}`, cursor: "pointer", transition: "transform 0.15s" }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                  >
                    <div style={{ fontSize: 26, marginBottom: 4 }}>{icon}</div>
                    <div style={{ fontSize: 30, fontWeight: 800, color }}>{value}</div>
                    <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Recouvrement du mois */}
              {(() => {
                const revenuMois = paiements
                  .filter((p) => p.mois === getMoisActuel() && p.statut === "payé")
                  .reduce((sum, p) => sum + p.montant, 0);
                return (
                  <div onClick={() => setActivePage("finances")} style={{ background: "linear-gradient(135deg, #1a237e 0%, #283593 100%)", color: "#fff", borderRadius: 12, padding: "20px 28px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 16px rgba(26,35,126,0.25)", cursor: "pointer" }}>
                    <div>
                      <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>Recouvrement {mois[getMoisActuel() - 1]} {new Date().getFullYear()}</div>
                      <div style={{ fontSize: 36, fontWeight: 800 }}>{revenuMois.toLocaleString("fr-FR")} €</div>
                      <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>Cliquer pour voir les finances →</div>
                    </div>
                    <div style={{ fontSize: 48, opacity: 0.5 }}>💰</div>
                  </div>
                );
              })()}

              {/* Alertes paiements */}
              {paiements.filter((p) => p.statut === "en attente").length > 0 && (
                <div onClick={() => setActivePage("locataires")} style={{ background: "#fff8e1", border: "1px solid #FF9800", borderRadius: 10, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", marginBottom: 16 }}>
                  <span style={{ fontSize: 26 }}>⚠️</span>
                  <div>
                    <div style={{ fontWeight: 700, color: "#e65100" }}>{paiements.filter((p) => p.statut === "en attente").length} paiement(s) en attente</div>
                    <div style={{ fontSize: 13, color: "#888" }}>Cliquer pour gérer les locataires →</div>
                  </div>
                </div>
              )}
              {candidatures.length > 0 && (
                <div onClick={() => setActivePage("reservations")} style={{ background: "#e8f5e9", border: "1px solid #4CAF50", borderRadius: 10, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
                  <span style={{ fontSize: 26 }}>📝</span>
                  <div>
                    <div style={{ fontWeight: 700, color: "#2e7d32" }}>{candidatures.length} candidature(s) à traiter</div>
                    <div style={{ fontSize: 13, color: "#888" }}>Cliquer pour voir les réservations →</div>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* ===== PAGE : CLIENTS ===== */}
          {activePage === "clients" && (
          <div>
        {/* --- Section clients (bailleurs) --- */}
        <div style={{ background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.07)", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>🤝 Mes clients (bailleurs)</h2>
            <button
              onClick={() => { setEditingClient(null); setClientForm({ nom: "", prenom: "", email: "", telephone: "", adresse: "", notes: "" }); setShowAddClient(true); }}
              style={{ background: "#1a237e", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 13 }}
            >
              + Ajouter un client
            </button>
          </div>

          {clients.length === 0 ? (
            <p style={{ color: "#aaa", fontSize: 13, margin: 0 }}>Aucun client pour l'instant. Ajoutez un bailleur pour gérer ses logements.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
              {clients.map((c) => {
                const nbLogements = mesAnnonces.filter((a) => String(a.clientId?._id || a.clientId) === String(c._id)).length;
                return (
                  <div key={c._id} style={{ border: "1px solid #e0e0e0", borderRadius: 8, padding: "14px 16px", background: filtreClient === c._id ? "#e8eaf6" : "#fafafa", cursor: "pointer", transition: "all 0.15s" }}
                    onClick={() => setFiltreClient(filtreClient === c._id ? "all" : c._id)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{c.nom} {c.prenom || ""}</div>
                        {c.email && <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{c.email}</div>}
                        {c.telephone && <div style={{ fontSize: 12, color: "#666" }}>{c.telephone}</div>}
                        <div style={{ marginTop: 6, fontSize: 12, color: "#1a237e", fontWeight: 600 }}>
                          {nbLogements} logement{nbLogements > 1 ? "s" : ""}
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <button onClick={(e) => { e.stopPropagation(); openEditClient(c); }}
                          style={{ background: "#1976d2", color: "#fff", border: "none", padding: "3px 8px", borderRadius: 4, cursor: "pointer", fontSize: 11 }}>✏️</button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteClient(c._id); }}
                          style={{ background: "#f44336", color: "#fff", border: "none", padding: "3px 8px", borderRadius: 4, cursor: "pointer", fontSize: 11 }}>🗑️</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal client */}
        {showAddClient && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200 }}>
            <div style={{ background: "#fff", borderRadius: 10, padding: 24, width: 500, maxWidth: "95%" }}>
              <h3 style={{ margin: "0 0 16px" }}>{editingClient ? "Modifier le client" : "Ajouter un client"}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <input placeholder="Nom *" value={clientForm.nom} onChange={(e) => setClientForm((f) => ({ ...f, nom: e.target.value }))}
                  style={{ padding: "8px 10px", border: "1px solid #ddd", borderRadius: 6 }} />
                <input placeholder="Prénom" value={clientForm.prenom} onChange={(e) => setClientForm((f) => ({ ...f, prenom: e.target.value }))}
                  style={{ padding: "8px 10px", border: "1px solid #ddd", borderRadius: 6 }} />
                <input placeholder="Email" value={clientForm.email} onChange={(e) => setClientForm((f) => ({ ...f, email: e.target.value }))}
                  style={{ padding: "8px 10px", border: "1px solid #ddd", borderRadius: 6 }} />
                <input placeholder="Téléphone" value={clientForm.telephone} onChange={(e) => setClientForm((f) => ({ ...f, telephone: e.target.value }))}
                  style={{ padding: "8px 10px", border: "1px solid #ddd", borderRadius: 6 }} />
              </div>
              <input placeholder="Adresse" value={clientForm.adresse} onChange={(e) => setClientForm((f) => ({ ...f, adresse: e.target.value }))}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #ddd", borderRadius: 6, marginBottom: 10, boxSizing: "border-box" }} />
              <textarea placeholder="Notes..." value={clientForm.notes} onChange={(e) => setClientForm((f) => ({ ...f, notes: e.target.value }))}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #ddd", borderRadius: 6, minHeight: 70, boxSizing: "border-box", resize: "vertical" }} />
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
                <button onClick={() => { setShowAddClient(false); setEditingClient(null); }}
                  style={{ padding: "8px 16px", background: "#eee", border: "none", borderRadius: 6, cursor: "pointer" }}>Annuler</button>
                <button onClick={handleSaveClient}
                  style={{ padding: "8px 16px", background: "#1a237e", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                  {editingClient ? "Enregistrer" : "Ajouter"}
                </button>
              </div>
            </div>
          </div>
        )}
          </div>
          )} {/* fin page clients */}

          {/* ===== PAGE : LOGEMENTS ===== */}
          {activePage === "logements" && (
          <div>
        {/* --- Gestion logements --- */}

        {/* Statistiques logements */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20, marginTop: 12 }}>
          {[
            { label: "Total logements", value: mesAnnonces.length, color: "#1a237e" },
            { label: "Occupés", value: mesAnnonces.filter((a) => a.etat === "indisponible").length, color: "#c62828" },
            { label: "Disponibles", value: mesAnnonces.filter((a) => a.etat === "disponible").length, color: "#2e7d32" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "#fff", borderRadius: 8, padding: "16px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", textAlign: "center", borderTop: `4px solid ${color}` }}>
              <div style={{ fontSize: 30, fontWeight: 800, color }}>{value}</div>
              <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Onglets filtre */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {[
            { id: "all", label: "🌐 Tous les logements" },
            { id: "mine", label: "🏠 Mes logements" },
            ...clients.map((c) => ({ id: c._id, label: `👤 ${c.nom} ${c.prenom || ""}`.trim() })),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFiltreClient(tab.id)}
              style={{
                padding: "7px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: filtreClient === tab.id ? 700 : 400,
                background: filtreClient === tab.id ? "#1a237e" : "#f0f2f8",
                color: filtreClient === tab.id ? "#fff" : "#333",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleAdd}>
          <div className="form-card">
            <h4>Ajouter un logement</h4>
            <div className="form-grid">
              <div className="form-field">
                <label>Titre (réf. interne)</label>
                <input placeholder="Ex: Apt B3 Dakar" value={titre} onChange={(e) => setTitre(e.target.value)} required />
              </div>
              <div className="form-field">
                <label>Type</label>
                <select value={typeLogement} onChange={(e) => setTypeLogement(e.target.value)}>
                  {TYPES_LOGEMENT.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Région *</label>
                <select value={region} onChange={(e) => { setRegion(e.target.value); setCommune(""); }} required>
                  <option value="">-- Choisir --</option>
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Commune *</label>
                <select value={commune} onChange={(e) => setCommune(e.target.value)} disabled={!region} required>
                  <option value="">-- Choisir --</option>
                  {(REGIONS_COMMUNES[region] || []).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Prix (FCFA) *</label>
                <input type="number" placeholder="Ex: 150000" value={prix} onChange={(e) => setPrix(parseInt(e.target.value) || "")} required />
              </div>
              <div className="form-field">
                <label>Client</label>
                <select value={locClientId} onChange={(e) => setLocClientId(e.target.value)}>
                  <option value="">Mes logements</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>{c.nom} {c.prenom || ""}</option>
                  ))}
                </select>
              </div>
              <div className="form-field form-field-full">
                <label>Adresse précise (optionnel)</label>
                <input placeholder="Rue, numéro, quartier..." value={localisation} onChange={(e) => setLocalisation(e.target.value)} />
              </div>
              <div className="form-field form-field-full">
                <label>Description *</label>
                <input placeholder="Surface, équipements, détails..." value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>
              <div className="form-field form-field-full">
                <label>Photos</label>
                <input type="file" multiple onChange={(e) => setImages(e.target.files)} />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn">Ajouter le logement</button>
            </div>
          </div>
        </form>

        <div className="table-responsive" style={{ marginTop: "1rem" }}>
          <table className="table">
            <thead>
              <tr><th>Image</th><th>Titre</th><th>Client</th><th>Prix</th><th>État</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {annoncesAffichees.map((a) => {
                const client = a.clientId ? (typeof a.clientId === "object" ? a.clientId : clients.find((c) => String(c._id) === String(a.clientId))) : null;
                return (
                <tr key={a._id}>
                  <td>{a.images?.[0] ? <img src={getImageUrl(a.images[0])} width={80} alt="" /> : "—"}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{a.titre}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>{[a.type, a.commune].filter(Boolean).join(" — ")}</div>
                  </td>
                  <td>
                    {client ? (
                      <span style={{ background: "#e8eaf6", color: "#1a237e", borderRadius: 10, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>
                        👤 {client.nom} {client.prenom || ""}
                      </span>
                    ) : (
                      <span style={{ color: "#aaa", fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td>{Number(a.prix).toLocaleString("fr-FR")} FCFA</td>
                  <td>
                    <span style={{
                      display: "inline-block",
                      padding: "2px 10px",
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 700,
                      background: a.etat === "disponible" ? "#e8f5e9" : a.etat === "indisponible" ? "#ffebee" : "#fff8e1",
                      color: a.etat === "disponible" ? "#2e7d32" : a.etat === "indisponible" ? "#c62828" : "#f57f17",
                    }}>
                      {a.etat || "—"}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => startEditing(a)}>Modifier</button>
                    <button onClick={() => handleDelete(a._id)}>Supprimer</button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>

          </div>
          )} {/* fin page logements */}

          {/* ===== PAGE : RÉSERVATIONS ===== */}
          {activePage === "reservations" && (
          <div>
        {/* --- Gérer mes candidatures --- */}
        <h2 style={{ marginTop: "0" }}>📝 Gérer mes candidatures</h2>
        <div style={{ background: "#fff", padding: 16, borderRadius: 8, boxShadow: "0 6px 18px rgba(0,0,0,0.06)", marginTop: 12 }}>
          {candidatures.length === 0 ? (
            <p style={{ color: "#666" }}>Aucune candidature pour le moment.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                  <th style={{ padding: 8 }}>Candidat</th>
                  <th style={{ padding: 8 }}>Logement</th>
                  <th style={{ padding: 8 }}>Message</th>
                  <th style={{ padding: 8 }}>Date</th>
                  <th style={{ padding: 8 }}>Statut</th>
                  <th style={{ padding: 8 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidatures.map((c) => {
                  const uiStatus = mapStatusToUI(c.status || "nouvelle");
                  return (
                    <tr key={c._id} style={{ borderBottom: "1px solid #fafafa" }}>
                      <td style={{ padding: 8 }}>{c.nom} {c.prenom}<div style={{ fontSize: 12, color: "#666" }}>{c.email || "-"}</div></td>
                      <td style={{ padding: 8 }}>{c.logement?.titre || c.logementTitre || "-"}</td>
                      <td style={{ padding: 8, maxWidth: 300, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.message || "-"}</td>
                      <td style={{ padding: 8 }}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString("fr-FR") : "-"}</td>
                      <td style={{ padding: 8, fontWeight: 700, color: uiStatus === "accepted" ? "#4CAF50" : uiStatus === "rejected" ? "#f44336" : uiStatus === "rdv-prevu" ? "#2196F3" : uiStatus === "en-attente" ? "#FF9800" : "#1976d2" }}>
                        {getStatusColor(uiStatus).label}
                      </td>
                      <td style={{ padding: 8 }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => openCandidature(c)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>Voir</button>
                          <button onClick={() => respondToCandidature(c._id, "accepted")} disabled={uiStatus === "accepted"} style={{ padding: "6px 10px", borderRadius: 6, border: "none", background: "#4CAF50", color: "#fff", cursor: uiStatus === "accepted" ? "not-allowed" : "pointer" }}>Accepter</button>
                          <button onClick={() => respondToCandidature(c._id, "rejected")} disabled={uiStatus === "rejected"} style={{ padding: "6px 10px", borderRadius: 6, border: "none", background: "#f44336", color: "#fff", cursor: uiStatus === "rejected" ? "not-allowed" : "pointer" }}>Refuser</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* --- Mes réservations --- */}
        <h2 style={{ marginTop: "2rem" }}>📅 Mes réservations</h2>
        <div style={{ background: "#fff", padding: 16, borderRadius: 8, boxShadow: "0 6px 18px rgba(0,0,0,0.06)", marginTop: 12 }}>
          {reservations.length === 0 ? (
            <p style={{ color: "#666" }}>Aucune réservation pour le moment.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                  <th style={{ padding: 8 }}>Réservant</th>
                  <th style={{ padding: 8 }}>Logement</th>
                  <th style={{ padding: 8 }}>Date de réservation</th>
                  <th style={{ padding: 8 }}>Statut</th>
                  <th style={{ padding: 8 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r._id} style={{ borderBottom: "1px solid #fafafa" }}>
                    <td style={{ padding: 8 }}>
                      {r.demandeur?.nom} {r.demandeur?.prenom}
                      <div style={{ fontSize: 12, color: "#666" }}>{r.demandeur?.email || "-"}</div>
                    </td>
                    <td style={{ padding: 8 }}>{r.logement?.titre || r.logementTitre || "-"}</td>
                    <td style={{ padding: 8 }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString("fr-FR") : "-"}</td>
                    <td style={{ padding: 8, fontWeight: 700, color: "#4CAF50" }}>Confirmée</td>
                    <td style={{ padding: 8 }}>
                      <button onClick={() => openReservationModal(r)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>Voir détails</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

          </div>
          )} {/* fin page reservations */}

          {/* ===== PAGE : LOCATAIRES ===== */}
          {activePage === "locataires" && (
          <div>
        {/* --- Mes locataires --- */}
        <h2 id="mes-locataires" style={{ marginTop: "0" }}>Mes locataires</h2>

        {/* Barre recherche + tri */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Rechercher par nom ou téléphone..."
            value={searchLoc}
            onChange={(e) => setSearchLoc(e.target.value)}
            style={{ flex: 1, minWidth: 200, padding: "8px 12px", borderRadius: 8, border: "1px solid #e0e0e0", fontSize: 14 }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            {[{ key: "nom", label: "Nom" }, { key: "telephone", label: "Téléphone" }].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  if (sortLocBy === key) setSortLocDir((d) => d === "asc" ? "desc" : "asc");
                  else { setSortLocBy(key); setSortLocDir("asc"); }
                }}
                style={{
                  padding: "7px 14px", borderRadius: 8, border: "1px solid #e0e0e0", cursor: "pointer", fontSize: 13,
                  background: sortLocBy === key ? "#1a237e" : "#fff",
                  color: sortLocBy === key ? "#fff" : "#333",
                  fontWeight: sortLocBy === key ? 700 : 400,
                }}
              >
                {label} {sortLocBy === key ? (sortLocDir === "asc" ? "↑" : "↓") : "↕"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: "#fff", padding: 16, borderRadius: 8, boxShadow: "0 6px 18px rgba(0,0,0,0.06)" }}>
          {locatairesFiltresTries.length === 0 ? (
            <p style={{ color: "#666" }}>{locatairesAffiches.length === 0 ? "Aucun locataire pour le moment." : "Aucun résultat pour cette recherche."}</p>
          ) : (
            <div className="table-responsive">
              <table className="table loc-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th>Logement</th>
                    <th>Prix</th>
                    <th>Début</th>
                    <th>Fin</th>
                    <th>Paiements</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {locatairesFiltresTries.map((l) => {
                    const montant = l.logementId?.prix || 0;

                    return (
                      <tr key={l._id}>
                        <td data-label="Nom">{l.nom} {l.prenom}</td>
                        <td data-label="Email">
                          <a href={`mailto:${l.email}`} style={{ color: "#1976d2", textDecoration: "none" }}>
                            {l.email || "-"}
                          </a>
                        </td>
                        <td data-label="Téléphone">
                          <a href={`tel:${l.telephone}`} style={{ color: "#1976d2", textDecoration: "none" }}>
                            {l.telephone || "-"}
                          </a>
                        </td>
                        <td data-label="Logement">{l.logementId?.titre || "-"}</td>
                        <td data-label="Prix">{Number(montant).toLocaleString("fr-FR")} FCFA</td>
                        <td data-label="Début">{formatDate(l.dateDebutLocation)}</td>
                        <td data-label="Fin">{formatDate(l.dateFinLocation)}</td>
                        <td data-label="Paiements">
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                            {getMoisLocation(l.dateDebutLocation, l.dateFinLocation).map(({ moisNum, annee }) => {
                              const label = `${mois[moisNum - 1].substring(0, 3)} ${annee}`;
                              const paiementMois = paiements.find((p) =>
                                String(p.locataireId) === String(l._id) &&
                                Number(p.mois) === moisNum &&
                                Number(p.annee) === annee
                              );
                              if (paiementMois) {
                                return paiementMois.statut === "payé" ? (
                                  <span key={`${moisNum}-${annee}`} style={{ background: "#e8f5e9", color: "#2e7d32", borderRadius: 4, padding: "3px 6px", fontSize: 11, fontWeight: 700 }}>
                                    ✅ {label}
                                  </span>
                                ) : (
                                  <button
                                    key={`${moisNum}-${annee}`}
                                    onClick={() => handleValiderPaiement(paiementMois._id)}
                                    style={{ background: "#4CAF50", color: "#fff", border: "none", padding: "3px 6px", borderRadius: 4, cursor: "pointer", fontSize: 11 }}
                                  >
                                    Valider {label}
                                  </button>
                                );
                              }
                              return (
                                <button
                                  key={`${moisNum}-${annee}`}
                                  onClick={() => handleCreerPaiement(l._id, moisNum, annee)}
                                  style={{ background: "#FF9800", color: "#fff", border: "none", padding: "3px 6px", borderRadius: 4, cursor: "pointer", fontSize: 11 }}
                                >
                                  {label}
                                </button>
                              );
                            })}
                            {getMoisLocation(l.dateDebutLocation, l.dateFinLocation).length === 0 && (
                              <span style={{ color: "#aaa", fontSize: 11 }}>Dates non définies</span>
                            )}
                          </div>
                        </td>
                        <td data-label="Actions">
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            <button
                              onClick={() => openEditLocataire(l)}
                              style={{
                                background: "#1976d2",
                                color: "#fff",
                                border: "none",
                                padding: "4px 6px",
                                borderRadius: 4,
                                cursor: "pointer",
                                fontSize: 10
                              }}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => openEtatDesLieux(l)}
                              title="État des lieux"
                              style={{
                                background: "#7B1FA2",
                                color: "#fff",
                                border: "none",
                                padding: "4px 6px",
                                borderRadius: 4,
                                cursor: "pointer",
                                fontSize: 10
                              }}
                            >
                              🏠
                            </button>
                            <button
                              onClick={() => openDossierLocataire(l)}
                              style={{
                                background: "#FF9800",
                                color: "#fff",
                                border: "none",
                                padding: "4px 6px",
                                borderRadius: 4,
                                cursor: "pointer",
                                fontSize: 10
                              }}
                            >
                              📁
                            </button>
                            {paiements.some(p => String(p.locataireId) === String(l._id) && p.statut === "payé") && (
                              <button
                                onClick={() => generateQuittance(l)}
                                style={{
                                  background: "#9C27B0",
                                  color: "#fff",
                                  border: "none",
                                  padding: "4px 6px",
                                  borderRadius: 4,
                                  cursor: "pointer",
                                  fontSize: 10
                                }}
                              >
                                📄
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* --- Ajouter un locataire --- */}
        <h3 id="ajouter-locataire" style={{ marginTop: "2rem" }}>Ajouter un locataire</h3>
        <form onSubmit={handleAddLocataire}>
          <div className="form-card">
            <div className="form-grid">
              <div className="form-field">
                <label>Nom *</label>
                <input type="text" placeholder="Nom" value={locNom} onChange={(e) => setLocNom(e.target.value)} required />
              </div>
              <div className="form-field">
                <label>Prénom *</label>
                <input type="text" placeholder="Prénom" value={locPrenom} onChange={(e) => setLocPrenom(e.target.value)} required />
              </div>
              <div className="form-field">
                <label>Email</label>
                <input type="email" placeholder="Email" value={locEmail} onChange={(e) => setLocEmail(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Téléphone</label>
                <input type="tel" placeholder="Téléphone" value={locTelephone} onChange={(e) => setLocTelephone(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Logement *</label>
                <select value={locLogement} onChange={(e) => setLocLogement(e.target.value)} required>
                  <option value="">-- Choisir --</option>
                  {mesAnnonces.filter((a) => a.etat === "disponible").map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.titre} — {Number(a.prix).toLocaleString("fr-FR")} FCFA
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Début location *</label>
                <input type="date" value={locDebut} onChange={(e) => setLocDebut(e.target.value)} required />
              </div>
              <div className="form-field">
                <label>Fin location *</label>
                <input type="date" value={locFin} onChange={(e) => setLocFin(e.target.value)} required />
              </div>
              <div className="form-field">
                <label>Pièce d'identité</label>
                <input type="file" onChange={(e) => setLocPieceIdentite(e.target.files[0])} />
              </div>
              <div className="form-field">
                <label>État des lieux</label>
                <input type="file" onChange={(e) => setLocEtatDesLieux(e.target.files[0])} />
              </div>
              <div className="form-field">
                <label>Contrat de bail</label>
                <input type="file" onChange={(e) => setLocContratBail(e.target.files[0])} />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn">Ajouter le locataire</button>
            </div>
          </div>
        </form>
          </div>
          )} {/* fin page locataires */}

        {/* --- Modal édition locataire --- */}
        {showEditLocModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}>
            <div style={{ width: 600, background: "#fff", padding: 20, borderRadius: 8, maxHeight: "80vh", overflowY: "auto" }}>
              <h3 style={{ marginTop: 0 }}>Modifier locataire</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <input
                  type="text"
                  placeholder="Nom"
                  value={editLocNom}
                  onChange={(e) => setEditLocNom(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Prénom"
                  value={editLocPrenom}
                  onChange={(e) => setEditLocPrenom(e.target.value)}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={editLocEmail}
                  onChange={(e) => setEditLocEmail(e.target.value)}
                />
                <input
                  type="tel"
                  placeholder="Téléphone"
                  value={editLocTelephone}
                  onChange={(e) => setEditLocTelephone(e.target.value)}
                />
                <input
                  type="date"
                  placeholder="Début location"
                  value={editLocDebut}
                  onChange={(e) => setEditLocDebut(e.target.value)}
                />
                <input
                  type="date"
                  placeholder="Fin location"
                  value={editLocFin}
                  onChange={(e) => setEditLocFin(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label>Pièce d'identité (laisser vide pour ne pas changer):</label>
                <input
                  type="file"
                  onChange={(e) => setEditLocPieceIdentite(e.target.files[0])}
                  style={{ marginTop: 4 }}
                />
                <label>État des lieux (laisser vide pour ne pas changer):</label>
                <input
                  type="file"
                  onChange={(e) => setEditLocEtatDesLieux(e.target.files[0])}
                  style={{ marginTop: 4 }}
                />
                <label>Contrat de bail (laisser vide pour ne pas changer):</label>
                <input
                  type="file"
                  onChange={(e) => setEditLocContratBail(e.target.files[0])}
                  style={{ marginTop: 4 }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  onClick={() => setShowEditLocModal(false)}
                  style={{ background: "#eee", border: "none", padding: "8px 12px", borderRadius: 6 }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveLocataire}
                  style={{ background: "#4CAF50", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 6 }}
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- Modal voir dossier --- */}
        {showDossierModal && selectedLocataireDossier && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}>
            <div style={{ width: 700, background: "#fff", padding: 20, borderRadius: 8, maxHeight: "80vh", overflowY: "auto" }}>
              <h3 style={{ marginTop: 0 }}>Dossier de {selectedLocataireDossier.nom} {selectedLocataireDossier.prenom}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <h4>Informations personnelles</h4>
                  <p><strong>Email:</strong> {selectedLocataireDossier.email || "-"}</p>
                  <p><strong>Téléphone:</strong> {selectedLocataireDossier.telephone || "-"}</p>
                  <p><strong>Début location:</strong> {formatDate(selectedLocataireDossier.dateDebutLocation)}</p>
                  <p><strong>Fin location:</strong> {formatDate(selectedLocataireDossier.dateFinLocation)}</p>
                </div>
                <div>
                  <h4>Logement</h4>
                  <p><strong>Titre:</strong> {selectedLocataireDossier.logementId?.titre || "-"}</p>
                  <p><strong>Localisation:</strong> {selectedLocataireDossier.logementId?.localisation || "-"}</p>
                  <p><strong>Prix:</strong> {selectedLocataireDossier.logementId?.prix ? Number(selectedLocataireDossier.logementId.prix).toLocaleString("fr-FR") + " FCFA" : "-"}</p>
                  <p><strong>Description:</strong> {selectedLocataireDossier.logementId?.description || "-"}</p>
                </div>
              </div>
              <div style={{ marginTop: 20 }}>
                <h4>Documents</h4>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {selectedLocataireDossier.pieceIdentite && (
                    <a
                      href={getImageUrl(selectedLocataireDossier.pieceIdentite)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: "#1976d2",
                        color: "#fff",
                        padding: "8px 12px",
                        borderRadius: 6,
                        textDecoration: "none",
                        display: "inline-block"
                      }}
                    >
                      📄 Pièce d'identité
                    </a>
                  )}
                  {selectedLocataireDossier.etatDesLieux && (
                    <a
                      href={getImageUrl(selectedLocataireDossier.etatDesLieux)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: "#1976d2",
                        color: "#fff",
                        padding: "8px 12px",
                        borderRadius: 6,
                        textDecoration: "none",
                        display: "inline-block"
                      }}
                    >
                      📄 État des lieux
                    </a>
                  )}
                  {selectedLocataireDossier.contratBail && (
                    <a
                      href={getImageUrl(selectedLocataireDossier.contratBail)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: "#1976d2",
                        color: "#fff",
                        padding: "8px 12px",
                        borderRadius: 6,
                        textDecoration: "none",
                        display: "inline-block"
                      }}
                    >
                      📄 Contrat de bail
                    </a>
                  )}
                </div>
              </div>
              {/* --- Quittances --- */}
              {(() => {
                const quittances = paiements.filter(
                  (p) => String(p.locataireId) === String(selectedLocataireDossier._id) && p.statut === "payé"
                );
                return (
                  <div style={{ marginTop: 24 }}>
                    <h4 style={{ marginBottom: 10 }}>🧾 Quittances de loyer</h4>
                    {quittances.length === 0 ? (
                      <p style={{ color: "#999", fontSize: 13 }}>Aucune quittance enregistrée.</p>
                    ) : (
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                          <tr style={{ background: "#f5f7fa", textAlign: "left" }}>
                            <th style={{ padding: "6px 10px" }}>Mois</th>
                            <th style={{ padding: "6px 10px" }}>Année</th>
                            <th style={{ padding: "6px 10px" }}>Montant</th>
                            <th style={{ padding: "6px 10px" }}>Date paiement</th>
                            <th style={{ padding: "6px 10px" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {quittances.map((q) => (
                            <tr key={q._id} style={{ borderBottom: "1px solid #eee" }}>
                              <td style={{ padding: "6px 10px" }}>{mois[(q.mois || 1) - 1]}</td>
                              <td style={{ padding: "6px 10px" }}>{q.annee || new Date().getFullYear()}</td>
                              <td style={{ padding: "6px 10px", fontWeight: 600 }}>{q.montant} €</td>
                              <td style={{ padding: "6px 10px" }}>
                                {q.datePaiement ? new Date(q.datePaiement).toLocaleDateString("fr-FR") : "-"}
                              </td>
                              <td style={{ padding: "6px 10px" }}>
                                <div style={{ display: "flex", gap: 6 }}>
                                  <button
                                    onClick={() => handlePreviewQuittance(selectedLocataireDossier, q)}
                                    style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 12 }}
                                  >
                                    👁️ Voir
                                  </button>
                                  <button
                                    onClick={() => handleDownloadQuittance(selectedLocataireDossier, q)}
                                    style={{ padding: "4px 8px", borderRadius: 4, border: "none", background: "#1976d2", color: "#fff", cursor: "pointer", fontSize: 12 }}
                                  >
                                    ⬇️ DL
                                  </button>
                                  <button
                                    onClick={() => handlePrintQuittance(selectedLocataireDossier, q)}
                                    style={{ padding: "4px 8px", borderRadius: 4, border: "none", background: "#555", color: "#fff", cursor: "pointer", fontSize: 12 }}
                                  >
                                    🖨️ Imp.
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                );
              })()}

              {/* --- Graphe comportement de paiement --- */}
              {(() => {
                const behaviorData = getPaymentBehaviorData(selectedLocataireDossier._id);
                const bonPayeur = behaviorData.filter((d) => d.statut === "bon_payeur").length;
                const retard    = behaviorData.filter((d) => d.statut === "retard").length;
                const nonPaye   = behaviorData.filter((d) => d.statut === "non_paye").length;
                return (
                  <div style={{ marginTop: 28 }}>
                    <h4 style={{ marginBottom: 4 }}>📈 Comportement de paiement (jour du mois)</h4>
                    <p style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>
                      Ligne rouge = limite du 5 du mois.
                      <span style={{ color: "#4CAF50", marginLeft: 12 }}>■ Ponctuel (≤5)</span>
                      <span style={{ color: "#FF9800", marginLeft: 8 }}>■ Retard (&gt;5)</span>
                      <span style={{ color: "#f44336", marginLeft: 8 }}>■ Non payé</span>
                      <span style={{ color: "#e0e0e0", marginLeft: 8 }}>■ Pas encore dû</span>
                    </p>
                    <BarChart width={620} height={220} data={behaviorData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 31]} tickFormatter={(v) => `J${v}`} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v, _, props) => [`Jour ${v} — ${props.payload.statut}`, "Paiement"]} />
                      <Bar dataKey="jour" radius={[3, 3, 0, 0]}>
                        {behaviorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getBehaviorColor(entry.statut)} />
                        ))}
                      </Bar>
                    </BarChart>
                    <p style={{ fontSize: 13, marginTop: 8 }}>
                      <strong style={{ color: "#4CAF50" }}>Ponctuel :</strong> {bonPayeur} mois —{" "}
                      <strong style={{ color: "#FF9800" }}>Retard :</strong> {retard} mois —{" "}
                      <strong style={{ color: "#f44336" }}>Non payé :</strong> {nonPaye} mois
                    </p>
                  </div>
                );
              })()}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 24 }}>
                <button
                  onClick={() => setShowDossierModal(false)}
                  style={{ background: "#eee", border: "none", padding: "8px 12px", borderRadius: 6 }}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- Modal prévisualisation quittance --- */}
        {showQuittancePreviewModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200 }}>
            <div style={{ background: "#fff", borderRadius: 10, width: "90%", maxWidth: 580, maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>🧾 {quittancePreviewData.title}</h3>
                <button
                  onClick={() => setShowQuittancePreviewModal(false)}
                  style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#888", lineHeight: 1 }}
                >
                  ✕
                </button>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
                <pre style={{ fontFamily: "monospace", fontSize: 13, whiteSpace: "pre-wrap", margin: 0, lineHeight: 1.6, color: "#222" }}>
                  {quittancePreviewData.text}
                </pre>
              </div>
              <div style={{ padding: "12px 20px", borderTop: "1px solid #eee", display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowQuittancePreviewModal(false)}
                  style={{ background: "#eee", border: "none", padding: "8px 14px", borderRadius: 6, cursor: "pointer" }}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

          {/* ===== PAGE : FINANCES ===== */}
          {activePage === "finances" && (
        <div>
          {/* --- Graphique --- */}
          <h2 style={{ marginTop: "0" }}>📊 Revenus & Paiements</h2>

          {/* Carte recouvrement du mois actuel */}
          {(() => {
            const revenuMois = paiementsAffiches
              .filter((p) => p.mois === getMoisActuel() && p.statut === "payé")
              .reduce((sum, p) => sum + p.montant, 0);
            return (
              <div style={{ background: "linear-gradient(135deg, #1a237e 0%, #283593 100%)", color: "#fff", borderRadius: 12, padding: "20px 28px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 16px rgba(26,35,126,0.25)" }}>
                <div>
                  <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>
                    Recouvrement de {mois[getMoisActuel() - 1]} {new Date().getFullYear()}
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 800 }}>{revenuMois.toLocaleString("fr-FR")} €</div>
                </div>
                <div style={{ fontSize: 44, opacity: 0.6 }}>💰</div>
              </div>
            );
          })()}

          <div style={{ display: "flex", gap: 20 }}>
            {/* BarChart revenu annuel */}
            <div style={{ flex: 1 }}>
              <h4>Revenu annuel</h4>
              <BarChart width={500} height={350} data={dataGraph}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" />
                <YAxis tickFormatter={(v) => `${v} FCFA`} />
                <Tooltip formatter={(v) => `${v} FCFA`} />
                <Legend />
                <Bar dataKey="revenu" fill="#4CAF50" onClick={(d) => setMoisSelectionne(d.mois)} />
              </BarChart>
            </div>

            {/* Pie Chart paiements mois actuel */}
            {/* Pie Chart paiements mois actuel */}
            <div style={{ flex: 1, textAlign: "center" }}>
              <h4>Paiements de {mois[getMoisActuel() - 1]}</h4>
              {totalPaiementsMois > 0 ? (
                <div>
                  <PieChart width={350} height={350}>
                    <Pie
                      data={dataPaiements}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      onClick={(entry) => {
                        // Fonctionnalité supprimée - paiements gérés directement dans le tableau
                      }}
                    >
                      {dataPaiements.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>

                  <p style={{ marginTop: 12 }}>
                    <span style={{ color: "#666" }}>
                      <strong>{dataPaiements[0].value}/{totalPaiementsMois}</strong> payés (
                      {((dataPaiements[0].value / totalPaiementsMois) * 100).toFixed(1)}%)
                    </span>
                  </p>
                </div>
              ) : (
                <p style={{ marginTop: 100, color: "#999" }}>Aucun paiement ce mois</p>
              )}
            </div>

          </div>

          {/* --- Modal paiements (payés / en attente) - SUPPRIMÉ --- */}
          {/* Ce modal n'est plus nécessaire car les paiements sont gérés directement dans le tableau */}

          {/* --- Modal revenus mensuels --- */}
          {moisSelectionne && (
            <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ background: "white", padding: "2rem", borderRadius: "12px", width: "70%" }}>
                <h3>Revenus de {moisSelectionne}</h3>
                <table border="1" cellPadding="10">
                  <thead><tr><th>Logement</th><th>Montant</th><th>Locataire</th></tr></thead>
                  <tbody>
                    {logementsDuMois(mois.indexOf(moisSelectionne)).map((p) => (
                      <tr key={p._id}>
                        <td>{p.logementTitre || p.logement?.titre || "-"}</td>
                        <td>{p.montant} €</td>
                        <td>{p.locataireNom || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button onClick={() => setMoisSelectionne(null)}>Fermer</button>
              </div>
            </div>
          )}

          {/* --- Tableau recouvrement mensuel --- */}
          <div style={{ background: "#fff", borderRadius: 8, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.07)", marginTop: 28 }}>
            <h3 style={{ marginTop: 0, fontSize: 18 }}>📋 Registre de recouvrement mensuel {new Date().getFullYear()}</h3>
            <p style={{ color: "#888", fontSize: 13, marginBottom: 16 }}>
              Cliquez sur "Clôturer" pour fermer un mois et télécharger le document de recouvrement.
            </p>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f0f2f8", textAlign: "left" }}>
                  <th style={{ padding: "10px 14px", fontWeight: 700, borderBottom: "2px solid #e0e0e0" }}>Mois</th>
                  <th style={{ padding: "10px 14px", fontWeight: 700, borderBottom: "2px solid #e0e0e0" }}>Encaissements</th>
                  <th style={{ padding: "10px 14px", fontWeight: 700, borderBottom: "2px solid #e0e0e0" }}>Total recouvré</th>
                  <th style={{ padding: "10px 14px", fontWeight: 700, borderBottom: "2px solid #e0e0e0" }}>Statut</th>
                  <th style={{ padding: "10px 14px", fontWeight: 700, borderBottom: "2px solid #e0e0e0" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {mois.map((m, i) => {
                  const moisNum = i + 1;
                  const annee = new Date().getFullYear();
                  const currentMonth = getMoisActuel();
                  const clotureInfo = moisClotures.find((c) => c.moisNum === moisNum);
                  const isCloture = !!clotureInfo;
                  const isPast = moisNum < currentMonth;
                  const isCurrent = moisNum === currentMonth;

                  // Paiements du mois (loyer couvrant ce mois) — filtrés selon vue active
                  const payesMois = paiementsAffiches.filter(
                    (p) => p.mois === moisNum && (p.annee || annee) === annee && p.statut === "payé"
                  );
                  const arrieresMois = paiementsAffiches.filter(
                    (p) =>
                      p.mois !== moisNum && p.statut === "payé" && p.datePaiement &&
                      new Date(p.datePaiement).getMonth() + 1 === moisNum &&
                      new Date(p.datePaiement).getFullYear() === annee
                  );
                  const enAttenteMois = paiementsAffiches.filter(
                    (p) => p.mois === moisNum && (p.annee || annee) === annee && p.statut === "en attente"
                  );
                  const impayesMois = paiementsAffiches.filter(
                    (p) => p.mois === moisNum && (p.annee || annee) === annee && p.statut === "impayé"
                  );

                  const totalMois =
                    payesMois.reduce((s, p) => s + p.montant, 0) +
                    arrieresMois.reduce((s, p) => s + p.montant, 0);

                  const renderLigne = (p, tag) => {
                    const loc = locataires.find((l) => String(l._id) === String(p.locataireId));
                    const nomLoc = loc ? `${loc.nom || ""} ${loc.prenom || ""}`.trim() : (p.locataireNom || "-");
                    const date = p.datePaiement ? new Date(p.datePaiement).toLocaleDateString("fr-FR") : "-";
                    return (
                      <div key={p._id} style={{ fontSize: 12, color: "#555", display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                        <strong>{nomLoc}</strong> — {date} —{" "}
                        <span style={{ color: "#2e7d32", fontWeight: 600 }}>{p.montant} €</span>
                        {tag && <span style={{ background: tag.bg, color: "#fff", borderRadius: 8, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>{tag.label}</span>}
                      </div>
                    );
                  };

                  const hasAny = payesMois.length > 0 || arrieresMois.length > 0 || enAttenteMois.length > 0 || impayesMois.length > 0;

                  return (
                    <tr key={m} style={{ borderBottom: "1px solid #f0f0f0", background: isCloture ? "#f9fbe7" : isCurrent ? "#e8f5e9" : "transparent" }}>
                      <td style={{ padding: "12px 14px", fontWeight: isCurrent ? 700 : 400 }}>
                        {m}
                        {isCurrent && (
                          <span style={{ marginLeft: 6, background: "#4CAF50", color: "#fff", borderRadius: 10, padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>
                            En cours
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        {hasAny ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {payesMois.map((p) => renderLigne(p, null))}
                            {arrieresMois.map((p) => renderLigne(p, { bg: "#FF9800", label: `Arrière ${mois[(p.mois || 1) - 1]}` }))}
                            {enAttenteMois.map((p) => {
                              const loc = locataires.find((l) => String(l._id) === String(p.locataireId));
                              const nomLoc = loc ? `${loc.nom || ""} ${loc.prenom || ""}`.trim() : (p.locataireNom || "-");
                              return (
                                <div key={p._id} style={{ fontSize: 12, color: "#888", display: "flex", alignItems: "center", gap: 4 }}>
                                  <strong>{nomLoc}</strong> —
                                  <span style={{ background: "#FF9800", color: "#fff", borderRadius: 8, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>En attente</span>
                                </div>
                              );
                            })}
                            {impayesMois.map((p) => {
                              const loc = locataires.find((l) => String(l._id) === String(p.locataireId));
                              const nomLoc = loc ? `${loc.nom || ""} ${loc.prenom || ""}`.trim() : (p.locataireNom || "-");
                              return (
                                <div key={p._id} style={{ fontSize: 12, color: "#c62828", display: "flex", alignItems: "center", gap: 4 }}>
                                  <strong>{nomLoc}</strong> — {p.montant} € —
                                  <span style={{ background: "#f44336", color: "#fff", borderRadius: 8, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>Impayé</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span style={{ color: "#aaa", fontSize: 12 }}>Aucun encaissement</span>
                        )}
                      </td>
                      <td style={{ padding: "12px 14px", fontWeight: 700, color: totalMois > 0 ? "#2e7d32" : "#aaa", fontSize: 15 }}>
                        {totalMois > 0 ? `${totalMois.toLocaleString("fr-FR")} €` : "—"}
                        {impayesMois.length > 0 && (
                          <div style={{ fontSize: 11, color: "#f44336", fontWeight: 600, marginTop: 2 }}>
                            {impayesMois.length} impayé{impayesMois.length > 1 ? "s" : ""}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        {isCloture ? (
                          <span style={{ background: "#f9fbe7", color: "#827717", border: "1px solid #cddc39", borderRadius: 12, padding: "3px 12px", fontSize: 12, fontWeight: 700 }}>
                            ✅ Clôturé
                          </span>
                        ) : isCurrent || isPast ? (
                          <span style={{ fontSize: 12, color: "#888" }}>
                            {payesMois.length + arrieresMois.length} encaissement{payesMois.length + arrieresMois.length > 1 ? "s" : ""}
                            {enAttenteMois.length > 0 && `, ${enAttenteMois.length} en attente`}
                          </span>
                        ) : (
                          <span style={{ color: "#bdbdbd", fontSize: 12 }}>À venir</span>
                        )}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        {isCloture ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {(() => {
                              const docs = clotureInfo.documents
                                ? [
                                    { key: "global", label: "📊 Global", doc: clotureInfo.documents.global },
                                    { key: "personnel", label: "🏠 Personnel", doc: clotureInfo.documents.personnel },
                                    ...Object.entries(clotureInfo.documents.clients || {}).map(([id, doc]) => ({
                                      key: id,
                                      label: `👤 ${doc.clientNom || "Client"}`,
                                      doc,
                                    })),
                                  ]
                                : [{ key: "legacy", label: "📄 Registre", doc: { content: clotureInfo.content, titre: clotureInfo.titre } }];
                              return docs.map(({ key, label, doc }) => (
                                <div key={key} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                                  <span style={{ fontSize: 11, color: "#555", minWidth: 90 }}>{label}</span>
                                  <button
                                    onClick={() => {
                                      const w = window.open("", "_blank");
                                      w.document.write(`<pre style="font-family:monospace;padding:2rem;font-size:13px;white-space:pre-wrap;line-height:1.6">${doc.content}</pre>`);
                                      w.document.close();
                                    }}
                                    style={{ background: "#1976d2", color: "#fff", border: "none", padding: "4px 8px", borderRadius: 4, cursor: "pointer", fontSize: 11 }}
                                  >
                                    👁️
                                  </button>
                                  <button
                                    onClick={() => {
                                      const w = window.open("", "_blank");
                                      w.document.write(`<pre style="font-family:monospace;padding:2rem;font-size:13px;white-space:pre-wrap;line-height:1.6">${doc.content}</pre>`);
                                      w.document.close();
                                      w.print();
                                    }}
                                    style={{ background: "#555", color: "#fff", border: "none", padding: "4px 8px", borderRadius: 4, cursor: "pointer", fontSize: 11 }}
                                  >
                                    🖨️
                                  </button>
                                  <button
                                    onClick={() => {
                                      const a = document.createElement("a");
                                      a.href = URL.createObjectURL(new Blob([doc.content], { type: "text/plain;charset=utf-8" }));
                                      a.download = `${doc.titre}.txt`;
                                      document.body.appendChild(a);
                                      a.click();
                                      document.body.removeChild(a);
                                    }}
                                    style={{ background: "#2e7d32", color: "#fff", border: "none", padding: "4px 8px", borderRadius: 4, cursor: "pointer", fontSize: 11 }}
                                  >
                                    ⬇️
                                  </button>
                                </div>
                              ));
                            })()}
                            <button
                              onClick={async () => {
                                setMoisClotures((prev) => prev.filter((c) => c.moisNum !== moisNum));
                                try { await deleteRegistreApi(moisNum, annee); } catch {}
                              }}
                              style={{ marginTop: 4, background: "none", border: "1px solid #e57373", color: "#e57373", padding: "3px 8px", borderRadius: 4, cursor: "pointer", fontSize: 11 }}
                            >
                              ✕ Désclôturer
                            </button>
                          </div>
                        ) : isCurrent || isPast ? (
                          <button
                            onClick={() => {
                              if (window.confirm(`Clôturer ${m} ${annee} ? Les paiements non validés seront marqués impayés et le document sera téléchargé.`)) {
                                handleCloturerMois(moisNum);
                              }
                            }}
                            style={{ background: "#1a237e", color: "#fff", border: "none", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 12 }}
                          >
                            Clôturer
                          </button>
                        ) : (
                          <span style={{ color: "#bdbdbd", fontSize: 12 }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
          )} {/* fin page finances */}

        </div> {/* fin dash-page */}
      </div> {/* fin dash-content */}

      {/* ===== MODALS GLOBAUX ===== */}

      {/* --- Modal détail réservation --- */}
      {showReservationModal && selectedReservation && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", padding: "2rem", borderRadius: 12, width: "90%", maxWidth: 680, maxHeight: "88vh", overflowY: "auto" }}>
            <h3 style={{ marginTop: 0 }}>📅 Détails de la réservation</h3>

            {/* Demandeur */}
            <div style={{ background: "#f5f7fa", borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
              <h4 style={{ margin: "0 0 8px" }}>👤 Demandeur</h4>
              <p style={{ margin: "4px 0" }}><strong>Nom :</strong> {selectedReservation.demandeur?.nom} {selectedReservation.demandeur?.prenom}</p>
              <p style={{ margin: "4px 0" }}><strong>Email :</strong> {selectedReservation.demandeur?.email || "-"}</p>
              <p style={{ margin: "4px 0" }}><strong>Téléphone :</strong> {selectedReservation.demandeur?.telephone || "-"}</p>
              {selectedReservation.demandeur?.dateDeNaissance && (
                <p style={{ margin: "4px 0" }}><strong>Date de naissance :</strong> {new Date(selectedReservation.demandeur.dateDeNaissance).toLocaleDateString("fr-FR")}</p>
              )}
            </div>

            {/* Logement */}
            <div style={{ background: "#f5f7fa", borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
              <h4 style={{ margin: "0 0 8px" }}>🏠 Logement</h4>
              <p style={{ margin: "4px 0" }}><strong>Titre :</strong> {selectedReservation.logement?.titre || "-"}</p>
              <p style={{ margin: "4px 0" }}><strong>Localisation :</strong> {selectedReservation.logement?.localisation || "-"}</p>
              <p style={{ margin: "4px 0" }}><strong>Prix :</strong> {selectedReservation.logement?.prix ? `${selectedReservation.logement.prix} €/mois` : "-"}</p>
            </div>

            {/* RDV */}
            <div style={{ background: "#f5f7fa", borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
              <h4 style={{ margin: "0 0 8px" }}>📆 RDV</h4>
              {editReservationMode ? (
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    Date du RDV
                    <input type="date" value={editRdvDate} onChange={(e) => setEditRdvDate(e.target.value)}
                      style={{ padding: "6px 8px", border: "1px solid #ddd", borderRadius: 4 }} />
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    Heure du RDV
                    <input type="time" value={editRdvHeure} onChange={(e) => setEditRdvHeure(e.target.value)}
                      style={{ padding: "6px 8px", border: "1px solid #ddd", borderRadius: 4 }} />
                  </label>
                </div>
              ) : (
                <>
                  {selectedReservation.rdvDate ? (
                    (() => {
                      const d = new Date(selectedReservation.rdvDate);
                      const heure =
                        selectedReservation.rdvHeure ||
                        `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
                      return (
                        <>
                          <p style={{ margin: "4px 0" }}>
                            <strong>Date :</strong> {d.toLocaleDateString("fr-FR")}
                          </p>
                          <p style={{ margin: "4px 0" }}>
                            <strong>Heure :</strong> {heure}
                          </p>
                        </>
                      );
                    })()
                  ) : (
                    <p style={{ margin: "4px 0", color: "#999" }}>Aucun RDV fixé</p>
                  )}
                </>
              )}
            </div>

            {/* Statut + date création */}
            <p style={{ marginBottom: 8 }}>
              <strong>Statut :</strong>{" "}
              <span style={{ color: "#4CAF50", fontWeight: 700 }}>
                {selectedReservation.statut || "Confirmée"}
              </span>
            </p>
            <p style={{ marginBottom: 20, color: "#888", fontSize: 13 }}>
              Créée le {selectedReservation.createdAt ? new Date(selectedReservation.createdAt).toLocaleString("fr-FR") : "-"}
            </p>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {editReservationMode ? (
                <>
                  <button
                    onClick={handleUpdateReservation}
                    style={{ background: "#4CAF50", color: "#fff", border: "none", padding: "8px 14px", borderRadius: 6, cursor: "pointer" }}
                  >
                    💾 Enregistrer
                  </button>
                  <button
                    onClick={() => setEditReservationMode(false)}
                    style={{ background: "#eee", border: "none", padding: "8px 14px", borderRadius: 6, cursor: "pointer" }}
                  >
                    Annuler
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditReservationMode(true)}
                    style={{ background: "#1976d2", color: "#fff", border: "none", padding: "8px 14px", borderRadius: 6, cursor: "pointer" }}
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    onClick={handleAccepterCandidatureFromReservation}
                    style={{ background: "#4CAF50", color: "#fff", border: "none", padding: "8px 14px", borderRadius: 6, cursor: "pointer" }}
                  >
                    ✅ Accepter — créer dossier locataire
                  </button>
                  <button
                    onClick={handleDeleteReservation}
                    style={{ background: "#f44336", color: "#fff", border: "none", padding: "8px 14px", borderRadius: 6, cursor: "pointer" }}
                  >
                    🗑️ Supprimer
                  </button>
                  <button
                    onClick={() => setShowReservationModal(false)}
                    style={{ background: "#eee", border: "none", padding: "8px 14px", borderRadius: 6, cursor: "pointer" }}
                  >
                    Fermer
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Modal détail candidature --- */}
      {showCandidatureDetailModal && currentCandidatureDetail && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", padding: "2rem", borderRadius: "12px", width: "80%", maxWidth: "600px", maxHeight: "80vh", overflowY: "auto" }}>
            <h3>Détails de la candidature</h3>
            <div style={{ marginBottom: "1rem" }}>
              <strong>Candidat:</strong> {currentCandidatureDetail.nom} {currentCandidatureDetail.prenom}
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <strong>Email:</strong> {currentCandidatureDetail.email}
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <strong> Téléphone:</strong> {currentCandidatureDetail.telephone || "-" }
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <strong>Logement:</strong> {currentCandidatureDetail.logement?.titre || currentCandidatureDetail.logementTitre}
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <strong>Message:</strong> {currentCandidatureDetail.message}
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <strong>Statut:</strong> {getStatusColor(mapStatusToUI(currentCandidatureDetail.status)).label}
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label><strong>Notes:</strong></label>
              <textarea
                value={candidatureNotes}
                onChange={(e) => setCandidatureNotes(e.target.value)}
                style={{ width: "100%", minHeight: "80px", marginTop: "0.5rem", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                placeholder="Ajouter des notes..."
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label><strong>Date RDV:</strong></label>
              <input
                type="date"
                value={candidatureRdvDate}
                onChange={(e) => setCandidatureRdvDate(e.target.value)}
                style={{ marginLeft: "0.5rem", padding: "4px", border: "1px solid #ddd", borderRadius: "4px" }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label><strong>Heure RDV:</strong></label>
              <input
                type="time"
                value={candidatureRdvHeure}
                onChange={(e) => setCandidatureRdvHeure(e.target.value)}
                style={{ marginLeft: "0.5rem", padding: "4px", border: "1px solid #ddd", borderRadius: "4px" }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <strong>Historique:</strong>
              <div style={{ maxHeight: "150px", overflowY: "auto", border: "1px solid #eee", padding: "8px", marginTop: "0.5rem" }}>
                {candidatureHistorique.length > 0 ? (
                  candidatureHistorique.map((h, i) => (
                    <div key={i} style={{ marginBottom: "0.5rem", padding: "4px", background: "#f9f9f9", borderRadius: "4px" }}>
                      <small><strong>{h.action}</strong> - {new Date(h.date).toLocaleString("fr-FR")}</small>
                      {h.notes && <div><small>{h.notes}</small></div>}
                    </div>
                  ))
                ) : (
                  <small style={{ color: "#999" }}>Aucun historique</small>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <button
                onClick={() => respondToCandidature(currentCandidatureDetail._id, "accepted")}
                style={{ background: "#4CAF50", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" }}
              >
                Accepter
              </button>
              <button
                onClick={() => respondToCandidature(currentCandidatureDetail._id, "rejected")}
                style={{ background: "#f44336", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" }}
              >
                Refuser
              </button>
              <button
                onClick={() => setShowCandidatureDetailModal(false)}
                style={{ background: "#eee", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modifier Logement */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3>Modifier Logement</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
              <div style={{ marginBottom: '10px' }}>
                <label>Titre: <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required /></label>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Type:
                  <select value={editType} onChange={(e) => setEditType(e.target.value)}>
                    {TYPES_LOGEMENT.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Région:
                  <select value={editRegion} onChange={(e) => { setEditRegion(e.target.value); setEditCommune(""); }}>
                    <option value="">-- Région --</option>
                    {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </label>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Commune:
                  <select value={editCommune} onChange={(e) => setEditCommune(e.target.value)} disabled={!editRegion}>
                    <option value="">-- Commune --</option>
                    {(REGIONS_COMMUNES[editRegion] || []).map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Prix: <input type="number" value={editPrix} onChange={(e) => setEditPrix(e.target.value)} required /></label>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Adresse précise: <input type="text" value={editLocalisation} onChange={(e) => setEditLocalisation(e.target.value)} /></label>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>État:
                  <select value={editEtat} onChange={(e) => setEditEtat(e.target.value)}>
                    <option value="disponible">Disponible</option>
                    <option value="indisponible">Indisponible</option>
                    <option value="en renovation">En rénovation</option>
                  </select>
                </label>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Description: <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows="6" placeholder="Adresse, Surface, Type, Nombre de pièces, Description..." /></label>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Photos:</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {editImages.map((img, index) => {
                    const url = typeof img === 'string' ? getImageUrl(img) : URL.createObjectURL(img);
                    return (
                      <div key={index} style={{ position: 'relative' }}>
                        <img
                          src={url}
                          width={100}
                          alt=""
                          style={{ cursor: 'pointer', borderRadius: '6px', border: '1px solid #ddd' }}
                          onClick={() => {
                            setSelectedPhotoUrl(url);
                            setShowPhotoModal(true);
                          }}
                        />
                        <button type="button" onClick={() => setEditImages(editImages.filter((_, i) => i !== index))} style={{ position: 'absolute', top: 0, right: 0, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer' }}>X</button>
                      </div>
                    );
                  })}
                </div>
                <input type="file" multiple onChange={(e) => setEditImages([...editImages, ...Array.from(e.target.files)])} />
              </div>
              <div>
                <button type="submit">Enregistrer</button>
                <button type="button" onClick={() => setShowEditModal(false)}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showPhotoModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.95)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1100,
          padding: 0
        }} onClick={() => setShowPhotoModal(false)}>
          <div style={{ width: '100%', height: '100%', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <img src={selectedPhotoUrl} alt="" style={{ maxWidth: '100vw', maxHeight: '100vh', width: '100vh', height: '100vh', objectFit: 'contain', display: 'block', margin: '0 auto' }} />
            <button type="button" onClick={() => setShowPhotoModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer' }}>×</button>
          </div>
        </div>
      )}

      {/* --- Modal État des lieux --- */}
      {showEtatDesLieux && edlLocataire && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 1200, overflowY: "auto", padding: "24px 12px" }}>
          <div style={{ width: "100%", maxWidth: 940, borderRadius: 10, overflow: "hidden" }}>
            <EtatDesLieux
              locataire={edlLocataire}
              logement={edlLocataire.logementId || mesAnnonces.find((a) => String(a._id) === String(edlLocataire.logementId))}
              user={user}
              onArchive={handleArchiveEDL}
              onClose={() => setShowEtatDesLieux(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;
