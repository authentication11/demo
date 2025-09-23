// PWA Installation and Service Worker Registration
// This script handles PWA functionality without interfering with existing logic

(function() {
    'use strict';

    // Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('✅ Service Worker registered successfully:', registration.scope);
                    
                    // Handle service worker updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    console.log('🔄 New service worker available');
                                    // Optionally notify user about update
                                }
                            });
                        }
                    });
                })
                .catch((error) => {
                    console.error('❌ Service Worker registration failed:', error);
                });
        });
    }

    // PWA Install Prompt Handling
    let deferredPrompt;
    let installButton;

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('💡 PWA install prompt available');
        
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        
        // Stash the event so it can be triggered later
        deferredPrompt = e;
        
        // Show install button if it exists
        showInstallButton();
    });

    // Handle successful PWA installation
    window.addEventListener('appinstalled', (e) => {
        console.log('🎉 PWA was installed successfully');
        
        // Hide install button
        hideInstallButton();
        
        // Clear the deferredPrompt
        deferredPrompt = null;
        
        // Optional: Track installation analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'pwa_install', {
                event_category: 'PWA',
                event_label: 'App Installed'
            });
        }
    });

    // Function to show install button
    function showInstallButton() {
        installButton = document.getElementById('pwa-install-btn');
        if (installButton) {
            installButton.style.display = 'block';
            installButton.addEventListener('click', handleInstallClick);
        } else {
            // Create a floating install button if none exists
            createFloatingInstallButton();
        }
    }

    // Function to hide install button
    function hideInstallButton() {
        if (installButton) {
            installButton.style.display = 'none';
        }
    }

    // Handle install button click
    function handleInstallClick() {
        if (deferredPrompt) {
            // Show the install prompt
            deferredPrompt.prompt();
            
            // Wait for the user to respond to the prompt
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('✅ User accepted the PWA install prompt');
                } else {
                    console.log('❌ User dismissed the PWA install prompt');
                }
                deferredPrompt = null;
            });
        }
    }

    // Create floating install button
    function createFloatingInstallButton() {
        // Only create if we're not already in standalone mode
        if (!window.matchMedia('(display-mode: standalone)').matches && 
            !window.navigator.standalone) {
            
            const button = document.createElement('button');
            button.id = 'pwa-install-btn';
            button.innerHTML = '📱 Install App';
            button.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #0f172a;
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 25px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                z-index: 1000;
                box-shadow: 0 4px 15px rgba(15, 23, 42, 0.3);
                transition: all 0.3s ease;
                display: none;
            `;
            
            // Add hover effects
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px)';
                button.style.boxShadow = '0 6px 20px rgba(15, 23, 42, 0.4)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0)';
                button.style.boxShadow = '0 4px 15px rgba(15, 23, 42, 0.3)';
            });
            
            button.addEventListener('click', handleInstallClick);
            document.body.appendChild(button);
            installButton = button;
            
            // Show the button
            setTimeout(() => {
                button.style.display = 'block';
            }, 2000); // Show after 2 seconds
        }
    }

    // Check if app is running in standalone mode
    function isStandalone() {
        return window.matchMedia('(display-mode: standalone)').matches || 
               window.navigator.standalone === true;
    }

    // Add PWA-specific styling when in standalone mode
    if (isStandalone()) {
        document.documentElement.classList.add('pwa-standalone');
        console.log('🚀 Running in PWA standalone mode');
    }

    // Handle navigation in PWA mode to ensure smooth transitions
    function enhancePWANavigation() {
        // Add smooth transitions for PWA navigation
        const style = document.createElement('style');
        style.textContent = `
            .pwa-standalone body {
                -webkit-user-select: none;
                -webkit-touch-callout: none;
                -webkit-tap-highlight-color: transparent;
            }
            
            .pwa-standalone .container,
            .pwa-standalone .receipt-container,
            .pwa-standalone .details-container {
                transition: opacity 0.3s ease;
            }
            
            .pwa-standalone .loading-overlay {
                backdrop-filter: blur(8px);
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize PWA navigation enhancements
    enhancePWANavigation();

    // Prevent zoom on double tap in PWA mode
    if (isStandalone()) {
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function (event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

})();