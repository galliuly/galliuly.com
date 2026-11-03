// i18n.js — Multilingual support for the portfolio (progressive enhancement).
//
// Approach (confirmed with the owner): a single HTML document holds the
// Portuguese (pt-BR) content directly in the markup as the base language, so
// with JavaScript disabled the site is fully readable in pt-BR (Req 2.4 is
// preserved for the base language). Translatable elements carry a data-i18n
// key; this script swaps their text when another language is chosen, updates
// <html lang>, the document title, and remembers the choice in localStorage.
//
// Supported languages: pt-BR (base), en, es, zh, de, fr.
//
// TRANSLATION REVIEW NOTE
// -----------------------
// The pt-BR and en strings are authored carefully. The es, fr, de, and
// especially zh strings are machine-generated first drafts and SHOULD BE
// REVIEWED by a fluent speaker before this goes live — career/portfolio copy
// is easy to get subtly wrong in automatic translation. Each non-pt/en block
// is marked with "REVIEW:" for that reason.

"use strict";

(function () {
  if (typeof document === "undefined") {
    return;
  }

  // English is the default landing language. pt-BR remains the text authored
  // directly in the HTML (the no-JS base, Req 2.4); on load the script applies
  // the default/stored language over that base.
  var DEFAULT_LANG = "en";
  var BASE_LANG = "pt-BR"; // the language the HTML markup is authored in
  var SUPPORTED = ["pt-BR", "en", "es", "zh", "de", "fr"];
  var STORAGE_KEY = "portfolio-lang";

  // Per-language document title.
  var TITLES = {
    "pt-BR": "Ulysses Galli | Portfólio",
    en: "Ulysses Galli | Portfolio",
    es: "Ulysses Galli | Portafolio",
    zh: "Ulysses Galli | 作品集", // REVIEW
    de: "Ulysses Galli | Portfolio",
    fr: "Ulysses Galli | Portfolio"
  };

  // Translation dictionary. Keys match the data-i18n attributes in index.html.
  // pt-BR intentionally mirrors the authored HTML so a language reset restores
  // the exact base copy.
  var STRINGS = {
    "pt-BR": {
      "nav.about": "Sobre",
      "nav.experience": "Experiência",
      "nav.education": "Formação",
      "nav.skills": "Áreas de atuação",
      "nav.contact": "Contato",
      "hero.ctaPrimary": "Explore minha trajetória",
      "hero.ctaSecondary": "Entre em contato",
      "certs.label": "Certificações",
      "certs.link": "Ver todas as minhas certificações no Credly (abre em nova aba)",
      "about.heading": "Sobre",
      "about.tagline":
        "Acredito no potencial transformador da inteligência artificial para fazer a sociedade avançar.",
      "skip": "Pular para o conteúdo",
      "footer.top": "Voltar ao topo",
      "about.summary":
        "Sou Ulysses Galli, profissional de vendas e estratégia baseado em São Paulo, atualmente Sales Executive na Amazon Web Services (AWS) e 3x AWS Certified. Minha formação une Relações Internacionais, Administração e experiências internacionais, base que sustenta uma trajetória por vendas, estratégia, produto e operações, experiência do cliente, consultoria e marketing. Dedico-me continuamente a inteligência artificial, gestão de relacionamento com clientes, gerenciamento de projetos e consultoria estratégica, buscando conectar visão de negócio, intraempreendedorismo e execução com rigor e elegância.",
      "experience.heading": "Experiência",
      "period.present": "Presente",
      "period.partTime": "(meio período)",
      "exp.aws.sales.desc":
        "Executivo de vendas; 150% de atingimento de quota de receita no Q3 ainda em onboarding.",
      "exp.aws.pm.desc":
        "Programas de especialização de parceiros e iniciativas SMB na LATAM; desenvolvimento estratégico e trabalho cross-funcional.",
      "exp.smartv4.poa.desc":
        "Gestão e desenvolvimento de produto, com foco em branding, implementação e monitoramento de estratégias de marketing e growth.",
      "exp.smartv4.cx.desc":
        "Customer Journey e gestão de relacionamento com clientes, garantindo customer success e qualidade de atendimento.",
      "exp.nucleo.rl.desc":
        "Relacionamento, customer journey e representação da organização junto a empresas parceiras, em Customer Success e Customer Experience.",
      "exp.eppen.dc.desc": "Conselho Deliberativo da Diretoria Executiva 2024.",
      "exp.eppen.pmd.desc":
        "Gestão de projetos e equipes, desenvolvimento estratégico, otimização de processos, planejamento, validação e controle de atividades.",
      "exp.eppen.jc.desc":
        "Consultor júnior na área de Projetos, prestando consultoria de negócios a empresas em Marketing, Estratégia e Processos.",
      "exp.kruzer.jma.desc":
        "Branding, gestão de mídia, design, planejamento estratégico de marketing, SEO, tráfego, ABM, posicionamento digital, email marketing e UI Design.",
      "education.heading": "Formação",
      "edu.unifesp.name": "Universidade Federal de São Paulo",
      "edu.unifesp.subtitle": "Top 10 universidades brasileiras",
      "edu.unifesp.qualification": "Bacharelado em Relações Internacionais",
      "edu.fgv.subtitle": "Na 3ª melhor think tank do mundo fora dos Estados Unidos",
      "edu.fgv.qualification": "Tecnólogo em Processos Gerenciais",
      "edu.lmu.subtitle":
        "Entre os 20 selecionados para a turma internacional na universidade Top 40 Global",
      "edu.lmu.qualification":
        "Summer Program: International Management and Communications",
      "skills.heading": "Áreas de atuação",
      "contact.heading": "Contato",
      "contact.intro":
        "Vamos conversar sobre vendas, estratégia e IA. Fique à vontade para se conectar comigo ou enviar um e-mail."
    },

    en: {
      "nav.about": "About",
      "nav.experience": "Experience",
      "nav.education": "Education",
      "nav.skills": "Areas of expertise",
      "nav.contact": "Contact",
      "hero.ctaPrimary": "Explore my work",
      "hero.ctaSecondary": "Get in touch",
      "certs.label": "Certifications",
      "certs.link": "View all my certifications on Credly (opens in a new tab)",
      "about.heading": "About",
      "about.tagline":
        "I believe in the transformative potential of artificial intelligence to move society forward.",
      "skip": "Skip to content",
      "footer.top": "Back to top",
      "about.summary":
        "I'm Ulysses Galli, a sales and strategy professional based in São Paulo, currently a Sales Executive at Amazon Web Services (AWS) and 3x AWS Certified. My background combines International Relations, Business, and international experiences, a foundation behind a career spanning sales, strategy, product and operations, customer experience, consulting, and marketing. I'm continuously focused on artificial intelligence, customer relationship management, project management, and strategic consulting, connecting business vision, intrapreneurship, and execution through rigor and elegance.",
      "experience.heading": "Experience",
      "period.present": "Present",
      "period.partTime": "(part-time)",
      "exp.aws.sales.desc":
        "Sales executive; 150% revenue quota attainment in Q3 while still onboarding.",
      "exp.aws.pm.desc":
        "Partner specialization programs and SMB initiatives across LATAM; strategic development and cross-functional work.",
      "exp.smartv4.poa.desc":
        "Product management and development, focused on branding and on implementing and monitoring marketing and growth strategies.",
      "exp.smartv4.cx.desc":
        "Customer journey and customer relationship management, ensuring customer success and service quality.",
      "exp.nucleo.rl.desc":
        "Relationship management, customer journey, and representing the organization to partner companies in Customer Success and Customer Experience.",
      "exp.eppen.dc.desc": "Deliberative Council of the 2024 Executive Board.",
      "exp.eppen.pmd.desc":
        "Project and team management, strategic development, process optimization, planning, validation, and control of activities.",
      "exp.eppen.jc.desc":
        "Junior consultant in the Projects area, providing business consulting to companies in Marketing, Strategy, and Processes.",
      "exp.kruzer.jma.desc":
        "Branding, media management, design, strategic marketing planning, SEO, traffic, ABM, digital positioning, email marketing, and UI design.",
      "education.heading": "Education",
      "edu.unifesp.name": "Federal University of São Paulo",
      "edu.unifesp.subtitle": "Consistently a Top 10 Brazilian university",
      "edu.unifesp.qualification": "Bachelor's in International Relations",
      "edu.fgv.subtitle": "At the 3rd-best think tank in the world outside the United States",
      "edu.fgv.qualification": "Technologist in Management Processes",
      "edu.lmu.subtitle":
        "Among the 20 selected for the international cohort at a Top 40 Global university",
      "edu.lmu.qualification":
        "Summer Program: International Management and Communications",
      "skills.heading": "Areas of expertise",
      "contact.heading": "Contact",
      "contact.intro":
        "Let's talk about sales, strategy, and AI. Feel free to connect with me or send an email."
    },

    // REVIEW: Spanish — machine-generated first draft, please review.
    es: {
      "nav.about": "Sobre mí",
      "nav.experience": "Experiencia",
      "nav.education": "Formación",
      "nav.skills": "Áreas de especialización",
      "nav.contact": "Contacto",
      "hero.ctaPrimary": "Explora mi trayectoria",
      "hero.ctaSecondary": "Ponte en contacto",
      "certs.label": "Certificaciones",
      "certs.link": "Ver todas mis certificaciones en Credly (se abre en una nueva pestaña)",
      "about.heading": "Sobre mí",
      "about.tagline":
        "Creo en el potencial transformador de la inteligencia artificial para hacer avanzar a la sociedad.",
      "skip": "Saltar al contenido",
      "footer.top": "Volver arriba",
      "about.summary":
        "Soy Ulysses Galli, profesional de ventas y estrategia basado en São Paulo, actualmente Sales Executive en Amazon Web Services (AWS) y 3x AWS Certified. Mi formación combina Relaciones Internacionales, Administración y experiencias internacionales, base de una trayectoria por ventas, estrategia, producto y operaciones, experiencia del cliente, consultoría y marketing. Me dedico continuamente a la inteligencia artificial, la gestión de relaciones con clientes, la gestión de proyectos y la consultoría estratégica, conectando la visión de negocio, el intraemprendimiento y la ejecución con rigor y elegancia.",
      "experience.heading": "Experiencia",
      "period.present": "Actualidad",
      "period.partTime": "(media jornada)",
      "exp.aws.sales.desc":
        "Ejecutivo de ventas; 150 % de cumplimiento de la cuota de ingresos en el Q3 aún en onboarding.",
      "exp.aws.pm.desc":
        "Programas de especialización de socios e iniciativas SMB en LATAM; desarrollo estratégico y trabajo transversal.",
      "exp.smartv4.poa.desc":
        "Gestión y desarrollo de producto, con foco en branding e implementación y seguimiento de estrategias de marketing y growth.",
      "exp.smartv4.cx.desc":
        "Customer journey y gestión de relaciones con clientes, garantizando customer success y calidad de servicio.",
      "exp.nucleo.rl.desc":
        "Relaciones, customer journey y representación de la organización ante empresas asociadas, en Customer Success y Customer Experience.",
      "exp.eppen.dc.desc": "Consejo Deliberativo de la Junta Ejecutiva 2024.",
      "exp.eppen.pmd.desc":
        "Gestión de proyectos y equipos, desarrollo estratégico, optimización de procesos, planificación, validación y control de actividades.",
      "exp.eppen.jc.desc":
        "Consultor júnior en el área de Proyectos, brindando consultoría de negocios a empresas en Marketing, Estrategia y Procesos.",
      "exp.kruzer.jma.desc":
        "Branding, gestión de medios, diseño, planificación estratégica de marketing, SEO, tráfico, ABM, posicionamiento digital, email marketing y diseño UI.",
      "education.heading": "Formación",
      "edu.unifesp.name": "Universidad Federal de São Paulo",
      "edu.unifesp.subtitle": "Habitualmente entre las 10 mejores universidades de Brasil",
      "edu.unifesp.qualification": "Licenciatura en Relaciones Internacionales",
      "edu.fgv.subtitle": "En el 3.º mejor think tank del mundo fuera de Estados Unidos",
      "edu.fgv.qualification": "Tecnólogo en Procesos de Gestión",
      "edu.lmu.subtitle":
        "Entre los 20 seleccionados para la promoción internacional en una universidad Top 40 global",
      "edu.lmu.qualification":
        "Programa de verano: International Management and Communications",
      "skills.heading": "Áreas de especialización",
      "contact.heading": "Contacto",
      "contact.intro":
        "Hablemos de ventas, estrategia e IA. No dudes en conectar conmigo o enviarme un correo."
    },

    // REVIEW: Chinese (Simplified) — machine-generated first draft, needs
    // review by a fluent speaker, especially job/career terminology.
    zh: {
      "nav.about": "关于",
      "nav.experience": "经历",
      "nav.education": "教育",
      "nav.skills": "专业领域",
      "nav.contact": "联系",
      "hero.ctaPrimary": "了解我的经历",
      "hero.ctaSecondary": "与我联系",
      "certs.label": "认证",
      "certs.link": "在 Credly 查看我的全部认证（在新标签页中打开）",
      "about.heading": "关于",
      "about.tagline": "我相信人工智能拥有推动社会进步的变革潜力。",
      "skip": "跳到主要内容",
      "footer.top": "返回顶部",
      "about.summary":
        "我是 Ulysses Galli，常驻圣保罗的销售与战略专业人士，目前担任亚马逊云科技（AWS）销售主管，并持有三项 AWS 认证。我的背景融合了国际关系、管理学以及多段国际经历，支撑起横跨销售、战略、产品与运营、客户体验、咨询与市场营销的职业经历。我持续专注于人工智能、客户关系管理、项目管理与战略咨询，以严谨而优雅的方式将商业视野、内部创业与执行力相连接。",
      "experience.heading": "经历",
      "period.present": "至今",
      "period.partTime": "（兼职）",
      "exp.aws.sales.desc":
        "销售主管；在入职培训期间即实现第三季度营收配额的 150%。",
      "exp.aws.pm.desc":
        "负责拉美地区的合作伙伴专业化项目与中小企业（SMB）举措；战略发展与跨职能协作。",
      "exp.smartv4.poa.desc":
        "负责产品管理与开发，专注于品牌建设，以及营销与增长策略的实施与监控。",
      "exp.smartv4.cx.desc":
        "客户旅程与客户关系管理，确保客户成功与服务质量。",
      "exp.nucleo.rl.desc":
        "负责在客户成功与客户体验领域的关系管理、客户旅程，以及代表组织对接合作伙伴企业。",
      "exp.eppen.dc.desc": "2024 年执行董事会审议委员会成员。",
      "exp.eppen.pmd.desc":
        "项目与团队管理、战略发展、流程优化、规划、验证与活动管控。",
      "exp.eppen.jc.desc":
        "项目领域的初级顾问，为企业提供市场营销、战略与流程方面的商业咨询。",
      "exp.kruzer.jma.desc":
        "品牌建设、媒体管理、设计、营销战略规划、SEO、流量、ABM、数字定位、电子邮件营销与 UI 设计。",
      "education.heading": "教育",
      "edu.unifesp.name": "圣保罗联邦大学",
      "edu.unifesp.subtitle": "长期位列巴西大学前十",
      "edu.unifesp.qualification": "国际关系学士",
      "edu.fgv.subtitle": "位于美国以外全球排名第三的智库",
      "edu.fgv.qualification": "管理流程技术学位",
      "edu.lmu.subtitle":
        "在全球 Top 40 大学的国际班中入选的 20 人之一",
      "edu.lmu.qualification":
        "暑期项目：国际管理与传播",
      "skills.heading": "专业领域",
      "contact.heading": "联系",
      "contact.intro":
        "欢迎与我交流销售、战略与人工智能的话题。随时与我建立联系或发送邮件。"
    },

    // REVIEW: German — machine-generated first draft, please review.
    de: {
      "nav.about": "Über mich",
      "nav.experience": "Erfahrung",
      "nav.education": "Ausbildung",
      "nav.skills": "Kompetenzbereiche",
      "nav.contact": "Kontakt",
      "hero.ctaPrimary": "Meinen Werdegang entdecken",
      "hero.ctaSecondary": "Kontakt aufnehmen",
      "certs.label": "Zertifizierungen",
      "certs.link": "Alle meine Zertifizierungen auf Credly ansehen (öffnet in neuem Tab)",
      "about.heading": "Über mich",
      "about.tagline":
        "Ich glaube an das transformative Potenzial künstlicher Intelligenz, die Gesellschaft voranzubringen.",
      "skip": "Zum Inhalt springen",
      "footer.top": "Nach oben",
      "about.summary":
        "Ich bin Ulysses Galli, Vertriebs- und Strategieprofi mit Sitz in São Paulo, derzeit Sales Executive bei Amazon Web Services (AWS) und 3x AWS Certified. Mein Hintergrund verbindet Internationale Beziehungen, Betriebswirtschaft und internationale Erfahrungen, die Grundlage für einen Werdegang über Vertrieb, Strategie, Produkt und Operations, Customer Experience, Beratung und Marketing. Ich widme mich kontinuierlich künstlicher Intelligenz, Customer-Relationship-Management, Projektmanagement und strategischer Beratung und verbinde unternehmerische Vision, Intrapreneurship und Umsetzung mit Sorgfalt und Eleganz.",
      "experience.heading": "Erfahrung",
      "period.present": "Heute",
      "period.partTime": "(Teilzeit)",
      "exp.aws.sales.desc":
        "Vertriebsleiter; 150 % Zielerreichung der Umsatzquote im Q3 noch während des Onboardings.",
      "exp.aws.pm.desc":
        "Partner-Spezialisierungsprogramme und SMB-Initiativen in LATAM; strategische Entwicklung und bereichsübergreifende Arbeit.",
      "exp.smartv4.poa.desc":
        "Produktmanagement und -entwicklung mit Fokus auf Branding sowie Umsetzung und Monitoring von Marketing- und Growth-Strategien.",
      "exp.smartv4.cx.desc":
        "Customer Journey und Management der Kundenbeziehungen, mit Sicherstellung von Customer Success und Servicequalität.",
      "exp.nucleo.rl.desc":
        "Beziehungsmanagement, Customer Journey und Vertretung der Organisation gegenüber Partnerunternehmen in Customer Success und Customer Experience.",
      "exp.eppen.dc.desc": "Beirat des Vorstands 2024.",
      "exp.eppen.pmd.desc":
        "Projekt- und Teammanagement, strategische Entwicklung, Prozessoptimierung, Planung, Validierung und Steuerung von Aktivitäten.",
      "exp.eppen.jc.desc":
        "Junior-Berater im Projektbereich, mit Unternehmensberatung in Marketing, Strategie und Prozessen.",
      "exp.kruzer.jma.desc":
        "Branding, Medienmanagement, Design, strategische Marketingplanung, SEO, Traffic, ABM, digitale Positionierung, E-Mail-Marketing und UI-Design.",
      "education.heading": "Ausbildung",
      "edu.unifesp.name": "Bundesuniversität São Paulo",
      "edu.unifesp.subtitle": "Durchgängig unter den Top 10 der brasilianischen Universitäten",
      "edu.unifesp.qualification": "Bachelor in Internationalen Beziehungen",
      "edu.fgv.subtitle": "Am drittbesten Thinktank der Welt außerhalb der USA",
      "edu.fgv.qualification": "Technologe für Managementprozesse",
      "edu.lmu.subtitle":
        "Unter den 20 Ausgewählten des internationalen Jahrgangs an einer Top-40-Universität weltweit",
      "edu.lmu.qualification":
        "Summer Program: International Management and Communications",
      "skills.heading": "Kompetenzbereiche",
      "contact.heading": "Kontakt",
      "contact.intro":
        "Lassen Sie uns über Vertrieb, Strategie und KI sprechen. Vernetzen Sie sich gern mit mir oder senden Sie eine E-Mail."
    },

    // REVIEW: French — machine-generated first draft, please review.
    fr: {
      "nav.about": "À propos",
      "nav.experience": "Expérience",
      "nav.education": "Formation",
      "nav.skills": "Domaines d'expertise",
      "nav.contact": "Contact",
      "hero.ctaPrimary": "Découvrir mon parcours",
      "hero.ctaSecondary": "Me contacter",
      "certs.label": "Certifications",
      "certs.link": "Voir toutes mes certifications sur Credly (s'ouvre dans un nouvel onglet)",
      "about.heading": "À propos",
      "about.tagline":
        "Je crois au potentiel transformateur de l'intelligence artificielle pour faire avancer la société.",
      "skip": "Aller au contenu",
      "footer.top": "Retour en haut",
      "about.summary":
        "Je suis Ulysses Galli, professionnel de la vente et de la stratégie basé à São Paulo, actuellement Sales Executive chez Amazon Web Services (AWS) et 3x AWS Certified. Ma formation associe les Relations internationales, la gestion et des expériences internationales, un socle pour un parcours couvrant la vente, la stratégie, le produit et les opérations, l'expérience client, le conseil et le marketing. Je me consacre en continu à l'intelligence artificielle, à la gestion de la relation client, à la gestion de projet et au conseil stratégique, en reliant vision business, intrapreneuriat et exécution avec rigueur et élégance.",
      "experience.heading": "Expérience",
      "period.present": "Aujourd'hui",
      "period.partTime": "(temps partiel)",
      "exp.aws.sales.desc":
        "Directeur commercial ; 150 % d'atteinte du quota de chiffre d'affaires au T3, encore en phase d'intégration.",
      "exp.aws.pm.desc":
        "Programmes de spécialisation des partenaires et initiatives SMB en Amérique latine ; développement stratégique et travail transverse.",
      "exp.smartv4.poa.desc":
        "Gestion et développement produit, axés sur le branding ainsi que sur la mise en œuvre et le suivi des stratégies de marketing et de croissance.",
      "exp.smartv4.cx.desc":
        "Customer journey et gestion de la relation client, en garantissant le customer success et la qualité de service.",
      "exp.nucleo.rl.desc":
        "Gestion de la relation, customer journey et représentation de l'organisation auprès des entreprises partenaires, en Customer Success et Customer Experience.",
      "exp.eppen.dc.desc": "Conseil délibératif du bureau exécutif 2024.",
      "exp.eppen.pmd.desc":
        "Gestion de projets et d'équipes, développement stratégique, optimisation des processus, planification, validation et contrôle des activités.",
      "exp.eppen.jc.desc":
        "Consultant junior dans le pôle Projets, fournissant du conseil aux entreprises en marketing, stratégie et processus.",
      "exp.kruzer.jma.desc":
        "Branding, gestion des médias, design, planification marketing stratégique, SEO, trafic, ABM, positionnement digital, email marketing et UI design.",
      "education.heading": "Formation",
      "edu.unifesp.name": "Université fédérale de São Paulo",
      "edu.unifesp.subtitle": "Régulièrement dans le Top 10 des universités brésiliennes",
      "edu.unifesp.qualification": "Licence en Relations internationales",
      "edu.fgv.subtitle": "Au 3e meilleur think tank au monde hors États-Unis",
      "edu.fgv.qualification": "Diplôme de technologue en processus de gestion",
      "edu.lmu.subtitle":
        "Parmi les 20 sélectionnés de la promotion internationale d'une université du Top 40 mondial",
      "edu.lmu.qualification":
        "Programme d'été: International Management and Communications",
      "skills.heading": "Domaines d'expertise",
      "contact.heading": "Contact",
      "contact.intro":
        "Parlons vente, stratégie et IA. N'hésitez pas à vous connecter avec moi ou à m'envoyer un e-mail."
    }
  };

  /** The <html> lang value to set per supported language. */
  var HTML_LANG = {
    "pt-BR": "pt-BR",
    en: "en",
    es: "es",
    zh: "zh",
    de: "de",
    fr: "fr"
  };

  function isSupported(lang) {
    return SUPPORTED.indexOf(lang) !== -1;
  }

  /** Apply a language: swap all data-i18n texts, set <html lang> and title. */
  function applyLanguage(lang) {
    if (!isSupported(lang)) {
      lang = DEFAULT_LANG;
    }
    var dict = STRINGS[lang] || STRINGS[DEFAULT_LANG];

    var nodes = document.querySelectorAll("[data-i18n]");
    Array.prototype.forEach.call(nodes, function (node) {
      var key = node.getAttribute("data-i18n");
      if (dict && Object.prototype.hasOwnProperty.call(dict, key)) {
        node.textContent = dict[key];
      }
      // If a key is missing in the chosen language, the node keeps whatever it
      // currently shows — never blanks out, so content is never lost.
    });

    if (document.documentElement) {
      document.documentElement.setAttribute("lang", HTML_LANG[lang] || lang);
    }
    if (TITLES[lang]) {
      document.title = TITLES[lang];
    }

    // Let other scripts (e.g. the word-by-word tagline in main.js) rebuild
    // anything that depended on the text we just replaced.
    try {
      document.dispatchEvent(new CustomEvent("i18n:applied", { detail: { lang: lang } }));
    } catch (err) {
      // Very old browsers without CustomEvent: nothing else to notify.
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (err) {
      // localStorage may be unavailable (private mode); ignore — the choice
      // simply won't persist across visits.
    }
  }

  /**
   * Determine the initial language: a previously stored choice wins; otherwise
   * the site lands in English (DEFAULT_LANG), regardless of browser locale.
   */
  function initialLanguage() {
    try {
      var stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && isSupported(stored)) {
        return stored;
      }
    } catch (err) {
      // ignore storage errors
    }
    return DEFAULT_LANG;
  }

  function init() {
    var select = document.getElementById("lang-select");
    var lang = initialLanguage();

    // Reflect the active language in the selector and apply it.
    if (select) {
      // Only override the default (pt-BR) markup if needed.
      select.value = lang;
      select.addEventListener("change", function () {
        applyLanguage(select.value);
      });
    }

    // pt-BR is already in the HTML; applying it is a harmless no-op that also
    // sets the title and persists the choice. For any other language, this
    // performs the swap.
    applyLanguage(lang);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
