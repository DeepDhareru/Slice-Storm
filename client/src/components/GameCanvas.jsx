import { useEffect, useRef } from 'react';
import Engine from '../game/Engine';

export default function GameCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const engine = new Engine(canvasRef.current);
    engine.start();
    return () => engine.destroy(); // clean everything when component unmounts
  }, []);

  return <canvas ref={canvasRef} className="game-canvas" />;
}