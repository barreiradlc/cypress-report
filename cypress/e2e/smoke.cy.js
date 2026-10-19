const pages = ['/', '/dashboard', '/products', '/settings'];

describe('Smoke test: main pages render', () => {
  pages.forEach((path) => {
    it(`renders ${path} without errors`, () => {
      cy.visit(path);
      cy.get('header').should('be.visible');
      cy.get('main').should('be.visible');
      cy.contains(/something went wrong/i).should('not.exist');
    });
  });
});