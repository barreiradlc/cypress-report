import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import styles from './App.module.css';

const ABOUT_TEXT: string = `Hello, my name is Augusto Barreira, I am a Full Stack Developer with extensive experience in web and mobile development, working on both front-end and back-end. Throughout my career, I have had the opportunity to work at large companies such as PWC, Apple, and BairesDev, where I used modern technologies such as React.js, Next.js, Node.js, and Ruby on Rails, as well as databases such as PostgreSQL, MongoDB, and DynamoDB.

I have knowledge of microservices architecture, GraphQL, REST, and messaging with RabbitMQ. I am familiar with TDD, unit testing, integration testing, and e2e testing. I have also worked with CI/CD pipelines using Jenkins and AWS cloud infrastructure with Terraform.

I am a versatile professional with a leadership profile, committed to good software engineering practices and always seeking learning and technological updates.`;

function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className={styles.header}>
      <h1 className={styles.name}>{title}</h1>
      {subtitle && <p className={styles.title}>{subtitle}</p>}
    </header>
  );
}

function Nav() {
  return (
    <nav className={styles.nav} aria-label="Main navigation">
      <Link to="/" data-cy="nav-home" className={styles.navLink}>
        Home
      </Link>
      <Link to="/login" data-cy="nav-login" className={styles.navLink}>
        Login
      </Link>
      <Link to="/products" data-cy="nav-products" className={styles.navLink}>
        Products
      </Link>
      <Link to="/settings" data-cy="nav-settings" className={styles.navLink}>
        Settings
      </Link>
    </nav>
  );
}

function Layout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className={styles.container}>
      {/* Moving background */}
      <div className={styles.chessBackground} aria-hidden="true" />
      <div className={styles.topBar}>
        <Header title={title} subtitle={subtitle} />
        <Nav />
      </div>
      {children}
    </div>
  );
}

function HomePage() {
  return (
    <Layout title="Home" subtitle="Cypress E2E demo application">
      <main className={styles.card}>
        <section className={styles.bioSection}>
          <p className={styles.bioText}>{ABOUT_TEXT}</p>
        </section>
      </main>
    </Layout>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(false);
    setLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        navigate('/dashboard', { replace: true });
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Sign in">
      <main className={styles.card}>
        <form className={styles.form} onSubmit={handleSubmit} data-cy="login-form">
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              data-cy="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              data-cy="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <button type="submit" data-cy="login-submit" disabled={loading} className={styles.button}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <p className={styles.hint}>
            Demo credentials: 
            <code className={styles.hintCode}>Email: user@example.com <br />Password: correct-password</code>
          </p>
          {error && (
            <p data-cy="error-message" role="alert" className={styles.error}>
              Invalid credentials. Please try again.
            </p>
          )}
        </form>
      </main>
    </Layout>
  );
}

function DashboardPage() {
  return (
    <Layout title="Dashboard">
      <main className={styles.card}>
        <p data-cy="welcome-message">Welcome back! You are signed in.</p>
      </main>
    </Layout>
  );
}

function ProductsPage() {
  return (
    <Layout title="Products">
      <main className={styles.card}>
        <p>Browse our product catalog. This page is covered by the smoke test.</p>
      </main>
    </Layout>
  );
}

function SettingsPage() {
  return (
    <Layout title="Settings">
      <main className={styles.card}>
        <p>Manage your account settings. This page is covered by the smoke test.</p>
      </main>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
