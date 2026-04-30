import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLogementById, createCandidature } from "../services/logements";
import { getImageUrl } from "../services/api";
import "../styles/LogementDetail.css";

export default function LogementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [logement, setLogement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // formulaire candidature
  const [candidature, setCandidature] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getLogementById(id);
        setLogement(data);
      } catch (err) {
        console.error("Erreur de chargement :", err);
        setError("Logement non trouvé");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const normalizeImages = (images) => {
    if (!images) return [];
    return Array.isArray(images) ? images : [images];
  };

  const imgs = logement ? normalizeImages(logement.images) : [];
  const currentImg = imgs[carouselIndex] ? getImageUrl(imgs[carouselIndex]) : "/placeholder-400.png";

  const prevCarousel = () => {
    setCarouselIndex((i) => (i - 1 + imgs.length) % imgs.length);
  };
  const nextCarousel = () => {
    setCarouselIndex((i) => (i + 1) % imgs.length);
  };

  const handleCandidature = async (e) => {
    e.preventDefault();
    const { nom, prenom, email, telephone } = candidature;
    if (!nom.trim() || !prenom.trim() || !email.trim() || !telephone.trim()) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setSubmitting(true);
    try {
      await createCandidature(logement._id, {
        nom,
        prenom,
        email,
        telephone,
        message: candidature.message,
      });
      setSubmitSuccess(true);
      setCandidature({ nom: "", prenom: "", email: "", telephone: "", message: "" });
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      console.error("Erreur candidature :", err);
      const msg = err?.response?.data?.message || "Erreur lors de l'envoi de votre candidature";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="detail-page"><h1>Chargement...</h1></div>;
  }

  if (error || !logement) {
    return <div className="detail-page"><h1>{error || "Logement non trouvé"}</h1></div>;
  }

  return (
    <div className="detail-page">
      <button className="btn-back" onClick={() => navigate("/")}>← Retour</button>

      <div className="detail-container">
        {/* Carousel principal */}
        <div className="carousel-main">
          <img src={currentImg} alt={logement.titre} className="carousel-img" onClick={() => setLightboxOpen(true)} />
          {imgs.length > 1 && (
            <>
              <button className="carousel-nav left" onClick={prevCarousel}>‹</button>
              <button className="carousel-nav right" onClick={nextCarousel}>›</button>
              <div className="carousel-indicators">
                {imgs.map((_, i) => (
                  <button
                    key={i}
                    className={"indicator" + (i === carouselIndex ? " active" : "")}
                    onClick={() => setCarouselIndex(i)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Infos + formulaire */}
        <div className="detail-info">
          <h1>{[logement.type, logement.commune].filter(Boolean).join(" — ") || logement.titre}</h1>
          <p className="location">
            📍 {[logement.region, logement.commune, logement.localisation].filter(Boolean).join(", ")}
          </p>
          <p className="price">{Number(logement.prix).toLocaleString("fr-FR")} FCFA / mois</p>
          <p className="desc">{logement.description}</p>
          {logement.etat && (
            <p className="etat">
              État : {logement.etat === "disponible" ? "Disponible" : logement.etat === "indisponible" ? "Indisponible" : "En rénovation"}
            </p>
          )}

          {/* Formulaire candidature */}
          {submitSuccess ? (
            <div className="success-message">
              ✅ Candidature envoyée avec succès ! Redirection en cours...
            </div>
          ) : (
            <form onSubmit={handleCandidature} className="candidature-form">
              <h3>📋 Postuler pour ce logement</h3>
              <input
                type="text"
                placeholder="Nom"
                value={candidature.nom}
                onChange={(e) => setCandidature({ ...candidature, nom: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Prénom"
                value={candidature.prenom}
                onChange={(e) => setCandidature({ ...candidature, prenom: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={candidature.email}
                onChange={(e) => setCandidature({ ...candidature, email: e.target.value })}
                required
              />
              <input
                type="tel"
                placeholder="Téléphone"
                value={candidature.telephone}
                onChange={(e) => setCandidature({ ...candidature, telephone: e.target.value })}
                required
              />
              <textarea
                placeholder="Message (optionnel)"
                value={candidature.message}
                onChange={(e) => setCandidature({ ...candidature, message: e.target.value })}
                rows={4}
              />
              <button type="submit" disabled={submitting}>
                {submitting ? "Envoi..." : "✉️ Postuler"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="lightbox" onClick={() => setLightboxOpen(false)}>
          <button className="lightbox-close" onClick={() => setLightboxOpen(false)}>✕</button>
          <img src={currentImg} alt="Zoom" className="lightbox-img" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}