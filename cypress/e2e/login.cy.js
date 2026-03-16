describe('Child Login Flow', () => {
  it('allows a child to login with visual cues', () => {
    cy.visit('/');

    // Check if on login page
    cy.contains('מי משחק היום?').should('be.visible');

    // Click on ליאו
    cy.get('[data-testid="child-button-1"]').click();

    // Check if on password step
    cy.contains('הסיסמה הסודית').should('be.visible');
    cy.contains("התור של ליאו").should('be.visible');

    // Select shape sequence
    cy.get('[data-testid="shape-button-circle"]').click();
    cy.get('[data-testid="shape-button-square"]').click();

    // Success step check
    cy.contains('הידד, ליאו!').should('be.visible');
    cy.contains('הצלחת!').should('be.visible');
  });
});
