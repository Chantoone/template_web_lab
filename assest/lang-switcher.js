(function () {
  const STORAGE_KEY = "nits-language";
  const currentLang = document.documentElement.lang?.toLowerCase().startsWith("en") ? "en" : "vi";
  const switcher = document.querySelector("[data-lang-switcher]");

  if (!switcher) {
    return;
  }

  const getHref = (lang) => switcher.dataset[lang === "en" ? "enHref" : "viHref"];
  const withCurrentHash = (href) => {
    if (!href || href.includes("#") || !window.location.hash) {
      return href;
    }

    return `${href}${window.location.hash}`;
  };

  try {
    const savedLang = localStorage.getItem(STORAGE_KEY);
    const savedHref = getHref(savedLang);

    if ((savedLang === "en" || savedLang === "vi") && savedLang !== currentLang && savedHref) {
      window.location.replace(withCurrentHash(savedHref));
      return;
    }

    localStorage.setItem(STORAGE_KEY, currentLang);
  } catch (error) {
    // localStorage can be unavailable in strict privacy contexts.
  }

  switcher.addEventListener("click", () => {
    const nextLang = currentLang === "en" ? "vi" : "en";
    const nextHref = getHref(nextLang);

    try {
      localStorage.setItem(STORAGE_KEY, nextLang);
    } catch (error) {
      // Navigation should still work even if persistence is blocked.
    }

    if (nextHref) {
      window.location.href = withCurrentHash(nextHref);
    }
  });
})();
