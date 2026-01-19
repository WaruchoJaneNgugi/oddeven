import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../assets/oddeven.css';

type Choice = 'odd' | 'even';
type GameStatus = 'idle' | 'waiting' | 'result' | 'countdown';

const OddEvenGame: React.FC = () => {
    const [score, setScore] = useState<number>(0);
    const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
    const [userChoice, setUserChoice] = useState<Choice | null>(null);
    const [generatedNumber, setGeneratedNumber] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [countdown, setCountdown] = useState<number>(3);
    const [streak, setStreak] = useState<number>(0);
    const [bestStreak, setBestStreak] = useState<number>(0);
    const countdownRef = useRef<number>();

    const generateRandomNumber = useCallback(() => {
        return Math.floor(Math.random() * 100) + 1;
    }, []);

    const checkOddEven = useCallback((num: number): Choice => {
        return num % 2 === 0 ? 'even' : 'odd';
    }, []);

    const handleChoice = useCallback((choice: Choice) => {
        setUserChoice(choice);
        setGameStatus('countdown');
        setCountdown(3);

        // Clear any existing timeout
        if (countdownRef.current) {
            clearTimeout(countdownRef.current);
        }

        // Start countdown
        countdownRef.current = window.setTimeout(() => handleCountdown(2), 1000);
    }, []);

    const handleCountdown = useCallback((remaining: number) => {
        if (remaining > 0) {
            setCountdown(remaining);
            countdownRef.current = window.setTimeout(() => handleCountdown(remaining - 1), 1000);
        } else {
            setCountdown(0);
            // Move to waiting state after a brief pause
            countdownRef.current = window.setTimeout(() => {
                setGameStatus('waiting');
                setGeneratedNumber(null);
                setIsCorrect(null);

                // Generate number after waiting state
                countdownRef.current = window.setTimeout(() => {
                    const number = generateRandomNumber();
                    const correctAnswer = checkOddEven(number);
                    const correct = userChoice === correctAnswer;

                    setGeneratedNumber(number);
                    setIsCorrect(correct);
                    setGameStatus('result');

                    if (correct) {
                        setScore(prev => prev + 1);
                        setStreak(prev => {
                            const newStreak = prev + 1;
                            if (newStreak > bestStreak) {
                                setBestStreak(newStreak);
                            }
                            return newStreak;
                        });
                    } else {
                        setStreak(0);
                    }
                }, 500);
            }, 500);
        }
    }, [generateRandomNumber, checkOddEven, userChoice, bestStreak]);

    const startNewRound = useCallback(() => {
        setGameStatus('idle');
        setUserChoice(null);
    }, []);

    const resetGame = useCallback(() => {
        // Clear any existing timeout
        if (countdownRef.current) {
            clearTimeout(countdownRef.current);
        }

        setScore(0);
        setStreak(0);
        setUserChoice(null);
        setGeneratedNumber(null);
        setIsCorrect(null);
        setGameStatus('idle');
        setCountdown(3);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (countdownRef.current) {
                clearTimeout(countdownRef.current);
            }
        };
    }, []);

    return (
        <div className="game-container">
            <div className="game-header">
                <h1 className="game-title">Odd & Even</h1>
                <p className="game-subtitle">Fast-paced number guessing game</p>
            </div>

            <div className="game-stats">
                <div className="stat-card">
                    <span className="stat-label">Score</span>
                    <span className="stat-value">{score}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Current Streak</span>
                    <span className="stat-value streak-value">{streak}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Best Streak</span>
                    <span className="stat-value best-streak">{bestStreak}</span>
                </div>
            </div>

            {gameStatus === 'idle' && (
                <div className="choice-screen">
                    <h2 className="choice-title">Pick Your Choice</h2>
                    <p className="choice-subtitle">Fast and casual - just pick Odd or Even!</p>
                    <div className="choice-buttons">
                        <div
                            className="choice-btn odd-btn"
                            onClick={() => handleChoice('odd')}
                        >
                            {/*<span className="choice-icon">🔢</span>*/}
                            <span className="choice-text">Odd</span>
                        </div>
                        <div
                            className="choice-btn even-btn"
                            onClick={() => handleChoice('even')}
                        >
                            {/*<span className="choice-icon">⚡</span>*/}
                            <span className="choice-text">Even</span>
                        </div>
                    </div>
                </div>
            )}

            {gameStatus === 'countdown' && (
                <div className="countdown-screen">
                    <div className="countdown-circle">
                        <span className="countdown-number">{countdown}</span>
                    </div>
                    <p className="countdown-text">Get ready...</p>
                </div>
            )}

            {gameStatus === 'waiting' && (
                <div className="waiting-screen">
                    <div className="spinner"></div>
                    <p className="waiting-text">Generating number...</p>
                </div>
            )}

            {gameStatus === 'result' && (
                <div className="result-screen">
                    <div className={`result-card ${isCorrect ? 'correct' : 'incorrect'}`}>
                        <h2 className="result-title">
                            {isCorrect ? 'Correct!' : 'Try Again!'}
                        </h2>

                        <div className="number-display">
                            <span className="generated-number">{generatedNumber}</span>
                            <span className="number-label">
                                is {generatedNumber ? checkOddEven(generatedNumber) : ''} • You chose {userChoice}
                            </span>
                        </div>

                        <p className="result-message">
                            {isCorrect
                                ? `+1 point! Keep the streak going!`
                                : `The number was ${generatedNumber ? checkOddEven(generatedNumber) : ''}`
                            }
                        </p>

                        <div className="action-buttons">
                            <button
                                className="play-again-btn"
                                onClick={startNewRound}
                            >
                                Play Again
                            </button>
                            <button
                                className="reset-btn"
                                onClick={resetGame}
                            >
                                Reset Game
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="game-instructions">
                <h3>How to Play:</h3>
                <ul>
                    <li>Choose Odd or Even</li>
                    <li>System generates a random number (1-100)</li>
                    <li>Correct guess = +1 point</li>
                    <li>Build streaks for higher scores!</li>
                </ul>
            </div>

            <div className="theme-toggle">
                <div className="theme-dots">
                    <div className="theme-dot primary"></div>
                    <div className="theme-dot secondary"></div>
                    <div className="theme-dot accent"></div>
                </div>
                <span className="theme-label">Modern Theme</span>
            </div>
        </div>
    );
};

export default OddEvenGame;