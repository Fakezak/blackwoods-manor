// Game State Management
class GameState {
    constructor() {
        this.currentScreen = 'main-menu';
        this.player = {
            name: 'Adventurer',
            health: 100,
            level: 1,
            location: 'Darkwood Forest',
            inventory: []
        };
        this.gameProgress = {
            currentChapter: 0,
            decisions: []
        };
        this.settings = {
            musicVolume: 50,
            sfxVolume: 70,
            textSpeed: 'normal',
            darkMode: true
        };
        this.loadSettings();
    }

    saveGame() {
        const saveData = {
            player: this.player,
            gameProgress: this.gameProgress,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('darkwood-save', JSON.stringify(saveData));
        return true;
    }

    loadGame() {
        const saveData = localStorage.getItem('darkwood-save');
        if (saveData) {
            const parsed = JSON.parse(saveData);
            this.player = parsed.player;
            this.gameProgress = parsed.gameProgress;
            return true;
        }
        return false;
    }

    hasSaveData() {
        return localStorage.getItem('darkwood-save') !== null;
    }

    deleteSave() {
        localStorage.removeItem('darkwood-save');
    }

    saveSettings() {
        localStorage.setItem('darkwood-settings', JSON.stringify(this.settings));
    }

    loadSettings() {
        const settingsData = localStorage.getItem('darkwood-settings');
        if (settingsData) {
            this.settings = { ...this.settings, ...JSON.parse(settingsData) };
        }
    }
}

// Game Story Data
const gameStory = {
    start: {
        text: "You awaken in the Darkwood Forest, the ancient trees looming overhead like silent sentinels. The air is thick with mist, and you can hear the distant howl of wolves. A worn path leads north, while a faint light flickers to the east.",
        choices: [
            { text: "Follow the path north", next: 'northPath' },
            { text: "Investigate the light to the east", next: 'eastLight' },
            { text: "Search the area where you woke up", next: 'searchArea' }
        ]
    },
    northPath: {
        text: "The path winds through the dark forest. After walking for what feels like hours, you come across an old, abandoned cabin. The door creaks open in the wind.",
        choices: [
            { text: "Enter the cabin", next: 'enterCabin' },
            { text: "Continue past the cabin", next: 'continuePast' },
            { text: "Circle around to the back", next: 'cabinBack' }
        ]
    },
    eastLight: {
        text: "You push through the underbrush towards the flickering light. You discover a small campfire with a hooded figure sitting beside it. The figure turns towards you, revealing an old woman's face.",
        choices: [
            { text: "Approach the woman", next: 'approachWoman' },
            { text: "Hide and observe", next: 'hideObserve' },
            { text: "Call out a greeting", next: 'greetWoman' }
        ]
    },
    searchArea: {
        text: "You search the area where you awoke and find a leather satchel half-buried under leaves. Inside, you discover a rusty dagger, a piece of parchment with strange markings, and three gold coins.",
        choices: [
            { text: "Take everything", next: 'takeItems' },
            { text: "Take only the dagger", next: 'takeDagger' },
            { text: "Leave it and head north", next: 'northPath' }
        ]
    },
    enterCabin: {
        text: "The cabin interior is dusty but surprisingly well-preserved. A journal lies open on a desk, and a locked chest sits in the corner. The floorboards creak beneath your feet.",
        choices: [
            { text: "Read the journal", next: 'readJournal' },
            { text: "Try to open the chest", next: 'openChest' },
            { text: "Search for supplies", next: 'searchSupplies' }
        ]
    },
    approachWoman: {
        text: "The old woman smiles warmly as you approach. 'Ah, another lost soul,' she says, her voice like rustling leaves. 'Sit, child. I have tea and answers for those who seek them.'",
        choices: [
            { text: "Accept her offer", next: 'acceptTea' },
            { text: "Ask about the forest", next: 'askForest' },
            { text: "Politely decline", next: 'declineTea' }
        ]
    }
};

// UI Management
class UIManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.elements = {
            mainMenu: document.getElementById('main-menu'),
            settingsScreen: document.getElementById('settings-screen'),
            gameScreen: document.getElementById('game-screen'),
            gameText: document.getElementById('game-text'),
            gameChoices: document.getElementById('game-choices'),
            playerInput: document.getElementById('player-input'),
            inventoryList: document.getElementById('inventory-list'),
            health: document.getElementById('health'),
            level: document.getElementById('level'),
            locationName: document.getElementById('location-name')
        };
        
