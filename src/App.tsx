"use client"
import "./App.css";
import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment, Text } from "@react-three/drei"
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import type * as THREE from "three"

type Position = {
  x: number
  y: number
  z: number
}

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT"

const GRID_SIZE = 15
const INITIAL_SNAKE = [{ x: 7, y: 0, z: 7 }]
const INITIAL_FOOD = { x: 12, y: 0, z: 12 }
const INITIAL_DIRECTION: Direction = "RIGHT"
const GAME_SPEED = 500

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
      <mesh position={[0, 0, 0]}>
        <coneGeometry args={[0.35, 0.8, 8]} />
        <meshStandardMaterial color="#228B22" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Head top part */}
      <mesh position={[0, 0.1, -0.2]}>
        <sphereGeometry args={[0.3, 12, 8]} />
        <meshStandardMaterial color="#32CD32" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Snake pattern stripes */}
      <mesh position={[0, 0.05, -0.1]}>
        <cylinderGeometry args={[0.32, 0.32, 0.1, 16]} />
        <meshStandardMaterial color="#006400" />
      </mesh>
      <mesh position={[0, 0.05, -0.3]}>
        <cylinderGeometry args={[0.28, 0.28, 0.1, 16]} />
        <meshStandardMaterial color="#006400" />
      </mesh>

      {/* Eyes */}
      <mesh ref={eyeRef1} position={[0.15, 0.15, -0.1]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
      </mesh>
      <mesh ref={eyeRef2} position={[-0.15, 0.15, -0.1]}>
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
      <mesh ref={meshRef}>
        <cylinderGeometry args={[0.25, 0.3, 0.5, 12]} />
        <meshStandardMaterial color={segmentColor} roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Body pattern */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.27, 0.32, 0.1, 12]} />
        <meshStandardMaterial color="#006400" />
      </mesh>
    </group>
  )
}

