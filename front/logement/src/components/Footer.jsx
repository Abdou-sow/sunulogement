export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                {/* Colonne 1: Logo et description */}
                <div className="footer-col">
                    <img src="/logo1.png" alt="SunuLogement" className="footer-logo" />
                </div>

                {/* Colonne 2: À propos */}
                <div className="footer-col">
                    <h4>À propos</h4>
                    <ul>
                        <li><a href="/">Accueil</a></li>
                        <li><button type="button" className="footer-link-btn">Qui sommes-nous</button></li>
                        <li><button type="button" className="footer-link-btn">Nos services</button></li>
                        <li><button type="button" className="footer-link-btn">Blog</button></li>
                    </ul>
                </div>

                {/* Colonne 3: Aide */}
                <div className="footer-col">
                    <h4>Aide</h4>
                    <ul>
                        <li><button type="button" className="footer-link-btn">FAQ</button></li>
                        <li><button type="button" className="footer-link-btn">Contact</button></li>
                        <li><button type="button" className="footer-link-btn">Conditions d'utilisation</button></li>
                        <li><button type="button" className="footer-link-btn">Politique de confidentialité</button></li>
                    </ul>
                </div>

                {/* Colonne 4: Coordonnées et réseaux sociaux */}
                <div className="footer-col">
                    <h4>Nous contacter</h4>
                    <p className="footer-contact">
                        <strong>Téléphone :</strong> <a href="tel:+221771234567">+221 77 123 45 67</a>
                    </p>
                    <p className="footer-contact">
                        <strong>Email :</strong> <a href="mailto:contact@sunulogement.sn">contact@sunulogement.sn</a>
                    </p>

                    {/* Réseaux sociaux */}
                    <div className="footer-socials">
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <img src="/instagram.jpeg" alt="Instagram" className="social-icon" />
                        </a>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                            <img src="/facebook.jpeg" alt="Facebook" className="social-icon" />
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                            <img src="/linkedin.png" alt="LinkedIn" className="social-icon" />
                        </a>
                        <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                            <img src="/tiktok.png" alt="TikTok" className="social-icon" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="footer-bottom">
                <p>&copy; 2025 SunuLogement. Tous droits réservés.</p>
            </div>
        </footer>
    );
}