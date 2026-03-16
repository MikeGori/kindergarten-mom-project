describe('Show & Tell Feed', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.contains('Show & Tell Feed').click();
  });

  it('allows a student to post an emoji and react to posts', () => {
    cy.contains('Show & Tell').should('be.visible');

    // Create a post
    // Note: The UI has a tool selection step now
    cy.get('[data-testid="select-emoji-tool"]').click();
    cy.get('[data-testid="post-emoji-smile"]').click();

    // Verify post appears
    cy.get('.grid-container').first().should('contain', 'Mia');
    cy.contains('😁').should('be.visible');

    // React to a post
    cy.get('button').contains('0').first().click(); // Like first post
    cy.get('button').contains('1').should('be.visible');
  });
});
