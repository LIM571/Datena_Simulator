const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ajusta o tamanho do canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight * 0.75; // 75% da altura da tela

// Variáveis do jogo
const shipImage = new Image();
shipImage.src = 'img1.png'; // Substitua pelo caminho da sua imagem de nave

const bulletImage = new Image();
bulletImage.src = 'img2.png'; // Substitua pelo caminho da sua imagem de tiro (projétil maior)

const enemyImage = new Image();
enemyImage.src = 'img3.png'; // Substitua pelo caminho da sua imagem de inimigo

const powerUpImage = new Image();
powerUpImage.src = 'img4.png'; // Substitua pelo caminho da imagem de power-up

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
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.75; // 75% da altura da tela
    ship.y = canvas.height / 2 - 25; // Reposiciona a nave ao redimensionar
}

// Atualiza o canvas ao redimensionar a tela
window.addEventListener('resize', resizeCanvas);

// Controles da nave com teclas
document.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowUp' && ship.y > 0) {
        ship.y -= ship.speed;
    } else if (event.key === 'ArrowDown' && ship.y < canvas.height - ship.height) {
        ship.y += ship.speed;
    } else if (event.key === ' ') {
        shoot();
    }
});

// Funções para controlar a nave pelos botões
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

document.getElementById('shootButton').addEventListener('click', shoot);

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
    
    if (isPowerUp) {
        enemies.push({ x: canvas.width, y: yPosition, width: 50, height: 50, type: 'power-up' });
    } else {
        enemies.push({ x: canvas.width, y: yPosition, width: 50, height: 50, type: 'enemy' });
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
            if (enemy.type === 'power-up') {
                ctx.drawImage(powerUpImage, enemy.x, enemy.y, enemy.width, enemy.height); // Desenha power-up
            } else {
                ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height); // Desenha inimigo
            }
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

    // Exibe a pontuação e nível
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Pontuação: ' + score, 10, 20);
    ctx.fillText('Nível: ' + level, 10, 40);

    // Aumenta de nível conforme a quantidade de inimigos derrotados
    if (score >= enemiesToNextLevel) {
        nextLevel();
    }

    requestAnimationFrame(gameLoop);
}

// Gera inimigos a cada 1.5 segundos (diminui com níveis)
setInterval(generateEnemies, Math.max(1000 - level * 100, 500));

// Inicia o loop do jogo
gameLoop();
