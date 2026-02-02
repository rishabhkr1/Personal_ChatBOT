import { Canvas, useFrame } from '@react-three/fiber';
import { Clouds, Cloud, PerspectiveCamera, Line } from '@react-three/drei';
import { useRef, useMemo, useState } from 'react';
import * as THREE from 'three';

const Rain = ({ count = 1000 }) => {
    const pointsRef = useRef();

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 40;
            const y = (Math.random() - 0.5) * 40;
            const z = (Math.random() - 0.5) * 40;
            temp.push(x, y, z);
        }
        return new Float32Array(temp);
    }, [count]);

    useFrame((state, delta) => {
        if (!pointsRef.current) return;

        const positions = pointsRef.current.geometry.attributes.position.array;

        for (let i = 1; i < positions.length; i += 3) {
            // Move y down (gravity)
            positions[i] -= 0.5; // Rain speed

            // Reset if too low
            if (positions[i] < -20) {
                positions[i] = 20;
            }
        }
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particles.length / 3}
                    array={particles}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.1}
                color="#aaaaaa"
                transparent
                opacity={0.6}
                sizeAttenuation={true}
            />
        </points>
    );
};

const LightningBolt = () => {
    const lightRef = useRef();
    const [points, setPoints] = useState(null);
    const [opacity, setOpacity] = useState(0);

    const generateBolt = () => {
        const start = new THREE.Vector3((Math.random() - 0.5) * 20, 15, (Math.random() - 0.5) * 10);
        const end = new THREE.Vector3(start.x + (Math.random() - 0.5) * 5, -5, start.z + (Math.random() - 0.5) * 5);

        const segments = 10;
        const pts = [];
        const current = start.clone();

        for (let i = 0; i <= segments; i++) {
            pts.push(current.clone());
            // Move towards end
            current.lerp(end, 1 / (segments - i + 1));
            // Add jitter
            if (i < segments) {
                current.x += (Math.random() - 0.5) * 2;
                current.z += (Math.random() - 0.5) * 2;
            }
        }
        return pts;
    };

    useFrame((state) => {
        // Logic largely similar: Random trigger
        if (Math.random() > 0.99) { // 1% chance
            // Strike!
            setPoints(generateBolt());
            setOpacity(1);
            if (lightRef.current) {
                lightRef.current.intensity = 20;
                lightRef.current.position.set((Math.random() - 0.5) * 10, 10, 0); // Roughly center light
            }
        } else {
            // Decay
            if (opacity > 0) {
                setOpacity(prev => Math.max(0, prev - 0.1));
            }
            if (lightRef.current && lightRef.current.intensity > 0) {
                lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, 0, 0.1);
            }
        }
    });

    return (
        <>
            <pointLight ref={lightRef} color="#a8c5ff" distance={100} decay={2} />
            {points && opacity > 0.01 && (
                <Line
                    points={points}
                    color="#ffffff"
                    lineWidth={3}
                    transparent
                    opacity={opacity}
                />
            )}
        </>
    );
};



// Simple V-shape Bird
const Bird = ({ position, speed, offset }) => {
    const groupRef = useRef();
    const wingLeftRef = useRef();
    const wingRightRef = useRef();

    useFrame((state) => {
        if (!groupRef.current) return;

        const time = state.clock.getElapsedTime();

        // Move Forward (along X or Z)
        // Let's make them fly from right to left across the screen (positive X to negative X)
        groupRef.current.position.x -= speed * 0.05;

        // Reset if off screen
        if (groupRef.current.position.x < -20) {
            groupRef.current.position.x = 20;
            groupRef.current.position.y = position[1] + (Math.random() - 0.5) * 4; // Vary height on reset
        }

        // Bob up and down
        groupRef.current.position.y += Math.sin(time * 5 + offset) * 0.01;

        // Flap Wings
        const flap = Math.sin(time * 15 + offset) * 0.5;
        if (wingLeftRef.current) wingLeftRef.current.rotation.z = flap;
        if (wingRightRef.current) wingRightRef.current.rotation.z = -flap;
    });

    return (
        <group ref={groupRef} position={position} rotation={[0, -Math.PI / 2, 0]}> {/* Rotate to face left */}
            {/* Left Wing */}
            <mesh ref={wingLeftRef} position={[0, 0, 0]}>
                <boxGeometry args={[0.5, 0.05, 0.2]} />
                <meshStandardMaterial color="#111" />
            </mesh>
            {/* Right Wing */}
            <mesh ref={wingRightRef} position={[0, 0, 0]}>
                <boxGeometry args={[0.5, 0.05, 0.2]} />
                <meshStandardMaterial color="#111" />
            </mesh>
        </group>
    );
};

