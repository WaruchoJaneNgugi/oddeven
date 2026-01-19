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
    const timerRef = useRef<number>(3);

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
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // Start countdown - capture the current choice
        const startCountdown = (remaining: number, currentChoice: Choice) => {
            if (remaining > 0) {
                setCountdown(remaining);
                timerRef.current = window.setTimeout(() => startCountdown(remaining - 1, currentChoice), 1000);
            } else {
                setCountdown(0);
                // Move to waiting state after a brief pause
                timerRef.current = window.setTimeout(() => {
                    setGameStatus('waiting');
                    setGeneratedNumber(null);
                    setIsCorrect(null);

                    // Generate number after waiting state
                    timerRef.current = window.setTimeout(() => {
                        const number = generateRandomNumber();
                        const correctAnswer = checkOddEven(number);
                        const correct = currentChoice === correctAnswer;

                        setGeneratedNumber(number);
                        setIsCorrect(correct);
                        setGameStatus('result');

                        if (correct) {
                            setScore(prev => prev + 1);
                        }
                    }, 500);
                }, 500);
            }
        };

        // Start countdown with the current choice
        timerRef.current = window.setTimeout(() => startCountdown(2, choice), 1000);
    }, [generateRandomNumber, checkOddEven]);

    const startNewRound = useCallback(() => {
        setGameStatus('idle');
        setUserChoice(null);
        setCountdown(3);
    }, []);

    // const resetGame = useCallback(() => {
    //     if (timerRef.current) {
    //         clearTimeout(timerRef.current);
    //     }
    //     setScore(0);
    //     setUserChoice(null);
    //     setGeneratedNumber(null);
    //     setIsCorrect(null);
    //     setGameStatus('idle');
    //     setCountdown(3);
    // }, []);game-subtitle

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
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
                    <span className="stat-label">Points</span>
                    <span className="stat-value">{score}</span>
                </div>
            </div>

            {gameStatus === 'idle' && (
                <div className="choice-screen">
                    <h2 className="choice-title">Pick Your Choice</h2>
                    <p className="choice-subtitle">Just pick Odd or Even!</p>
                    <div className="choice-buttons">
                        <div
                            className="choice-btn odd-btn"
                            onClick={() => handleChoice('odd')}
                        >
                            <span className="choice-text">Odd</span>
                        </div>
                        <div
                            className="choice-btn even-btn"
                            onClick={() => handleChoice('even')}
                        >
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
                            {/*<button*/}
                            {/*    className="reset-btn"*/}
                            {/*    onClick={resetGame}*/}
                            {/*>*/}
                            {/*    Reset Game*/}
                            {/*</button>*/}
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
                </ul>
            </div>
        </div>
    );
};

export default OddEvenGame;