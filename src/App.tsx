import "./App.css";

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Settings } from "lucide-react"
import type * as THREE from "three"

type Position = {
  x: number
  y: number
  z: number
}

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT"

type Difficulty = "BEGINNER" | "EASY" | "NORMAL" | "HARD" | "EXPERT" | "MASTER" | "INSANE"

const GRID_SIZE = 15
const INITIAL_SNAKE = [{ x: 7, y: 0, z: 7 }]
const INITIAL_FOOD = { x: 12, y: 0, z: 12 }
const INITIAL_DIRECTION: Direction = "RIGHT"

// Difficulty settings with speeds and descriptions
const DIFFICULTY_SETTINGS = {
  BEGINNER: {
    speed: 600,
    label: "🐌 Beginner",
    description: "Perfect for learning",
    color: "from-green-400 to-green-600",
  },
  EASY: { speed: 450, label: "🚶 Easy", description: "Relaxed gameplay", color: "from-blue-400 to-blue-600" },
  NORMAL: { speed: 300, label: "🏃 Normal", description: "Balanced challenge", color: "from-yellow-400 to-yellow-600" },
  HARD: { speed: 200, label: "🏃‍♂️ Hard", description: "Getting intense", color: "from-orange-400 to-orange-600" },
  EXPERT: { speed: 150, label: "⚡ Expert", description: "For skilled players", color: "from-red-400 to-red-600" },
  MASTER: { speed: 100, label: "🔥 Master", description: "Lightning fast", color: "from-purple-400 to-purple-600" },
  INSANE: { speed: 50, label: "💀 Insane", description: "Are you crazy?!", color: "from-pink-400 to-pink-600" },
} as const

// Realistic Snake Head Component
function SnakeHead({ position, direction }: { position: Position; direction: Direction }) {
  const headRef = useRef<THREE.Group>(null)
  const eyeRef1 = useRef<THREE.Mesh>(null)
  const eyeRef2 = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (headRef.current) {
      // Subtle head movement
      headRef.current.position.y = position.y + 0.4 + Math.sin(state.clock.elapsedTime * 4) * 0.05
    }

    // Blinking eyes
    if (eyeRef1.current && eyeRef2.current) {
      const blink = Math.sin(state.clock.elapsedTime * 0.5) > 0.9 ? 0.3 : 1
      eyeRef1.current.scale.y = blink
      eyeRef2.current.scale.y = blink
    }
  })

  const getRotation = (): [number, number, number] => {
    switch (direction) {
      case "UP":
        return [0, Math.PI, 0]
      case "DOWN":
        return [0, 0, 0]
      case "LEFT":
        return [0, -Math.PI / 2, 0]
      case "RIGHT":
        return [0, Math.PI / 2, 0]
      default:
        return [0, 0, 0]
    }
  }

  return (
    <group
      ref={headRef}
      position={[position.x - GRID_SIZE / 2, position.y + 0.4, position.z - GRID_SIZE / 2]}
      rotation={getRotation()}
    >
      {/* Main head shape - more triangular/snake-like */}
      <mesh position={[0, 0, 0]} castShadow>
        <coneGeometry args={[0.35, 0.8, 8]} />
        <meshStandardMaterial color="#228B22" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Head top part */}
      <mesh position={[0, 0.1, -0.2]} castShadow>
        <sphereGeometry args={[0.3, 12, 8]} />
        <meshStandardMaterial color="#32CD32" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Snake pattern stripes */}
      <mesh position={[0, 0.05, -0.1]} castShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.1, 16]} />
        <meshStandardMaterial color="#006400" />
      </mesh>
      <mesh position={[0, 0.05, -0.3]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.1, 16]} />
        <meshStandardMaterial color="#006400" />
      </mesh>

      {/* Eyes */}
      <mesh ref={eyeRef1} position={[0.15, 0.15, -0.1]} castShadow>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
      </mesh>
      <mesh ref={eyeRef2} position={[-0.15, 0.15, -0.1]} castShadow>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
      </mesh>

      {/* Eye pupils */}
      <mesh position={[0.18, 0.15, -0.05]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[-0.18, 0.15, -0.05]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Nostrils */}
      <mesh position={[0.05, 0.05, 0.35]}>
        <sphereGeometry args={[0.02, 6, 6]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[-0.05, 0.05, 0.35]}>
        <sphereGeometry args={[0.02, 6, 6]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Forked tongue */}
      <mesh position={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.01, 0.01, 0.3]} />
        <meshStandardMaterial color="#FF0000" />
      </mesh>
      <mesh position={[0.05, 0, 0.65]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.005, 0.005, 0.1]} />
        <meshStandardMaterial color="#FF0000" />
      </mesh>
      <mesh position={[-0.05, 0, 0.65]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.005, 0.005, 0.1]} />
        <meshStandardMaterial color="#FF0000" />
      </mesh>
    </group>
  )
}

