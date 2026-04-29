import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLogementById, createCandidature } from "../services/logements";
import { API_URL } from "../services/api";

function AnnonceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [annonce, setAnnonce] = useState(null);
  const [proprietaire, setProprietaire] = useState('');
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    dateDeNaissance: "",
    email: '',
    telephone: '',
    message: '',
  });

  useEffect(() => {
    const fetchAnnonce = async () => {
      try {
        const annonce = await getLogementById(id);
        setAnnonce(annonce);
        if (annonce.proprietaire?._id) {
          setProprietaire(annonce.proprietaire._id);
        }
      } catch {
        navigate('/annonces');
      }
    };
    fetchAnnonce();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const candidatureData = {
        ...formData,
        logement: annonce._id,
        proprietaire: proprietaire,
      };
      await createCandidature(id, candidatureData);
      alert(`Candidature envoyée avec succès pour : ${annonce.titre}`);
      setFormData({ nom: '', prenom: '', dateDeNaissance: '', email: '', telephone: '', message: '' });
      navigate('/annonces');
    } catch (error) {
      console.error("Erreur:", error);
      const msg = error?.response?.data?.message || "Une erreur s'est produite";
      alert(msg);
    }
  };

  if (!annonce) {
    return <p>Chargement...</p>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
      <h1>{annonce.titre}</h1>
      <h1>Prix : {annonce.prix}</h1>
      <p><strong>Ville :</strong> {annonce.localisation}</p>
      {annonce.images?.[0] && (
        <img
          src={`${API_URL}${annonce.images[0]}`}
          alt={annonce.titre}
          style={{
            width: '100%',
            maxHeight: 300,
            objectFit: 'cover',
            marginBottom: '1rem',
            borderRadius: '8px'
          }}
        />
      )}
      <p>Description :</p>
      <p>{annonce.description}</p>

      <hr style={{ margin: '2rem 0' }} />

      <h2>Postuler à cette annonce</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nom :</label>
          <input
            type="text"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
          />
        </div>
        <div>
          <label>Prénom :</label>
          <input
            type="text"
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
          />
        </div>
        <div>
          <label>Date de naissance :</label>
          <input
            type="date"
            name="dateDeNaissance"
            value={formData.dateDeNaissance}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
          />
        </div>
        <div>
          <label>Email :</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
          />
        </div>
        <div>
          <label>Téléphone :</label>
          <input
            type="tel"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
          />
        </div>
        <div>
          <label>Message :</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows="5"
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <button type="submit" style={{ marginTop: '1rem' }}>
          Envoyer la candidature
        </button>
      </form>
    </div>
  );
}

export default AnnonceDetail;
