describe('Home page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should have a favicon', () => {
    cy.get('link[rel="icon"]').should('have.attr', 'href');
  });

  it('should display the expected set of links', () => {
    cy.getTestElement('PanelLink').should(panelLinks => {
      expect(
        panelLinks.get().map(panelLink => {
          const panelImg = panelLink.querySelector(
            '[data-testid="PanelImage"]',
          );
          const panelHeader = panelLink.querySelector(
            '[data-testid="PanelHeader"]',
          );
          return {
            label: panelHeader.textContent,
            description: panelLink.querySelector('p').textContent,
            href: panelLink.href,
            img: {
              alt: panelImg.alt,
              src: panelImg.src,
            },
            target: panelLink.target,
          };
        }),
        // eslint-disable-next-line jest/valid-expect
      ).to.deep.eq([
        {
          label: 'Get Started',
          description: 'Everything you need to get up and running',
          href: 'http://localhost:8000/readme',
          img: {
            alt: 'Get Started graphic',
            src: 'http://localhost:8000/static/simplify.svg',
          },
          target: '',
        },
        {
          label: 'Packages',
          description: 'A custom description for the packages section',
          href: 'http://localhost:8000/packages',
          img: {
            alt: 'Packages graphic',
            src: 'http://localhost:8000/static/simplify.svg',
          },
          target: '',
        },
        {
          label: 'Docs',
          description: 'Read the full documentation for this project',
          href: 'http://localhost:8000/docco',
          img: {
            alt: 'Docs graphic',
            src: 'http://localhost:8000/static/simplify.svg',
          },
          target: '',
        },
        {
          label: 'Tutorial',
          description: 'Get started by following a tutorial',
          href: 'http://localhost:8000/tut',
          img: {
            alt: 'Tutorial graphic',
            src: 'http://localhost:8000/static/file_cabinet.png',
          },
          target: '',
        },
        {
          label: 'Get accomplished today!',
          description: '',
          href: 'http://localhost:8000/docco/guides/how-to-be-accomplished',
          img: {
            alt: 'Get accomplished today! graphic',
            src: 'http://localhost:8000/static/file_cabinet.png',
          },
          target: '',
        },
        {
          label: 'Get a job!',
          description:
            'Browse the available Atlassian career opportunities and join the team.',
          href: 'https://www.atlassian.com/company/careers/all-jobs',
          img: {
            alt: 'Get a job! graphic',
            src: 'http://localhost:8000/static/simplify.svg',
          },
          target: '_blank',
        },
      ]);
    });
  });
});
