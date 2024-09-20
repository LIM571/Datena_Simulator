const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');

// Proporções do canvas
const aspectRatio = 800 / 600; // Proporção 4:3

// Variáveis do jogo
const shipImage = new Image();
shipImage.src = 'img1.png';

const bulletImage = new Image();
bulletImage.src = 'img2.png';

const enemyImage = new Image();
enemyImage.src = 'img3.png';

const powerUpImage = new Image();
powerUpImage.src = 'img4.png';

const ship = {
    x: 50,
    y: canvas.height / 2 - 25,
    width: 50,
    height: 50,
    speed: 5,
    fireRate: 500,
    lastShot: 0
};

let bullets = [];
let enemies = [];
let enemySpeed = 1.5;
let score = 0;
let level = 1;
let enemiesToNextLevel = 10;
let upgrades = 0;

// Função para redimensionar o canvas
function resizeCanvas() {
    const width = window.innerWidth;
    const height = width / aspectRatio;
    if (height > window.innerHeight) {
        canvas.height = window.innerHeight;
        canvas.width = window.innerHeight * aspectRatio;
    } else {
        canvas.width = width;
        canvas.height = height;
    }
    ship.y = canvas.height / 2 - 25; // Reposiciona a nave ao redimensionar
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Inicializa o tamanho do canvas

// Controles da nave
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' && ship.y > 0) {
        ship.y -= ship.speed;
    } else if (event.key === 'ArrowDown' && ship.y < canvas.height - ship.height) {
        ship.y += ship.speed;
    } else if (event.key === ' ') { // Espaço atira
        shoot();
    }
});

// Funções de controle por botão
document.getElementById('upButton').addEventListener('click', () => {
    if (ship.y > 0) {
        ship.y -= ship.speed;
    }
});

document.getElementById('downButton').addEventListener('click', () => {
    if (ship.y < canvas.height - ship.height) {
        ship.y += ship.speed;
    }
});

document.getElementById('shootButton').addEventListener('click', () => {
    shoot();
});

function shoot() {
    const now = Date.now();
    if (now - ship.lastShot > ship.fireRate) {
        bullets.push({ x: ship.x + ship.width, y: ship.y + ship.height / 2 - 10, width: 20, height: 40 });
        ship.lastShot = now;
    }
}

// Função para gerar inimigos e power-ups
function generateEnemies() {
    const yPosition = Math.random() * (canvas.height - 50);
    const isPowerUp = Math.random() < 0.01; // 1% de chance para aparecer power-up
    enemies.push({
        x: canvas.width,
        y: yPosition,
        width: 50,
        height: 50,
        type: isPowerUp ? 'power-up' : 'enemy'
    });
}

// Função para aplicar upgrades
function applyUpgrades() {
    if (upgrades >= 3) {
        ship.speed += 1; // Aumenta a velocidade da nave
        ship.fireRate -= 50; // Aumenta a taxa de tiro
        upgrades = 0; // Reseta os upgrades
    }
}

// Função para aumentar velocidade vertical da nave
function increaseYSpeed() {
    ship.speed += 2; // Aumenta a velocidade Y da nave
}

// Função para avançar de nível
function nextLevel() {
    level++;
    if (level === 2) {
        enemiesToNextLevel = 25;
    } else if (level === 3) {
        enemiesToNextLevel = 50;
    } else if (level === 4) {
        enemiesToNextLevel = 100;
    }
    enemySpeed += 0.2; // Aumenta a velocidade dos inimigos lentamente
    if (level % 3 === 0) { // A cada 3 níveis
        upgrades++; // Ganha um upgrade
        applyUpgrades();
    }
}

// Função principal do jogo (loop)
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fundo branco
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenha a nave
    ctx.drawImage(shipImage, ship.x, ship.y, ship.width, ship.height);

    // Desenha os tiros e atualiza sua posição
    bullets.forEach((bullet, index) => {
        bullet.x += 5;
        if (bullet.x > canvas.width) {
            bullets.splice(index, 1); // Remove o tiro se sair da tela
        } else {
            ctx.drawImage(bulletImage, bullet.x, bullet.y, bullet.width, bullet.height);
        }
    });

    // Gera inimigos e atualiza sua posição
    enemies.forEach((enemy, index) => {
        enemy.x -= enemySpeed;
        if (enemy.x < 0) {
            enemies.splice(index, 1); // Remove o inimigo se sair da tela
        } else {
            ctx.drawImage(enemy.type === 'power-up' ? powerUpImage : enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
        }

        // Checa colisão entre tiro e inimigo/power-up
        bullets.forEach((bullet, bulletIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.height + bullet.y > enemy.y
            ) {
                bullets.splice(bulletIndex, 1); // Remove o tiro
                if (enemy.type === 'power-up') {
                    increaseYSpeed(); // Aumenta a velocidade Y da nave ao coletar o power-up
                }
                enemies.splice(index, 1); // Remove o inimigo ou power-up
                score++; // Aumenta a pontuação
            }
        });

        // Checa colisão entre nave e power-up
        if (
            ship.x < enemy.x + enemy.width &&
            ship.x + ship.width > enemy.x &&
            ship.y < enemy.y + enemy.height &&
            ship.height + ship.y > enemy.y &&
            enemy.type === 'power-up'
        ) {
            increaseYSpeed(); // Aumenta a velocidade Y da nave ao passar sobre o power-up
            enemies.splice(index, 1); // Remove o power-up
        }

        // Checa colisão entre nave e inimigo
        if (
            ship.x < enemy.x + enemy.width &&
            ship.x + ship.width > enemy.x &&
            ship.y < enemy.y + enemy.height &&
            ship.height + ship.y > enemy.y &&
            enemy.type === 'enemy'
        ) {
            alert('Game Over! Sua pontuação: ' + score + ' | Nível: ' + level);
            document.location.reload();
        }
    });

    // Atualiza a pontuação na tela
    updateScore();

    // Aumenta de nível conforme a quantidade de inimigos derrotados
    if (score >= enemiesToNextLevel) {
        nextLevel();
    }

    requestAnimationFrame(gameLoop);
}

// Função para atualizar a pontuação na tela
function updateScore() {
    scoreDisplay.innerText = 'Pontuação: ' + score + ' | Nível: ' + level;
}

// Gera inimigos a cada 1.5 segundos (diminui com níveis)
setInterval(generateEnemies, Math.max(1000 - level * 100, 500));

// Inicia o loop do jogo
gameLoop();
