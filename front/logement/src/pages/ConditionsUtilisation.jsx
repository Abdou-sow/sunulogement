import "../styles/LegalPage.css";

export default function ConditionsUtilisation() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Conditions d'utilisation</h1>
        <p className="legal-date">Dernière mise à jour : mai 2025</p>

        <section>
          <h2>1. Objet</h2>
          <p>
            Les présentes conditions d'utilisation régissent l'accès et l'utilisation de la
            plateforme SunuLogement, accessible à l'adresse <strong>www.sunulogement.com</strong>.
            En utilisant notre service, vous acceptez sans réserve ces conditions.
          </p>
        </section>

        <section>
          <h2>2. Description du service</h2>
          <p>
            SunuLogement est une plateforme de gestion immobilière qui permet aux propriétaires
            de gérer leurs logements, suivre les paiements, gérer les locataires et publier
            des annonces de location.
          </p>
        </section>

        <section>
          <h2>3. Inscription et compte utilisateur</h2>
          <p>
            Pour accéder aux fonctionnalités de la plateforme, vous devez créer un compte en
            fournissant des informations exactes et complètes. Vous êtes responsable de la
            confidentialité de votre mot de passe et de toutes les activités effectuées sous
            votre compte.
          </p>
          <ul>
            <li>Vous devez avoir au moins 18 ans pour vous inscrire.</li>
            <li>Un seul compte par personne est autorisé.</li>
            <li>Vous devez notifier immédiatement tout accès non autorisé à votre compte.</li>
          </ul>
        </section>

        <section>
          <h2>4. Utilisation acceptable</h2>
          <p>Vous vous engagez à ne pas :</p>
          <ul>
            <li>Publier des annonces frauduleuses ou trompeuses.</li>
            <li>Utiliser la plateforme à des fins illicites.</li>
            <li>Tenter de pirater ou perturber le fonctionnement du service.</li>
            <li>Collecter les données d'autres utilisateurs sans leur consentement.</li>
          </ul>
        </section>

        <section>
          <h2>5. Responsabilité</h2>
          <p>
            SunuLogement met tout en œuvre pour assurer la disponibilité et la fiabilité du
            service, mais ne peut garantir un fonctionnement sans interruption. Nous déclinons
            toute responsabilité en cas de perte de données due à des circonstances
            indépendantes de notre volonté.
          </p>
        </section>

        <section>
          <h2>6. Propriété intellectuelle</h2>
          <p>
            Tous les contenus de la plateforme (logo, textes, interface) sont la propriété
            exclusive de SunuLogement. Toute reproduction sans autorisation écrite est
            strictement interdite.
          </p>
        </section>

        <section>
          <h2>7. Modification des conditions</h2>
          <p>
            Nous nous réservons le droit de modifier ces conditions à tout moment. Les
            utilisateurs seront informés de tout changement significatif par email ou via
            une notification sur la plateforme.
          </p>
        </section>

        <section>
          <h2>8. Contact</h2>
          <p>
            Pour toute question relative aux présentes conditions, vous pouvez nous contacter :
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
