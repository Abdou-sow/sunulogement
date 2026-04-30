import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLogements } from "../services/logements";
import { getImageUrl } from "../services/api";
import { TYPES_LOGEMENT, REGIONS, REGIONS_COMMUNES } from "../data/senegal";
import "../styles/Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [logements, setLogements] = useState([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState({});

  // filtres
  const [filterRegion, setFilterRegion] = useState("");
  const [filterCommune, setFilterCommune] = useState("");
  const [filterMinBudget, setFilterMinBudget] = useState("");
  const [filterMaxBudget, setFilterMaxBudget] = useState("");
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getLogements();
        setLogements(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erreur de chargement :", error);
      }
    };
    fetchData();
  }, []);

  const normalizeImages = (images) => {
    if (!images) return [];
    return Array.isArray(images) ? images : [images];
  };

  const filteredLogements = logements.filter((l) => {
    if (l.etat !== "disponible") return false;
    if (filterRegion && l.region !== filterRegion) return false;
    if (filterCommune && l.commune !== filterCommune) return false;
    if (filterType && l.type !== filterType) return false;
    const prix = Number(l.prix || 0);
    if (filterMinBudget && !isNaN(Number(filterMinBudget)) && prix < Number(filterMinBudget)) return false;
    if (filterMaxBudget && !isNaN(Number(filterMaxBudget)) && prix > Number(filterMaxBudget)) return false;
    return true;
  });

  const statutStyle = (etat) => ({
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 700,
    background: etat === "disponible" ? "#e8f5e9" : etat === "indisponible" ? "#ffebee" : "#fff8e1",
    color: etat === "disponible" ? "#2e7d32" : etat === "indisponible" ? "#c62828" : "#f57f17",
  });

  const openLightbox = (images, index = 0) => {
    const imgs = normalizeImages(images).filter(Boolean);
    if (imgs.length === 0) return;
    setLightboxImages(imgs);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);
  const prevLightbox = () => setLightboxIndex((i) => (i - 1 + lightboxImages.length) % lightboxImages.length);
  const nextLightbox = () => setLightboxIndex((i) => (i + 1) % lightboxImages.length);

  const prevCarousel = (id, images) => {
    const imgs = normalizeImages(images);
    if (!imgs.length) return;
    setCarouselIndex((s) => {
      const cur = Number(s[id] || 0);
      return { ...s, [id]: (cur - 1 + imgs.length) % imgs.length };
    });
  };
  const nextCarousel = (id, images) => {
    const imgs = normalizeImages(images);
    if (!imgs.length) return;
    setCarouselIndex((s) => {
      const cur = Number(s[id] || 0);
      return { ...s, [id]: (cur + 1) % imgs.length };
    });
  };

  const openLightboxFromCard = (id, images) => {
    const idx = Number(carouselIndex[id] || 0);
    openLightbox(images, idx);
  };

  const resetFilters = () => {
    setFilterRegion("");
    setFilterCommune("");
    setFilterMinBudget("");
    setFilterMaxBudget("");
    setFilterType("");
  };

  return (
    <div className="home-page">
      <h1 className="home-title">Nos logements</h1>

      {/* Barre de filtres */}
      <div className="filters-bar card">
        <div className="filter-item">
          <label>Région</label>
          <select value={filterRegion} onChange={(e) => { setFilterRegion(e.target.value); setFilterCommune(""); }}>
            <option value="">Toutes les régions</option>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="filter-item">
          <label>Commune</label>
          <select value={filterCommune} onChange={(e) => setFilterCommune(e.target.value)} disabled={!filterRegion}>
            <option value="">Toutes les communes</option>
            {(REGIONS_COMMUNES[filterRegion] || []).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="filter-item">
          <label>Type</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">Tous les types</option>
            {TYPES_LOGEMENT.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="filter-item">
          <label>Budget min (FCFA)</label>
          <input type="number" value={filterMinBudget} onChange={(e) => setFilterMinBudget(e.target.value)} placeholder="Min" />
        </div>
        <div className="filter-item">
          <label>Budget max (FCFA)</label>
          <input type="number" value={filterMaxBudget} onChange={(e) => setFilterMaxBudget(e.target.value)} placeholder="Max" />
        </div>
        <div className="filter-actions">
          <button className="btn" onClick={resetFilters}>Réinitialiser</button>
        </div>
      </div>

      <div className="cards-grid">
        {filteredLogements.length === 0 && (
          <p style={{ gridColumn: "1/-1", textAlign: "center", color: "#888", padding: "40px 0" }}>
            Aucun logement disponible pour ces critères.
          </p>
        )}
        {filteredLogements.map((logement) => {
          const imgs = normalizeImages(logement.images);
          const current = Number(carouselIndex[logement._id] || 0);
          const thumb = imgs[current] ? getImageUrl(imgs[current]) : "/placeholder-400.png";
          const displayTitle = [logement.type, logement.commune].filter(Boolean).join(" — ");

          return (
            <div key={logement._id} className="card">
              <div className="card-media">
                {imgs.length > 1 && (
                  <>
                    <button className="carousel-btn left" onClick={() => prevCarousel(logement._id, imgs)} aria-label="Précédent">‹</button>
                    <button className="carousel-btn right" onClick={() => nextCarousel(logement._id, imgs)} aria-label="Suivant">›</button>
                  </>
                )}
                <img
                  src={thumb}
                  alt={displayTitle}
                  className="card-image"
                  onClick={() => openLightboxFromCard(logement._id, imgs)}
                />
                {imgs.length > 1 && (
                  <div className="carousel-dots">
                    {imgs.map((_, i) => (
                      <button
                        key={i}
                        className={"dot" + (i === current ? " active" : "")}
                        onClick={() => setCarouselIndex((s) => ({ ...s, [logement._id]: i }))}
                        aria-label={`Vue ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="card-body">
                <h2 className="card-title">{displayTitle || logement.titre}</h2>
                <p className="card-location">
                  📍 {[logement.region, logement.commune, logement.localisation].filter(Boolean).join(", ")}
                </p>
                <p className="card-price">{Number(logement.prix).toLocaleString("fr-FR")} FCFA / mois</p>
                <p className="card-desc">{logement.description}</p>
                <div className="card-meta">
                  <span className="meta-type">{logement.type || "—"}</span>
                  <span style={statutStyle(logement.etat)}>
                    {logement.etat === "disponible" ? "Disponible" : logement.etat === "indisponible" ? "Indisponible" : "En rénovation"}
                  </span>
                </div>
                <button className="btn-details" onClick={() => navigate(`/logement/${logement._id}`)}>
                  Voir détails
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox modal */}
      {lightboxOpen && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>✕</button>
          <button className="lightbox-prev" onClick={(e) => { e.stopPropagation(); prevLightbox(); }}>‹</button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={getImageUrl(lightboxImages[lightboxIndex])} alt={`Vue ${lightboxIndex + 1}`} className="lightbox-image" />
            {lightboxImages.length > 1 && (
              <div className="lightbox-footer">
                <button onClick={prevLightbox} className="lb-btn">‹</button>
                <span>{lightboxIndex + 1} / {lightboxImages.length}</span>
                <button onClick={nextLightbox} className="lb-btn">›</button>
              </div>
            )}
          </div>
          <button className="lightbox-next" onClick={(e) => { e.stopPropagation(); nextLightbox(); }}>›</button>
        </div>
      )}
    </div>
  );
}
