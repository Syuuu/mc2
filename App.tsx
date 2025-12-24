import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import Experience from './components/Experience';
import UI from './components/UI';
import { TreeState } from './types';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.FORMED);

  const toggleState = () => {
    setTreeState((prev) => 
      prev === TreeState.CHAOS ? TreeState.FORMED : TreeState.CHAOS
    );
  };

  return (
    <>
      <div className="w-full h-screen bg-neutral-950 relative">
        <Canvas
          shadows
          dpr={[1, 2]} // Optimize pixel ratio
          gl={{ 
            antialias: false, // Postprocessing handles antialiasing better usually or makes it unnecessary with bloom
            toneMapping: 3, // ACESFilmicToneMapping
            toneMappingExposure: 1.1
          }}
        >
          <Experience treeState={treeState} />
        </Canvas>
        
        <UI treeState={treeState} toggleState={toggleState} />
        
        <Loader 
          containerStyles={{ background: '#050505' }}
          innerStyles={{ width: '300px', height: '2px', background: '#333' }}
          barStyles={{ height: '2px', background: '#FFD700' }}
          dataStyles={{ fontFamily: 'Cinzel', color: '#FFD700', fontSize: '12px' }}
        />
      </div>
    </>
  );
};

export default App;
