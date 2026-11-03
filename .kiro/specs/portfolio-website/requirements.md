# Requirements Document

## Introduction

This feature delivers a personal portfolio website for a single individual, Ulysses Galli, presenting their professional trajectory, academic background, areas of expertise, and a personal "about" summary. The site is a static, one-page (single-scroll) website built with plain HTML, CSS, and JavaScript, with no build step or framework, so it can be hosted on static hosts such as GitHub Pages or Netlify.

The visual identity follows a classic "Ivy League" aesthetic: academic and elegant, using serif typography for headings, a sober collegiate color palette built on navy, cream, and gold, and a clean, minimalist layout. The structure must be organized into clear, labeled sections (hero with role chips, about, professional experience, academic background, projects, contact) so the real content can be inserted easily. The professional experience must support grouping multiple roles under a single organization and an optional highlight badge, and the academic background must support a descriptive subtitle per entry. The site must be responsive across mobile and desktop, meet accessibility standards, and load quickly as a static site. A contact section provides social and link-in-bio style links, and social links also appear in the hero.

The document language of this specification is English (per EARS convention), while the content presented on the live site is in Portuguese.

## Glossary

- **Portfolio_Site**: The complete static website composed of HTML, CSS, and JavaScript files served to a visitor's browser.
- **Visitor**: Any person who opens the Portfolio_Site in a web browser.
- **Owner**: Ulysses Galli, the individual whose professional, academic, project, and personal information the Portfolio_Site presents, and who maintains the content.
- **Hero_Section**: The first visible section of the Portfolio_Site introducing the Owner by name and headline.
- **Role_Chip**: A compact labeled tag displayed in the Hero_Section representing one of the Owner's professional roles or focus areas.
- **About_Section**: The section presenting a personal summary of the Owner.
- **Experience_Section**: The section presenting the Owner's professional trajectory.
- **Organization_Group**: A content block within the Experience_Section that associates one organization with one or more role entries held by the Owner at that organization.
- **Role_Entry**: A content unit within an Organization_Group describing a single role, its time period, and its description.
- **Highlight_Badge**: An optional labeled indicator attached to a Role_Entry that emphasizes a notable achievement.
- **Education_Section**: The section presenting the Owner's academic background.
- **Education_Entry**: A repeatable content block within the Education_Section describing one institution, qualification, time period, and descriptive subtitle.
- **Skills_Section**: The section presenting the Owner's areas of expertise as a word cloud (an animated rotating sphere when scripting is enabled, a readable list otherwise).
- **Contact_Section**: The section presenting the Owner's contact information and social or link-in-bio links.
- **Navigation_Bar**: The in-page navigation element containing anchor links to each section.
- **Anchor_Link**: A navigation link that scrolls the viewport to a specific section within the single page.
- **Viewport_Width**: The horizontal pixel width of the Visitor's browser viewport.
- **Mobile_Layout**: The layout rendered when Viewport_Width is less than 768 pixels.
- **Desktop_Layout**: The layout rendered when Viewport_Width is 768 pixels or greater.

## Requirements

### Requirement 1: Single-page structure with labeled sections

**User Story:** As the Owner, I want a one-page site organized into clearly labeled sections, so that I can present my real content in a ready-made structure without rebuilding the layout.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL render all content on a single HTML page.
2. THE Portfolio_Site SHALL include a Hero_Section, an About_Section, an Experience_Section, an Education_Section, a Skills_Section, and a Contact_Section.
3. THE Portfolio_Site SHALL assign a unique identifier to each of the Hero_Section, About_Section, Experience_Section, Education_Section, Skills_Section, and Contact_Section.
4. THE Portfolio_Site SHALL present each section, except the Hero_Section, with a visible heading identifying the section's purpose.
5. THE Hero_Section SHALL present the Owner's name "Ulysses Galli" using a strong-weight serif typeface.
6. THE Hero_Section SHALL present the Owner's headline "Sales at Amazon Web Services | 3x AWS Certified | UNIFESP | FGV".
7. THE Hero_Section SHALL present a set of Role_Chip elements representing the Owner's focus areas, including "Sales", "Strategy", and "AI".
8. THE About_Section SHALL present a personal summary describing the Owner.
9. THE Experience_Section SHALL present professional history using one Organization_Group per organization, each containing one or more Role_Entry units.
10. THE Education_Section SHALL present academic history using repeatable Education_Entry blocks.
11. THE Skills_Section SHALL present the Owner's areas of expertise as a set of skill labels, and SHALL present those labels as a readable list when scripting is disabled.

### Requirement 2: Static technology stack

**User Story:** As the Owner, I want the site built with plain HTML, CSS, and JavaScript and no build step, so that I can host it easily on static hosts such as GitHub Pages or Netlify.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL be composed only of HTML, CSS, and JavaScript files.
2. THE Portfolio_Site SHALL render fully when its files are served as static assets without a build or compilation step.
3. THE Portfolio_Site SHALL operate without any server-side runtime dependency.
4. WHERE the Portfolio_Site uses JavaScript, THE Portfolio_Site SHALL present all textual content of every section when JavaScript is disabled.

### Requirement 3: In-page navigation

**User Story:** As a Visitor, I want anchor navigation to each section, so that I can jump directly to the information I want without manual scrolling.

#### Acceptance Criteria

1. THE Navigation_Bar SHALL present one Anchor_Link for each of the About_Section, Experience_Section, Education_Section, Skills_Section, and Contact_Section.
2. WHEN a Visitor activates an Anchor_Link, THE Portfolio_Site SHALL scroll the viewport to the corresponding section.
3. WHEN a Visitor activates an Anchor_Link, THE Portfolio_Site SHALL move keyboard focus to the corresponding section.
4. WHILE the Visitor scrolls the page, THE Navigation_Bar SHALL remain accessible for navigation between sections.

