describe('Package docs page tests', () => {
  it('has the correct page title', () => {
    cy.visit('/packages/mock-package-2/docs/extended-info');
    cy.title().should('eq', 'Extended Info - Complete Config Project');
  });

  it('has the correct page title with custom page title', () => {
    cy.visit('/packages/mock-package-1/docs/extended-info');
    cy.title().should('eq', 'Extended Information - Complete Config Project');
  });
});
