// Service worker registration + "Install App" prompt
(function () {
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", function () {
            navigator.serviceWorker.register("./service-worker.js")
                .then(function () { console.log("THEOS app: service worker ready"); })
                .catch(function (err) { console.error("Service worker failed:", err); });
        });
    }

    var banner = document.getElementById("install-banner");
    var installBtn = document.getElementById("install-btn");
    var closeBtn = document.getElementById("install-close");
    var iosTip = document.getElementById("install-ios-tip");
    if (!banner) return;

    var isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    var dismissed = false;
    try { dismissed = localStorage.getItem("theos_install_dismissed") === "1"; } catch (e) {}
    if (isStandalone || dismissed) return;

    var deferredPrompt = null;

    window.addEventListener("beforeinstallprompt", function (e) {
        e.preventDefault();
        deferredPrompt = e;
        banner.style.display = "flex";
    });

    installBtn.addEventListener("click", function () {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function () {
            deferredPrompt = null;
            banner.style.display = "none";
        });
    });

    window.addEventListener("appinstalled", function () {
        banner.style.display = "none";
    });

    var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIOS) {
        installBtn.style.display = "none";
        iosTip.style.display = "block";
        banner.style.display = "flex";
    }

    closeBtn.addEventListener("click", function () {
        banner.style.display = "none";
        try { localStorage.setItem("theos_install_dismissed", "1"); } catch (e) {}
    });
})();