### Requirement 4: Ivy League visual identity

**User Story:** As the Owner, I want a classic, academic, elegant visual identity in navy, cream, and gold, so that the site conveys a sober and professional impression consistent with an Ivy League aesthetic.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL apply an elegant serif typeface to section headings and to the Owner's name in the Hero_Section.
2. THE Portfolio_Site SHALL apply a sober collegiate color palette limited to no more than four principal colors.
3. THE Portfolio_Site SHALL use navy as the primary color and cream as the primary background color.
4. THE Portfolio_Site SHALL use gold as the accent color for emphasis elements, including Role_Chip borders and Highlight_Badge indicators.
5. THE Portfolio_Site SHALL maintain consistent spacing and alignment across all sections.
6. THE Portfolio_Site SHALL present content using a minimalist layout that excludes decorative elements not tied to content.
7. THE Experience_Section SHALL present each Organization_Group within a bounded card block (which the Experience timeline styling may render without a visible card surface).

### Requirement 5: Responsive layout

**User Story:** As a Visitor, I want the site to adapt to my device, so that I can read it comfortably on both mobile and desktop.

#### Acceptance Criteria

1. WHILE Viewport_Width is less than 768 pixels, THE Portfolio_Site SHALL render the Mobile_Layout.
2. WHILE Viewport_Width is 768 pixels or greater, THE Portfolio_Site SHALL render the Desktop_Layout.
3. WHILE the Mobile_Layout is active, THE Portfolio_Site SHALL present all content without horizontal scrolling.
4. THE Portfolio_Site SHALL render text at a minimum body font size of 16 pixels on the Mobile_Layout.

### Requirement 6: Accessibility

**User Story:** As a Visitor using assistive technology, I want the site to be accessible, so that I can perceive and navigate all content.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL define a document language on the root HTML element.
2. THE Portfolio_Site SHALL structure headings in a hierarchical order without skipping heading levels.
3. THE Portfolio_Site SHALL provide a descriptive text alternative for every non-decorative image.
4. THE Portfolio_Site SHALL maintain a contrast ratio of at least 4.5 to 1 between body text and its background.
5. WHEN a Visitor navigates using a keyboard, THE Portfolio_Site SHALL display a visible focus indicator on each focusable element.
6. THE Navigation_Bar SHALL expose each Anchor_Link to assistive technology with a descriptive accessible name.

### Requirement 7: Performance

**User Story:** As a Visitor, I want the site to load quickly, so that I can view the content without delay.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL render the Hero_Section within 2 seconds on a broadband connection of 10 megabits per second or faster.
2. THE Portfolio_Site SHALL load all CSS and JavaScript assets as a combined transferred size of 150 kilobytes or less, excluding images and fonts.
3. WHEN the Portfolio_Site loads, THE Portfolio_Site SHALL display section text before any non-essential media finishes loading.

### Requirement 8: Contact and social links

**User Story:** As a Visitor, I want contact and social links in the hero and in a dedicated contact section, so that I can reach the Owner or view their profiles.

#### Acceptance Criteria

1. THE Hero_Section SHALL present a set of social link icons, including a link to the Owner's LinkedIn profile at "linkedin.com/in/ulyssesgalli".
2. THE Contact_Section SHALL present a set of links to the Owner's contact and social destinations in a link-in-bio style.
3. WHEN a Visitor activates a social or external link in the Hero_Section or the Contact_Section, THE Portfolio_Site SHALL open the corresponding destination.
4. THE Contact_Section SHALL present each link with a visible label identifying the link's destination.
5. WHERE a link in the Hero_Section or the Contact_Section opens in a new browser context, THE Portfolio_Site SHALL set the link relationship to prevent the opened page from accessing the originating window.

### Requirement 9: Grouped professional experience content

**User Story:** As the Owner, I want multiple roles grouped under a single organization with an optional achievement badge, so that my progression at the same company is presented coherently.

#### Acceptance Criteria

1. THE Organization_Group SHALL present the organization name once as the group heading.
2. THE Organization_Group SHALL present each Role_Entry with a role title, a time period, and a description.
3. WHERE an organization has more than one Role_Entry, THE Organization_Group SHALL present every Role_Entry under the single organization heading.
4. WHERE a Role_Entry has a notable achievement, THE Organization_Group SHALL present a Highlight_Badge on that Role_Entry.
5. THE Experience_Section SHALL present Organization_Groups in reverse chronological order by the most recent Role_Entry time period.
6. THE Experience_Section SHALL present an Organization_Group for Amazon Web Services containing a "Sales Executive" Role_Entry and a "Program Manager" Role_Entry.
7. THE Experience_Section SHALL present a Highlight_Badge of "150% quota" on the Amazon Web Services "Sales Executive" Role_Entry.
8. THE Experience_Section SHALL present an Organization_Group for EPPEN JR containing a "Deliberative Counselor" Role_Entry, a "Project Management Director" Role_Entry, and a "Junior Consultant" Role_Entry.

### Requirement 10: Academic background content

**User Story:** As the Owner, I want each education entry to carry a descriptive subtitle, so that the prestige and context of each institution is visible.

#### Acceptance Criteria

1. THE Education_Entry SHALL present an institution name, a qualification, and a time period.
2. THE Education_Entry SHALL present a descriptive subtitle for the entry.
3. THE Education_Section SHALL present an Education_Entry for UNIFESP with the subtitle "Top 10 universidades brasileiras".
4. THE Education_Section SHALL present an Education_Entry for FGV.
5. THE Education_Section SHALL present an Education_Entry for LMU München.
