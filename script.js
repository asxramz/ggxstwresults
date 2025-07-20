// Application State
class TournamentApp {
    constructor() {
        this.teams = [];
        this.settings = {
            killPoints: 2,
            tournamentName: 'TOURNAMENT',
            logoDisplay: 'both' // New setting for logo display
        };
        this.currentLogo = null;
        this.currentBooyahLogo = null;
        this.init();
    }

    init() {
        this.loadData();
        this.bindEvents();
        this.updateStats();
        this.updateSettings();
        this.updateLogoDisplay();
    }

    loadData() {
        // Load teams from localStorage
        const savedTeams = localStorage.getItem('tournament-teams');
        if (savedTeams) {
            this.teams = JSON.parse(savedTeams);
        }

        // Load settings from localStorage
        const savedSettings = localStorage.getItem('tournament-settings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }

        // Load logo from localStorage
        const savedLogo = localStorage.getItem('tournament-logo');
        if (savedLogo) {
            this.currentLogo = savedLogo;
            this.updateLogoDisplays();
        }

        // Load booyah logo from localStorage
        const savedBooyahLogo = localStorage.getItem('tournament-booyah-logo');
        if (savedBooyahLogo) {
            this.currentBooyahLogo = savedBooyahLogo;
            this.updateBooyahLogoDisplays();
        }
    }

    saveData() {
        localStorage.setItem('tournament-teams', JSON.stringify(this.teams));
        localStorage.setItem('tournament-settings', JSON.stringify(this.settings));
        if (this.currentLogo) {
            localStorage.setItem('tournament-logo', this.currentLogo);
        }
        if (this.currentBooyahLogo) {
            localStorage.setItem('tournament-booyah-logo', this.currentBooyahLogo);
        }
    }

    bindEvents() {
        // Form input events for real-time calculation
        const killsInput = document.getElementById('kills');
        const booyahInput = document.getElementById('booyah-count');
        const placementInput = document.getElementById('placement-points');

        [killsInput, booyahInput, placementInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => this.updatePointsPreview());
            }
        });

        // Settings input events
        const killPointsInput = document.getElementById('kill-points-setting');
        const tournamentNameInput = document.getElementById('tournament-name-setting');

        if (killPointsInput) {
            killPointsInput.addEventListener('change', () => {
                this.settings.killPoints = parseInt(killPointsInput.value);
                this.updateSettings();
                this.saveData();
            });
        }

        if (tournamentNameInput) {
            tournamentNameInput.addEventListener('input', () => {
                this.settings.tournamentName = tournamentNameInput.value || 'TOURNAMENT';
                this.updateTournamentName();
                this.saveData();
            });
        }

        // Logo display radio buttons
        const logoDisplayInputs = document.querySelectorAll('input[name="logo-display"]');
        logoDisplayInputs.forEach(input => {
            input.addEventListener('change', () => {
                if (input.checked) {
                    this.settings.logoDisplay = input.value;
                    this.updateLogoDisplay();
                    this.saveData();
                }
            });
        });

        // Modal events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });

        // Touch events for mobile
        this.bindTouchEvents();
    }

    bindTouchEvents() {
        // Improve touch interactions for mobile
        const touchElements = document.querySelectorAll('.dashboard-card, .nav-item, .team-row');
        
        touchElements.forEach(element => {
            element.addEventListener('touchstart', () => {
                element.style.transform = 'scale(0.98)';
            }, { passive: true });
            
            element.addEventListener('touchend', () => {
                element.style.transform = '';
            }, { passive: true });
        });
    }

    updatePointsPreview() {
        const kills = parseInt(document.getElementById('kills').value) || 0;
        const booyahs = parseInt(document.getElementById('booyah-count').value) || 0;
        const placement = parseInt(document.getElementById('placement-points').value) || 0;

        const killPoints = kills * this.settings.killPoints;
        const totalPoints = killPoints + placement;

        const preview = document.getElementById('points-preview');
        if (preview && (kills > 0 || booyahs > 0 || placement > 0)) {
            preview.style.display = 'block';
            document.getElementById('calc-kill-points').textContent = killPoints;
            document.getElementById('calc-booyah-points').textContent = booyahs;
            document.getElementById('calc-placement-points').textContent = placement;
            document.getElementById('calc-total-points').textContent = totalPoints;
        } else if (preview) {
            preview.style.display = 'none';
        }
    }

    addTeam() {
        const teamName = document.getElementById('team-name').value.trim();
        const kills = parseInt(document.getElementById('kills').value) || 0;
        const booyahs = parseInt(document.getElementById('booyah-count').value) || 0;
        const placement = parseInt(document.getElementById('placement-points').value) || 0;

        if (!teamName) {
            this.showToast('Please enter a team name', 'error');
            return;
        }

        const killPoints = kills * this.settings.killPoints;
        const totalPoints = killPoints + placement;

        // Check if team already exists
        const existingTeamIndex = this.teams.findIndex(team => team.name.toLowerCase() === teamName.toLowerCase());
        
        if (existingTeamIndex !== -1) {
            // Update existing team
            const existingTeam = this.teams[existingTeamIndex];
            existingTeam.kills += kills;
            existingTeam.booyahs += booyahs;
            existingTeam.placementPoints += placement;
            existingTeam.totalPoints = (existingTeam.kills * this.settings.killPoints) + 
                                     existingTeam.placementPoints;
            existingTeam.matches += 1;
        } else {
            // Add new team
            const newTeam = {
                id: Date.now(),
                name: teamName,
                kills: kills,
                booyahs: booyahs,
                placementPoints: placement,
                totalPoints: totalPoints,
                matches: 1,
                avatar: this.generateAvatar(teamName)
            };
            this.teams.push(newTeam);
        }

        this.saveData();
        this.updateStats();
        this.clearForm();
        this.showToast('Team result saved successfully!', 'success');
    }

    generateAvatar(teamName) {
        // Array of gaming/competitive emojis
        const emojis = [
            '🏆', '🎮', '⚡', '🔥', '💎', '👑', '🎯', '🚀',
            '⭐', '💫', '🌟', '🎊', '🎉', '🎈', '🏅', '🥇',
            '🥈', '🥉', '🎪', '🎨', '🎭', '🎪', '🎺', '🎸',
            '🎤', '🎧', '🎵', '🎶', '🎼', '🎹', '🥁', '🎷',
            '🦄', '🐉', '🦅', '🦁', '🐺', '🦈', '🐅', '🦋',
            '🔱', '⚔️', '🛡️', '🏹', '🗡️', '💣', '💥', '⚡'
        ];
        
        // Use team name to generate consistent emoji selection
        const index = teamName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % emojis.length;
        return emojis[index];
    }

    clearForm() {
        document.getElementById('team-name').value = '';
        document.getElementById('kills').value = '';
        document.getElementById('booyah-count').value = '';
        document.getElementById('placement-points').value = '';
        
        const preview = document.getElementById('points-preview');
        if (preview) {
            preview.style.display = 'none';
        }
    }

    updateStats() {
        // Update home page stats
        document.getElementById('total-teams').textContent = this.teams.length;
        document.getElementById('total-matches').textContent = this.teams.reduce((sum, team) => sum + team.matches, 0);
        
        // Update leaderboard
        this.updateLeaderboard();
    }

    updateSettings() {
        document.getElementById('kill-points-display').textContent = this.settings.killPoints;
        
        const killPointsInput = document.getElementById('kill-points-setting');
        const tournamentNameInput = document.getElementById('tournament-name-setting');
        
        if (killPointsInput) killPointsInput.value = this.settings.killPoints;
        if (tournamentNameInput) tournamentNameInput.value = this.settings.tournamentName;
        
        // Update logo display radio buttons
        const logoDisplayInput = document.getElementById(`logo-display-${this.settings.logoDisplay}`);
        if (logoDisplayInput) {
            logoDisplayInput.checked = true;
        }
        
        this.updateTournamentName();
    }

    updateTournamentName() {
        const displayElement = document.getElementById('tournament-display-name');
        if (displayElement) {
            displayElement.textContent = this.settings.tournamentName.toUpperCase();
        }
    }

    updateLogoDisplay() {
        const leftLogo = document.getElementById('results-logo-left');
        const rightLogo = document.getElementById('results-logo-right');
        
        if (leftLogo && rightLogo) {
            switch (this.settings.logoDisplay) {
                case 'both':
                    leftLogo.style.display = 'flex';
                    rightLogo.style.display = 'flex';
                    break;
                case 'left':
                    leftLogo.style.display = 'flex';
                    rightLogo.style.display = 'none';
                    break;
                case 'right':
                    leftLogo.style.display = 'none';
                    rightLogo.style.display = 'flex';
                    break;
                case 'none':
                    leftLogo.style.display = 'none';
                    rightLogo.style.display = 'none';
                    break;
            }
        }
    }

    updateLeaderboard() {
        const leaderboardContent = document.getElementById('leaderboard-content');
        if (!leaderboardContent) return;

        if (this.teams.length === 0) {
            leaderboardContent.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-line"></i>
                    <h3>No Results Yet</h3>
                    <p>Add your first match result to get started</p>
                    <button class="empty-action-btn" onclick="app.showPage('add-result')">
                        <i class="fas fa-plus"></i>
                        Add Result
                    </button>
                </div>
            `;
            return;
        }

        // Sort teams by total points
        const sortedTeams = [...this.teams].sort((a, b) => b.totalPoints - a.totalPoints);

        const leaderboardHTML = sortedTeams.map((team, index) => {
            const rank = index + 1;
            const rankClass = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : '';
            
            return `
                <div class="team-row">
                    <div class="team-rank ${rankClass}">${rank}</div>
                    <div class="team-info">
                        <div class="team-avatar">${team.avatar}</div>
                        <div class="team-name-text">${team.name}</div>
                    </div>
                    <div class="team-stat kills">${team.kills}</div>
                    <div class="team-stat wins">${team.booyahs}</div>
                    <div class="team-stat placement">${team.placementPoints}</div>
                    <div class="team-stat total">${team.totalPoints}</div>
                </div>
            `;
        }).join('');

        leaderboardContent.innerHTML = leaderboardHTML;
    }

    updateLogoDisplays() {
        const logoElements = [
            { icon: 'brand-icon', image: 'brand-image' },
            { icon: 'main-logo-icon', image: 'main-logo-image' },
            { icon: 'results-icon-left', image: 'results-image-left' },
            { icon: 'results-icon-right', image: 'results-image-right' },
            { icon: 'settings-logo-icon', image: 'settings-logo-image' }
        ];

        logoElements.forEach(({ icon, image }) => {
            const iconElement = document.getElementById(icon);
            const imageElement = document.getElementById(image);
            
            if (iconElement && imageElement) {
                if (this.currentLogo) {
                    iconElement.style.display = 'none';
                    imageElement.src = this.currentLogo;
                    imageElement.style.display = 'block';
                } else {
                    iconElement.style.display = 'flex';
                    imageElement.style.display = 'none';
                }
            }
        });
    }

    updateBooyahLogoDisplays() {
        const booyahElements = [
            { icon: 'booyah-header-icon', image: 'booyah-header-image' },
            { icon: 'settings-booyah-icon', image: 'settings-booyah-image' }
        ];

        booyahElements.forEach(({ icon, image }) => {
            const iconElement = document.getElementById(icon);
            const imageElement = document.getElementById(image);
            
            if (iconElement && imageElement) {
                if (this.currentBooyahLogo) {
                    iconElement.style.display = 'none';
                    imageElement.src = this.currentBooyahLogo;
                    imageElement.style.display = 'block';
                } else {
                    iconElement.style.display = 'flex';
                    imageElement.style.display = 'none';
                }
            }
        });
    }

    uploadLogo(input) {
        const file = input.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.showToast('Please select a valid image file', 'error');
            return;
        }

        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showToast('Image file size should be less than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentLogo = e.target.result;
            this.updateLogoDisplays();
            this.saveData();
            this.showToast('Logo updated successfully!', 'success');
        };
        reader.readAsDataURL(file);
    }

    uploadBooyahLogo(input) {
        const file = input.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.showToast('Please select a valid image file', 'error');
            return;
        }

        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showToast('Image file size should be less than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentBooyahLogo = e.target.result;
            this.updateBooyahLogoDisplays();
            this.saveData();
            this.showToast('Booyah logo updated successfully!', 'success');
        };
        reader.readAsDataURL(file);
    }

    useDefaultTournamentLogo() {
        // Load the default GG Esports logo from assets
        const logoPath = 'assets/logos/tournament-logo.png';
        
        // Convert image to base64 for storage
        fetch(logoPath)
            .then(response => response.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.currentLogo = e.target.result;
                    this.updateLogoDisplays();
                    this.saveData();
                    this.showToast('GG Esports logo loaded successfully!', 'success');
                };
                reader.readAsDataURL(blob);
            })
            .catch(() => {
                this.showToast('Could not load default tournament logo', 'error');
            });
    }

    useDefaultBooyahLogo() {
        // Load the default Booyah logo from assets
        const logoPath = 'assets/logos/booyah-logo.png';
        
        // Convert image to base64 for storage
        fetch(logoPath)
            .then(response => response.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.currentBooyahLogo = e.target.result;
                    this.updateBooyahLogoDisplays();
                    this.saveData();
                    this.showToast('Booyah logo loaded successfully!', 'success');
                };
                reader.readAsDataURL(blob);
            })
            .catch(() => {
                this.showToast('Could not load default booyah logo', 'error');
            });
    }

    showPage(pageName) {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to current nav item
        const activeNavItem = document.querySelector(`[data-page="${pageName}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Update logo display when showing results page
        if (pageName === 'results') {
            this.updateLogoDisplay();
        }

        // Scroll to top on page change
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    exportData() {
        const exportData = {
            teams: this.teams,
            settings: this.settings,
            logo: this.currentLogo,
            booyahLogo: this.currentBooyahLogo,
            exportDate: new Date().toISOString(),
            version: '2.0'
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `tournament-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showToast('Data exported successfully!', 'success');
    }

    importData(input) {
        const file = input.files[0];
        if (!file) return;

        if (!file.type.includes('json')) {
            this.showToast('Please select a valid JSON file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                
                // Validate data structure
                if (!importData.teams || !Array.isArray(importData.teams)) {
                    throw new Error('Invalid data format');
                }

                // Merge or replace data
                this.showConfirmation(
                    'Import Data',
                    'This will replace all current tournament data. Are you sure you want to continue?',
                    () => {
                        this.teams = importData.teams || [];
                        this.settings = { ...this.settings, ...(importData.settings || {}) };
                        this.currentLogo = importData.logo || null;
                        this.currentBooyahLogo = importData.booyahLogo || null;

                        this.saveData();
                        this.updateStats();
                        this.updateSettings();
                        this.updateLogoDisplays();
                        this.updateBooyahLogoDisplays();
                        this.updateLogoDisplay();

                        this.showToast('Data imported successfully!', 'success');
                        input.value = ''; // Clear file input
                    }
                );
            } catch (error) {
                this.showToast('Failed to import data. Please check the file format.', 'error');
                input.value = ''; // Clear file input
            }
        };
        reader.readAsText(file);
    }

    resetAllData() {
        this.showConfirmation(
            'Reset All Data',
            'This will permanently delete all tournament data, teams, and settings. This action cannot be undone.',
            () => {
                // Clear all data
                this.teams = [];
                this.settings = {
                    killPoints: 2,
                    tournamentName: 'TOURNAMENT',
                    logoDisplay: 'both'
                };
                this.currentLogo = null;
                this.currentBooyahLogo = null;

                // Clear localStorage
                localStorage.removeItem('tournament-teams');
                localStorage.removeItem('tournament-settings');
                localStorage.removeItem('tournament-logo');
                localStorage.removeItem('tournament-booyah-logo');

                // Update UI
                this.updateStats();
                this.updateSettings();
                this.updateLogoDisplays();
                this.updateBooyahLogoDisplays();
                this.updateLogoDisplay();

                this.showToast('All data has been reset successfully!', 'success');
                this.showPage('home');
            }
        );
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <i class="toast-icon ${iconMap[type] || iconMap.info}"></i>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        toastContainer.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    showConfirmation(title, message, onConfirm) {
        const modal = document.getElementById('confirmation-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');
        const confirmBtn = document.getElementById('modal-confirm-btn');

        if (modal && modalTitle && modalMessage && confirmBtn) {
            modalTitle.textContent = title;
            modalMessage.textContent = message;
            
            // Remove existing event listeners
            const newConfirmBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
            
            // Add new event listener
            newConfirmBtn.addEventListener('click', () => {
                onConfirm();
                this.closeModal();
            });

            modal.style.display = 'flex';
        }
    }

    closeModal() {
        const modal = document.getElementById('confirmation-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
}

// Global functions for HTML onclick events
function showPage(pageName) {
    if (window.app) {
        window.app.showPage(pageName);
    }
}

function addTeam() {
    if (window.app) {
        window.app.addTeam();
    }
}

function uploadLogo(input) {
    if (window.app) {
        window.app.uploadLogo(input);
    }
}

function uploadBooyahLogo(input) {
    if (window.app) {
        window.app.uploadBooyahLogo(input);
    }
}

function exportData() {
    if (window.app) {
        window.app.exportData();
    }
}

function importData(input) {
    if (window.app) {
        window.app.importData(input);
    }
}

function resetAllData() {
    if (window.app) {
        window.app.resetAllData();
    }
}

function closeModal() {
    if (window.app) {
        window.app.closeModal();
    }
}

function useDefaultTournamentLogo() {
    if (window.app) {
        window.app.useDefaultTournamentLogo();
    }
}

function useDefaultBooyahLogo() {
    if (window.app) {
        window.app.useDefaultBooyahLogo();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TournamentApp();
});

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Handle orientation changes for mobile
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        window.scrollTo(0, 1);
    }, 500);
});

// Prevent zoom on double tap for iOS
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Alt + 1-4 for quick navigation
    if (e.altKey && !e.ctrlKey && !e.shiftKey) {
        switch (e.key) {
            case '1':
                e.preventDefault();
                showPage('home');
                break;
            case '2':
                e.preventDefault();
                showPage('add-result');
                break;
            case '3':
                e.preventDefault();
                showPage('results');
                break;
            case '4':
                e.preventDefault();
                showPage('settings');
                break;
        }
    }
    
    // Escape to close modal
    if (e.key === 'Escape') {
        closeModal();
    }
});
