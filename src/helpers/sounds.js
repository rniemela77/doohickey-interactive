export const playGlassCrack = () => {
    const audio = new Audio('../../glass_crack.mp3');
    audio.playbackRate = 1.5;
    audio.play();
}

export const playTap = () => {
    const audio = new Audio('../../tap.mp3');
    audio.currentTime = 0.33;
    audio.volume = 0.5;
    audio.playbackRate = 2;
    audio.play();
}

export const playDrone = () => {
    const audio = new Audio('../../mystery-drone.mp3');
    audio.volume = 0.2;
    audio.play();

    // when the audio gets to 11sec, loop it
    audio.addEventListener('timeupdate', () => {
        if (audio.currentTime > 9) {
            audio.currentTime = 1;
        }
    });
}