const BirdFlock = () => {
    // Generate static flock data
    const flock = useMemo(() => {
        return new Array(5).fill(0).map((_, i) => ({
            position: [
                10 + Math.random() * 10, // Start far right
                5 + Math.random() * 5,   // High up
                (Math.random() - 0.5) * 10 // Spread depth
            ],
            speed: 1 + Math.random(),
            offset: Math.random() * 100
        }));
    }, []);

    return (
        <group>
            {flock.map((bird, i) => (
                <Bird key={i} {...bird} />
            ))}
        </group>
    );
};

const Mountains = () => {
    return (
        <group position={[0, -10, -30]}>
            <mesh position={[-15, 5, 0]}>
                <coneGeometry args={[15, 20, 4]} />
                <meshStandardMaterial color="#0f172a" roughness={0.9} />
            </mesh>
            <mesh position={[0, 8, -5]}>
                <coneGeometry args={[20, 25, 4]} />
                <meshStandardMaterial color="#1e293b" roughness={0.9} />
            </mesh>
            <mesh position={[18, 4, 2]}>
                <coneGeometry args={[18, 18, 4]} />
                <meshStandardMaterial color="#0b1120" roughness={0.9} />
            </mesh>
        </group>
    );
};

const Background3D = ({ isDarkMode, isLoginPage }) => {
    // Colors based on mode
    const bgGradient = isDarkMode
        ? 'linear-gradient(to bottom, #000000 0%, #1a1a1a 100%)'
        : 'linear-gradient(to bottom, #64748b 0%, #334155 100%)';

    const cloudColor1 = isDarkMode ? '#111111' : '#94a3b8';
    const cloudColor2 = isDarkMode ? '#050505' : '#64748b';
    const fogColor = isDarkMode ? '#000000' : '#334155';
    const lightIntensity = isDarkMode ? 0.5 : 2.0; // Dimmer sun in dark mode

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            background: bgGradient,
            pointerEvents: 'none',
            transition: 'background 1s ease', // Smooth transition
            overflow: 'hidden'
        }}>
            {isLoginPage && (
                <>
                    <div style={{
                        position: 'absolute',
                        right: '-5%',
                        bottom: '-5%',
                        width: '80vw',
                        height: '80vh',
                        backgroundImage: `url("${import.meta.env.BASE_URL}assets/robot.png")`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'right bottom',
                        backgroundRepeat: 'no-repeat',
                        opacity: 0.4,
                        zIndex: 1,
                        filter: 'drop-shadow(0 0 50px rgba(0, 255, 255, 0.2))'
                    }} />
                    <div style={{
                        position: 'absolute',
                        left: '-5%',
                        top: '-5%',
                        width: '85vw',
                        height: '85vh',
                        backgroundImage: `url("${import.meta.env.BASE_URL}assets/ai.png")`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'left top',
                        backgroundRepeat: 'no-repeat',
                        opacity: 0.35,
                        zIndex: 1,
                        filter: 'drop-shadow(0 0 50px rgba(138, 43, 226, 0.2))'
                    }} />
                    <div style={{
                        position: 'absolute',
                        left: '50%',
                        top: '45%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '15vw', // Back to a bit larger
                        fontWeight: '900',
                        color: 'rgba(255, 255, 255, 0.25)', // Increased opacity to 25%
                        fontFamily: 'Inter, sans-serif',
                        pointerEvents: 'none',
                        zIndex: 1, // Above background but below card
                        textTransform: 'uppercase',
                        letterSpacing: '15px',
                        whiteSpace: 'nowrap',
                        filter: 'blur(1px)',
                        textShadow: '0 0 50px rgba(255, 255, 255, 0.2)'
                    }}>
                        growGpt
                    </div>
                </>
            )}
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 15]} />
                <ambientLight intensity={isDarkMode ? 0.4 : 1.2} />
                <directionalLight position={[10, 10, 5]} intensity={lightIntensity} color="#ffffff" />

                {/* Bird Flock */}
                <BirdFlock />

                {/* Mountains */}
                <Mountains />

                {/* Stormy Clouds */}
                <Clouds material={THREE.MeshStandardMaterial} limit={400}>
                    <Cloud seed={1} bounds={[20, 6, 4]} volume={15} color={cloudColor1} position={[0, 5, -10]} opacity={0.8} speed={0.4} />
                    <Cloud seed={2} bounds={[20, 6, 4]} volume={15} color={cloudColor2} position={[0, -5, -12]} opacity={0.6} speed={0.3} />
                </Clouds>

                <fog attach="fog" args={[fogColor, 5, 60]} />
            </Canvas>
        </div>
    );
};

export default Background3D;
