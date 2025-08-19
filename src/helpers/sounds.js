export const playGlassCrack = () => {
  const audio = new Audio("../../glass_crack.mp3");
  audio.playbackRate = 1.5;
  audio.play();
};

export const playTap = () => {
  const audio = new Audio("../../tap.mp3");
  audio.currentTime = 0.33;
  audio.volume = 0.5;
  audio.playbackRate = 2;
  audio.play();
};

export const playDrone = () => {
  const audio = new Audio("../../mystery-drone.mp3");
  audio.volume = 0.2;
  audio.play();

  // when the audio gets to 11sec, loop it
  audio.addEventListener("timeupdate", () => {
    if (audio.currentTime > 9) {
      audio.currentTime = 1;
    }
  });
};

export const playScan = () => {
  const audio = new Audio("../../scanning.mp3");
  audio.volume = 0.2;
  audio.play();

  return audio;
};

export const playSuccess = () => {
  const audio = new Audio("../../success.mp3");
  audio.volume = 0.2;
  audio.playbackRate = 1.9;
  audio.play();
};

export const playRolling = () => {
  const audio = new Audio("../../rolling.mp3");
  audio.volume = 0.2;
  audio.play();

  return audio;
};

export const playSlider = () => {
  const audio = new Audio("../../slider.mp3");
  audio.volume = 0.2;
  audio.playbackRate = 2;
  audio.play();

  audio.currentTime = 0.2;
  audio.addEventListener("timeupdate", () => {
    if (audio.currentTime > 0.5) {
      audio.pause();
    }
  });

  return audio;
};

export const playSuccessPlop = () => {
  const audio = new Audio("../../success-plop.mp3");
  audio.volume = 0.2;
  audio.play();
};

export const playSuccessPickup = () => {
  const audio = new Audio("../../success-plop.mp3");
  audio.volume = 0.1;
  audio.playbackRate = 3;

  audio.addEventListener("timeupdate", () => {
    if (audio.currentTime > 0.001) {
      audio.pause();
    }
  });

  audio.play();
};

export const playCorruption = () => {
  const audio1 = new Audio("../../rolling.mp3");
  audio1.volume = 0.1;
  audio1.playbackRate = 0.1;
  audio1.loop = true;

  const audio2 = new Audio("../../scanning.mp3");
  audio2.volume = 0.05;
  audio2.playbackRate = 0.1;
  audio2.loop = true;

  audio1.play();
  audio2.play();

  const stop = () => {
    audio1.pause();
    audio2.pause();
  };

  let fadeOutInterval = null;

  const fadeOut = () => {
    if (fadeOutInterval) {
      clearInterval(fadeOutInterval);
      fadeOutInterval = null;
    }

    const bothSilent = audio1.volume <= 0.01 && audio2.volume <= 0.01;
    if (bothSilent) {
      audio1.pause();
      audio2.pause();
      return;
    }

    fadeOutInterval = setInterval(() => {
      audio1.volume = Math.max(0, audio1.volume - 0.01);
      audio2.volume = Math.max(0, audio2.volume - 0.01);

      const done = audio1.volume <= 0.001 && audio2.volume <= 0.001;
      if (done) {
        clearInterval(fadeOutInterval);
        fadeOutInterval = null;
        audio1.pause();
        audio2.pause();
      }
    }, 100);
  };

  return { audio1, audio2, stop, fadeOut };
};

export const playKeypad = () => {
  const audio = new Audio("../../tap-confirm.mp3");
  audio.volume = 0.2;
  audio.play();

  audio.addEventListener("timeupdate", () => {
    if (audio.currentTime > 0.5) {
      audio.pause();
    }
  });

  return audio;
};

export const playError = () => {
  const audio = new Audio("../../error.mp3");
  audio.volume = 0.2;
  audio.play();
};