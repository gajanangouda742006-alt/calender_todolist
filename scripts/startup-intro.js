let startupIntroStarted = false;

function startStartupIntro() {
  if (startupIntroStarted) return;
  startupIntroStarted = true;

  const intro = document.getElementById('app-startup-intro');
  const video = intro?.querySelector('video');
  const appFrame = document.querySelector('.mobile-frame');
  if (!intro || !video) {
    intro?.remove();
    return;
  }

  intro.hidden = false;
  video.muted = true;
  video.playsInline = true;

  let exiting = false;
  let removed = false;
  let playbackTimeout;
  let exitTimeout;
  const removeIntro = () => {
    if (removed) return;
    removed = true;
    window.clearTimeout(exitTimeout);
    intro.removeEventListener('transitionend', onExitTransitionEnd);
    appFrame?.removeEventListener('animationend', onExitAnimationEnd);
    appFrame?.classList.remove('startup-app-revealing');
    intro.remove();
  };
  const finish = () => {
    if (exiting) return;
    exiting = true;
    window.clearTimeout(playbackTimeout);
    video.removeEventListener('ended', finish);
    video.removeEventListener('error', onError);
    video.removeEventListener('playing', onPlaying);
    video.removeEventListener('loadeddata', onLoadedData);
    video.pause();
    intro.addEventListener('transitionend', onExitTransitionEnd);
    appFrame?.addEventListener('animationend', onExitAnimationEnd);
    appFrame?.classList.add('startup-app-revealing');
    intro.classList.add('is-exiting');
    exitTimeout = window.setTimeout(removeIntro, 800);
  };
  const onExitTransitionEnd = (event) => {
    if (event.target === intro && event.propertyName === 'opacity') removeIntro();
  };
  const onExitAnimationEnd = (event) => {
    if (event.target !== appFrame || event.animationName !== 'startup-app-reveal') return;
    appFrame?.classList.remove('startup-app-revealing');
  };
  const onError = () => {
    console.warn('Startup intro could not be loaded; continuing into the app.', video.error);
    finish();
  };
  const onPlaying = () => intro.classList.add('is-playing');
  const onLoadedData = () => intro.classList.add('is-playing');

  video.addEventListener('ended', finish);
  video.addEventListener('error', onError);
  video.addEventListener('playing', onPlaying);
  video.addEventListener('loadeddata', onLoadedData);
  playbackTimeout = window.setTimeout(() => {
    console.warn('Startup intro timed out; continuing into the app.');
    finish();
  }, 12000);

  try {
    const playback = video.play();
    if (playback && typeof playback.catch === 'function') playback.catch((error) => {
      console.warn('Startup intro autoplay failed; continuing into the app.', error);
      finish();
    });
  } catch (error) {
    console.warn('Startup intro playback failed; continuing into the app.', error);
    finish();
  }
}

startStartupIntro();