// Realistic Snake Body Segment
function SnakeBodySegment({
  position,
  index,
  totalLength,
}: { position: Position; index: number; totalLength: number }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      const wave = Math.sin(state.clock.elapsedTime * 2 + index * 0.8) * 0.08
      meshRef.current.position.y = position.y + 0.25 + wave
      const scale = Math.max(0.4, 1 - (index / totalLength) * 0.4)
      meshRef.current.scale.setScalar(scale)
    }
  })

  const segmentColor = index % 2 === 0 ? "#228B22" : "#32CD32"

  return (
    <group position={[position.x - GRID_SIZE / 2, position.y + 0.25, position.z - GRID_SIZE / 2]}>
      {/* Main body segment */}
      <mesh ref={meshRef} castShadow>
        <cylinderGeometry args={[0.25, 0.3, 0.5, 12]} />
        <meshStandardMaterial color={segmentColor} roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Body pattern */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.27, 0.32, 0.1, 12]} />
        <meshStandardMaterial color="#006400" />
      </mesh>
    </group>
  )
}

// Enhanced Food Component
function Food({ position }: { position: Position }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
      meshRef.current.position.y = position.y + 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.1
    }
    if (glowRef.current) {
      glowRef.current.rotation.y = -state.clock.elapsedTime * 0.3
      glowRef.current.position.y = position.y + 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.1
    }
  })

  return (
    <group position={[position.x - GRID_SIZE / 2, position.y, position.z - GRID_SIZE / 2]}>
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial
          color="#FF4500"
          emissive="#FF6347"
          emissiveIntensity={0.2}
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>
      {/* Glowing effect */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#FF4500" transparent opacity={0.3} emissive="#FF4500" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

// Professional 3D Game Board
function GameBoard() {
  return (
    <group>
      {/* Main board base */}
      <mesh position={[0, -0.8, 0]} receiveShadow>
        <boxGeometry args={[GRID_SIZE + 2, 0.4, GRID_SIZE + 2]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>

      {/* Board surface */}
      <mesh position={[0, -0.6, 0]} receiveShadow>
        <boxGeometry args={[GRID_SIZE, 0.1, GRID_SIZE]} />
        <meshStandardMaterial color="#DEB887" roughness={0.6} />
      </mesh>

      {/* Grid lines */}
      {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
        <group key={`grid-${i}`}>
          {/* Vertical lines */}
          <mesh position={[i - GRID_SIZE / 2, -0.55, 0]}>
            <boxGeometry args={[0.05, 0.05, GRID_SIZE]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          {/* Horizontal lines */}
          <mesh position={[0, -0.55, i - GRID_SIZE / 2]}>
            <boxGeometry args={[GRID_SIZE, 0.05, 0.05]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
        </group>
      ))}

      {/* Board borders */}
      <mesh position={[0, -0.3, GRID_SIZE / 2 + 0.5]}>
        <boxGeometry args={[GRID_SIZE + 1, 0.6, 1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[0, -0.3, -GRID_SIZE / 2 - 0.5]}>
        <boxGeometry args={[GRID_SIZE + 1, 0.6, 1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[GRID_SIZE / 2 + 0.5, -0.3, 0]}>
        <boxGeometry args={[1, 0.6, GRID_SIZE + 1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[-GRID_SIZE / 2 - 0.5, -0.3, 0]}>
        <boxGeometry args={[1, 0.6, GRID_SIZE + 1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Corner decorations */}
      {[
        [GRID_SIZE / 2 + 0.5, -0.2, GRID_SIZE / 2 + 0.5] as [number, number, number],
        [GRID_SIZE / 2 + 0.5, -0.2, -GRID_SIZE / 2 - 0.5] as [number, number, number],
        [-GRID_SIZE / 2 - 0.5, -0.2, GRID_SIZE / 2 + 0.5] as [number, number, number],
        [-GRID_SIZE / 2 - 0.5, -0.2, -GRID_SIZE / 2 - 0.5] as [number, number, number],
      ].map((pos, i) => (
        <mesh key={`corner-${i}`} position={pos}>
          <cylinderGeometry args={[0.3, 0.3, 0.4, 8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      ))}

      {/* Board numbers */}
      {Array.from({ length: GRID_SIZE }).map((_, i) => (
        <group key={`numbers-${i}`}>
          <Text
            position={[-GRID_SIZE / 2 - 0.8, -0.4, i - GRID_SIZE / 2]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.3}
            color="#654321"
            anchorX="center"
            anchorY="middle"
          >
            {i + 1}
          </Text>
          <Text
            position={[i - GRID_SIZE / 2, -0.4, -GRID_SIZE / 2 - 0.8]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.3}
            color="#654321"
            anchorX="center"
            anchorY="middle"
          >
            {String.fromCharCode(65 + i)}
          </Text>
        </group>
      ))}
    </group>
  )
}

// 3D Scene Component
function GameScene({ snake, food, direction }: { snake: Position[]; food: Position; direction: Direction }) {
  return (
    <>
      <color attach="background" args={["#87CEEB"]} />
      <fog attach="fog" args={["#87CEEB", 20, 100]} />

      {/* Enhanced lighting setup */}
      <ambientLight intensity={0.6} color="#FFF8DC" />

      {/* Main directional light (sun) */}
      <directionalLight
        position={[15, 20, 10]}
        intensity={1.5}
        color="#FFE4B5"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Secondary fill light */}
      <directionalLight position={[-10, 15, -5]} intensity={0.4} color="#E6E6FA" />

      {/* Accent lights */}
      <pointLight position={[0, 8, 0]} intensity={0.8} color="#FFD700" />
      <pointLight position={[8, 4, 8]} intensity={0.3} color="#FF6347" />
      <pointLight position={[-8, 4, -8]} intensity={0.3} color="#32CD32" />

      <GameBoard />

      {/* Render snake with unique keys */}
      {snake.map((segment, index) =>
        index === 0 ? (
          <SnakeHead key={`head-${index}`} position={segment} direction={direction} />
        ) : (
          <SnakeBodySegment key={`body-${index}`} position={segment} index={index} totalLength={snake.length} />
        ),
      )}

      <Food position={food} />

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={15}
        maxDistance={35}
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  )
}

// Arrow Button Component
function ArrowButton({
  icon: Icon,
  onClick,
  className,
  disabled = false,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
  onClick: () => void
  className: string
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${className} ${
        disabled
          ? "bg-gray-400 cursor-not-allowed opacity-50"
          : "bg-gradient-to-b from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 active:scale-95"
      } text-white w-12 h-12 rounded-xl shadow-xl transition-all duration-200 border-2 border-green-400 flex items-center justify-center`}
    >
      <Icon size={24} strokeWidth={3} />
    </button>
  )
}

// Difficulty Button Component
function DifficultyButton({
  difficulty,
  isSelected,
  onClick,
}: {
  difficulty: Difficulty
  isSelected: boolean
  onClick: () => void
}) {
  const settings = DIFFICULTY_SETTINGS[difficulty]

  return (
    <button
      onClick={onClick}
      className={`w-full p-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
        isSelected
          ? `bg-gradient-to-r ${settings.color} text-white shadow-lg border-2 border-white`
          : "bg-white/20 text-white hover:bg-white/30 border-2 border-transparent"
      }`}
    >
      <div className="text-left">
        <div className="font-bold text-sm">{settings.label}</div>
        <div className="text-xs opacity-80">{settings.description}</div>
        <div className="text-xs opacity-60">{settings.speed}ms</div>
      </div>
    </button>
  )
}

export default function SnakeGame3D() {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE)
  const [food, setFood] = useState<Position>(INITIAL_FOOD)
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION)
  const [isGameOver, setIsGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [difficulty, setDifficulty] = useState<Difficulty>("NORMAL")
  const [showDifficultyMenu, setShowDifficultyMenu] = useState(false)
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentGameSpeed = DIFFICULTY_SETTINGS[difficulty].speed

  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position
    let attempts = 0
    const maxAttempts = 100

    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: 0,
        z: Math.floor(Math.random() * GRID_SIZE),
      }
      attempts++
    } while (
      attempts < maxAttempts &&
      currentSnake.some((segment) => segment.x === newFood.x && segment.z === newFood.z)
    )

    return newFood
  }, [])

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE)
    setFood(INITIAL_FOOD)
    setDirection(INITIAL_DIRECTION)
    setIsGameOver(false)
    setScore(0)
    setIsPlaying(false)
    setIsPaused(false)
  }, [])

  const togglePause = useCallback(() => {
    if (isPlaying && !isGameOver) {
      setIsPaused((prev) => !prev)
    }
  }, [isPlaying, isGameOver])

  const changeDirection = useCallback(
    (newDirection: Direction) => {
      if (!isPlaying || isPaused) return

      setDirection((prev) => {
        if (
          (prev === "UP" && newDirection === "DOWN") ||
          (prev === "DOWN" && newDirection === "UP") ||
          (prev === "LEFT" && newDirection === "RIGHT") ||
          (prev === "RIGHT" && newDirection === "LEFT")
        ) {
          return prev
        }
        return newDirection
      })
    },
    [isPlaying, isPaused],
  )

  const moveSnake = useCallback(() => {
    setSnake((currentSnake) => {
      if (currentSnake.length === 0) return currentSnake

      const newSnake = [...currentSnake]
      const head = { ...newSnake[0] }

      switch (direction) {
        case "UP":
          head.z -= 1
          break
        case "DOWN":
          head.z += 1
          break
        case "LEFT":
          head.x -= 1
          break
        case "RIGHT":
          head.x += 1
          break
      }

      if (head.x < 0 || head.x >= GRID_SIZE || head.z < 0 || head.z >= GRID_SIZE) {
        setIsGameOver(true)
        setIsPlaying(false)
        return currentSnake
      }

      if (newSnake.some((segment) => segment.x === head.x && segment.z === head.z)) {
        setIsGameOver(true)
        setIsPlaying(false)
        return currentSnake
      }

      newSnake.unshift(head)

      if (head.x === food.x && head.z === food.z) {
        setScore((prev) => prev + 10)
        setFood(generateFood(newSnake))
      } else {
        newSnake.pop()
      }

      return newSnake
    })
  }, [direction, food, generateFood])

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (!isPlaying) return

      switch (e.key.toLowerCase()) {
        case "arrowup":
        case "w":
          e.preventDefault()
          changeDirection("UP")
          break
        case "arrowdown":
        case "s":
          e.preventDefault()
          changeDirection("DOWN")
          break
        case "arrowleft":
        case "a":
          e.preventDefault()
          changeDirection("LEFT")
          break
        case "arrowright":
        case "d":
          e.preventDefault()
          changeDirection("RIGHT")
          break
        case " ":
          e.preventDefault()
          togglePause()
          break
      }
    },
    [changeDirection, isPlaying, togglePause],
  )

  const startGame = useCallback(() => {
    setIsPlaying(true)
    setIsPaused(false)
    setShowDifficultyMenu(false)
  }, [])

  const openDifficultyMenu = useCallback(() => {
    setShowDifficultyMenu(true)
  }, [])

  const selectDifficulty = useCallback((newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty)
    setShowDifficultyMenu(false)
  }, [])

  useEffect(() => {
    if (isPlaying && !isGameOver && !isPaused) {
      gameLoopRef.current = setInterval(moveSnake, currentGameSpeed)
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
        gameLoopRef.current = null
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
        gameLoopRef.current = null
      }
    }
  }, [isPlaying, isGameOver, isPaused, moveSnake, currentGameSpeed])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [handleKeyPress])

  return (
    <div className="w-full h-screen bg-gradient-to-b from-amber-100 to-green-200 relative overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        camera={{
          position: [12, 18, 12],
          fov: 50,
          near: 0.1,
          far: 1000,
        }}
        shadows
        className="w-full h-full"
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor("#87CEEB")
        }}
      >
        <GameScene snake={snake} food={food} direction={direction} />
      </Canvas>

      {/* Enhanced UI Overlay with Difficulty Display */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 lg:top-6 lg:left-6 z-10 text-gray-800 font-mono bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl p-1 sm:p-3 lg:p-1 shadow-lg max-w-[200px] sm:max-w-none border border-white/20">
        <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 text-green-600">
          🐍 <span className="hidden sm:inline">SNAKE MASTER</span> 3D
        </h1>
        <div className="text-sm sm:text-lg lg:text-xl mb-1 text-gray-700">
          Score: <span className="text-green-600 font-bold">{score}</span>
        </div>
        <div className="text-xs sm:text-sm text-gray-600 mb-1">
          Length: <span className="text-green-600 font-bold">{snake.length}</span>
        </div>
        <div className="text-xs text-purple-600 font-bold mb-1">{DIFFICULTY_SETTINGS[difficulty].label}</div>
        <div className="text-xs text-gray-500 mt-1 sm:mt-2 hidden sm:block">🖱️ Drag to rotate • 🔍 Scroll to zoom</div>
        {isPaused && <div className="text-xs text-orange-600 mt-1 font-bold">⏸️ PAUSED</div>}
      </div>

      {/* Enhanced Arrow Controls with Settings Button */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 z-10">
        <div className="grid grid-cols-3 gap-2 w-40 bg-white/40 backdrop-blur-sm rounded-2xl p-1 shadow-xl border border-white/20">
          <div></div>
          <ArrowButton
            icon={ChevronUp}
            onClick={() => changeDirection("UP")}
            className="col-start-2"
            disabled={!isPlaying || isPaused}
          />
          <div></div>
          <ArrowButton
            icon={ChevronLeft}
            onClick={() => changeDirection("LEFT")}
            className=""
            disabled={!isPlaying || isPaused}
          />
          <div className="flex items-center justify-center">
            <button
              onClick={togglePause}
              disabled={!isPlaying || isGameOver}
              className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-200 ${
                !isPlaying || isGameOver
                  ? "bg-gray-400 cursor-not-allowed opacity-50"
                  : "bg-gradient-to-b from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 active:scale-95"
              }`}
            >
              {isPaused ? (
                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-green-400 border-b-[8px] border-b-transparent ml-1"></div>
              ) : (
                <div className="flex gap-1">
                  <div className="w-[4px] h-[12px] bg-green-400 rounded-sm"></div>
                  <div className="w-[4px] h-[12px] bg-green-400 rounded-sm"></div>
                </div>
              )}
            </button>
          </div>
          <ArrowButton
            icon={ChevronRight}
            onClick={() => changeDirection("RIGHT")}
            className=""
            disabled={!isPlaying || isPaused}
          />
          <div></div>
          <ArrowButton
            icon={ChevronDown}
            onClick={() => changeDirection("DOWN")}
            className="col-start-2"
            disabled={!isPlaying || isPaused}
          />
          <div></div>
        </div>

        {/* Settings Button */}
        <button
          onClick={openDifficultyMenu}
          className="mt-2 w-full bg-gradient-to-b from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600 text-white rounded-xl shadow-xl transition-all duration-200 active:scale-95 border-2 border-purple-400 flex items-center justify-center py-2"
        >
          <Settings size={20} strokeWidth={3} />
          <span className="ml-2 text-sm font-bold">Difficulty</span>
        </button>
      </div>

      {/* Enhanced Instructions */}
      <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 lg:bottom-6 lg:left-6 text-gray-800 font-mono text-xs sm:text-sm z-10 bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 shadow-lg max-w-[180px] sm:max-w-none border border-white/20">
        <p className="mb-1">
          🐍 <span className="font-bold hidden sm:inline">Realistic 3D Snake</span>
          <span className="font-bold sm:hidden">3D Snake</span>
        </p>
        <p className="mb-1 hidden sm:block">
          🎯 <span className="font-bold">Eat glowing orbs</span> to grow
        </p>
        <p className="sm:hidden">🎯 Eat orbs to grow</p>
        <p className="hidden sm:block">
          🎮 <span className="font-bold">Arrow buttons</span> or WASD/Arrow keys
        </p>
        <p className="sm:hidden">🎮 Use arrow buttons</p>
        <p className="text-xs text-gray-500 mt-1">Press SPACE to pause</p>
      </div>

      {/* Difficulty Selection Menu */}
      {showDifficultyMenu && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-30 p-4">
          <div className="text-center text-white bg-gray-900/95 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl max-w-md w-full border border-gray-700">
            <h2 className="text-2xl sm:text-3xl font-bold text-purple-400 mb-6">🎯 Choose Difficulty</h2>
            <div className="space-y-3 mb-6">
              {(Object.keys(DIFFICULTY_SETTINGS) as Difficulty[]).map((diff) => (
                <DifficultyButton
                  key={diff}
                  difficulty={diff}
                  isSelected={difficulty === diff}
                  onClick={() => selectDifficulty(diff)}
                />
              ))}
            </div>
            <button
              onClick={() => setShowDifficultyMenu(false)}
              className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-700 text-white font-bold rounded-lg hover:from-gray-400 hover:to-gray-600 transition-all duration-300 shadow-lg transform hover:scale-105 w-full"
            >
              ✅ Confirm Selection
            </button>
          </div>
        </div>
      )}

      {/* Pause Overlay */}
      {isPaused && isPlaying && !isGameOver && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center z-20 p-4">
          <div className="text-center text-white bg-gray-900/95 rounded-xl p-6 shadow-2xl max-w-sm w-full border border-gray-700">
            <h2 className="text-3xl font-bold text-green-400 mb-4">⏸️ PAUSED</h2>
            <p className="text-sm mb-6 text-gray-300">Take a break! Click resume or press SPACE to continue.</p>
            <button
              onClick={togglePause}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white font-bold rounded-lg hover:from-green-400 hover:to-green-600 transition-all duration-300 shadow-lg transform hover:scale-105 w-full"
            >
              ▶️ Resume Game
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Game Over Overlay */}
      {isGameOver && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-20 p-4">
          <div className="text-center text-white bg-gray-900/95 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl max-w-sm sm:max-w-md w-full border border-gray-700">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-red-400 mb-4">💀 GAME OVER!</h2>
            <p className="text-xl sm:text-2xl mb-2">
              Final Score: <span className="text-yellow-400 font-bold">{score}</span>
            </p>
            <p className="text-lg mb-2 text-gray-300">
              Snake Length: <span className="text-green-400 font-bold">{snake.length}</span>
            </p>
            <p className="text-sm mb-6 text-purple-300">
              Difficulty: <span className="font-bold">{DIFFICULTY_SETTINGS[difficulty].label}</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={resetGame}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white font-bold rounded-lg hover:from-green-400 hover:to-green-600 transition-all duration-300 shadow-lg transform hover:scale-105"
              >
                🎮 Play Again
              </button>
              <button
                onClick={openDifficultyMenu}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold rounded-lg hover:from-purple-400 hover:to-purple-600 transition-all duration-300 shadow-lg transform hover:scale-105"
              >
                ⚙️ Change Difficulty
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Start Game Overlay */}
      {!isPlaying && !isGameOver && !showDifficultyMenu && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-20 p-4">
          <div className="text-center text-white bg-gray-900/95 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl max-w-sm sm:max-w-md w-full border border-gray-700">
            <h2 className="text-3xl sm:text-4xl font-bold text-green-400 mb-6">🐍 SNAKE MASTER 3D</h2>
            <p className="text-lg mb-4 text-gray-300">Experience the most realistic 3D Snake game!</p>
            <p className="text-sm mb-6 text-purple-300">
              Current Difficulty: <span className="font-bold">{DIFFICULTY_SETTINGS[difficulty].label}</span>
            </p>
            <div className="text-sm text-gray-400 mb-6 space-y-1">
              <p>🎮 Use WASD or Arrow Keys to move</p>
              <p>🖱️ Drag to rotate camera • Scroll to zoom</p>
              <p>⏸️ Press SPACE to pause</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={startGame}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-green-700 text-white font-bold rounded-lg hover:from-green-400 hover:to-green-600 transition-all duration-300 shadow-lg transform hover:scale-105 text-lg"
              >
                🚀 Start Adventure
              </button>
              <button
                onClick={openDifficultyMenu}
                className="px-4 py-4 bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold rounded-lg hover:from-purple-400 hover:to-purple-600 transition-all duration-300 shadow-lg transform hover:scale-105"
              >
                <Settings size={24} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
