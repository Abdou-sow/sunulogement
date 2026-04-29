import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLogements } from "../services/logements";
import { API_URL } from "../services/api";
import "../styles/Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [logements, setLogements] = useState([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState({}); // { logementId: index }

  // filtres
  const [filterLocation, setFilterLocation] = useState("");
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

  // helpers for images array normalization
  const normalizeImages = (images) => {
    if (!images) return [];
    return Array.isArray(images) ? images : [images];
  };

  // types possibles (adapter si nécessaire)
  const logementTypes = ["", "studio", "F1", "F2", "F3", "F4", "F5", "maison"];

  // filtrage appliqué — uniquement les logements disponibles
  const filteredLogements = logements.filter((l) => {
    if (l.etat !== "disponible") return false;
    if (filterLocation && !(l.localisation || "").toLowerCase().includes(filterLocation.toLowerCase())) {
      return false;
    }
    if (filterType && String((l.type || "")).toLowerCase() !== filterType.toLowerCase()) {
      return false;
    }
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

  return (
    <div className="home-page">
      <h1 className="home-title">🏠 Nos logements</h1>

      {/* Barre de filtres */}
      <div className="filters-bar card" >
        <div className="filter-item">
          <label>Localisation</label>
          <input value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} placeholder="Ville, quartier..." />
        </div>
        <div className="filter-item">
          <label>Budget min (€)</label>
          <input type="number" value={filterMinBudget} onChange={(e) => setFilterMinBudget(e.target.value)} placeholder="Min" />
        </div>
        <div className="filter-item">
          <label>Budget max (€)</label>
          <input type="number" value={filterMaxBudget} onChange={(e) => setFilterMaxBudget(e.target.value)} placeholder="Max" />
        </div>
        <div className="filter-item">
          <label>Type</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            {logementTypes.map((t) => <option key={t} value={t}>{t === "" ? "Tous types" : t.toUpperCase()}</option>)}
          </select>
        </div>
        <div className="filter-actions">
          <button className="btn" onClick={() => { setFilterLocation(""); setFilterMinBudget(""); setFilterMaxBudget(""); setFilterType(""); }}>Réinitialiser</button>
        </div>
      </div>

      <div className="cards-grid">
        {filteredLogements.map((logement) => {
           const imgs = normalizeImages(logement.images);
           const current = Number(carouselIndex[logement._id] || 0);
           const thumb = imgs[current] ? `${API_URL}${imgs[current]}` : "/placeholder-400.png";
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
                   alt={logement.titre}
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
                         aria-label={`Image ${i + 1}`}
                       />
                     ))}
                   </div>
                 )}
               </div>
               <div className="card-body">
                 <h2 className="card-title">{logement.titre}</h2>
                 <p className="card-location">{logement.localisation}</p>
                 <p className="card-price">{logement.prix} € / mois</p>
                 <p className="card-desc">{logement.description}</p>
                 <div className="card-meta">
                  <span className="meta-type">{(logement.type || "—").toString()}</span>
                  <span style={statutStyle(logement.etat)}>
                    {logement.etat === "disponible" ? "Disponible" : logement.etat === "indisponible" ? "Indisponible" : "En rénovation"}
                  </span>
                </div>
                <button 
                  className="btn-details"
                  onClick={() => navigate(`/logement/${logement._id}`)}
                >
                  👁️ Voir détails
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
            <img src={`${API_URL}${lightboxImages[lightboxIndex]}`} alt={`Vue ${lightboxIndex + 1}`} className="lightbox-image" />
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
