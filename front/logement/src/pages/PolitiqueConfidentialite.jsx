import "../styles/LegalPage.css";

export default function PolitiqueConfidentialite() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Politique de confidentialité</h1>
        <p className="legal-date">Dernière mise à jour : mai 2025</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            SunuLogement s'engage à protéger la vie privée de ses utilisateurs. Cette politique
            explique quelles données nous collectons, comment nous les utilisons et vos droits
            à leur égard.
          </p>
        </section>

        <section>
          <h2>2. Données collectées</h2>
          <p>Nous collectons les données suivantes :</p>
          <ul>
            <li><strong>Données d'identité :</strong> nom, prénom, adresse email.</li>
            <li><strong>Données de connexion :</strong> adresse IP, type de navigateur, date et heure d'accès.</li>
            <li><strong>Données immobilières :</strong> informations sur les logements, contrats, paiements saisis par l'utilisateur.</li>
            <li><strong>Photos :</strong> images de logements uploadées par l'utilisateur.</li>
          </ul>
        </section>

        <section>
          <h2>3. Utilisation des données</h2>
          <p>Vos données sont utilisées pour :</p>
          <ul>
            <li>Assurer le fonctionnement de votre compte et du service.</li>
            <li>Vous envoyer des notifications liées à votre activité (paiements, contrats).</li>
            <li>Améliorer nos services et corriger les erreurs techniques.</li>
            <li>Répondre à vos demandes de support.</li>
          </ul>
          <p>Nous ne vendons jamais vos données à des tiers.</p>
        </section>

        <section>
          <h2>4. Conservation des données</h2>
          <p>
            Vos données sont conservées tant que votre compte est actif. En cas de suppression
            de votre compte, vos données personnelles sont effacées dans un délai de 30 jours,
            sauf obligation légale de conservation.
          </p>
        </section>

        <section>
          <h2>5. Partage des données</h2>
          <p>
            Vos données ne sont partagées qu'avec les prestataires techniques nécessaires au
            fonctionnement du service (hébergement, envoi d'emails). Ces prestataires sont
            contractuellement tenus de respecter la confidentialité de vos données.
          </p>
        </section>

        <section>
          <h2>6. Sécurité</h2>
          <p>
            Nous mettons en œuvre des mesures de sécurité adaptées pour protéger vos données :
            chiffrement des mots de passe, connexion HTTPS, jetons d'authentification sécurisés.
          </p>
        </section>

        <section>
          <h2>7. Vos droits</h2>
          <p>Conformément à la réglementation applicable, vous disposez des droits suivants :</p>
          <ul>
            <li><strong>Droit d'accès :</strong> obtenir une copie de vos données.</li>
            <li><strong>Droit de rectification :</strong> corriger des données inexactes.</li>
            <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données.</li>
            <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format lisible.</li>
          </ul>
          <p>Pour exercer ces droits, contactez-nous à l'adresse ci-dessous.</p>
        </section>

        <section>
          <h2>8. Cookies</h2>
          <p>
            SunuLogement n'utilise pas de cookies publicitaires. Seuls des cookies techniques
            essentiels au fonctionnement de l'application sont utilisés (session, authentification).
          </p>
        </section>

        <section>
          <h2>9. Contact</h2>
          <p>
            Pour toute question relative à cette politique ou pour exercer vos droits :
          </p>
          <ul>
            <li>Email : <a href="mailto:contact.sunulogement@gmail.com">contact.sunulogement@gmail.com</a></li>
            <li>Téléphone : <a href="tel:+33627197015">+33 6 27 19 70 15</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
