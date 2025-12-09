// startup screen component
export class StartupManager {
    constructor() {
        this.startupScreen = document.getElementById('win95-startup');
        this.progressBar = document.getElementById('win95-progress');
        this.statusText = document.getElementById('win95-status');
        this.appContainer = document.querySelector('.app-container');

        // load Windows 95 startup sound
        this.startupSound = new Audio('./resources/sounds/windows95_startup.mp3');
        this.startupSound.volume = 0.5; // Adjust as needed

        // startup messages
        this.statusMessages = [
            "Starting Windows 95...",
            "Loading system components...",
            "Preparing Personal Finance System...",
            "Initializing database...",
            "Ready"
        ];

        // adjust sound duration as needed
        // windows 95 startup sound is approximately 6 seconds
        this.soundDuration = 6000;
        this.messageInterval = this.soundDuration / this.statusMessages.length;
    }

    async start() {
        // initial state: hidden
        this.startupScreen.style.opacity = '0';
        this.startupScreen.style.display = 'flex';
        this.appContainer.style.display = 'none';
        
        // wait 1 second before starting fade in
        await new Promise(r => setTimeout(r, 1000));

        // fade in
        this.startupScreen.style.transition = 'opacity 1s ease-in';
        this.startupScreen.style.opacity = '1';
        
        // wait for fade in to complete
        await new Promise(r => setTimeout(r, 1000));

        // clean up inline styles so CSS classes can work later for fade-out
        this.startupScreen.style.transition = '';
        this.startupScreen.style.opacity = '';
        
        return new Promise((resolve) => {
            this.animateStartup(resolve);
        });
    }

    animateStartup(resolve) {
        // for progress bar
        let currentStep = 0;
        const totalSteps = this.statusMessages.length;

        // play sound
        this.playStartupSound();

         const interval = setInterval(() => {
            // update status text
            this.statusText.textContent = this.statusMessages[currentStep];
            
            // update progress bar
            const progress = ((currentStep + 1) / totalSteps) * 100;
            this.progressBar.style.width = `${progress}%`;
            
            currentStep++;
            
            // completed
            if (currentStep >= totalSteps) {
                clearInterval(interval);
                
                // small delay so sound can finish
                setTimeout(() => {
                    this.finishStartup(resolve);
                }, 500);
            }
        }, this.messageInterval);
    }

    playStartupSound() {
        try {
            this.startupSound.currentTime = 0; // reset if already played
            const playPromise = this.startupSound.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Autoplay prevented. User interaction required for sound:", error);
                });
            }
            
            // handle playback errors
            this.startupSound.onerror = (e) => {
                console.log("Error playing sound:", e);
            };
        } catch (error) {
            console.log("Failed to play startup sound:", error);
        }
    }

    finishStartup(resolve) {
        // fade out effect on startup screen
        this.startupScreen.classList.add('fade-out');
        
        // wait for the transition to end
        setTimeout(() => {
            // hide startup screen
            this.startupScreen.style.display = 'none';
            
            // show main application
            this.appContainer.style.display = 'flex';
            
            // stop the sound just in case
            this.startupSound.pause();
            this.startupSound.currentTime = 0;
            
            resolve();
        }, 800);
    }

    // method to skip startup (if needed)
    skipStartup() {
        this.startupScreen.style.display = 'none';
        this.appContainer.style.display = 'flex';
        this.startupSound.pause();
        this.startupSound.currentTime = 0;
    }
}