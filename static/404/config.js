// 404 Page Configuration File
const Config404 = {
  // Default language settings
  defaultLanguage: "en", // English only
    
    // Multilingual copy (English only)
    i18n: {
      en: {
        pageTitle: "404 - Page Not Found",
        title: "404",
        subtitle: "Oops! You've arrived at an unknown planet.",
        desktopDescription: "The page you're looking for doesn't exist. Try the sidebar tools or search.",
        mobileDescription: "The page doesn't exist. Try Google search.",
        searchButtonText: "Search on Google",
        searchButtonUrl: "https://www.google.com/",
        sidebarItems: [
          { name: "Todo List", url: "https://Excalibra.github.io/todo" },
          { name: "Pomodoro Timer", url: "https://Excalibra.github.io/shigure" },
          { name: "Image Compressor", url: "https://squoosh-neon.vercel.app" },
          { name: "File Renamer", url: "https://Excalibra.github.io/rename" },
          { name: "Network Calculator", url: "https://Excalibra.github.io/network-calculator" },
          { name: "Calendar", url: "https://Excalibra.github.io/calendar" }
        ]
      }
    },
    
    // Social links configuration
    social: [
      {
        name: "Blog",
        iconId: "icon-blog",
        iconClass: "social-icon--blog",
        url: "/",
        title: "Blog"
      },
      {
        name: "Twitter",
        iconId: "icon-twitter",
        iconClass: "social-icon--twitter",
        url: "https://twitter.com/Excalibra",
        title: "Twitter"
      },
      {
        name: "GitHub",
        iconId: "icon-github",
        iconClass: "social-icon--github",
        url: "https://github.com/Excalibra",
        title: "GitHub"
      },
      {
        name: "Email",
        iconId: "icon-email",
        iconClass: "social-icon--email",
        url: "mailto:x.calibra@outlook.com",
        title: "Email"
      }
    ],
    
    // Sidebar configuration
    sidebar: {
      defaultOpen: false
    }
};
