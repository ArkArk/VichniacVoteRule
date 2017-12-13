"use strict";

const p5 = require("p5");

const sketch = (p) => {

    const CANVAS_WIDTH  = Math.min(window.innerWidth, window.innerHeight, 600);
    const CANVAS_HEIGHT = Math.min(window.innerWidth, window.innerHeight, 600);

    const CELL_NUM_X    = 50;
    const CELL_NUM_Y    = 50;
    const CELL_WIDTH    = CANVAS_WIDTH/CELL_NUM_X;
    const CELL_HEIGHT   = CANVAS_HEIGHT/CELL_NUM_Y;
    const DMAN_SIZE     = CELL_WIDTH * 1.5;
    const GOPHER_SIZE   = CELL_WIDTH * 1.1;

    let dmanImage;
    let gopherImage;

    const fpsSlider     = document.querySelector("#fpsSlider");
    const fpsText       = document.querySelector("#fpsText");
    const randomButton  = document.querySelector("#randomButton");
    const noizeCheckBox = document.querySelector("#noizeCheckBox");

    function iota(n) {
        return Array.from({length: n}, (_, i) => i);
    }

    function updateFpsText() {
        fpsText.innerHTML = fpsSlider.value;
    }

    class Cell {
        constructor(indexX, indexY, isAlive) {
            this.indexX = indexX;
            this.indexY = indexY;
            this.isAlive = isAlive;
            this.throttleFrame = this.throttleDuration = 20;
        }
        step() {
            if (p.mouseIsPressed && this.throttleFrame >= this.throttleDuration) {
                let ok = true;
                let x = this.indexX * CELL_WIDTH;
                let y = this.indexY * CELL_HEIGHT;
                ok &= x <= p.mouseX && p.mouseX < x + CELL_WIDTH;
                ok &= y <= p.mouseY && p.mouseY < y + CELL_HEIGHT;
                if (ok) {
                    this.isAlive = !this.isAlive;
                    this.throttleFrame = 0;
                }
            }
            this.throttleFrame++;
        }
        draw() {
            let centerX = (this.indexX + 0.5) * CELL_WIDTH;
            let centerY = (this.indexY + 0.5) * CELL_HEIGHT;
            let img = this.isAlive ? dmanImage : gopherImage;
            p.image(img, centerX, centerY);
        }
    }

    function getRandomCells() {
        return Array.from(
            {length: CELL_NUM_X},
            (_, x) => Array.from(
                {length: CELL_NUM_Y},
                (_, y) => new Cell(x, y, Math.random() < 0.5)
            )
        );
    }

    function hasNoize() {
        return noizeCheckBox.checked;
    }

    function next(grid) {
        return grid.map(
            cells => cells.map(
                cell => nextCell(cell, grid)
            )
        );
    }

    function nextCell(cell, grid) {
        const dx = [-1, -1, -1,  0,  0, 0,  1,  1,  1];
        const dy = [-1,  0,  1, -1,  0, 1, -1,  0,  1];
        const getX = i => (cell.indexX + dx[i] + CELL_NUM_X) % CELL_NUM_X;
        const getY = i => (cell.indexY + dy[i] + CELL_NUM_Y) % CELL_NUM_Y;
        const cnt = iota(9).map(
            i => grid[getX(i)][getY(i)]
        ).filter(
            c => c.isAlive
        ).length;
        let isAlive = cnt > 4;
        if (hasNoize() && (cnt == 4 || cnt == 5)) {
            isAlive = !isAlive;
        }
        return new Cell(cell.indexX, cell.indexY, isAlive);
    }

    function drawBackground() {
        p.noStroke();
        p.fill(40, 170, 110, 5);
        p.rect(0, 0, p.width, p.height);
    }

    let timeBySlider = 0.0;
    function shouldNext() {
        let ok = fpsSlider.value > fpsSlider.min && timeBySlider>=1.0;
        if (ok) timeBySlider -= 1.0;
        timeBySlider += 1.0/(fpsSlider.max - fpsSlider.min)*(fpsSlider.value);
        return ok;
    }

    let grid;

    function randomize() {
        grid = getRandomCells();
    }

    p.preload = () => {
        dmanImage = p.loadImage("img/dman.gif");
        gopherImage = p.loadImage("img/gopher.gif");
    };

    p.setup = () => {
        p.imageMode(p.CENTER);
        p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
        p.background(40, 170, 110);
        dmanImage.resize(DMAN_SIZE, DMAN_SIZE);
        gopherImage.resize(GOPHER_SIZE, GOPHER_SIZE);
        randomize();
    };

    p.draw = () => {
        updateFpsText();
        drawBackground();
        if (shouldNext()) {
            grid = next(grid);
        }
        grid.forEach(cells => cells.forEach(cell => cell.step()));
        grid.forEach(cells => cells.forEach(cell => cell.draw()));
    };

    randomButton.onclick = () => randomize();
};

const app = new p5(sketch, document.querySelector("#sketch"));
