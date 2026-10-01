# Six-Letter Wordle

A browser-based six-letter word guessing game built with vanilla JavaScript, HTML and CSS.

## Features

- Physical and on-screen keyboard input.
- Letter and keyboard colour feedback, including repeated-letter handling.
- Saved game state using browser localStorage.
- New-game confirmation dialog.
- Animated feedback using Animate.css.

## Run locally

From the project directory, start a static server:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/main/` in your browser.

An internet connection is required for the external word service at `words.trex-sandwich.com` and the Animate.css CDN. No build step is required. The dependency manifest is included; dependencies can be installed with `npm ci` if needed.

## Project structure

- `main/index.html`: game interface.
- `main/style.css`: layout and styles.
- `main/script.js`: game logic, word requests and saved state.

## Notes

This project originated as a coursework exercise. This repository contains a clean snapshot of the project, excluding local dependencies and editor files. The package currently has no automated test suite.