// Enhanced Food Component
function Food({ position }: { position: Position }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
      meshRef.current.position.y = position.y + 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.1
    }
  })

  return (
    <group position={[position.x - GRID_SIZE / 2, position.y, position.z - GRID_SIZE / 2]}>
      <mesh ref={meshRef}>
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
      <mesh>
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

      {/* Grid lines - more prominent */}
      {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
        <group key={`grid-${i}`}>
          {/* Vertical lines */}
          <mesh position={[i - GRID_SIZE / 2, -0.55, 0]}>
            <boxGeometry args={[0.05, 0.05, GRID_SIZE]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          {/* Horizontal lines */}
          <mesh position={[0, -0.55, i - GRID_SIZE / 2]}>
            <boxGeometry args={[GRID_SIZE, 0.05, GRID_SIZE]} />
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
      <Environment preset="sunset" />
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[15, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <pointLight position={[0, 8, 0]} intensity={0.5} color="#FFD700" />

      <GameBoard />

      {/* Render snake */}
      {snake.map((segment, index) =>
        index === 0 ? (
          <SnakeHead key={index} position={segment} direction={direction} />
        ) : (
          <SnakeBodySegment key={index} position={segment} index={index} totalLength={snake.length} />
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
      />
    </>
  )
}

// Arrow Button Component
function ArrowButton({
  icon: Icon,
  onClick,
  className,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
  onClick: () => void
  className: string
}) {
  return (
    <button
      onClick={onClick}
      className={`${className} bg-gradient-to-b from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-white w-12 h-12 rounded-xl shadow-xl transition-all duration-200 active:scale-95 border-2 border-green-400 flex items-center justify-center`}
    >
      <Icon size={24} strokeWidth={3} />
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
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const generateFood = useCallback((): Position => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: 0,
      z: Math.floor(Math.random() * GRID_SIZE),
    }
    return newFood
  }, [])

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE)
    setFood(INITIAL_FOOD)
    setDirection(INITIAL_DIRECTION)
    setIsGameOver(false)
    setScore(0)
    setIsPlaying(false)
  }, [])

  const changeDirection = useCallback(
    (newDirection: Direction) => {
      if (!isPlaying) return

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
    [isPlaying],
  )

  const moveSnake = useCallback(() => {
    setSnake((currentSnake) => {
      if (currentSnake.length === 0) return currentSnake

      const newSnake = [...currentSnake]
      const head = { ...newSnake[0] }

      switch (direction) {
        case "UP":
          head.z -= 1 // Move towards back (up on screen)
          break
        case "DOWN":
          head.z += 1 // Move towards front (down on screen)
          break
        case "LEFT":
          head.x -= 1 // Move towards left
          break
        case "RIGHT":
          head.x += 1 // Move towards right
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
        setFood(generateFood())
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
          changeDirection("UP")
          break
        case "arrowdown":
        case "s":
          changeDirection("DOWN")
          break
        case "arrowleft":
        case "a":
          changeDirection("LEFT")
          break
        case "arrowright":
        case "d":
          changeDirection("RIGHT")
          break
      }
    },
    [changeDirection, isPlaying],
  )

  const startGame = () => {
    setIsPlaying(true)
  }

  const togglePause = useCallback(() => {
    if (isPlaying && !isGameOver) {
      setIsPaused((prev) => !prev)
    }
  }, [isPlaying, isGameOver])

  useEffect(() => {
    if (isPlaying && !isGameOver && !isPaused) {
      gameLoopRef.current = setInterval(moveSnake, GAME_SPEED)
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }
  }, [isPlaying, isGameOver, isPaused, moveSnake])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [handleKeyPress])

  return (
    <div className="w-full h-screen bg-gradient-to-b from-amber-100 to-green-200 relative overflow-hidden">
      {/* Enhanced UI Overlay - Responsive */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 lg:top-6 lg:left-6 z-10 text-gray-800 font-mono bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 shadow-lg max-w-[200px] sm:max-w-none">
        <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 text-green-600">
          🐍 <span className="hidden sm:inline">SNAKE MASTER</span> 3D
        </h1>
        <div className="text-sm sm:text-lg lg:text-xl mb-1 text-gray-700">
          Score: <span className="text-green-600 font-bold">{score}</span>
        </div>
        <div className="text-xs sm:text-sm text-gray-600">
          Length: <span className="text-green-600 font-bold">{snake.length}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1 sm:mt-2 hidden sm:block">🖱️ Drag to rotate • 🔍 Scroll to zoom</div>
      </div>

      {/* Enhanced Arrow Controls - Fixed Sizing */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 z-10">
        <div className="grid grid-cols-3 gap-2 w-40 bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
          <div></div>
          <ArrowButton icon={ChevronUp} onClick={() => changeDirection("UP")} className="col-start-2" />
          <div></div>

          <ArrowButton icon={ChevronLeft} onClick={() => changeDirection("LEFT")} className="" />
          <div className="flex items-center justify-center">
            <button
              onClick={togglePause}
              className="w-12 h-12 bg-gradient-to-b from-gray-600 to-gray-800 rounded-xl flex items-center justify-center shadow-lg hover:from-gray-500 hover:to-gray-700 active:scale-95 transition-all duration-200 ml-2"
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
          <ArrowButton icon={ChevronRight} onClick={() => changeDirection("RIGHT")} className="" />

          <div></div>
          <ArrowButton icon={ChevronDown} onClick={() => changeDirection("DOWN")} className="col-start-2" />
          <div></div>
        </div>
      </div>

      {/* 3D Canvas - Responsive */}
      <Canvas
        camera={{
          position: [12, 18, 12],
          fov: window.innerWidth < 768 ? 60 : 50,
          near: 0.1,
          far: 1000,
        }}
        shadows
        className="w-full h-full"
      >
        <GameScene snake={snake} food={food} direction={direction} />
      </Canvas>

      {/* Pause Overlay */}
      {isPaused && isPlaying && !isGameOver && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center z-20 p-4">
          <div className="text-center text-white bg-gray-900/80 rounded-xl p-4 shadow-2xl max-w-sm w-full">
            <h2 className="text-2xl font-bold text-green-400 mb-3">⏸️ PAUSED</h2>
            <p className="text-sm mb-4 text-gray-300">Take a break! Click the center button to resume.</p>
            <button
              onClick={togglePause}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white font-bold rounded-lg hover:from-green-400 hover:to-green-600 transition-all duration-300 shadow-lg transform hover:scale-105 w-full"
            >
              ▶️ Resume Game
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Game Over Overlay - Responsive */}
      {isGameOver && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-20 p-4">
          <div className="text-center text-white bg-gray-900/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl max-w-sm sm:max-w-md lg:max-w-lg w-full">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-red-400 mb-2 sm:mb-4">💀 GAME OVER!</h2>
            <p className="text-lg sm:text-2xl lg:text-3xl mb-1 sm:mb-2">
              Final Score: <span className="text-yellow-400">{score}</span>
            </p>
            <p className="text-sm sm:text-lg lg:text-xl mb-4 sm:mb-6 lg:mb-8 text-gray-300">
              Snake Length: <span className="text-green-400">{snake.length}</span>
            </p>
            <button
              onClick={resetGame}
              className="px-6 py-3 sm:px-8 sm:py-3 lg:px-10 lg:py-4 bg-gradient-to-r from-green-500 to-green-700 text-white font-bold rounded-lg sm:rounded-xl hover:from-green-400 hover:to-green-600 transition-all duration-300 text-sm sm:text-lg lg:text-xl shadow-lg transform hover:scale-105 w-full sm:w-auto"
            >
              🎮 Play Again
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Start Game Overlay - Responsive */}
      {!isPlaying && !isGameOver && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-20 p-4">
          <div className="text-center text-white bg-gray-900/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl max-w-sm sm:max-w-md lg:max-w-lg w-full">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-400 mb-3 sm:mb-4 lg:mb-6">
              🐍 SNAKE MASTER 3D
            </h2>
            <p className="text-sm sm:text-lg lg:text-xl mb-4 sm:mb-6 lg:mb-8 text-gray-300">
              Experience the most realistic 3D Snake game!
            </p>
            <button
              onClick={startGame}
              className="px-6 py-3 sm:px-8 sm:py-3 lg:px-10 lg:py-4 bg-gradient-to-r from-green-500 to-green-700 text-white font-bold rounded-lg sm:rounded-xl hover:from-green-400 hover:to-green-600 transition-all duration-300 text-sm sm:text-lg lg:text-xl shadow-lg transform hover:scale-105 w-full sm:w-auto"
            >
              🚀 Start Adventure
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Instructions - Responsive */}
      <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 lg:bottom-6 lg:left-6 text-gray-800 font-mono text-xs sm:text-sm z-10 bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 shadow-lg max-w-[180px] sm:max-w-none">
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
      </div>
    </div>
  )
}
