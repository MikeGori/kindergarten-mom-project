describe('Child Login Flow', () => {
  it('allows a child to login with visual cues', () => {
    cy.visit('/');

    // Check if on login page
    cy.contains('מי משחק היום?').should('be.visible');

    // Test Registration Flow
    cy.get('[aria-label="תלמיד חדש? הצטרף אלינו"]').click();
    cy.contains('ברוכים הבאים!').should('be.visible');
    
    const randomName = `ילד-${Math.floor(Math.random() * 1000)}`;
    cy.get('input[placeholder="איך קוראים לך?"]').type(randomName);
    cy.contains('הצטרפתי!').click();

    // Verify back on login page and new student exists
    cy.contains('מי משחק היום?').should('be.visible');
    cy.contains(randomName).should('be.visible').click();

    // Password step
    cy.contains('הסיסמה הסודית').should('be.visible');
    cy.get('[data-testid="shape-button-circle"]').click();
    cy.get('[data-testid="shape-button-square"]').click();

    // Success step
    cy.contains(`הידד, ${randomName}!`).should('be.visible');
  });
});
