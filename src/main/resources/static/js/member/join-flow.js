(() => {
  const createBtn = document.querySelector('.primary-btn');
  const loginBtn = document.querySelector('.secondary-btn');
  const root = document.getElementById('flowModalRoot');
  const frame = document.getElementById('flowModalFrame');

  if (!createBtn || !loginBtn || !root || !frame) return;

  const JOIN_FLOW = [
    'join-modal.html',
    'join-modal-code.html',
    'join-modal-password.html',
    'join-modal-business-regist.html',
    'join-modal-profile-img.html',
    'join-modal-user-name.html',
    'join-modal-notification.html',
    'join-modal-language.html',
    'join-modal-category.html',
    'login-follow-modal.html'
  ];

  const LOGIN_FLOW = [
    'login-modal.html',
    'login-auth-modal.html',
    'login-code-modal.html',
    'login-password-modal.html'
  ];

  let activeFlow = '';
  let activeSteps = [];
  let index = 0;
  let forceJoinMode = null;
  let joinContactMode = 'phone';

  const openHost = () => {
    root.classList.remove('is-hidden');
    root.setAttribute('aria-hidden', 'false');
  };

  const closeHost = () => {
    root.classList.add('is-hidden');
    root.setAttribute('aria-hidden', 'true');
    frame.src = 'about:blank';
    activeFlow = '';
    activeSteps = [];
    index = 0;
  };

  const loadIndex = (nextIndex) => {
    if (nextIndex < 0 || nextIndex >= activeSteps.length) {
      closeHost();
      return;
    }

    index = nextIndex;
    frame.src = activeSteps[index];
  };

  const goNext = () => loadIndex(index + 1);

  const goTo = (file) => {
    const nextIndex = activeSteps.indexOf(file);
    if (nextIndex === -1) {
      frame.src = file;
      return;
    }
    loadIndex(nextIndex);
  };

  const bindClose = (doc) => {
    const closeSelectors = [
      '.join-modal-header-close-button',
      '.join-modal-close',
      '.login-close',
      '.auth-close',
      '.code-close',
      '.account-close',
      '.np-close',
      '.close-btn',
      '#closeFollowModal'
    ];

    doc.querySelectorAll(closeSelectors.join(', ')).forEach((btn) => {
      btn.addEventListener('click', closeHost);
    });
  };

  const useSingleOverlay = (doc) => {
    if (!doc?.head) return;

    const style = doc.createElement('style');
    style.setAttribute('data-flow-single-overlay', 'true');
    style.textContent = `
      .join-modal-all,
      .modal-mask,
      .overlay,
      .login-overlay,
      .auth-overlay,
      .code-overlay,
      .account-overlay,
      #npOverlay,
      #followOverlay {
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
    `;
    doc.head.appendChild(style);
  };

  const applyLoginOnlyScale = (doc) => {
    if (!doc?.body) return;

    if (activeFlow === 'login') {
      doc.body.style.zoom = '0.8';
    } else {
      doc.body.style.zoom = '';
    }
  };

  const bindJoin = (doc, file) => {
    if (file === 'join-modal.html') {
      if (forceJoinMode) {
        const currentLabel = doc.querySelector('.phone-text-in')?.textContent?.trim() || '';
        const isPhoneMode = currentLabel.includes('휴대폰');
        const needsEmail = forceJoinMode === 'email';
        const needsPhone = forceJoinMode === 'phone';

        if ((needsEmail && isPhoneMode) || (needsPhone && !isPhoneMode)) {
          doc.querySelector('.change')?.click();
        }
        forceJoinMode = null;
      }

      doc.querySelector('.next-button')?.addEventListener('click', () => {
        const phoneLabel = doc.querySelector('.phone-text-in')?.textContent?.trim() || '';
        if (phoneLabel.includes('휴대폰')) {
          joinContactMode = 'phone';
          frame.src = 'join-modal-phone.html';
        } else {
          joinContactMode = 'email';
          goTo('join-modal-code.html');
        }
      });
      return;
    }

    if (file === 'join-modal-phone.html') {
      doc.querySelector('.btn-confirm')?.addEventListener('click', () => goTo('join-modal-code.html'));
      doc.querySelector('.btn-edit')?.addEventListener('click', () => goTo('join-modal.html'));
      return;
    }

    if (file === 'join-modal-notification.html') {
      doc.querySelectorAll('.notification-btn, .js-bounce-btn').forEach((btn) => {
        btn.addEventListener('click', goNext);
      });
      return;
    }

    if (file === 'join-modal-profile-img.html') {
      doc.querySelector('.ghost-button')?.addEventListener('click', goNext);
      return;
    }

    if (file === 'login-follow-modal.html') {
      doc.getElementById('nextBtn')?.addEventListener('click', closeHost);
      return;
    }

    doc.querySelector('.next-button')?.addEventListener('click', goNext);
    if (file === 'join-modal-password.html') {
      const changeBtn = doc.querySelector('.change');
      if (changeBtn) {
        const switchText = joinContactMode === 'email' ? '대신 휴대폰 사용하기' : '대신 이메일 사용하기';
        const textNode = changeBtn.querySelector('.replace-email, .replace-phone');
        if (textNode) {
          textNode.textContent = switchText;
        } else {
          changeBtn.textContent = switchText;
        }
      }

      doc.querySelector('.change')?.addEventListener('click', (event) => {
        event.preventDefault();
        forceJoinMode = joinContactMode === 'email' ? 'phone' : 'email';
        goTo('join-modal.html');
      });
    }
  };

  const bindLogin = (doc, file) => {
    if (file === 'login-modal.html') {
      doc.getElementById('nextBtn')?.addEventListener('click', () => {
        const identityInput = doc.getElementById('loginIdentity');
        const rawValue = (identityInput?.value || '').trim();
        const digits = rawValue.replace(/\D/g, '');
        const isPhone = digits.length >= 10 && !rawValue.includes('@');

        window.sessionStorage.setItem('loginIdentityMode', isPhone ? 'phone' : 'email');
        goTo('login-auth-modal.html');
      });
      doc.querySelector('.btn-secondary')?.addEventListener('click', (event) => {
        event.preventDefault();
        frame.src = 'login-account-modal.html';
      });
      doc.querySelector('.signup-text a')?.addEventListener('click', (event) => {
        event.preventDefault();
        activeFlow = 'join';
        activeSteps = JOIN_FLOW;
        loadIndex(0);
      });
      return;
    }

    if (file === 'login-auth-modal.html') {
      doc.getElementById('authNextBtn')?.addEventListener('click', () => goTo('login-code-modal.html'));
      doc.getElementById('authCancelBtn')?.addEventListener('click', closeHost);
      return;
    }

    if (file === 'login-code-modal.html') {
      doc.getElementById('codeActionBtn')?.addEventListener('click', () => {
        const actionBtn = doc.getElementById('codeActionBtn');
        if (actionBtn?.classList.contains('is-primary')) {
          goTo('login-password-modal.html');
        } else {
          goTo('login-auth-modal.html');
        }
      });
      return;
    }

    if (file === 'login-password-modal.html') {
      doc.querySelector('.find-password')?.addEventListener('click', (event) => {
        event.preventDefault();
        frame.src = 'login-account-modal.html';
      });

      doc.querySelector('.signup-text a')?.addEventListener('click', (event) => {
        event.preventDefault();
        activeFlow = 'join';
        activeSteps = JOIN_FLOW;
        loadIndex(0);
      });

      doc.getElementById('loginBtn')?.addEventListener('click', closeHost);
      return;
    }

    if (file === 'login-account-modal.html') {
      doc.getElementById('accountNextBtn')?.addEventListener('click', () => {
        frame.src = 'login-new-password.html';
      });
      return;
    }

    if (file === 'login-new-password.html') {
      doc.getElementById('npSubmit')?.addEventListener('click', () => {
        const submit = doc.getElementById('npSubmit');
        if (submit?.classList.contains('is-enabled')) {
          closeHost();
        }
      });
    }
  };

  frame.addEventListener('load', () => {
    const doc = frame.contentDocument;
    if (!doc) return;

    useSingleOverlay(doc);
    applyLoginOnlyScale(doc);
    bindClose(doc);

    const file = (frame.src.split('/').pop() || '').split('?')[0];
    if (activeFlow === 'join') {
      bindJoin(doc, file);
      return;
    }

    if (activeFlow === 'login') {
      bindLogin(doc, file);
    }
  });

  createBtn.addEventListener('click', (event) => {
    event.preventDefault();
    activeFlow = 'join';
    activeSteps = JOIN_FLOW;
    openHost();
    loadIndex(0);
  });

  loginBtn.addEventListener('click', (event) => {
    event.preventDefault();
    activeFlow = 'login';
    activeSteps = LOGIN_FLOW;
    openHost();
    loadIndex(0);
  });

  root.addEventListener('click', (event) => {
    if (event.target === root) {
      closeHost();
    }
  });
})();
