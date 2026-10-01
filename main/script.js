document.addEventListener('DOMContentLoaded',async () => {
    const spansKeyboard = document.querySelectorAll('.keyboard-row span')
    const spansGuess = document.querySelectorAll('.user-guess span')
    const feedbackContainer = document.querySelector('.feedback-container')
    const newGameModel = document.querySelector('.new-game-modal')
    const yesBtn = document.getElementById('yes-btn');
    const noBtn = document.getElementById('no-btn');
    let targetWord = '';
    let currentGuess = '';
    let guessHistory = [];
    let ifInputBlocked = false;

    // 1.area for game states
    const saveGameState = () => {
        const gameState = {
            currentGuess: currentGuess,
            guessHistory: guessHistory,
            targetWord: targetWord
        };

        localStorage.setItem('wordleGameState', JSON.stringify(gameState));
    }

    const loadGameState = () => {
        const savedState = localStorage.getItem('wordleGameState');
        if (savedState) {
            const gameState = JSON.parse(savedState);
            currentGuess = gameState.currentGuess;
            guessHistory = gameState.guessHistory;
            targetWord = gameState.targetWord;
            return true;
        }
        return false;
    }

    const clearGameState = () => {
        localStorage.removeItem('wordleGameState')
    }

    //2.functions for display
    const displayGuess = (spans) => {
        for (let i = 0; i < spans.length; i++) {
            if (i < currentGuess.length) {
                spans[i].textContent = currentGuess[i];
            } else {
                spans[i].textContent = '';
                spans[i].style.backgroundColor = '#f0f0f0';
            }
        }
    }

    const getKeyElement = (keyValue) => {
        for (let span of spansKeyboard) {
            if (span.textContent === keyValue) {
                return span;
            }
        }
        return null;
    }

    const activeKey = (span) => {
        if (span) {
            span.classList.add('active');
            setTimeout(() => {
                span.classList.remove('active');
            }, 300);
        }
    }

    const disableEnterKey = () => {
        const enterBtn = getKeyElement('Enter');
        if (enterBtn) {
            enterBtn.classList.add('disabled');
        }
    }

    const enableEnterKey = () => {
        const enterBtn = getKeyElement('Enter');
        if (enterBtn) {
            enterBtn.classList.remove('disabled');
        }
    }

    const shaking =() =>{
        spansGuess.forEach((span) => {
            span.classList.add('animate__animated', 'animate__shakeX')
            span.addEventListener('animationend', () => {
                span.classList.remove('animate__animated', 'animate__shakeX');
            }, {once: true});
        })
    }

    const displayFeedback = (guess) => {
        const feedbackRow = document.createElement('div');
        feedbackRow.className = 'feedback-row';

        const status = getLetterStatus(guess, targetWord);

        for (let i = 0; i < guess.length; i++) {
            const span = document.createElement('span');
            span.textContent = guess[i];
            span.className = 'feedback-letter ' + status[i];
            feedbackRow.appendChild(span);
        }

        feedbackContainer.appendChild(feedbackRow);
        updateKeyboardColors(guess, status);
    }

    const updateKeyboardColors = (guess, status) => {
        for (let i = 0; i < guess.length; i++) {
            const letter = guess[i];
            const keySpan = getKeyElement(letter);

            if (keySpan) {
                const currentColor = status[i];

                if (currentColor === 'green') {
                    keySpan.classList.remove('orange', 'grey');
                    keySpan.classList.add('green');
                } else if (currentColor === 'orange' && !keySpan.classList.contains('green')) {
                    keySpan.classList.remove('grey');
                    keySpan.classList.add('orange');
                } else if (currentColor === 'grey' && !keySpan.classList.contains('green') && !keySpan.classList.contains('orange')) {
                    keySpan.classList.add('grey');
                }
            }
        }
    }

    //3.functions for game logic
    const getTargetWord = async () => {
        const response = await fetch('https://words.trex-sandwich.com/?count=1&length=6')
        const data = await response.json();
        targetWord = data[0].toUpperCase();
        console.log('Target word selected:', targetWord);
    }

    const verifyGuessNum = (guess)=> {
        if (guess.length < 6) {
            disableEnterKey();
        } else if (guess.length === 6) {
            enableEnterKey();
        }
    }

    const addLetter = (letter) => {
        if (currentGuess.length < 6) {
            currentGuess += letter;
            displayGuess(spansGuess);
            verifyGuessNum(currentGuess);
            saveGameState();
        }
    }

    const removeLetter = () => {
        if (currentGuess.length > 0) {
            currentGuess = currentGuess.slice(0, -1);
            displayGuess(spansGuess);
            verifyGuessNum(currentGuess);
            saveGameState();
        }
    }

    const getLetterStatus = (guess, target) =>{
        const status = new Array(guess.length).fill('grey');
        const targetLetters = target.split('');

        for (let i = 0; i < guess.length; i++) {
            if (guess[i] === target[i]) {
                status[i] = 'green';
                targetLetters[i] = null;
            }
        }

        for (let i = 0; i < guess.length; i++) {
            if (status[i] !== 'green' && targetLetters.includes(guess[i])) {
                status[i] = 'orange';
                const index = targetLetters.indexOf(guess[i]);
                targetLetters[index] = null;
            }
        }

        return status;
    }

    const verifyGuess = async (guess) => {
        const response = await fetch('https://words.trex-sandwich.com/' + guess);
        const data = await response.json();
        const result = data.valid;
        if (result === true && guess === targetWord) {
            console.log("Your word is spelled correctly.");
            guessHistory.push(guess);
            displayFeedback(guess);
            console.log('Stored guess: ', guessHistory[guessHistory.length - 1]);
            currentGuess = '';
            displayGuess(spansGuess);
            disableEnterKey();
            saveGameState();
            return true;
        } else if (result === true) {
            console.log('Your word is in the dictionary, but not the target word.')
            guessHistory.push(guess);
            displayFeedback(guess);
            shaking();
            currentGuess = '';
            saveGameState();
            return false;
        } else {
            console.log('Invalid word. Please try again.')
            guessHistory.push(guess);
            displayFeedback(guess);
            shaking();
            saveGameState();
            return false;
        }
    }

    //4.game model and reset
    const showNewGameModel = () => {
        newGameModel.classList.add('show');
        ifInputBlocked = true;
    }

    const hideNewGameModel = () => {
        newGameModel.classList.remove('show')
        ifInputBlocked = false;
    }

    const resetGame = async () => {
        currentGuess = '';
        guessHistory = [];
        ifInputBlocked = false;

        spansGuess.forEach(span => {
            span.textContent = '';
        })
        feedbackContainer.innerHTML = '';
        disableEnterKey();

        spansKeyboard.forEach(span=>{
            span.classList.remove('green', 'orange', 'grey');
        })

        await getTargetWord();
        hideNewGameModel();
        clearGameState();
        saveGameState();
    }

    //5.event listener
    yesBtn.addEventListener('click', async () => {
        await resetGame();
    })

    noBtn.addEventListener('click', () => {
        hideNewGameModel();
        ifInputBlocked = true;
        saveGameState();
    })

    spansKeyboard.forEach(span => {
        span.addEventListener('click', async () => {
            const value = span.textContent;

            if (value === 'New Game') {
                activeKey(span)
                console.log('NewGame');
                showNewGameModel();
                return;
            }

            if (ifInputBlocked) {
                return;
            }
            if (value === 'Enter' && span.classList.contains('disabled')) {
                return;
            }

            activeKey(span)
            if (value === 'Enter') {
                console.log('Enter');
                const isValid = await verifyGuess(currentGuess);
                if (isValid) {
                    showNewGameModel();
                }
            } else if (value === 'Backspace') {
                removeLetter();
            } else {
                addLetter(value);
            }
        })
    })

    document.addEventListener('keydown', async (event) => {
        const key = event.key;
        let targetSpan = null;

        if (key === 'Escape') {
            console.log('NewGame')
            showNewGameModel();
            targetSpan = getKeyElement('New Game');
        }

        if (ifInputBlocked) {
            event.preventDefault();
            return;
        }

        if (key === 'Enter') {
            console.log('Enter');
            targetSpan = getKeyElement('Enter');
            if (targetSpan && targetSpan.classList.contains('disabled')) {
                return;
            }
            const isValid  = await verifyGuess(currentGuess);
            if (isValid) {
                showNewGameModel();
            }
        } else if (/^[a-zA-Z]$/.test(key)) {
            console.log(key.toUpperCase());
            targetSpan = getKeyElement(key.toUpperCase())
            addLetter(key.toUpperCase())
        } else if (key === 'Backspace') {
            console.log('Backspace');
            targetSpan = getKeyElement('Backspace')
            removeLetter();
        }

        if (targetSpan) {
            activeKey(targetSpan);
        }
    })

    //6.init the game
    disableEnterKey();

    const hasSavedState = loadGameState();

    if (hasSavedState) {
        console.log('Restoring saved game state...');
        displayGuess(spansGuess);
        verifyGuessNum(currentGuess);

        guessHistory.forEach(guess => {
            displayFeedback(guess);
        })
    }

    console.log('Saved targetWord is: ', targetWord);

    if (!targetWord) {
        await getTargetWord();
        saveGameState();
    }
})
