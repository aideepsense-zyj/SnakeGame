class SnakeGame {
    constructor() {
        // 获取DOM元素
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.menuElement = document.getElementById('menu');
        this.gameOverElement = document.getElementById('gameOver');
        this.scoreElement = document.getElementById('score');
        this.finalScoreElement = document.getElementById('finalScore');
        this.highScoreElement = document.getElementById('highScore');
        this.speedSlider = document.getElementById('speedSlider');
        this.speedValue = document.getElementById('speedValue');
        
        this.setupCanvas();
        
        // 游戏配置
        this.gridSize = 20;
        this.snake = [];
        this.food = { x: 0, y: 0 };
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.baseSpeed = 150; // 基础速度
        this.speedMultiplier = 1; // 速度倍数
        this.gameSpeed = this.baseSpeed;
        this.gameLoop = null;
        this.touchStartX = 0;
        this.touchStartY = 0;
        
        // 设置最高分
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.highScoreElement.textContent = this.highScore;
        
        // 绑定事件处理器
        this.bindEventHandlers();
        
        // 显示开始菜单
        this.showMenu();
    }
    
    setupCanvas() {
        // 设置画布大小为容器大小
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        // 计算网格大小
        this.cols = Math.floor(this.canvas.width / 20);
        this.rows = Math.floor(this.canvas.height / 20);
        
        // 更新实际的网格大小以适应画布
        this.gridSize = Math.min(
            this.canvas.width / this.cols,
            this.canvas.height / this.rows
        );
    }
    
    showMenu() {
        this.menuElement.style.display = 'block';
        this.gameOverElement.style.display = 'none';
    }
    
    bindEventHandlers() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
        
        // 触摸控制
        this.canvas.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            this.handleSwipe(touchEndX - this.touchStartX, touchEndY - this.touchStartY);
        });
        
        // 按钮事件
        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('restartButton').addEventListener('click', () => {
            this.hideGameOver();
            this.startGame();
        });
        
        // 速度控制
        this.speedSlider.addEventListener('input', () => {
            const speedLevel = parseInt(this.speedSlider.value);
            switch(speedLevel) {
                case 1:
                    this.speedMultiplier = 1.5;
                    this.speedValue.textContent = '慢速';
                    break;
                case 2:
                    this.speedMultiplier = 1;
                    this.speedValue.textContent = '正常';
                    break;
                case 3:
                    this.speedMultiplier = 0.6;
                    this.speedValue.textContent = '快速';
                    break;
            }
            
            // 如果游戏正在运行，更新游戏速度
            if (this.gameLoop) {
                clearInterval(this.gameLoop);
                this.gameSpeed = this.baseSpeed * this.speedMultiplier;
                this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
            }
        });
        
        // 窗口大小改变时重新设置画布
        window.addEventListener('resize', () => {
            this.setupCanvas();
        });
    }
    
    handleKeyPress(e) {
        const key = e.key.toLowerCase();
        
        // 支持方向键和WASD
        switch(key) {
            case 'arrowup':
            case 'w':
                if (this.direction !== 'down') this.nextDirection = 'up';
                break;
            case 'arrowdown':
            case 's':
                if (this.direction !== 'up') this.nextDirection = 'down';
                break;
            case 'arrowleft':
            case 'a':
                if (this.direction !== 'right') this.nextDirection = 'left';
                break;
            case 'arrowright':
            case 'd':
                if (this.direction !== 'left') this.nextDirection = 'right';
                break;
        }
    }
    
    handleSwipe(deltaX, deltaY) {
        const sensitivity = 50;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // 水平滑动
            if (deltaX > sensitivity && this.direction !== 'left') {
                this.nextDirection = 'right';
            } else if (deltaX < -sensitivity && this.direction !== 'right') {
                this.nextDirection = 'left';
            }
        } else {
            // 垂直滑动
            if (deltaY > sensitivity && this.direction !== 'up') {
                this.nextDirection = 'down';
            } else if (deltaY < -sensitivity && this.direction !== 'down') {
                this.nextDirection = 'up';
            }
        }
    }
    
    startGame() {
        this.menuElement.style.display = 'none';
        this.snake = [
            { x: Math.floor(this.cols / 2), y: Math.floor(this.rows / 2) }
        ];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.scoreElement.textContent = this.score;
        this.generateFood();
        
        // 根据当前选择的速度设置游戏速度
        this.gameSpeed = this.baseSpeed * this.speedMultiplier;
        
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
    }
    
    generateFood() {
        do {
            this.food = {
                x: Math.floor(Math.random() * this.cols),
                y: Math.floor(Math.random() * this.rows)
            };
        } while (this.snake.some(segment => 
            segment.x === this.food.x && segment.y === this.food.y));
    }
    
    update() {
        this.direction = this.nextDirection;
        
        // 计算新的蛇头位置
        const head = { ...this.snake[0] };
        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        
        // 检查碰撞
        if (this.checkCollision(head)) {
            this.gameOver();
            return;
        }
        
        // 移动蛇
        this.snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.scoreElement.textContent = this.score;
            this.generateFood();
            
            // 加快游戏速度
            if (this.score % 50 === 0 && this.gameSpeed > 60) {
                clearInterval(this.gameLoop);
                this.gameSpeed -= 10;
                this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
            }
        } else {
            this.snake.pop();
        }
        
        this.draw();
    }
    
    checkCollision(head) {
        // 检查墙壁碰撞
        if (head.x < 0 || head.x >= this.cols || head.y < 0 || head.y >= this.rows) {
            return true;
        }
        
        // 检查自身碰撞
        return this.snake.some(segment => segment.x === head.x && segment.y === head.y);
    }
    
    draw() {
        // 清空画布
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格
        this.ctx.strokeStyle = 'rgba(78, 204, 163, 0.15)';
        this.ctx.lineWidth = 1;
        
        // 使用单一路径绘制所有网格线，提高性能
        this.ctx.beginPath();
        
        // 绘制垂直线
        for (let x = 0; x <= this.cols; x++) {
            const xPos = x * this.gridSize;
            this.ctx.moveTo(xPos, 0);
            this.ctx.lineTo(xPos, this.canvas.height);
        }
        
        // 绘制水平线
        for (let y = 0; y <= this.rows; y++) {
            const yPos = y * this.gridSize;
            this.ctx.moveTo(0, yPos);
            this.ctx.lineTo(this.canvas.width, yPos);
        }
        
        // 一次性绘制所有线条
        this.ctx.stroke();
        
        // 添加网格的渐变效果
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, 'rgba(78, 204, 163, 0.05)');
        gradient.addColorStop(0.5, 'rgba(78, 204, 163, 0.02)');
        gradient.addColorStop(1, 'rgba(78, 204, 163, 0.05)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制食物
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.beginPath();
        const foodX = (this.food.x + 0.5) * this.gridSize;
        const foodY = (this.food.y + 0.5) * this.gridSize;
        this.ctx.arc(foodX, foodY, this.gridSize / 2 * 0.8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 绘制蛇
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            const padding = 1;
            
            // 计算连接点
            let prevSegment = this.snake[index - 1];
            let nextSegment = this.snake[index + 1];
            
            // 创建主体渐变色
            const gradient = this.ctx.createLinearGradient(
                x, y, x + this.gridSize, y + this.gridSize
            );
            
            if (index === 0) { // 蛇头使用特殊颜色
                gradient.addColorStop(0, '#66ffb3');
                gradient.addColorStop(1, '#4ecca3');
            } else { // 蛇身渐变
                gradient.addColorStop(0, '#4ecca3');
                gradient.addColorStop(1, '#45b08c');
            }
            
            this.ctx.fillStyle = gradient;
            
            // 绘制身体段落
            this.ctx.beginPath();
            if (index === 0) { // 蛇头
                // 根据方向绘制蛇头形状
                const headRadius = this.gridSize / 2.5;
                this.ctx.roundRect(
                    x + padding, y + padding,
                    this.gridSize - padding * 2, this.gridSize - padding * 2,
                    headRadius
                );
            } else { // 蛇身
                this.ctx.roundRect(
                    x + padding, y + padding,
                    this.gridSize - padding * 2, this.gridSize - padding * 2,
                    this.gridSize / 5
                );
            }
            this.ctx.fill();
            
            // 添加鳞片效果
            if (index > 0) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                this.ctx.beginPath();
                this.ctx.ellipse(
                    x + this.gridSize / 2,
                    y + this.gridSize / 2,
                    this.gridSize / 3,
                    this.gridSize / 4,
                    0, 0, Math.PI * 2
                );
                this.ctx.fill();
            }
            
            // 为蛇头添加细节
            if (index === 0) {
                // 眼睛
                const eyeSize = this.gridSize / 7;
                const eyeOffset = this.gridSize / 3;
                let eyeX1, eyeX2, eyeY1, eyeY2;
                
                // 根据方向调整眼睛位置
                switch(this.direction) {
                    case 'right':
                        eyeX1 = eyeX2 = x + this.gridSize - eyeOffset;
                        eyeY1 = y + eyeOffset;
                        eyeY2 = y + this.gridSize - eyeOffset;
                        break;
                    case 'left':
                        eyeX1 = eyeX2 = x + eyeOffset;
                        eyeY1 = y + eyeOffset;
                        eyeY2 = y + this.gridSize - eyeOffset;
                        break;
                    case 'up':
                        eyeY1 = eyeY2 = y + eyeOffset;
                        eyeX1 = x + eyeOffset;
                        eyeX2 = x + this.gridSize - eyeOffset;
                        break;
                    case 'down':
                        eyeY1 = eyeY2 = y + this.gridSize - eyeOffset;
                        eyeX1 = x + eyeOffset;
                        eyeX2 = x + this.gridSize - eyeOffset;
                        break;
                }
                
                // 绘制眼白
                this.ctx.fillStyle = '#fff';
                this.ctx.beginPath();
                this.ctx.arc(eyeX1, eyeY1, eyeSize, 0, Math.PI * 2);
                this.ctx.arc(eyeX2, eyeY2, eyeSize, 0, Math.PI * 2);
                this.ctx.fill();
                
                // 绘制眼球
                this.ctx.fillStyle = '#000';
                this.ctx.beginPath();
                this.ctx.arc(eyeX1, eyeY1, eyeSize / 2, 0, Math.PI * 2);
                this.ctx.arc(eyeX2, eyeY2, eyeSize / 2, 0, Math.PI * 2);
                this.ctx.fill();
                
                // 添加高光
                this.ctx.fillStyle = '#fff';
                this.ctx.beginPath();
                this.ctx.arc(eyeX1 - eyeSize / 4, eyeY1 - eyeSize / 4, eyeSize / 4, 0, Math.PI * 2);
                this.ctx.arc(eyeX2 - eyeSize / 4, eyeY2 - eyeSize / 4, eyeSize / 4, 0, Math.PI * 2);
                this.ctx.fill();
                
                // 添加舌头
                const tongueLength = this.gridSize / 2;
                const tongueWidth = this.gridSize / 8;
                this.ctx.fillStyle = '#ff3366';
                this.ctx.beginPath();
                
                let tongueX, tongueY, tongueEndX, tongueEndY;
                switch(this.direction) {
                    case 'right':
                        tongueX = x + this.gridSize - padding;
                        tongueY = y + this.gridSize / 2;
                        tongueEndX = tongueX + tongueLength;
                        tongueEndY = tongueY;
                        break;
                    case 'left':
                        tongueX = x + padding;
                        tongueY = y + this.gridSize / 2;
                        tongueEndX = tongueX - tongueLength;
                        tongueEndY = tongueY;
                        break;
                    case 'up':
                        tongueX = x + this.gridSize / 2;
                        tongueY = y + padding;
                        tongueEndX = tongueX;
                        tongueEndY = tongueY - tongueLength;
                        break;
                    case 'down':
                        tongueX = x + this.gridSize / 2;
                        tongueY = y + this.gridSize - padding;
                        tongueEndX = tongueX;
                        tongueEndY = tongueY + tongueLength;
                        break;
                }
                
                // 绘制分叉舌头
                this.ctx.moveTo(tongueX, tongueY);
                if (this.direction === 'left' || this.direction === 'right') {
                    this.ctx.lineTo(tongueEndX, tongueEndY - tongueWidth);
                    this.ctx.lineTo(tongueEndX, tongueEndY + tongueWidth);
                } else {
                    this.ctx.lineTo(tongueEndX - tongueWidth, tongueEndY);
                    this.ctx.lineTo(tongueEndX + tongueWidth, tongueEndY);
                }
                this.ctx.closePath();
                this.ctx.fill();
            }
        });
    }
    
    gameOver() {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        
        // 更新最高分
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreElement.textContent = this.highScore;
            localStorage.setItem('snakeHighScore', this.highScore);
        }
        
        this.finalScoreElement.textContent = this.score;
        this.showGameOver();
    }
    
    showGameOver() {
        this.gameOverElement.style.display = 'block';
    }
    
    hideGameOver() {
        this.gameOverElement.style.display = 'none';
    }
}

// 等待DOM完全加载后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});