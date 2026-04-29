import React, { useState } from 'react';
import { login as loginService } from '../services/auth';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

function LoginModérateur() {
  const { login } = useUser();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = await loginService({ email: credentials.email, password: credentials.password });
      if (userData?.role !== 'moderateur') {
        setError('Accès réservé aux modérateurs ❌');
        return;
      }
      login(userData);
      navigate('/dashboard-mod');
    } catch {
      setError('Identifiants invalides ❌');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>Connexion Modérateur</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={credentials.email}
          onChange={handleChange}
          required
          style={{ width: '100%', marginBottom: '1rem' }}
        />
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={credentials.password}
          onChange={handleChange}
          required
          style={{ width: '100%', marginBottom: '1rem' }}
        />
        <button type="submit">Se connecter</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default LoginModérateur;
