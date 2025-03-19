let canvas;
let context;

let request_id;

let playButton = null;
let scoreDisplay = document.querySelector("#scoreDisplay");
let hasMoved = false;

let player = {
    x : 350,
    y : 350,
    size : 10,
    xChange : 20,
    yChange : 20
};

let score = 0;

let obstacles = []

let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

let fpsInterval = 1000 / 10; // the denominator is frames-per-second
let now;
let then = Date.now();
                
document.addEventListener("DOMContentLoaded", init, false);
            
function init() {
    canvas = document.querySelector("canvas");
    context = canvas.getContext("2d");
    window.addEventListener("keydown", activate, false);
    // window.addEventListener("keyup", deactivate, false);

    draw();
}
            
function draw() {
    request_id = window.requestAnimationFrame(draw);
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    if (moveLeft || moveRight || moveUp || moveDown) {
        hasMoved = true;
        score += 1   // Player has started moving
    }

    if (hasMoved) {
        score += 1;  // Increase the score once the player starts moving
    }
    generate();
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "yellow";
    for (let obstacle of obstacles) {
        context.fillRect(obstacle.x, obstacle.y, obstacle.size, obstacle.size);
    }
    context.fillStyle = "white";
    context.fillRect(player.x, player.y, player.size, player.size);

    
    console.log("Score:" + score)   
    scoreDisplay.innerHTML = "Score: " + score;
    if (collides(player)) {
        stop("You lose!");
        return;
    }
    for (let obstacle of obstacles) {
        if (collides_obstacle(player, obstacle)) {
            obstacles = []
            score += 5;
            console.log("+5")
            generate();
        }
    }
    if (moveRight) {
        player.y = player.y
        player.x = player.x + player.xChange;
    }
    if (moveUp) {
        player.x = player.x
        player.y = player.y - player.yChange;
    }
    if (moveLeft) {
        player.y = player.y
        player.x = player.x - player.xChange;
    }
    if (moveDown) {
        player.x = player.x
        player.y = player.y + player.xChange;
    }

    
}
        

// FUNCTIONS


function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function activate(event) {
    let key = event.key;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
    }
    if (key === "ArrowLeft") {
        moveLeft = true;
        moveRight = false;
        moveUp = false;
        moveDown = false;
    }
    if (key === "ArrowRight") {
        moveLeft = false;
        moveRight = true;
        moveUp = false;
        moveDown = false;
    }
    if (key === "ArrowUp") {
        moveLeft = false;
        moveRight = false;
        moveUp = true;
        moveDown = false;
    }
    if (key === "ArrowDown") {
        moveLeft = false;
        moveRight = false;
        moveUp = false;
        moveDown = true;
    }
}   

function collides(player) {
    if (player.x <= 0 || player.x + player.xChange >= canvas.width || player.y <= 0 || player.y + player.yChange >= canvas.height ) {
        return true;
    } else {
        return false;
    }
}

function collides_obstacle(obj1, obj2) {
    if (obj1.x + obj1.size < obj2.x || 
        obj2.x + obj2.size < obj1.x || 
        obj1.y > obj2.y + obj2.size || 
        obj2.y > obj1.y + obj1.size ) {
        return false;
    } else {
        return true;
    }
}

function generate() {
    if (obstacles.length === 0) {
    let obstacle = {
        x : randint(10, 580),
        y : randint(10, 580),
        size : 10
    };
    obstacles.push(obstacle);
    }
}

function stop(outcome) {
    window.removeEventListener("keydown", activate, false);
    window.cancelAnimationFrame(request_id);
    let outcome_element = document.querySelector("#outcome");
    outcome_element.innerHTML = outcome + score;

    let data = new FormData();
    data.append("score", score);

    showMessage(outcome);
}

function showMessage(outcome) {
    let boxWidth = 350;
    let boxHeight = 150;
    let boxX = (canvas.width - boxWidth ) / 2;
    let boxY = (canvas.height - boxHeight ) / 2;

    context.fillStyle = "rgba(255, 255, 255, 0.8)"; // White with 80% opacity
    context.strokeStyle = "black";
    context.lineWidth = 4;
    
    context.beginPath();
    context.roundRect(boxX, boxY, boxWidth, boxHeight, 20); // 20px rounded corners
    context.fill();
    context.stroke();
    
    // Display text inside the box
    context.fillStyle = "red";
    context.font = "24px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(outcome, canvas.width / 2, boxY + 30);

    context.font = "20px Arial";
    context.fillStyle = "black"
    context.fillText("Score: " + score,  canvas.width / 2, boxY + 60);

    drawButton();
}

function drawButton() {
    let buttonX = 220;
    let buttonY = 300;
    let buttonWidth = 160;
    let buttonHeight = 50;

    // Button background
    context.fillStyle = "blue";
    context.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // Button border
    context.strokeStyle = "black";
    context.lineWidth = 3;
    context.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // Button text
    context.fillStyle = "white";
    context.font = "20px Arial";
    context.fillText("Play Again", buttonX + buttonWidth / 2, buttonY + 30);

    // Store button position for click detection
    playButton = { 
        x: buttonX, 
        y: buttonY, 
        width: buttonWidth, 
        height: buttonHeight 
    };
}

document.addEventListener("click", function(event) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;

    if (
        playButton &&
        mouseX >= playButton.x && mouseX <= playButton.x + playButton.width &&
        mouseY >= playButton.y && mouseY <= playButton.y + playButton.height
    ) {
        restartGame();
    }
});

function restartGame() {
    player.x = 350;
    player.y = 350;
    score = 0;
    moveLeft = false;
    moveRight = false;
    moveUp = false;
    moveDown = false;
    playButton = null;
    window.addEventListener("keydown", activate, false);
    draw();
}
