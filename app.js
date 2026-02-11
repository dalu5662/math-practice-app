// 应用状态管理
const AppState = {
    MODE_SELECTION: 'mode_selection',
    PRACTICE: 'practice',
    RESULT: 'result',
    WRONG_PRACTICE: 'wrong_practice'
};

class MathPracticeApp {
    constructor() {
        this.currentState = AppState.MODE_SELECTION;
        this.practiceMode = 'addSub'; // 'addSub' 或 'all'
        
        // 练习数据
        this.startTime = null;
        this.timeRemaining = 10 * 60; // 10分钟，单位：秒
        this.timerInterval = null;
        
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.correctAnswers = 0;
        this.wrongAnswers = 0;
        
        this.history = this.loadHistory();
        this.wrongQuestions = this.loadWrongQuestions();
        
        // 错题专项练习数据
        this.wrongPracticeMode = 'original'; // 'original', 'similar', 'mixed'
        this.wrongDifficulty = 2; // 1-3
        this.wrongPracticeQuestions = [];
        this.currentWrongIndex = 0;
        this.wrongPracticeCorrect = 0;
        this.selectedWrongQuestions = new Set();
        
        this.initializeElements();
        this.bindEvents();
        this.updateUI();
    }
    
    initializeElements() {
        // 界面元素
        this.controlPanel = document.getElementById('controlPanel');
        this.practiceInterface = document.getElementById('practiceInterface');
        this.resultInterface = document.getElementById('resultInterface');
        this.wrongPracticeInterface = document.getElementById('wrongPracticeInterface');
        
        // 模式选择
        this.modeAddSub = document.getElementById('modeAddSub');
        this.modeAll = document.getElementById('modeAll');
        
        // 按钮
        this.startBtn = document.getElementById('startBtn');
        this.submitBtn = document.getElementById('submitBtn');
        this.skipBtn = document.getElementById('skipBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.reviewBtn = document.getElementById('reviewBtn');
        this.practiceWrongBtn = document.getElementById('practiceWrongBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        
        // 显示元素
        this.timerDisplay = document.getElementById('timer');
        this.accuracyDisplay = document.getElementById('accuracy');
        this.currentQuestionDisplay = document.getElementById('currentQuestion');
        this.totalQuestionsDisplay = document.getElementById('totalQuestions');
        this.questionText = document.getElementById('questionText');
        this.expression = document.getElementById('expression');
        this.answerInput = document.getElementById('answerInput');
        this.feedback = document.getElementById('feedback');
        this.questionList = document.getElementById('questionList');
        
        // 结果界面元素
        this.finalCorrect = document.getElementById('finalCorrect');
        this.finalWrong = document.getElementById('finalWrong');
        this.finalAccuracy = document.getElementById('finalAccuracy');
        this.finalTotal = document.getElementById('finalTotal');
        this.resultsList = document.getElementById('resultsList');
        this.wrongQuestionsList = document.getElementById('wrongQuestionsList');
        this.historyList = document.getElementById('historyList');
        
        // 错题专项练习元素
        this.wrongTotal = document.getElementById('wrongTotal');
        this.wrongUnmastered = document.getElementById('wrongUnmastered');
        this.wrongCorrect = document.getElementById('wrongCorrect');
        this.wrongProgress = document.getElementById('wrongProgress');
        
        this.modeOriginal = document.getElementById('modeOriginal');
        this.modeSimilar = document.getElementById('modeSimilar');
        this.modeMixed = document.getElementById('modeMixed');
        this.difficultyRange = document.getElementById('difficultyRange');
        
        this.wrongQuestionIndex = document.getElementById('wrongQuestionIndex');
        this.wrongOriginalQuestion = document.getElementById('wrongOriginalQuestion');
        this.wrongMasteryLevel = document.getElementById('wrongMasteryLevel');
        this.wrongQuestionText = document.getElementById('wrongQuestionText');
        this.wrongExpression = document.getElementById('wrongExpression');
        this.wrongAnswerInput = document.getElementById('wrongAnswerInput');
        this.wrongSubmitBtn = document.getElementById('wrongSubmitBtn');
        this.wrongShowAnswerBtn = document.getElementById('wrongShowAnswerBtn');
        this.wrongSkipBtn = document.getElementById('wrongSkipBtn');
        this.wrongMarkMasteredBtn = document.getElementById('wrongMarkMasteredBtn');
        this.wrongFeedback = document.getElementById('wrongFeedback');
        
        this.selectAllBtn = document.getElementById('selectAllBtn');
        this.deselectAllBtn = document.getElementById('deselectAllBtn');
        this.deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
        this.exportWrongBtn = document.getElementById('exportWrongBtn');
        this.wrongListContainer = document.getElementById('wrongListContainer');
        
        this.backToResultsBtn = document.getElementById('backToResultsBtn');
        this.newSimilarSetBtn = document.getElementById('newSimilarSetBtn');
        this.finishWrongPracticeBtn = document.getElementById('finishWrongPracticeBtn');
    }
    
    bindEvents() {
        // 模式选择
        this.modeAddSub.addEventListener('click', () => this.selectMode('addSub'));
        this.modeAll.addEventListener('click', () => this.selectMode('all'));
        
        // 开始练习
        this.startBtn.addEventListener('click', () => this.startPractice());
        
        // 提交答案
        this.submitBtn.addEventListener('click', () => this.submitAnswer());
        this.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitAnswer();
        });
        
        // 跳过题目
        this.skipBtn.addEventListener('click', () => this.nextQuestion());
        
        // 结果界面按钮
        this.restartBtn.addEventListener('click', () => this.restartPractice());
        this.reviewBtn.addEventListener('click', () => this.reviewWrongQuestions());
        this.practiceWrongBtn.addEventListener('click', () => this.startWrongPractice());
        this.downloadBtn.addEventListener('click', () => this.downloadResults());
        
        // 错题专项练习
        this.modeOriginal.addEventListener('click', () => this.selectWrongMode('original'));
        this.modeSimilar.addEventListener('click', () => this.selectWrongMode('similar'));
        this.modeMixed.addEventListener('click', () => this.selectWrongMode('mixed'));
        
        this.difficultyRange.addEventListener('input', (e) => {
            this.wrongDifficulty = parseInt(e.target.value);
            this.updateWrongStats();
        });
        
        this.wrongSubmitBtn.addEventListener('click', () => this.submitWrongAnswer());
        this.wrongAnswerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitWrongAnswer();
        });
        
        this.wrongShowAnswerBtn.addEventListener('click', () => this.showWrongAnswer());
        this.wrongSkipBtn.addEventListener('click', () => this.nextWrongQuestion());
        this.wrongMarkMasteredBtn.addEventListener('click', () => this.markWrongAsMastered());
        
        this.selectAllBtn.addEventListener('click', () => this.selectAllWrongQuestions());
        this.deselectAllBtn.addEventListener('click', () => this.deselectAllWrongQuestions());
        this.deleteSelectedBtn.addEventListener('click', () => this.deleteSelectedWrongQuestions());
        this.exportWrongBtn.addEventListener('click', () => this.exportWrongQuestions());
        
        this.backToResultsBtn.addEventListener('click', () => this.backToResults());
        this.newSimilarSetBtn.addEventListener('click', () => this.generateSimilarQuestions());
        this.finishWrongPracticeBtn.addEventListener('click', () => this.finishWrongPractice());
    }
    
    selectMode(mode) {
        this.practiceMode = mode;
        
        // 更新按钮状态
        this.modeAddSub.classList.toggle('active', mode === 'addSub');
        this.modeAll.classList.toggle('active', mode === 'all');
    }
    
    selectWrongMode(mode) {
        this.wrongPracticeMode = mode;
        
        // 更新按钮状态
        this.modeOriginal.classList.toggle('active', mode === 'original');
        this.modeSimilar.classList.toggle('active', mode === 'similar');
        this.modeMixed.classList.toggle('active', mode === 'mixed');
        
        // 重新生成题目
        this.generateWrongPracticeQuestions();
    }
    
    startPractice() {
        this.currentState = AppState.PRACTICE;
        this.startTime = new Date();
        this.timeRemaining = 10 * 60;
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.correctAnswers = 0;
        this.wrongAnswers = 0;
        
        // 生成第一批题目
        this.generateQuestions(10);
        
        // 开始计时器
        this.startTimer();
        
        // 显示第一题
        this.displayCurrentQuestion();
        
        // 切换界面
        this.updateUI();
        
        // 聚焦到答案输入框
        setTimeout(() => this.answerInput.focus(), 100);
    }
    
    startWrongPractice() {
        this.currentState = AppState.WRONG_PRACTICE;
        this.currentWrongIndex = 0;
        this.wrongPracticeCorrect = 0;
        this.selectedWrongQuestions.clear();
        
        // 生成错题练习题目
        this.generateWrongPracticeQuestions();
        
        // 更新统计
        this.updateWrongStats();
        
        // 显示第一题
        this.displayCurrentWrongQuestion();
        
        // 切换界面
        this.updateUI();
        
        // 聚焦到答案输入框
        setTimeout(() => this.wrongAnswerInput.focus(), 100);
    }
    
    generateQuestions(count) {
        const newQuestions = [];
        
        for (let i = 0; i < count; i++) {
            const questionType = Math.floor(Math.random() * 3); // 0, 1, 2
            
            let question;
            if (this.practiceMode === 'addSub') {
                // 加减混合模式
                question = this.generateAddSubQuestion(questionType);
            } else {
                // 加减乘除混合模式
                question = this.generateAllOpsQuestion(questionType);
            }
            
            newQuestions.push(question);
        }
        
        this.questions.push(...newQuestions);
        
        // 后台继续生成更多题目（并行处理）
        if (this.currentState === AppState.PRACTICE) {
            setTimeout(() => {
                if (this.questions.length < 50) {
                    this.generateQuestions(10);
                }
            }, 1000);
        }
    }
    
    generateAddSubQuestion(type) {
        let x, y, z, op;
        
        switch(type) {
            case 0: // x + y = ?
                op = Math.random() < 0.5 ? '+' : '-';
                x = this.getRandomNumber(0, 100);
                y = this.getRandomNumber(0, 100);
                
                // 确保减法结果在0-100范围内
                if (op === '-') {
                    // 确保x ≥ y，避免负数
                    if (x < y) {
                        [x, y] = [y, x];
                    }
                }
                
                z = op === '+' ? x + y : x - y;
                return {
                    expression: `${x} ${op} ${y} = ?`,
                    answer: z,
                    userAnswer: null,
                    isCorrect: null,
                    type: 'normal',
                    originalType: 'addSub',
                    difficulty: op === '+' ? 1 : 2
                };
                
            case 1: // (?) + y = z
                op = Math.random() < 0.5 ? '+' : '-';
                
                if (op === '+') {
                    // ? + y = z，需要 ? = z - y ≥ 0
                    do {
                        y = this.getRandomNumber(0, 100);
                        z = this.getRandomNumber(0, 100);
                    } while (z < y); // 确保z ≥ y
                    x = z - y;
                } else {
                    // ? - y = z，需要 ? = z + y ≤ 100
                    do {
                        y = this.getRandomNumber(0, 100);
                        z = this.getRandomNumber(0, 100);
                    } while (z + y > 100); // 确保z + y ≤ 100
                    x = z + y;
                }
                
                return {
                    expression: `? ${op} ${y} = ${z}`,
                    answer: x,
                    userAnswer: null,
                    isCorrect: null,
                    type: 'missing_first',
                    originalType: 'addSub',
                    difficulty: 2
                };
                
            case 2: // x + (?) = z
                op = Math.random() < 0.5 ? '+' : '-';
                
                if (op === '+') {
                    // x + ? = z，需要 ? = z - x ≥ 0
                    do {
                        x = this.getRandomNumber(0, 100);
                        z = this.getRandomNumber(0, 100);
                    } while (z < x); // 确保z ≥ x
                    y = z - x;
                } else {
                    // x - ? = z，需要 ? = x - z ≥ 0
                    do {
                        x = this.getRandomNumber(0, 100);
                        z = this.getRandomNumber(0, 100);
                    } while (x < z); // 确保x ≥ z
                    y = x - z;
                }
                
                return {
                    expression: `${x} ${op} ? = ${z}`,
                    answer: y,
                    userAnswer: null,
                    isCorrect: null,
                    type: 'missing_second',
                    originalType: 'addSub',
                    difficulty: 2
                };
        }
    }
    
    generateAllOpsQuestion(type) {
        let x, y, z, op;
        const operators = ['+', '-', '*', '/'];
        op = operators[Math.floor(Math.random() * operators.length)];
        
        switch(type) {
            case 0: // x op y = ?
                if (op === '/') {
                    // 除法：确保整除且除数不为0
                    y = this.getRandomNumber(1, 10);
                    z = this.getRandomNumber(0, 10);
                    x = y * z;
                } else if (op === '*') {
                    // 乘法：结果在0-100
                    x = this.getRandomNumber(0, 10);
                    y = this.getRandomNumber(0, 10);
                    z = x * y;
                } else if (op === '+') {
                    // 加法
                    x = this.getRandomNumber(0, 100);
                    y = this.getRandomNumber(0, 100);
                    z = x + y;
                } else {
                    // 减法：确保非负
                    x = this.getRandomNumber(0, 100);
                    y = this.getRandomNumber(0, 100);
                    if (x < y) {
                        [x, y] = [y, x];
                    }
                    z = x - y;
                }
                
                // 确保所有结果在0-100范围内
                x = Math.max(0, Math.min(100, x));
                y = Math.max(0, Math.min(100, y));
                z = Math.max(0, Math.min(100, z));
                
                return {
                    expression: `${x} ${op} ${y} = ?`,
                    answer: z,
                    userAnswer: null,
                    isCorrect: null,
                    type: 'normal',
                    originalType: 'allOps',
                    difficulty: op === '+' || op === '-' ? 1 : op === '*' ? 2 : 3
                };
                
            case 1: // (?) op y = z
                if (op === '*') {
                    // ? × y = z
                    y = this.getRandomNumber(0, 10);
                    z = this.getRandomNumber(0, 100);
                    if (y === 0) {
                        x = 0;
                    } else {
                        x = Math.round(z / y);
                        if (x * y !== z) {
                            z = x * y;
                        }
                    }
                } else if (op === '/') {
                    // ? ÷ y = z
                    y = this.getRandomNumber(1, 10);
                    z = this.getRandomNumber(0, 10);
                    x = y * z;
                } else if (op === '+') {
                    // ? + y = z，需要z ≥ y
                    do {
                        y = this.getRandomNumber(0, 100);
                        z = this.getRandomNumber(0, 100);
                    } while (z < y);
                    x = z - y;
                } else {
                    // ? - y = z，需要z + y ≤ 100
                    do {
                        y = this.getRandomNumber(0, 100);
                        z = this.getRandomNumber(0, 100);
                    } while (z + y > 100);
                    x = z + y;
                }
                
                // 确保结果在0-100范围内
                x = Math.max(0, Math.min(100, x));
                y = Math.max(0, Math.min(100, y));
                z = Math.max(0, Math.min(100, z));
                
                return {
                    expression: `? ${op} ${y} = ${z}`,
                    answer: x,
                    userAnswer: null,
                    isCorrect: null,
                    type: 'missing_first',
                    originalType: 'allOps',
                    difficulty: 3
                };
                
            case 2: // x op (?) = z
                if (op === '*') {
                    // x × ? = z
                    x = this.getRandomNumber(0, 10);
                    z = this.getRandomNumber(0, 100);
                    if (x === 0) {
                        y = 0;
                    } else {
                        y = Math.round(z / x);
                        if (y * x !== z) {
                            z = y * x;
                        }
                    }
                } else if (op === '/') {
                    // x ÷ ? = z
                    z = this.getRandomNumber(0, 10);
                    if (z === 0) {
                        x = 0;
                        y = this.getRandomNumber(1, 10);
                    } else {
                        y = this.getRandomNumber(1, 10);
                        x = y * z;
                    }
                } else if (op === '+') {
                    // x + ? = z，需要z ≥ x
                    do {
                        x = this.getRandomNumber(0, 100);
                        z = this.getRandomNumber(0, 100);
                    } while (z < x);
                    y = z - x;
                } else {
                    // x - ? = z，需要x ≥ z
                    do {
                        x = this.getRandomNumber(0, 100);
                        z = this.getRandomNumber(0, 100);
                    } while (x < z);
                    y = x - z;
                }
                
                // 确保结果在0-100范围内
                x = Math.max(0, Math.min(100, x));
                y = Math.max(0, Math.min(100, y));
                z = Math.max(0, Math.min(100, z));
                
                return {
                    expression: `${x} ${op} ? = ${z}`,
                    answer: y,
                    userAnswer: null,
                    isCorrect: null,
                    type: 'missing_second',
                    originalType: 'allOps',
                    difficulty: 3
                };
        }
    }
    
    generateWrongPracticeQuestions() {
        this.wrongPracticeQuestions = [];
        
        if (this.wrongQuestions.length === 0) {
            this.showWrongFeedback('暂无错题可练习！', 'hint');
            return;
        }
        
        // 根据模式生成题目
        switch(this.wrongPracticeMode) {
            case 'original':
                // 原题重做
                this.wrongPracticeQuestions = this.wrongQuestions
                    .filter(q => !q.mastered || this.wrongDifficulty === 3)
                    .slice(0, 10)
                    .map(q => ({
                        ...q,
                        practiceType: 'original',
                        isPracticeCorrect: null,
                        practiceAnswer: null
                    }));
                break;
                
            case 'similar':
                // 举一反三
                const unmastered = this.wrongQuestions.filter(q => !q.mastered);
                if (unmastered.length === 0) {
                    this.showWrongFeedback('所有错题已掌握！', 'hint');
                    return;
                }
                
                for (let i = 0; i < Math.min(10, unmastered.length * 2); i++) {
                    const original = unmastered[Math.floor(Math.random() * unmastered.length)];
                    const similar = this.generateSimilarQuestion(original);
                    this.wrongPracticeQuestions.push({
                        ...similar,
                        originalExpression: original.expression,
                        originalAnswer: original.correctAnswer,
                        practiceType: 'similar',
                        isPracticeCorrect: null,
                        practiceAnswer: null
                    });
                }
                break;
                
            case 'mixed':
                // 混合练习
                const allWrong = this.wrongQuestions.filter(q => 
                    !q.mastered || this.wrongDifficulty === 3
                );
                
                for (let i = 0; i < Math.min(15, allWrong.length * 2); i++) {
                    const original = allWrong[Math.floor(Math.random() * allWrong.length)];
                    if (Math.random() < 0.5) {
                        // 原题
                        this.wrongPracticeQuestions.push({
                            ...original,
                            practiceType: 'original',
                            isPracticeCorrect: null,
                            practiceAnswer: null
                        });
                    } else {
                        // 相似题
                        const similar = this.generateSimilarQuestion(original);
                        this.wrongPracticeQuestions.push({
                            ...similar,
                            originalExpression: original.expression,
                            originalAnswer: original.correctAnswer,
                            practiceType: 'similar',
                            isPracticeCorrect: null,
                            practiceAnswer: null
                        });
                    }
                }
                break;
        }
        
        // 打乱顺序
        this.shuffleArray(this.wrongPracticeQuestions);
        
        this.updateWrongStats();
    }
    
    generateSimilarQuestion(original) {
        // 解析原题
        const match = original.expression.match(/(\d+|\?)\s*([+\-*/])\s*(\d+|\?)\s*=\s*(\d+|\?)/);
        if (!match) return original;
        
        const [, left, operator, right, result] = match;
        
        // 根据难度生成相似题
        let newLeft = left, newRight = right, newResult = result, newOperator = operator;
        
        if (this.wrongDifficulty >= 1) {
            // 难度1：仅数字变化
            if (left !== '?') newLeft = this.getRandomNumber(Math.max(0, parseInt(left) - 10), Math.min(100, parseInt(left) + 10));
            if (right !== '?') newRight = this.getRandomNumber(Math.max(0, parseInt(right) - 10), Math.min(100, parseInt(right) + 10));
            if (result !== '?') newResult = this.getRandomNumber(Math.max(0, parseInt(result) - 10), Math.min(100, parseInt(result) + 10));
        }
        
        if (this.wrongDifficulty >= 2 && Math.random() < 0.3) {
            // 难度2：运算符变化（保持题型）
            const operators = ['+', '-', '*', '/'];
            newOperator = operators[Math.floor(Math.random() * operators.length)];
        }
        
        // 重新计算确保有效性
        let answer;
        if (left === '?') {
            answer = this.solveEquation(newOperator, newRight, newResult, 'left');
        } else if (right === '?') {
            answer = this.solveEquation(newOperator, newLeft, newResult, 'right');
        } else {
            answer = this.calculateResult(newLeft, newOperator, newRight);
        }
        
        // 确保答案在0-100范围内
        answer = Math.max(0, Math.min(100, answer));
        
        const expression = left === '?' ? `? ${newOperator} ${newRight} = ${newResult}` :
                          right === '?' ? `${newLeft} ${newOperator} ? = ${newResult}` :
                          `${newLeft} ${newOperator} ${newRight} = ?`;
        
        return {
            expression: expression,
            correctAnswer: Math.round(answer),
            userAnswer: null,
            type: original.type,
            originalType: original.originalType || 'addSub',
            difficulty: this.wrongDifficulty
        };
    }
    
    solveEquation(operator, known, result, missingPosition) {
        switch(operator) {
            case '+':
                return missingPosition === 'left' ? result - known : result - known;
            case '-':
                return missingPosition === 'left' ? result + known : known - result;
            case '*':
                return missingPosition === 'left' ? result / known : result / known;
            case '/':
                return missingPosition === 'left' ? result * known : known / result;
            default:
                return 0;
        }
    }
    
    calculateResult(left, operator, right) {
        left = parseInt(left);
        right = parseInt(right);
        
        switch(operator) {
            case '+': return left + right;
            case '-': return left - right;
            case '*': return left * right;
            case '/': return left / right;
            default: return 0;
        }
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
            
            if (this.timeRemaining <= 0) {
                this.endPractice();
            }
        }, 1000);
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        this.timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // 最后30秒变红色
        if (this.timeRemaining <= 30) {
            this.timerDisplay.style.color = '#e53e3e';
            this.timerDisplay.classList.add('pulse');
        } else {
            this.timerDisplay.style.color = '';
            this.timerDisplay.classList.remove('pulse');
        }
    }
    
    displayCurrentQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.generateQuestions(5);
        }
        
        const question = this.questions[this.currentQuestionIndex];
        
        this.questionText.textContent = `第 ${this.currentQuestionIndex + 1} 题`;
        this.expression.textContent = question.expression;
        this.answerInput.value = '';
        this.feedback.textContent = '';
        this.feedback.className = 'feedback';
        
        this.currentQuestionDisplay.textContent = this.currentQuestionIndex + 1;
        this.totalQuestionsDisplay.textContent = this.questions.length;
        
        // 计算并显示正确率
        const accuracy = this.correctAnswers + this.wrongAnswers > 0 
            ? Math.round((this.correctAnswers / (this.correctAnswers + this.wrongAnswers)) * 100)
            : 0;
        this.accuracyDisplay.textContent = `${accuracy}%`;
        
        // 聚焦输入框
        this.answerInput.focus();
    }
    
    displayCurrentWrongQuestion() {
        if (this.wrongPracticeQuestions.length === 0) {
            this.showWrongFeedback('没有可练习的题目！', 'hint');
            return;
        }
        
        if (this.currentWrongIndex >= this.wrongPracticeQuestions.length) {
            this.currentWrongIndex = 0;
        }
        
        const question = this.wrongPracticeQuestions[this.currentWrongIndex];
        
        this.wrongQuestionIndex.textContent = `第 ${this.currentWrongIndex + 1} 题`;
        this.wrongOriginalQuestion.textContent = question.originalExpression ? 
            `原题：${question.originalExpression}` : `原题：${question.expression}`;
        
        // 更新掌握程度显示
        const masteryClass = question.mastered ? 'mastered' : 'unmastered';
        const masteryText = question.mastered ? '已掌握' : '未掌握';
        this.wrongMasteryLevel.textContent = `掌握程度：${masteryText}`;
        this.wrongMasteryLevel.className = `wrong-mastery ${masteryClass}`;
        
        this.wrongQuestionText.textContent = question.practiceType === 'similar' ? 
            '举一反三题目' : '原题重做';
        this.wrongExpression.textContent = question.expression;
        this.wrongAnswerInput.value = '';
        this.wrongFeedback.textContent = '';
        this.wrongFeedback.className = 'wrong-feedback';
        
        // 聚焦输入框
        this.wrongAnswerInput.focus();
        
        // 更新进度
        this.updateWrongStats();
    }
    
    submitAnswer() {
        const userAnswer = parseInt(this.answerInput.value);
        
        if (isNaN(userAnswer) || userAnswer < 0 || userAnswer > 100) {
            this.showFeedback('请输入0-100之间的整数！', 'wrong');
            return;
        }
        
        const question = this.questions[this.currentQuestionIndex];
        question.userAnswer = userAnswer;
        question.isCorrect = userAnswer === question.answer;
        
        if (question.isCorrect) {
            this.correctAnswers++;
            this.showFeedback('✓ 回答正确！', 'correct');
        } else {
            this.wrongAnswers++;
            this.showFeedback(`✗ 回答错误。正确答案是：${question.answer}`, 'wrong');
            
            // 添加到错题本
            this.addToWrongQuestions(question);
        }
        
        // 更新答题记录
        this.updateQuestionList();
        
        // 延迟显示下一题
        setTimeout(() => {
            this.nextQuestion();
        }, 1500);
    }
    
    submitWrongAnswer() {
        const userAnswer = parseInt(this.wrongAnswerInput.value);
        
        if (isNaN(userAnswer) || userAnswer < 0 || userAnswer > 100) {
            this.showWrongFeedback('请输入0-100之间的整数！', 'wrong');
            return;
        }
        
        const question = this.wrongPracticeQuestions[this.currentWrongIndex];
        question.practiceAnswer = userAnswer;
        question.isPracticeCorrect = userAnswer === question.correctAnswer;
        
        if (question.isPracticeCorrect) {
            this.wrongPracticeCorrect++;
            this.showWrongFeedback('✓ 回答正确！', 'correct');
            
            // 如果连续做对3次，自动标记为掌握
            if (question.practiceType === 'original' && !question.mastered) {
                question.practiceCount = (question.practiceCount || 0) + 1;
                if (question.practiceCount >= 3) {
                    question.mastered = true;
                    this.saveWrongQuestions();
                }
            }
        } else {
            this.showWrongFeedback(`✗ 回答错误。正确答案是：${question.correctAnswer}`, 'wrong');
            
            // 重置练习计数
            if (question.practiceType === 'original') {
                question.practiceCount = 0;
            }
        }
        
        // 更新统计
        this.updateWrongStats();
        
        // 延迟显示下一题
        setTimeout(() => {
            this.nextWrongQuestion();
        }, 1500);
    }
    
    showFeedback(message, type) {
        this.feedback.textContent = message;
        this.feedback.className = `feedback ${type}`;
    }
    
    showWrongFeedback(message, type) {
        this.wrongFeedback.textContent = message;
        this.wrongFeedback.className = `wrong-feedback ${type}`;
    }
    
    nextQuestion() {
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex >= this.questions.length) {
            this.generateQuestions(5);
        }
        
        this.displayCurrentQuestion();
    }
    
    nextWrongQuestion() {
        this.currentWrongIndex++;
        
        if (this.currentWrongIndex >= this.wrongPracticeQuestions.length) {
            this.currentWrongIndex = 0;
            
            // 如果所有题目都做完了，提示
            if (this.wrongPracticeQuestions.every(q => q.isPracticeCorrect !== null)) {
                this.showWrongFeedback('🎉 本次练习已完成！', 'correct');
            }
        }
        
        this.displayCurrentWrongQuestion();
    }
    
    showWrongAnswer() {
        const question = this.wrongPracticeQuestions[this.currentWrongIndex];
        this.showWrongFeedback(`正确答案：${question.correctAnswer}`, 'hint');
    }
    
    markWrongAsMastered() {
        const question = this.wrongPracticeQuestions[this.currentWrongIndex];
        
        // 找到对应的原错题
        const originalIndex = this.wrongQuestions.findIndex(q => 
            q.expression === question.expression || 
            (question.originalExpression && q.expression === question.originalExpression)
        );
        
        if (originalIndex !== -1) {
            this.wrongQuestions[originalIndex].mastered = true;
            this.saveWrongQuestions();
            this.showWrongFeedback('✅ 已标记为掌握！', 'correct');
            
            // 更新显示
            this.wrongMasteryLevel.textContent = '掌握程度：已掌握';
            this.wrongMasteryLevel.className = 'wrong-mastery mastered';
            
            // 更新统计
            this.updateWrongStats();
            this.updateWrongList();
        }
    }
    
    updateQuestionList() {
        this.questionList.innerHTML = '';
        
        // 只显示最近的10题
        const startIndex = Math.max(0, this.currentQuestionIndex - 9);
        
        for (let i = startIndex; i <= this.currentQuestionIndex; i++) {
            if (i >= this.questions.length) break;
            
            const question = this.questions[i];
            if (question.userAnswer === null) continue;
            
            const item = document.createElement('div');
            item.className = `question-item ${question.isCorrect ? 'correct' : 'wrong'}`;
            
            item.innerHTML = `
                <div class="question-info">
                    <span class="question-index">第 ${i + 1} 题</span>
                    <span class="question-expr">${question.expression}</span>
                </div>
                <div class="question-result">
                    <span class="user-answer">你的答案: ${question.userAnswer}</span>
                    ${!question.isCorrect ? `<span class="correct-answer">正确答案: ${question.answer}</span>` : ''}
                    <span class="result-icon">${question.isCorrect ? '✓' : '✗'}</span>
                </div>
            `;
            
            this.questionList.appendChild(item);
        }
    }
    
    updateWrongStats() {
        const totalWrong = this.wrongQuestions.length;
        const unmastered = this.wrongQuestions.filter(q => !q.mastered).length;
        const progress = this.wrongPracticeQuestions.length > 0 ? 
            Math.round((this.currentWrongIndex / this.wrongPracticeQuestions.length) * 100) : 0;
        
        this.wrongTotal.textContent = totalWrong;
        this.wrongUnmastered.textContent = unmastered;
        this.wrongCorrect.textContent = this.wrongPracticeCorrect;
        this.wrongProgress.textContent = `${progress}%`;
        
        // 更新错题列表
        this.updateWrongList();
    }
    
    updateWrongList() {
        this.wrongListContainer.innerHTML = '';
        
        this.wrongQuestions.forEach((item, index) => {
            const wrongItem = document.createElement('div');
            wrongItem.className = `wrong-list-item ${item.mastered ? 'mastered' : ''} ${this.selectedWrongQuestions.has(index) ? 'selected' : ''}`;
            
            const practiceCount = item.practiceCount || 0;
            const masteryText = item.mastered ? '已掌握' : practiceCount > 0 ? `练习中(${practiceCount})` : '未练习';
            const masteryClass = item.mastered ? 'mastered' : practiceCount > 0 ? 'learning' : 'unmastered';
            
            wrongItem.innerHTML = `
                <div class="wrong-checkbox">
                    <input type="checkbox" id="wrong-${index}" ${this.selectedWrongQuestions.has(index) ? 'checked' : ''}>
                </div>
                <div class="wrong-item-content">
                    <div class="wrong-expr">${item.expression}</div>
                    <div class="wrong-item-meta">
                        <span class="wrong-answer">正确答案: ${item.correctAnswer}</span>
                        <span class="wrong-date">${new Date(item.date).toLocaleDateString()}</span>
                        <span class="wrong-mastery ${masteryClass}">${masteryText}</span>
                        ${item.originalType ? `<span class="tag ${item.originalType === 'addSub' ? 'add-sub' : 'all-ops'}">${item.originalType === 'addSub' ? '加减' : '四则'}</span>` : ''}
                    </div>
                </div>
            `;
            
            // 添加选择事件
            const checkbox = wrongItem.querySelector(`#wrong-${index}`);
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.selectedWrongQuestions.add(index);
                    wrongItem.classList.add('selected');
                } else {
                    this.selectedWrongQuestions.delete(index);
                    wrongItem.classList.remove('selected');
                }
            });
            
            this.wrongListContainer.appendChild(wrongItem);
        });
    }
    
    selectAllWrongQuestions() {
        this.selectedWrongQuestions.clear();
        for (let i = 0; i < this.wrongQuestions.length; i++) {
            this.selectedWrongQuestions.add(i);
        }
        this.updateWrongList();
    }
    
    deselectAllWrongQuestions() {
        this.selectedWrongQuestions.clear();
        this.updateWrongList();
    }
    
    deleteSelectedWrongQuestions() {
        if (this.selectedWrongQuestions.size === 0) {
            this.showWrongFeedback('请先选择要删除的错题！', 'hint');
            return;
        }
        
        if (confirm(`确定要删除选中的 ${this.selectedWrongQuestions.size} 道错题吗？`)) {
            // 从大到小删除，避免索引问题
            const sortedIndices = Array.from(this.selectedWrongQuestions).sort((a, b) => b - a);
            sortedIndices.forEach(index => {
                this.wrongQuestions.splice(index, 1);
            });
            
            this.selectedWrongQuestions.clear();
            this.saveWrongQuestions();
            this.updateWrongStats();
            this.showWrongFeedback(`✅ 已删除 ${sortedIndices.length} 道错题`, 'correct');
        }
    }
    
    exportWrongQuestions() {
        const data = {
            date: new Date().toISOString(),
            total: this.wrongQuestions.length,
            unmastered: this.wrongQuestions.filter(q => !q.mastered).length,
            mastered: this.wrongQuestions.filter(q => q.mastered).length,
            questions: this.wrongQuestions
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `错题本-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    generateSimilarQuestions() {
        this.generateWrongPracticeQuestions();
        this.currentWrongIndex = 0;
        this.wrongPracticeCorrect = 0;
        this.displayCurrentWrongQuestion();
        this.showWrongFeedback('🔄 已生成新的题目组！', 'hint');
    }
    
    backToResults() {
        this.currentState = AppState.RESULT;
        this.updateUI();
    }
    
    finishWrongPractice() {
        this.backToResults();
        this.showWrongFeedback('🎉 错题练习完成！', 'correct');
    }
    
    endPractice() {
        clearInterval(this.timerInterval);
        this.currentState = AppState.RESULT;
        
        // 保存到历史记录
        this.saveToHistory();
        
        // 显示结果
        this.displayResults();
        
        // 切换界面
        this.updateUI();
    }
    
    displayResults() {
        const total = this.correctAnswers + this.wrongAnswers;
        const accuracy = this.calculateAccuracy();
        
        // 更新统计数字
        this.finalCorrect.textContent = this.correctAnswers;
        this.finalWrong.textContent = this.wrongAnswers;
        this.finalAccuracy.textContent = `${accuracy}%`;
        this.finalTotal.textContent = total;
        
        // 显示详细结果
        this.resultsList.innerHTML = '';
        this.questions.forEach((question, index) => {
            if (question.userAnswer !== null) {
                const item = document.createElement('div');
                item.className = `result-item ${question.isCorrect ? 'correct' : 'wrong'}`;
                
                item.innerHTML = `
                    <div class="result-expr">
                        <span>第${index + 1}题: ${question.expression}</span>
                    </div>
                    <div class="result-details">
                        <span class="user-answer">你的答案: ${question.userAnswer}</span>
                        <span class="correct-answer">正确答案: ${question.answer}</span>
                        <span class="result-status">${question.isCorrect ? '正确' : '错误'}</span>
                    </div>
                `;
                
                this.resultsList.appendChild(item);
            }
        });
        
        // 显示错题本
        this.wrongQuestionsList.innerHTML = '';
        this.wrongQuestions.forEach((item, index) => {
            const wrongItem = document.createElement('div');
            wrongItem.className = 'wrong-item';
            
            wrongItem.innerHTML = `
                <div class="wrong-expr">
                    <span>${index + 1}. ${item.expression}</span>
                </div>
                <div class="wrong-details">
                    <span class="user-wrong-answer">错误答案: ${item.userAnswer}</span>
                    <span class="wrong-correct-answer">正确答案: ${item.correctAnswer}</span>
                </div>
            `;
            
            this.wrongQuestionsList.appendChild(wrongItem);
        });
        
        // 显示历史记录
        this.historyList.innerHTML = '';
        this.history.forEach((record, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const date = new Date(record.date);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
            
            historyItem.innerHTML = `
                <div class="history-info">
                    <span class="history-date">${dateStr}</span>
                    <span class="history-mode">${record.mode === 'addSub' ? '加减' : '全四则'}</span>
                </div>
                <div class="history-stats">
                    <span class="history-correct">正确: ${record.correct}</span>
                    <span class="history-wrong">错误: ${record.wrong}</span>
                    <span class="history-accuracy">正确率: ${record.accuracy}%</span>
                </div>
            `;
            
            this.historyList.appendChild(historyItem);
        });
    }
    
    saveToHistory() {
        const historyItem = {
            date: new Date().toISOString(),
            mode: this.practiceMode,
            correct: this.correctAnswers,
            wrong: this.wrongAnswers,
            total: this.correctAnswers + this.wrongAnswers,
            accuracy: this.calculateAccuracy(),
            duration: 10 * 60 - this.timeRemaining
        };
        
        this.history.unshift(historyItem);
        
        // 只保留最近20条记录
        if (this.history.length > 20) {
            this.history = this.history.slice(0, 20);
        }
        
        this.saveHistory();
    }
    
    addToWrongQuestions(question) {
        const wrongItem = {
            expression: question.expression,
            correctAnswer: question.answer,
            userAnswer: question.userAnswer,
            date: new Date().toISOString(),
            type: question.type,
            originalType: question.originalType,
            difficulty: question.difficulty,
            mastered: false,
            practiceCount: 0
        };
        
        // 避免重复添加相同的错题
        const exists = this.wrongQuestions.some(item => 
            item.expression === wrongItem.expression && 
            item.userAnswer === wrongItem.userAnswer
        );
        
        if (!exists) {
            this.wrongQuestions.unshift(wrongItem);
            
            // 只保留最近100条错题
            if (this.wrongQuestions.length > 100) {
                this.wrongQuestions = this.wrongQuestions.slice(0, 100);
            }
            
            this.saveWrongQuestions();
        }
    }
    
    reviewWrongQuestions() {
        // 直接进入错题练习
        this.startWrongPractice();
    }
    
    calculateAccuracy() {
        const total = this.correctAnswers + this.wrongAnswers;
        return total > 0 ? Math.round((this.correctAnswers / total) * 100) : 0;
    }
    
    loadHistory() {
        try {
            const saved = localStorage.getItem('mathPracticeHistory');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }
    
    saveHistory() {
        try {
            localStorage.setItem('mathPracticeHistory', JSON.stringify(this.history));
        } catch (e) {
            console.error('保存历史记录失败:', e);
        }
    }
    
    loadWrongQuestions() {
        try {
            const saved = localStorage.getItem('mathPracticeWrongQuestions');
            const questions = saved ? JSON.parse(saved) : [];
            
            // 确保每个错题都有必要字段
            return questions.map(q => ({
                ...q,
                mastered: q.mastered || false,
                practiceCount: q.practiceCount || 0
            }));
        } catch (e) {
            return [];
        }
    }
    
    saveWrongQuestions() {
        try {
            localStorage.setItem('mathPracticeWrongQuestions', JSON.stringify(this.wrongQuestions));
        } catch (e) {
            console.error('保存错题本失败:', e);
        }
    }
    
    downloadResults() {
        const data = {
            date: new Date().toISOString(),
            mode: this.practiceMode,
            correct: this.correctAnswers,
            wrong: this.wrongAnswers,
            total: this.correctAnswers + this.wrongAnswers,
            accuracy: this.calculateAccuracy(),
            questions: this.questions.filter(q => q.userAnswer !== null),
            wrongQuestions: this.wrongQuestions
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `math-practice-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    restartPractice() {
        this.currentState = AppState.MODE_SELECTION;
        this.updateUI();
    }
    
    updateUI() {
        switch (this.currentState) {
            case AppState.MODE_SELECTION:
                this.controlPanel.style.display = 'block';
                this.practiceInterface.style.display = 'none';
                this.resultInterface.style.display = 'none';
                this.wrongPracticeInterface.style.display = 'none';
                break;
                
            case AppState.PRACTICE:
                this.controlPanel.style.display = 'none';
                this.practiceInterface.style.display = 'block';
                this.resultInterface.style.display = 'none';
                this.wrongPracticeInterface.style.display = 'none';
                break;
                
            case AppState.RESULT:
                this.controlPanel.style.display = 'none';
                this.practiceInterface.style.display = 'none';
                this.resultInterface.style.display = 'block';
                this.wrongPracticeInterface.style.display = 'none';
                break;
                
            case AppState.WRONG_PRACTICE:
                this.controlPanel.style.display = 'none';
                this.practiceInterface.style.display = 'none';
                this.resultInterface.style.display = 'none';
                this.wrongPracticeInterface.style.display = 'block';
                break;
        }
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    window.mathApp = new MathPracticeApp();
    
    // 显示安装提示
    let deferredPrompt;
    const installPrompt = document.getElementById('installPrompt');
    const installBtn = document.getElementById('installBtn');
    const dismissBtn = document.getElementById('dismissInstall');
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // 显示安装提示（延迟几秒显示）
        setTimeout(() => {
            if (deferredPrompt) {
                installPrompt.style.display = 'block';
            }
        }, 5000);
    });
    
    installBtn.addEventListener('click', () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(choiceResult => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('用户同意安装PWA');
                }
                deferredPrompt = null;
                installPrompt.style.display = 'none';
            });
        }
    });
    
    dismissBtn.addEventListener('click', () => {
        installPrompt.style.display = 'none';
    });
});