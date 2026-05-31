const startBtn = document.getElementById("startBtn");
const settingsScreen = document.getElementById("settingsScreen");

const frequency = document.getElementById("frequency");
const videoType = document.getElementById("videoType");

const feed = document.getElementById("feed");
const breakScreen = document.getElementById("breakScreen");
const calmVideo = document.getElementById("calmVideo");

const countdown = document.getElementById("countdown");
const homeScreen = document.getElementById("homeScreen");

const soundBtn = document.getElementById("soundBtn");

let soundOn = false;
let activeVideo = null;
let interventionTimeout;
let interventionActive = false;

/* =====================================
   SOUND BUTTON
===================================== */

soundBtn.addEventListener("click", () => {

    soundOn = !soundOn;

    soundBtn.textContent =
        soundOn ? "🔊 Sound On" : "🔇 Sound Off";

    if (interventionActive) {

        // Intervention currently showing
        calmVideo.muted = !soundOn;

    } else {

        // Feed currently showing
        if (activeVideo) {
            activeVideo.muted = !soundOn;
        }

    }

});

/* =====================================
   START EXPERIENCE
===================================== */

startBtn.addEventListener("click", () => {

    settingsScreen.classList.add("hidden");
    feed.classList.remove("hidden");

    initFeed();

    interventionTimeout = setTimeout(() => {

        showIntervention();

    }, Number(frequency.value));

});

/* =====================================
   FEED INITIALIZATION
   - Autoplay videos
   - Active video detection
   - Infinite scrolling
===================================== */

function initFeed() {

    const videos =
        document.querySelectorAll(".feed-video");

    videos.forEach(video => {

        video.play().catch(() => {});
        video.muted = true;

    });

    const videoHeight =
        videos[0].offsetHeight;

    /*
      Start in the duplicated section
      so scrolling feels infinite.
    */
    feed.scrollTop = videoHeight * 8;

    activeVideo = videos[8];

    if (soundOn) {
        activeVideo.muted = false;
    }

    feed.addEventListener("scroll", () => {

        const currentIndex =
            Math.round(feed.scrollTop / videoHeight);

        /* ======================
           INFINITE LOOP LOGIC
        ====================== */

        if (currentIndex <= 1) {

            feed.scrollTop =
                videoHeight * (8 + currentIndex);

        }

        if (currentIndex >= 14) {

            feed.scrollTop =
                videoHeight * (currentIndex - 8);

        }

        /* ======================
           FIND VISIBLE VIDEO
        ====================== */

        let closest = null;
        let minDist = Infinity;

        videos.forEach(video => {

            const rect =
                video.getBoundingClientRect();

            const dist =
                Math.abs(rect.top);

            if (dist < minDist) {

                minDist = dist;
                closest = video;

            }

        });

        activeVideo = closest;

        /* Mute all videos */

        videos.forEach(v => {
            v.muted = true;
        });

        /* Unmute current video if sound enabled */

        if (activeVideo) {

            activeVideo.muted = !soundOn;

            activeVideo.play().catch(() => {});

        }

    });

}

/* =====================================
   SHOW INTERVENTION
===================================== */

function showIntervention() {

    interventionActive = true;

    const feedVideos =
        document.querySelectorAll(".feed-video");

    /* Stop all TikTok videos */

    feedVideos.forEach(video => {

        video.pause();
        video.muted = true;

    });

    /* Load intervention video */

    calmVideo.pause();
    calmVideo.currentTime = 0;

    calmVideo.src = videoType.value;

    calmVideo.load();

    /* Intervention gets audio */

    calmVideo.muted = !soundOn;

    breakScreen.classList.remove("hidden");

    calmVideo.play().catch(error => {
        console.log("Intervention video play error:", error);
    });

    let timeLeft = 30;

    countdown.textContent = timeLeft;

    const timer = setInterval(() => {

        timeLeft--;

        countdown.textContent = timeLeft;

        if (timeLeft <= 0) {

            clearInterval(timer);

            endIntervention();

        }

    }, 1000);

}

/* =====================================
   END INTERVENTION
===================================== */

function endIntervention() {

    interventionActive = false;

    calmVideo.pause();
    calmVideo.currentTime = 0;

    breakScreen.classList.add("hidden");

    feed.classList.add("hidden");

    homeScreen.classList.remove("hidden");

}

/* =====================================
   OPTIONAL:
   Prevent browser from pausing videos
   when user returns to tab
===================================== */

document.addEventListener("visibilitychange", () => {

    if (document.hidden) return;

    if (!interventionActive && activeVideo) {

        activeVideo.play().catch(() => {});

    }

});