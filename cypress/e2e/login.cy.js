describe('Login flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('shows the login form', () => {
    cy.get('[data-cy=email]').should('be.visible');
    cy.get('[data-cy=password]').should('be.visible');
    cy.get('[data-cy=login-submit]').should('be.enabled');
  });

  it('logs in with valid credentials', () => {
    cy.intercept('POST', '/api/login').as('login');

    cy.get('[data-cy=email]').type('user@example.com');
    cy.get('[data-cy=password]').type('correct-password');
    cy.get('[data-cy=login-submit]').click();

    cy.wait('@login').its('response.statusCode').should('eq', 200);
    cy.url().should('include', '/dashboard');
    cy.get('[data-cy=welcome-message]').should('contain', 'Welcome');
  });

  it('shows an error with invalid credentials', () => {
    cy.get('[data-cy=email]').type('user@example.com');
    cy.get('[data-cy=password]').type('wrong-password');
    cy.get('[data-cy=login-submit]').click();

    cy.get('[data-cy=error-message]').should('be.visible');
    cy.url().should('include', '/login');
  });
});