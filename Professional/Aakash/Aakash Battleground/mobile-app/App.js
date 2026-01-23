import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Platform } from 'react-native';
import io from 'socket.io-client';

// 1. UPDATE THIS with your current Ngrok URL from the terminal
const NGROK_URL = 'https://134c5b1db093.ngrok-free.app'; 

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

  useEffect(() => {
    // Add extra config to ensure connection reliability
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'], // Force websocket to avoid polling issues
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server via:', SOCKET_URL);
    });

    newSocket.on('game_start', (data) => {
      setOpponentName(data.opponentName);
      setQuestions(data.questions);
      setGameState('PLAYING');
      setCurrentQIndex(0);
      setScore(0);
      setOpponentScore(0);
    });

    newSocket.on('opponent_score_update', (data) => {
      setOpponentScore(data.score);
    });

    return () => newSocket.close();
  }, []);

  const joinGame = () => {
    if (socket && name.trim()) {
      socket.emit('join_game', { name: name });
      setGameState('WAITING');
    }
  };

  const handleAnswer = (optionIndex) => {
    const isCorrect = optionIndex === questions[currentQIndex].answer;
    let newScore = score;
    if (isCorrect) {
      newScore += 10;
      setScore(newScore);
    }

    // Tell the server we answered
    socket.emit('submit_answer', { 
      isCorrect: isCorrect,
      questionId: questions[currentQIndex].id
    });

    // Move to next question or finish
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex(prev => prev + 1);
    }
    else {
      setGameState('FINISHED');
    }
  };

  const currentQuestion = questions[currentQIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aakash Battleground</Text>
      
      {gameState === 'LOBBY' && (
        <View style={styles.lobby}>
          <TextInput
            style={styles.input}
            placeholder="Enter Nickname"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
          />
          <TouchableOpacity style={styles.button} onPress={joinGame}>
            <Text style={styles.buttonText}>Join Battle</Text>
          </TouchableOpacity>
        </View>
      )}

      {gameState === 'WAITING' && (
        <View style={styles.waiting}>
          <Text style={styles.statusText}>Searching for opponent...</Text>
          <Text style={styles.subText}>Topic: Rotational Motion</Text>
        </View>
      )}

      {gameState === 'PLAYING' && currentQuestion && (
        <View style={styles.game}>
          <View style={styles.header}>
            <View>
              <Text style={styles.scoreText}>You: {score}</Text>
              <Text style={styles.opponentScoreText}>{opponentName}: {opponentScore}</Text>
            </View>
            <Text style={styles.qCountText}>Q: {currentQIndex + 1}/{questions.length}</Text>
          </View>

          <View style={styles.quizBox}>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
            
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.optionButton}
                  onPress={() => handleAnswer(index)}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
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
  game: {
    width: '100%',
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