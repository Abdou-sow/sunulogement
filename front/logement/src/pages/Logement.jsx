import { useEffect, useState } from "react";
import { getLogements } from "../services/logements";
import { API_URL } from "../services/api";
import { Link } from "react-router-dom";

function Logements() {
  const [logements, setLogements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getLogements();
        setLogements(data.filter((l) => l.etat === "disponible"));
      } catch (error) {
        console.error("Erreur de chargement :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <h1>Chargement...</h1>;
  }

  if (logements.length === 0) {
    return <h1>Aucun logement disponible pour le moment</h1>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Nos logements disponibles</h1>
      <div style={styles.grid}>
        {logements.map((logement) => (
          <div key={logement._id} style={styles.card}>
            <img
              src={
                logement.images?.[0]
                  ? `${API_URL}${logement.images[0]}`
                  : "/placeholder-400.png"
              }
              alt={logement.titre}
              style={styles.image}
            />
            <h3>{logement.titre}</h3>
            <p>{logement.description}</p>
            <p style={{ color: "#666" }}>📍 {logement.localisation}</p>
            <strong>{logement.prix?.toLocaleString()} FCFA / mois</strong>
            <Link to={`/logement/${logement._id}`} style={styles.button}>
              Voir plus
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1.5rem",
    marginTop: "1rem",
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "1rem",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    borderRadius: "8px",
  },
  button: {
    display: "inline-block",
    marginTop: "1rem",
    padding: "0.5rem 1rem",
    backgroundColor: "#222",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    textDecoration: "none",
  },
};

export default Logements;
