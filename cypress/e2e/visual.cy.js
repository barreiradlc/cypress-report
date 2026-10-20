/**
 * Visual regression spec.
 *
 * Visits the key application pages and captures deterministic screenshots
 * that are compared against committed baselines in
 * cypress/baselines/images/ on every CI run.
 *
 * Screenshots are named <page>-<state>.png so the comparison script can
 * match them one-to-one with the baseline folder.
 */

const pages = [
  { path: '/', name: 'home' },
  { path: '/login', name: 'login' },
  { path: '/dashboard', name: 'dashboard' },
  { path: '/products', name: 'products' },
  { path: '/settings', name: 'settings' },
];

describe('Visual regression: page layouts', () => {
  pages.forEach(({ path, name }) => {
    it(`captures ${path} screenshot`, () => {
      cy.visit(path);

      // Wait for the app shell to be present before capturing so the
      // screenshot is deterministic across runs.
      cy.get('header').should('be.visible');
      cy.get('main').should('be.visible');
      cy.contains(/something went wrong/i).should('not.exist');

      // Give animations/fonts a frame to settle.
      cy.wait(500);

      cy.screenshot(`visual-${name}`, {
        capture: 'viewport',
        blackout: [], // no elements hidden by default
      });
    });
  });
});

describe('Visual regression: login form states', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('[data-cy=email]').should('be.visible');
    cy.get('[data-cy=password]').should('be.visible');
  });

  it('captures empty login form', () => {
    cy.wait(500);
    cy.screenshot('visual-login-empty', { capture: 'viewport' });
  });

  it('captures login form with error state', () => {
    cy.get('[data-cy=email]').type('user@example.com');
    cy.get('[data-cy=password]').type('wrong-password');
    cy.get('[data-cy=login-submit]').click();
    cy.get('[data-cy=error-message]').should('be.visible');
    cy.wait(500);
    cy.screenshot('visual-login-error', { capture: 'viewport' });
  });
});