        this.setupEventListeners();
        this.applySettings();
    }

    setupEventListeners() {
        // Main Menu Buttons
        document.getElementById('play-btn').addEventListener('click', () => this.startNewGame());
        document.getElementById('continue-btn').addEventListener('click', () => this.continueGame());
        document.getElementById('settings-btn').addEventListener('click', () => this.showSettings());
        
        // Settings Screen
        document.getElementById('back-to-menu').addEventListener('click', () => this.showScreen('main-menu'));
        document.getElementById('delete-save').addEventListener('click', () => this.deleteSaveData());
        
        // Settings inputs
        document.getElementById('music-volume').addEventListener('input', (e) => {
            this.gameState.settings.musicVolume = e.target.value;
            document.getElementById('music-value').textContent = e.target.value + '%';
            this.gameState.saveSettings();
        });
        
        document.getElementById('sfx-volume').addEventListener('input', (e) => {
            this.gameState.settings.sfxVolume = e.target.value;
            document.getElementById('sfx-value').textContent = e.target.value + '%';
            this.gameState.saveSettings();
        });
        
        document.getElementById('text-speed').addEventListener('change', (e) => {
            this.gameState.settings.textSpeed = e.target.value;
            this.gameState.saveSettings();
        });
        
        document.getElementById('dark-mode').addEventListener('change', (e) => {
            this.gameState.settings.darkMode = e.target.checked;
            this.gameState.saveSettings();
            this.applySettings();
        });
        
        // Game Screen
        document.getElementById('return-to-menu').addEventListener('click', () => {
            if (confirm('Return to main menu? Unsaved progress will be lost.')) {
                this.showScreen('main-menu');
            }
        });
        
        document.getElementById('save-game-btn').addEventListener('click', () => this.saveGame());
        document.getElementById('submit-input').addEventListener('click', () => this.handlePlayerInput());
        
        document.getElementById('player-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handlePlayerInput();
            }
        });
    }

    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        switch(screenName) {
            case 'main-menu':
                this.elements.mainMenu.classList.add('active');
                break;
            case 'settings':
                this.elements.settingsScreen.classList.add('active');
                this.updateSettingsDisplay();
                break;
            case 'game':
                this.elements.gameScreen.classList.add('active');
                break;
        }
        
        this.gameState.currentScreen = screenName;
    }

    startNewGame() {
        // Reset game state
        this.gameState.player = {
            name: 'Adventurer',
            health: 100,
            level: 1,
            location: 'Darkwood Forest',
            inventory: []
        };
        this.gameState.gameProgress = {
            currentChapter: 'start',
            decisions: []
        };
        
        this.showScreen('game');
        this.updatePlayerStats();
        this.showGameText(gameStory.start);
    }

    continueGame() {
        if (this.gameState.hasSaveData()) {
            if (this.gameState.loadGame()) {
                this.showScreen('game');
                this.updatePlayerStats();
                this.showGameText(gameStory[this.gameState.gameProgress.currentChapter]);
            }
        } else {
            alert('No save data found! Start a new game instead.');
        }
    }

    showSettings() {
        this.showScreen('settings');
    }

    updateSettingsDisplay() {
        document.getElementById('music-volume').value = this.gameState.settings.musicVolume;
        document.getElementById('music-value').textContent = this.gameState.settings.musicVolume + '%';
        document.getElementById('sfx-volume').value = this.gameState.settings.sfxVolume;
        document.getElementById('sfx-value').textContent = this.gameState.settings.sfxVolume + '%';
        document.getElementById('text-speed').value = this.gameState.settings.textSpeed;
        document.getElementById('dark-mode').checked = this.gameState.settings.darkMode;
    }

    applySettings() {
        document.body.style.filter = this.gameState.settings.darkMode ? 'none' : 'brightness(1.2)';
    }

    saveGame() {
        if (this.gameState.saveGame()) {
            this.showNotification('Game saved successfully!');
        }
    }

    deleteSaveData() {
        if (confirm('Are you sure you want to delete all save data?')) {
            this.gameState.deleteSave();
            alert('Save data deleted.');
        }
    }

    updatePlayerStats() {
        this.elements.health.textContent = this.gameState.player.health;
        this.elements.level.textContent = this.gameState.player.level;
        this.elements.locationName.textContent = this.gameState.player.location;
        
        // Update inventory
        this.elements.inventoryList.innerHTML = '';
        if (this.gameState.player.inventory.length === 0) {
            this.elements.inventoryList.innerHTML = '<li>Empty</li>';
        } else {
            this.gameState.player.inventory.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                this.elements.inventoryList.appendChild(li);
            });
        }
    }

    showGameText(storyNode) {
        const textElement = this.elements.gameText;
        const choicesElement = this.elements.gameChoices;
        
        // Clear previous content
        textElement.textContent = '';
        choicesElement.innerHTML = '';
        
        // Typewriter effect based on text speed
        const speed = this.gameState.settings.textSpeed;
        const delay = speed === 'fast' ? 10 : speed === 'slow' ? 50 : 30;
        
        let i = 0;
        const typeWriter = () => {
            if (i < storyNode.text.length) {
                textElement.textContent += storyNode.text.charAt(i);
                i++;
                setTimeout(typeWriter, delay);
            } else {
                // Show choices after text is complete
                storyNode.choices.forEach((choice, index) => {
                    const button = document.createElement('button');
                    button.className = 'choice-btn';
                    button.textContent = `${index + 1}. ${choice.text}`;
                    button.addEventListener('click', () => this.makeChoice(choice));
                    choicesElement.appendChild(button);
                });
            }
        };
        
        typeWriter();
    }

    makeChoice(choice) {
        // Add decision to history
        this.gameState.gameProgress.decisions.push({
            chapter: this.gameState.gameProgress.currentChapter,
            choice: choice.text
        });
        
        // Handle special game events
        if (choice.next === 'takeItems') {
            this.gameState.player.inventory.push('Rusty Dagger', 'Mysterious Parchment', '3 Gold Coins');
            this.updatePlayerStats();
        } else if (choice.next === 'takeDagger') {
            this.gameState.player.inventory.push('Rusty Dagger');
            this.updatePlayerStats();
        }
        
        // Move to next chapter
        if (gameStory[choice.next]) {
            this.gameState.gameProgress.currentChapter = choice.next;
            this.showGameText(gameStory[choice.next]);
            this.updatePlayerStats();
        } else {
            // Generate placeholder response for unfinished branches
            const placeholderText = {
                text: "You continue your journey through the Darkwood Forest. The path ahead is still shrouded in mystery...\n\n(More content coming soon!)",
                choices: [
                    { text: "Continue exploring", next: 'start' }
                ]
            };
            this.showGameText(placeholderText);
        }
        
        this.updatePlayerStats();
    }

    handlePlayerInput() {
        const input = document.getElementById('player-input');
        const command = input.value.trim().toLowerCase();
        input.value = '';
        
        if (command) {
            this.processCommand(command);
        }
    }

    processCommand(command) {
        const textElement = this.elements.gameText;
        
        // Basic command processing
        if (command.includes('look') || command.includes('examine')) {
            textElement.textContent += '\n\n> You look around carefully. The Darkwood Forest stretches endlessly in all directions.';
        } else if (command.includes('inventory') || command.includes('bag')) {
            textElement.textContent += '\n\n> Inventory: ' + (this.gameState.player.inventory.length > 0 ? this.gameState.player.inventory.join(', ') : 'Empty');
        } else if (command.includes('help')) {
            textElement.textContent += '\n\n> Available commands: look, inventory, help';
        } else {
            textElement.textContent += '\n\n> You try to ' + command + ', but nothing happens. Try "help" for available commands.';
        }
        
        // Scroll to bottom
        textElement.scrollTop = textElement.scrollHeight;
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2a2a2a;
            color: #c9a959;
            padding: 15px 25px;
            border: 1px solid #c9a959;
            border-radius: 5px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize Game
const gameState = new GameState();
const uiManager = new UIManager(gameState);

// Update continue button based on save data
if (!gameState.hasSaveData()) {
    document.getElementById('continue-btn').style.opacity = '0.5';
    document.getElementById('continue-btn').title = 'No save data available';
}

// Check for saved settings
uiManager.updateSettingsDisplay();
