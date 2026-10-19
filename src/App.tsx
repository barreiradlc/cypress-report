import React from 'react';
import styles from './App.module.css';

interface SocialLink {
  label: string;
  url: string;
  isLinkedIn?: boolean;
}

const ABOUT_TEXT: string = `Hello, my name is Augusto Barreira, I am a Full Stack Developer with extensive experience in web and mobile development, working on both front-end and back-end. Throughout my career, I have had the opportunity to work at large companies such as PWC, Apple, and BairesDev, where I used modern technologies such as React.js, Next.js, Node.js, and Ruby on Rails, as well as databases such as PostgreSQL, MongoDB, and DynamoDB.

I have knowledge of microservices architecture, GraphQL, REST, and messaging with RabbitMQ. I am familiar with TDD, unit testing, integration testing, and e2e testing. I have also worked with CI/CD pipelines using Jenkins and AWS cloud infrastructure with Terraform.

I am a versatile professional with a leadership profile, committed to good software engineering practices and always seeking learning and technological updates.`;

const SOCIAL_LINKS: SocialLink[] = [
  {
    label: 'GitHub',
    url: 'http://github.com/barreiradlc',
  },
  {
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/in/augusto-barreira-5b7362118/',
    isLinkedIn: true,
  },
];

export const AboutMePage: React.FC = () => {
  return (
    <div className={styles.container}>
      {/* Moving background */}
      <div className={styles.chessBackground} aria-hidden="true" />

      {/* Profile Card */}
      <main className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.name}>Augusto Barreira</h1>
          <p className={styles.title}>Full Stack Developer</p>
        </header>

        <section className={styles.bioSection}>
          <p className={styles.bioText}>{ABOUT_TEXT}</p>
        </section>

        <footer className={styles.socialSection}>
          <span className={styles.followText}>Follow me here:</span>
          <div className={styles.linkGroup}>
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.button} ${
                  link.isLinkedIn ? styles.linkedinButton : ''
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>
        </footer>
      </main>
    </div>
  );
};

export default AboutMePage;