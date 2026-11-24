(function () {
  var config = window.SITE_CONFIG || {};
  var placeholder = "YOUR-USERNAME";

  function trimSlash(value) {
    return String(value || "").replace(/\/+$/, "");
  }

  function inferredSiteUrl() {
    return window.location.origin;
  }

  var configured = trimSlash(config.siteUrl);
  var siteUrl =
    configured && configured.indexOf(placeholder) === -1
      ? configured
      : trimSlash(inferredSiteUrl());

  var pageUrl = trimSlash(window.location.href.split("#")[0].replace(/index\.html$/, ""));
  if (!pageUrl.endsWith("/")) {
    pageUrl += "/";
  }

  var shareUrl = siteUrl + "/";
  var ogImage = siteUrl + "/assets/images/og-image.svg";

  window.SITE_URLS = {
    siteUrl: siteUrl,
    pageUrl: pageUrl,
    shareUrl: shareUrl
  };

  function setAttr(selector, attr, value) {
    var el = document.querySelector(selector);
    if (el) {
      el.setAttribute(attr, value);
    }
  }

  setAttr('link[rel="canonical"]', "href", pageUrl);
  setAttr('meta[property="og:url"]', "content", pageUrl);
  setAttr('meta[property="og:image"]', "content", ogImage);

  var ld = document.querySelector('script[type="application/ld+json"]');
  if (ld) {
    try {
      var data = JSON.parse(ld.textContent);
      data.url = shareUrl;
      ld.textContent = JSON.stringify(data);
    } catch (error) {
      // Leave the original JSON-LD in place if it cannot be parsed.
    }
  }

  function applyVisibleUrl() {
    document.querySelectorAll("[data-site-url]").forEach(function (field) {
      if (field.tagName === "INPUT" || field.tagName === "TEXTAREA") {
        field.value = shareUrl;
      } else {
        field.textContent = shareUrl;
      }
    });

    document.querySelectorAll("[data-site-url-link]").forEach(function (link) {
      link.setAttribute("href", shareUrl);
      if (!link.textContent.trim() || link.getAttribute("data-site-url-link") === "text") {
        link.textContent = shareUrl;
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyVisibleUrl);
  } else {
    applyVisibleUrl();
  }
})();
