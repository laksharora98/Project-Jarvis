import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import io from 'socket.io-client';

// 1. UPDATE THIS with your current Ngrok URL from the terminal
const NGROK_URL = 'https://b316f45af2fb.ngrok-free.app'; 

// 2. Automatic Selection Logic
const SOCKET_URL = (Platform.OS === 'web' && window.location.hostname === 'localhost') 
  ? 'http://localhost:3000'  // Browser on laptop uses local connection
  : NGROK_URL;               // Phone uses internet connection

export default function App() {
  const [socket, setSocket] = useState(null);
  const [name, setName] = useState('');
  const [gameState, setGameState] = useState('LOBBY'); // LOBBY, WAITING, PLAYING, FINISHED
  const [opponentName, setOpponentName] = useState('Opponent');
  const [opponentScore, setOpponentScore] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [opponentStatus, setOpponentStatus] = useState('IDLE'); // IDLE, CORRECT, WRONG
  const [gameConfig, setGameConfig] = useState({
    TOTAL_QUESTIONS: 3,
    TIMER_DURATION: 10,
    POINTS_BASE: 10,
    POINTS_PER_SECOND: 1
  });
  
  // Timer Logic
  useEffect(() => {
    let interval = null;
    if (gameState === 'PLAYING' && !isAnswering && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'PLAYING' && !isAnswering) {
      // Time's up! Force a "Wrong" answer
      handleAnswer(null);
    }
    return () => clearInterval(interval);
  }, [gameState, isAnswering, timeLeft]);

  // Reset timer for new questions
  useEffect(() => {
    if (gameState === 'PLAYING') {
      setTimeLeft(gameConfig.TIMER_DURATION);
    }
  }, [currentQIndex, gameState, gameConfig]);

  // Ref to track state inside socket listeners
  const gameStateRef = useRef(gameState);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  const isAnsweringRef = useRef(isAnswering);
  useEffect(() => { isAnsweringRef.current = isAnswering; }, [isAnswering]);

  // Ref for opponent flash timer to prevent conflicts
  const flashTimerRef = useRef(null);

  useEffect(() => {
    // Add extra config to ensure connection reliability
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'], // Force websocket to avoid polling issues
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server via:', SOCKET_URL);
      setIsConnected(true);

      // Check for server amnesia (reconnect mid-game)
      if (gameStateRef.current !== 'LOBBY') {
        newSocket.emit('check_session');
      }
    });

    newSocket.on('session_expired', () => {
      Alert.alert("Session Expired", "The server restarted. Please join again.");
      setGameState('LOBBY');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('game_start', (data) => {
      setOpponentName(data.opponentName);
      setQuestions(data.questions);
      if (data.config) setGameConfig(data.config);
      setGameState('PLAYING');
      setCurrentQIndex(0);
      setScore(0);
      setOpponentScore(0);
      // Reset UI state for new game
      setSelectedOption(null);
      setIsAnswering(false);
      setOpponentStatus('IDLE');
    });

    // SOURCE OF TRUTH: Reconciliation of our optimistic score
    newSocket.on('player_score_update', (data) => {
      setScore(data.score); // Reconcile with server's confirmed score
    });

    newSocket.on('opponent_score_update', (data) => {
      setOpponentScore(data.score);
      setOpponentStatus(data.isCorrect ? 'CORRECT' : 'WRONG');
      
      // Clear previous timer if exists (Debounce)
      if (flashTimerRef.current) {
        clearTimeout(flashTimerRef.current);
      }

      // Reset flash after 1s
      flashTimerRef.current = setTimeout(() => {
        setOpponentStatus('IDLE');
        flashTimerRef.current = null;
      }, 1000);
    });

    newSocket.on('opponent_left', (data) => {
      // Only show alert if we are actively playing or waiting
      if (gameStateRef.current === 'PLAYING' || gameStateRef.current === 'WAITING_FOR_OPPONENT') {
        alert(data.message);
        setGameState('FINISHED');
      }
    });

    newSocket.on('waiting_for_opponent', () => {
      // If user is seeing the Green/Red feedback, wait for it to finish
      if (isAnsweringRef.current) {
        setTimeout(() => {
          setGameState('WAITING_FOR_OPPONENT');
        }, 1000);
      } else {
        setGameState('WAITING_FOR_OPPONENT');
      }
    });

    newSocket.on('game_over', (data) => {
      // If user is seeing the Green/Red feedback, wait for it to finish
      if (isAnsweringRef.current) {
        setTimeout(() => {
          setGameState('FINISHED');
        }, 1000);
      } else {
        setGameState('FINISHED');
      }
    });

    return () => newSocket.close();
  }, []);

  const joinGame = () => {
    if (socket && name.trim()) {
      socket.emit('join_game', { name: name });
      setGameState('WAITING');
    }
  };

  const cancelSearch = () => {
    if (socket) {
      socket.emit('leave_queue');
      setGameState('LOBBY');
    }
  };

  const handleAnswer = (optionIndex) => {
    if (isAnswering) return; // Prevent double taps

    setIsAnswering(true);
    setSelectedOption(optionIndex);

    // OPTIMISTIC UPDATE: Guess the score immediately for the UI
    const isCorrect = optionIndex !== null && optionIndex === questions[currentQIndex].answer;
    if (isCorrect) {
      const optimisticPoints = gameConfig.POINTS_BASE + (timeLeft * gameConfig.POINTS_PER_SECOND);
      setScore(prev => prev + optimisticPoints);
    }

    // SUBMIT MINIMAL DATA: Let server do the math
    socket.emit('submit_answer', { 
      answerIndex: optionIndex,
      timeRemaining: timeLeft
    });

    // Wait for 1 second before moving on (Visual Feedback)
    setTimeout(() => {
      if (currentQIndex + 1 < questions.length) {
        // Not the last question? Reset and move on.
        setCurrentQIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsAnswering(false);
      }
      else {
        // Last question? KEEP the selection visible!
      }
    }, 1000);
  };

  const currentQuestion = questions[currentQIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aakash Battleground</Text>
      
      {gameState === 'LOBBY' && (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.lobby}
        >
          <TextInput
            style={styles.input}
            placeholder="Enter Nickname"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
          />
          <TouchableOpacity 
            style={[styles.button, !isConnected && styles.disabledButton]} 
            onPress={joinGame}
            disabled={!isConnected}
          >
            <Text style={styles.buttonText}>
              {isConnected ? 'Join Battle' : 'Connecting...'}
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      )}

      {gameState === 'WAITING' && (
        <View style={styles.waiting}>
          <Text style={styles.statusText}>Searching for opponent...</Text>
          <Text style={styles.subText}>Topic: Mixed Science</Text>
          <TouchableOpacity 
            style={[styles.button, { marginTop: 40, backgroundColor: '#444' }]} 
            onPress={cancelSearch}
          >
            <Text style={styles.buttonText}>Cancel Search</Text>
          </TouchableOpacity>
        </View>
      )}

      {gameState === 'PLAYING' && currentQuestion && (
        <View style={styles.game}>
          {!isConnected && (
            <View style={styles.offlineBanner}>
              <Text style={styles.offlineText}>⚠️ Connection Lost. Reconnecting...</Text>
            </View>
          )}
          
          {/* Left Bar: MY Score */}
          <View style={styles.raceContainer}>
            <Text style={styles.raceLabel}>YOU</Text>
            <View style={styles.raceBarContainer}>
              <View style={[
                styles.raceBar, 
                { height: `${Math.min((score / (gameConfig.TOTAL_QUESTIONS * 20)) * 100, 100)}%`, backgroundColor: '#4CD964' } 
              ]} />
            </View>
            <Text style={styles.raceLabel}>{score}</Text>
          </View>

          {/* Middle: Quiz Content */}
          <View style={styles.quizContainer}>
            <View style={styles.timerContainer}>
              <View style={[styles.timerBar, { width: `${(timeLeft / gameConfig.TIMER_DURATION) * 100}%` }]} />
            </View>

            <View style={styles.quizBox}>
              <Text style={styles.questionText}>{currentQuestion.question}</Text>
              
              <View style={styles.optionsContainer}>
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedOption === index;
                  const isCorrect = index === currentQuestion.answer;
                  
                  let buttonStyle = [styles.optionButton];
                  if (isSelected) {
                    buttonStyle.push(isCorrect ? styles.correctOption : styles.wrongOption);
                  } else if (isAnswering && isCorrect) {
                    buttonStyle.push(styles.correctOption); 
                  }

                  return (
                    <TouchableOpacity 
                      key={index} 
                      style={buttonStyle}
                      onPress={() => handleAnswer(index)}
                      disabled={isAnswering}
                    >
                      <Text style={styles.optionText}>{option}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Right Bar: OPPONENT Score */}
          <View style={styles.raceContainer}>
            <Text style={styles.raceLabel}>{opponentName.substring(0, 3)}</Text>
            <View style={styles.raceBarContainer}>
              <View style={[
                styles.raceBar, 
                { 
                  height: `${Math.min((opponentScore / (gameConfig.TOTAL_QUESTIONS * 20)) * 100, 100)}%`,
                  backgroundColor: opponentStatus === 'CORRECT' ? '#4CD964' 
                                 : opponentStatus === 'WRONG' ? '#FF3B30' 
                                 : '#007AFF' // Default Blue
                } 
              ]} />
            </View>
            <Text style={styles.raceLabel}>{opponentScore}</Text>
          </View>

        </View>
      )}

      {gameState === 'WAITING_FOR_OPPONENT' && (
        <View style={styles.waiting}>
          <Text style={styles.statusText}>You finished!</Text>
          <Text style={styles.subText}>Waiting for {opponentName} to finish...</Text>
        </View>
      )}

      {gameState === 'FINISHED' && (
        <View style={styles.finished}>
          <Text style={styles.matchText}>{score > opponentScore ? 'YOU WIN!' : score === opponentScore ? 'DRAW!' : 'YOU LOSE!'}</Text>
          <Text style={styles.finalScore}>Your Score: {score}</Text>
          <Text style={styles.finalScore}>Opponent Score: {opponentScore}</Text>
          <TouchableOpacity 
            style={[styles.button, { marginTop: 30 }]} 
            onPress={() => setGameState('LOBBY')}
          >
            <Text style={styles.buttonText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 40,
  },
  lobby: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#2A2A2A',
    color: '#FFF',
    width: '85%',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#444',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 30,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#555',
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusText: {
    color: '#FFF',
    fontSize: 22,
    marginBottom: 10,
  },
  subText: {
    color: '#AAA',
    fontSize: 16,
  },
  offlineBanner: {
    backgroundColor: '#FF3B30',
    padding: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 8,
  },
  offlineText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  game: {
    width: '100%',
    flex: 1, // Take full height
    flexDirection: 'row', // Horizontal Layout
    justifyContent: 'space-between',
  },
  raceContainer: {
    width: 40,
    height: '100%',
    justifyContent: 'flex-end', // Bars grow from bottom
    alignItems: 'center',
    paddingBottom: 20,
  },
  raceBarContainer: {
    width: 20,
    height: '80%',
    backgroundColor: '#333',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  raceBar: {
    width: '100%',
    borderRadius: 10,
  },
  raceLabel: {
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 12,
  },
  quizContainer: {
    flex: 1, // Take remaining middle space
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  scoreText: {
    color: '#4CD964',
    fontSize: 22,
    fontWeight: 'bold',
  },
  opponentScoreText: {
    color: '#FF3B30', // Red for opponent
    fontSize: 18,
    fontWeight: '600',
  },
  qCountText: {
    color: '#AAA',
    fontSize: 18,
  },
  timerContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  timerBar: {
    height: '100%',
    backgroundColor: '#FFD700', // Gold bar
  },
  quizBox: {
    backgroundColor: '#1E1E1E',
    padding: 25,
    borderRadius: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#333',
  },
  questionText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 30,
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#444',
  },
  optionText: {
    color: '#FFF',
    fontSize: 18,
    textAlign: 'center',
  },
  correctOption: {
    backgroundColor: '#28A745', // Green
    borderColor: '#28A745',
  },
  wrongOption: {
    backgroundColor: '#DC3545', // Red
    borderColor: '#DC3545',
  },
  finished: {
    alignItems: 'center',
  },
  matchText: {
    color: '#FFD700',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  finalScore: {
    color: '#FFF',
    fontSize: 24,
    marginTop: 5,
  },
});