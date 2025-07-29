/**
 * ===========================
 * ASTRONOMY LEARNING CENTER
 * ===========================
 * 
 * Interactive space education experience
 * Learn about planets, stars, and cosmic phenomena while playing
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { THEME, getPlanetType } from '../components/constants';
import PlanetTile from '../components/PlanetTile';
import SpaceBackground from '../components/SpaceBackground';
import useGameStore from '../store/gameStore';

const { width, height } = Dimensions.get('window');

const AstronomyScreen = ({ navigation }) => {
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [unlockedLessons, setUnlockedLessons] = useState([0, 1]); // Start with first two unlocked
  const { highestBlock } = useGameStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false, // Use JS driver for opacity
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: false, // Use JS driver for consistency
      }),
    ]).start();

    // Unlock lessons based on game progress
    const newUnlocked = [0, 1]; // Always available
    if (highestBlock >= 8) newUnlocked.push(2); // Solar System
    if (highestBlock >= 32) newUnlocked.push(3); // Stars
    if (highestBlock >= 128) newUnlocked.push(4); // Galaxies
    if (highestBlock >= 1024) newUnlocked.push(5); // Black Holes
    setUnlockedLessons(newUnlocked);
  }, [fadeAnim, slideAnim, highestBlock]);

  const lessons = [
    {
      id: 0,
      title: "Welcome to Space",
      subtitle: "Your Cosmic Journey Begins",
      difficulty: "Beginner",
      duration: "5 min",
      planetValue: 2,
      content: `Welcome to the vast universe! 

Space is everything that exists - all matter, energy, planets, stars, galaxies, and even empty space between them.

🌌 **Did you know?**
• The universe is about 13.8 billion years old
• It contains over 2 trillion galaxies
• Each galaxy has billions of stars
• Many stars have their own planetary systems

In our game, you'll merge cosmic objects starting from small celestial bodies all the way up to massive stars and black holes!

As you play, you're actually following the natural progression of how matter organizes in space - from small objects combining to form larger ones.`,
      quiz: [
        {
          question: "How old is the universe?",
          options: ["1 billion years", "13.8 billion years", "100 billion years", "1 trillion years"],
          correct: 1
        },
        {
          question: "What contains billions of stars?",
          options: ["Planet", "Galaxy", "Asteroid", "Comet"],
          correct: 1
        }
      ]
    },
    {
      id: 1,
      title: "Earth: Our Home Planet",
      subtitle: "The Perfect World for Life",
      difficulty: "Beginner",
      duration: "6 min",
      planetValue: 4,
      content: `Earth is our beautiful blue marble - the only known planet with life!

🌍 **Earth's Special Features:**
• **Perfect Distance**: Not too hot, not too cold (Goldilocks Zone)
• **Liquid Water**: Essential for all life as we know it
• **Protective Atmosphere**: 78% nitrogen, 21% oxygen
• **Magnetic Field**: Shields us from harmful solar radiation

🌊 **Amazing Earth Facts:**
• 71% of Earth's surface is covered by oceans
• The deepest point is the Mariana Trench (36,000 feet deep)
• Earth spins at 1,040 mph at the equator
• One day on Earth = 24 hours

In the game, Earth represents balance and life. When you merge to create Earth, you're creating the perfect conditions for life to flourish!`,
      quiz: [
        {
          question: "What percentage of Earth is covered by oceans?",
          options: ["50%", "65%", "71%", "85%"],
          correct: 2
        },
        {
          question: "What makes Earth special for life?",
          options: ["It's the biggest planet", "It has liquid water", "It's closest to the sun", "It has the most moons"],
          correct: 1
        }
      ]
    },
    {
      id: 2,
      title: "Our Solar System",
      subtitle: "Eight Worlds Orbiting the Sun",
      difficulty: "Intermediate",
      duration: "8 min",
      planetValue: 8,
      unlockRequirement: 8,
      content: `Our solar system is like a cosmic family with the Sun as the parent star!

☀️ **The Sun**: Our massive star that gives us light and warmth
• Contains 99.86% of the solar system's mass
• Surface temperature: 5,778 K (9,941°F)
• Could fit 1.3 million Earths inside it!

🪐 **The Planets** (in order from the Sun):
1. **Mercury** - Closest, hottest days, coldest nights
2. **Venus** - Hottest planet due to greenhouse effect
3. **Earth** - Our perfect home
4. **Mars** - The red planet with polar ice caps
5. **Jupiter** - Largest planet, Great Red Spot storm
6. **Saturn** - Beautiful rings made of ice and rock
7. **Uranus** - Tilted on its side, ice giant
8. **Neptune** - Windiest planet with speeds up to 1,200 mph

Each planet in our game represents these real worlds with their unique characteristics!`,
      quiz: [
        {
          question: "Which planet is known for its beautiful rings?",
          options: ["Jupiter", "Mars", "Saturn", "Neptune"],
          correct: 2
        },
        {
          question: "What percentage of the solar system's mass does the Sun contain?",
          options: ["75%", "85%", "95%", "99.86%"],
          correct: 3
        }
      ]
    },
    {
      id: 3,
      title: "Stars: Cosmic Furnaces",
      subtitle: "How Stars Live and Die",
      difficulty: "Intermediate",
      duration: "10 min",
      planetValue: 32,
      unlockRequirement: 32,
      content: `Stars are gigantic fusion reactors that light up the universe!

⭐ **How Stars Work:**
• They fuse hydrogen into helium in their cores
• This process releases enormous amounts of energy
• The energy travels to the surface and shines as light
• It takes light 100,000 years to travel from a star's core to its surface!

🌟 **Star Life Cycle:**
1. **Nebula** - Gas and dust clouds where stars are born
2. **Protostar** - Baby star still forming
3. **Main Sequence** - Stable star (like our Sun)
4. **Red Giant** - Aging star expands dramatically
5. **White Dwarf** - Small, hot stellar remnant
6. **Black Hole** - Most massive stars collapse into these

🔥 **Star Colors and Temperature:**
• Blue stars: Hottest (30,000+ K)
• White stars: Very hot (10,000 K)
• Yellow stars: Medium (5,800 K) - like our Sun
• Red stars: Coolest (3,000 K)

In our game, as you merge to higher values, you're following the stellar evolution path!`,
      quiz: [
        {
          question: "What do stars fuse in their cores?",
          options: ["Helium into carbon", "Hydrogen into helium", "Carbon into iron", "Iron into gold"],
          correct: 1
        },
        {
          question: "What color are the hottest stars?",
          options: ["Red", "Yellow", "White", "Blue"],
          correct: 3
        }
      ]
    },
    {
      id: 4,
      title: "Galaxies: Star Cities",
      subtitle: "Billions of Stars Working Together",
      difficulty: "Advanced",
      duration: "12 min",
      planetValue: 128,
      unlockRequirement: 128,
      content: `Galaxies are massive collections of stars, gas, dust, and dark matter!

🌌 **The Milky Way - Our Home Galaxy:**
• Contains 100-400 billion stars
• Diameter: 100,000 light-years across
• Our solar system is in the Orion Arm
• Takes 225 million years to complete one rotation

🌀 **Types of Galaxies:**
1. **Spiral** (like Milky Way) - Beautiful spiral arms
2. **Elliptical** - Oval-shaped, older galaxies
3. **Irregular** - No distinct shape, often smaller

💫 **Amazing Galaxy Facts:**
• Andromeda Galaxy is approaching us at 250,000 mph
• It will collide with the Milky Way in 4.5 billion years
• Don't worry - space is so vast that stars rarely collide!
• The collision will create a new galaxy scientists call "Milkomeda"

🔬 **What's Between Galaxies?**
• Mostly empty space
• Dark matter webs connect galaxy clusters
• Some lone "rogue" stars drift in the void

When you reach high scores in our game, you're operating on galactic scales!`,
      quiz: [
        {
          question: "How many stars are in the Milky Way?",
          options: ["1 million", "1 billion", "100-400 billion", "1 trillion"],
          correct: 2
        },
        {
          question: "What will happen when Andromeda and Milky Way collide?",
          options: ["Everything will be destroyed", "They'll form a new galaxy", "They'll bounce off each other", "Nothing will happen"],
          correct: 1
        }
      ]
    },
    {
      id: 5,
      title: "Black Holes: Space Mysteries",
      subtitle: "Where Gravity Rules Supreme",
      difficulty: "Expert",
      duration: "15 min",
      planetValue: 1024,
      unlockRequirement: 1024,
      content: `Black holes are the most extreme objects in the universe!

🕳️ **What is a Black Hole?**
• A region where gravity is so strong that nothing can escape
• Not even light can get out (hence "black" hole)
• Formed when massive stars collapse
• The boundary is called the "event horizon"

⚫ **Types of Black Holes:**
1. **Stellar** - Formed from collapsed stars (3-20 solar masses)
2. **Intermediate** - Medium-sized (100-100,000 solar masses)
3. **Supermassive** - Giants at galaxy centers (millions to billions of solar masses)
4. **Primordial** - Theoretical tiny black holes from the Big Bang

🌀 **Mind-Bending Facts:**
• Time slows down near black holes (time dilation)
• If you fell in, you'd be "spaghettified" - stretched out
• Black holes slowly evaporate via Hawking radiation
• The supermassive black hole in our galaxy (Sagittarius A*) has the mass of 4 million suns

🔬 **Recent Discoveries:**
• First black hole image taken in 2019 (Event Horizon Telescope)
• LIGO detected gravitational waves from merging black holes
• Black holes might be connected by "wormholes"

In our game, reaching a black hole represents mastering the ultimate cosmic forces!`,
      quiz: [
        {
          question: "What is the boundary around a black hole called?",
          options: ["Event horizon", "Photon sphere", "Ergosphere", "Singularity"],
          correct: 0
        },
        {
          question: "What happens to time near a black hole?",
          options: ["It speeds up", "It slows down", "It stops", "It reverses"],
          correct: 1
        }
      ]
    }
  ];

  const handleLessonSelect = (lesson) => {
    setSelectedLesson(lesson);
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
    setCurrentQuizIndex(0);
    setQuizScore(0);
  };

  const handleQuizAnswer = (answerIndex) => {
    if (answerIndex === selectedLesson.quiz[currentQuizIndex].correct) {
      setQuizScore(quizScore + 1);
    }
    
    if (currentQuizIndex < selectedLesson.quiz.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
    } else {
      // Quiz completed
      setTimeout(() => {
        setShowQuiz(false);
        setSelectedLesson(null);
      }, 2000);
    }
  };

  const renderLessonCard = (lesson) => {
    const isUnlocked = unlockedLessons.includes(lesson.id);
    const planet = getPlanetType(lesson.planetValue);

    return (
      <TouchableOpacity
        key={lesson.id}
        style={[
          styles.lessonCard,
          !isUnlocked && styles.lockedCard
        ]}
        onPress={() => isUnlocked && handleLessonSelect(lesson)}
        disabled={!isUnlocked}
        activeOpacity={0.8}
      >
        <View style={styles.lessonHeader}>
          <View style={styles.planetPreview}>
            <PlanetTile value={lesson.planetValue} isOrbiting={isUnlocked} orbitSpeed={0.5} />
          </View>
          <View style={styles.lessonInfo}>
            <Text style={[styles.lessonTitle, !isUnlocked && styles.lockedText]}>
              {lesson.title}
            </Text>
            <Text style={[styles.lessonSubtitle, !isUnlocked && styles.lockedText]}>
              {lesson.subtitle}
            </Text>
            <View style={styles.lessonMeta}>
              <Text style={styles.difficulty}>{lesson.difficulty}</Text>
              <Text style={styles.duration}>{lesson.duration}</Text>
            </View>
          </View>
        </View>
        
        {!isUnlocked && (
          <View style={styles.lockOverlay}>
            <Text style={styles.lockText}>
              🔒 Reach {lesson.unlockRequirement} in-game to unlock
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (selectedLesson) {
    return (
      <SafeAreaView style={styles.container}>
        <SpaceBackground />
        
        <View style={styles.lessonContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.lessonContent}>
              
              {/* Header */}
              <View style={styles.contentHeader}>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => setSelectedLesson(null)}
                >
                  <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                
                <View style={styles.lessonTitleSection}>
                  <PlanetTile value={selectedLesson.planetValue} isOrbiting={true} orbitSpeed={0.3} />
                  <Text style={styles.contentTitle}>{selectedLesson.title}</Text>
                  <Text style={styles.contentSubtitle}>{selectedLesson.subtitle}</Text>
                </View>
              </View>

              {/* Content */}
              <View style={styles.contentBody}>
                <Text style={styles.contentText}>{selectedLesson.content}</Text>
              </View>

              {/* Quiz Button */}
              <TouchableOpacity 
                style={styles.quizButton}
                onPress={handleStartQuiz}
              >
                <Text style={styles.quizButtonText}>🧠 Test Your Knowledge</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* Quiz Modal */}
        <Modal visible={showQuiz} transparent animationType="fade">
          <View style={styles.quizOverlay}>
            <View style={styles.quizContainer}>
              {currentQuizIndex < selectedLesson.quiz.length ? (
                <>
                  <Text style={styles.quizQuestion}>
                    {selectedLesson.quiz[currentQuizIndex].question}
                  </Text>
                  {selectedLesson.quiz[currentQuizIndex].options.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.quizOption}
                      onPress={() => handleQuizAnswer(index)}
                    >
                      <Text style={styles.quizOptionText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </>
              ) : (
                <View style={styles.quizResult}>
                  <Text style={styles.quizResultText}>
                    🎉 Quiz Complete!
                  </Text>
                  <Text style={styles.quizScore}>
                    Score: {quizScore}/{selectedLesson.quiz.length}
                  </Text>
                  {quizScore === selectedLesson.quiz.length && (
                    <Text style={styles.perfectScore}>Perfect! You're a space expert! 🌟</Text>
                  )}
                </View>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SpaceBackground />
      
      <Animated.View style={[styles.mainContainer, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Home</Text>
          </TouchableOpacity>
          
          <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.mainTitle}>🌌 Astronomy Center</Text>
            <Text style={styles.mainSubtitle}>Learn the secrets of the universe</Text>
          </Animated.View>
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <Text style={styles.progressText}>
            🏆 Progress: {unlockedLessons.length}/{lessons.length} lessons unlocked
          </Text>
          <Text style={styles.progressSubtext}>
            Keep playing to unlock more cosmic knowledge!
          </Text>
        </View>

        {/* Lessons */}
        <ScrollView style={styles.lessonsContainer} showsVerticalScrollIndicator={false}>
          {lessons.map(renderLessonCard)}
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              🎮 Play the game to unlock more lessons and explore the cosmos!
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.DARK.BACKGROUND_PRIMARY,
  },
  
  mainContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  
  backButton: {
    position: 'absolute',
    left: 0,
    top: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: THEME.DARK.COSMIC_ACCENT + '30',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.DARK.COSMIC_ACCENT,
  },
  
  backButtonText: {
    color: THEME.DARK.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '600',
  },
  
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: THEME.DARK.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 5,
  },
  
  mainSubtitle: {
    fontSize: 16,
    color: THEME.DARK.TEXT_SECONDARY,
    textAlign: 'center',
  },
  
  progressSection: {
    backgroundColor: THEME.DARK.BACKGROUND_SECONDARY + '60',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: THEME.DARK.STELLAR_GLOW + '30',
  },
  
  progressText: {
    color: THEME.DARK.TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 5,
  },
  
  progressSubtext: {
    color: THEME.DARK.TEXT_SECONDARY,
    fontSize: 14,
    textAlign: 'center',
  },
  
  lessonsContainer: {
    flex: 1,
  },
  
  lessonCard: {
    backgroundColor: THEME.DARK.BACKGROUND_SECONDARY + '80',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: THEME.DARK.COSMIC_ACCENT + '30',
    shadowColor: THEME.DARK.STELLAR_GLOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  lockedCard: {
    opacity: 0.5,
    backgroundColor: THEME.DARK.BACKGROUND_SECONDARY + '40',
  },
  
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  planetPreview: {
    marginRight: 15,
  },
  
  lessonInfo: {
    flex: 1,
  },
  
  lessonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.DARK.TEXT_PRIMARY,
    marginBottom: 5,
  },
  
  lessonSubtitle: {
    fontSize: 14,
    color: THEME.DARK.TEXT_SECONDARY,
    marginBottom: 10,
  },
  
  lockedText: {
    color: THEME.DARK.TEXT_SECONDARY + '80',
  },
  
  lessonMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  difficulty: {
    fontSize: 12,
    color: THEME.DARK.NEBULA_PINK,
    fontWeight: '600',
    backgroundColor: THEME.DARK.NEBULA_PINK + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  
  duration: {
    fontSize: 12,
    color: THEME.DARK.COSMIC_PURPLE,
    fontWeight: '600',
    backgroundColor: THEME.DARK.COSMIC_PURPLE + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  
  lockOverlay: {
    marginTop: 15,
    padding: 10,
    backgroundColor: THEME.DARK.BACKGROUND_PRIMARY + '80',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.DARK.BORDER_COLOR,
  },
  
  lockText: {
    color: THEME.DARK.TEXT_SECONDARY,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Lesson Content Styles
  lessonContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  lessonContent: {
    paddingBottom: 50,
  },
  
  contentHeader: {
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  
  lessonTitleSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  
  contentTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME.DARK.TEXT_PRIMARY,
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 5,
  },
  
  contentSubtitle: {
    fontSize: 16,
    color: THEME.DARK.TEXT_SECONDARY,
    textAlign: 'center',
  },
  
  contentBody: {
    backgroundColor: THEME.DARK.BACKGROUND_SECONDARY + '60',
    padding: 25,
    borderRadius: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: THEME.DARK.STELLAR_GLOW + '30',
  },
  
  contentText: {
    color: THEME.DARK.TEXT_PRIMARY,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
  },
  
  quizButton: {
    backgroundColor: THEME.DARK.COSMIC_ACCENT,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: THEME.DARK.COSMIC_ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  
  quizButtonText: {
    color: THEME.DARK.TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Quiz Styles
  quizOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  
  quizContainer: {
    backgroundColor: THEME.DARK.BACKGROUND_SECONDARY,
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: THEME.DARK.COSMIC_ACCENT,
  },
  
  quizQuestion: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.DARK.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 30,
  },
  
  quizOption: {
    backgroundColor: THEME.DARK.BACKGROUND_PRIMARY,
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: THEME.DARK.STELLAR_GLOW + '30',
  },
  
  quizOptionText: {
    color: THEME.DARK.TEXT_PRIMARY,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  quizResult: {
    alignItems: 'center',
  },
  
  quizResultText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.DARK.TEXT_PRIMARY,
    marginBottom: 15,
  },
  
  quizScore: {
    fontSize: 18,
    color: THEME.DARK.COSMIC_ACCENT,
    fontWeight: '600',
    marginBottom: 10,
  },
  
  perfectScore: {
    fontSize: 16,
    color: THEME.DARK.NEBULA_PINK,
    textAlign: 'center',
    fontWeight: '500',
  },
  
  footer: {
    padding: 30,
    alignItems: 'center',
  },
  
  footerText: {
    color: THEME.DARK.TEXT_SECONDARY,
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default AstronomyScreen; 