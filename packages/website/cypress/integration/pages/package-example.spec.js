describe('Package example page tests', () => {
  beforeEach(() => {
    cy.visit('/packages/mock-package-1/examples/example1');
  });

  it('has the correct page title', () => {
    cy.title().should('eq', 'Example1 - Complete Config Project');
  });
});
