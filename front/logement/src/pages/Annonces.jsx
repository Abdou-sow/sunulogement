import React from 'react';
import { Link } from 'react-router-dom';
import { useAnnonces } from '../contexts/AnnoncesContext';
import { getImageUrl } from '../services/api';

function Annonces() {
  const { annonces } = useAnnonces();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Nos Annonces</h1>
      {annonces.length === 0 ? (
        <p>Aucune annonce disponible.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {annonces.map(({ _id, titre, prix, images, localisation }) => (
            <div
              key={_id}
              style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#f9f9f9',
              }}
            >
              <img
                src={images?.[0] ? getImageUrl(images[0]) : '/placeholder-400.png'}
                alt={titre}
                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
              />
              <div style={{ padding: '1rem' }}>
                <h3>{titre}</h3>
                <p><strong>{Number(prix).toLocaleString("fr-FR")} FCFA / mois</strong></p>
                <p>{localisation}</p>
                <Link
                  to={`/annonces/${_id}`}
                  style={{
                    display: 'inline-block',
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#007bff',
                    color: 'white',
                    borderRadius: '4px',
                    textDecoration: 'none',
                  }}
                >
                  Voir plus
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Annonces;
