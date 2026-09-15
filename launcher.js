(() => {
  const gamePath = '/play/';
  const authOrPurchaseKeys = [
    'code',
    'token_hash',
    'type',
    'error',
    'error_code',
    'error_description',
    'purchase',
    'session_id',
    'authreset',
  ];
  const incoming = new URL(window.location.href);
  const isAppReturn =
    authOrPurchaseKeys.some((key) => incoming.searchParams.has(key)) ||
    /(?:^|[&#])(access_token|refresh_token|error)=/.test(incoming.hash);

  // Supabase and the payment provider historically return to the site root.
  // Preserve those callbacks while the marketing launcher owns `/`.
  if (isAppReturn) {
    window.location.replace(`${gamePath}${incoming.search}${incoming.hash}`);
    return;
  }

  // Retire the old root-scoped game worker. The game now owns only /play/;
  // leaving the old worker active can replace this launcher with a cached
  // Expo shell on returning phones.
  if ('serviceWorker' in navigator) {
    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      const rootScope = `${window.location.origin}/`;
      for (const registration of registrations) {
        if (registration.scope === rootScope) void registration.unregister();
      }
    }).catch(() => {});
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const status = document.querySelector('.launch-status');
  const launchLinks = Array.from(document.querySelectorAll('[data-launch-game]'));

  document.querySelectorAll('[data-current-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  const openGame = (href, { immediate = false } = {}) => {
    if (document.querySelector('iframe.game-frame')) return;

    // Opened during the Play tap. allow=autoplay delegates that gesture into
    // /play/ so team-select music can start there — never on this landing page.
    const frame = document.createElement('iframe');
    frame.className = 'game-frame';
    frame.setAttribute('allow', 'autoplay; fullscreen');
    frame.setAttribute('title', 'Gridiron Roll');
    frame.src = href;
    document.body.appendChild(frame);

    const reveal = () => {
      document.body.classList.add('is-in-game');
      try {
        frame.contentWindow?.focus();
      } catch {
        frame.focus();
      }
    };

    if (immediate) {
      reveal();
    } else {
      window.setTimeout(reveal, 920);
    }
  };

  window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data?.type !== 'dfc-return-home') return;
    document.querySelectorAll('iframe.game-frame').forEach((node) => node.remove());
    document.body.classList.remove('is-launching', 'is-in-game');
    launchLinks.forEach((item) => item.removeAttribute('aria-disabled'));
    if (status) status.textContent = '';
  });

  launchLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      event.preventDefault();
      if (document.body.classList.contains('is-launching') || document.body.classList.contains('is-in-game')) {
        return;
      }

      launchLinks.forEach((item) => item.setAttribute('aria-disabled', 'true'));
      if (status) status.textContent = 'Opening Gridiron Roll.';

      if (reducedMotion.matches) {
        openGame(link.href, { immediate: true });
        return;
      }

      document.body.classList.add('is-launching');
      openGame(link.href);
    });
  });
})();
