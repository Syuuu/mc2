import React from 'react';
import { TreeState } from '../types';

interface UIProps {
  treeState: TreeState;
  toggleState: () => void;
}

const UI: React.FC<UIProps> = ({ treeState, toggleState }) => {
  const isChaos = treeState === TreeState.CHAOS;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-8 md:p-12">
      {/* Header */}
      <header className="flex flex-col items-center animate-fade-in-down pointer-events-auto">
        <h1 className="font-luxury text-3xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-700 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-widest uppercase text-center"
            style={{ filter: 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.4))' }}
        >
          The Grand Luxury Tree
        </h1>
        <div className="h-0.5 w-32 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mt-4 shadow-[0_0_15px_#FFD700]"></div>
        
        {/* Customized Greeting */}
        <div className="text-center mt-12 relative z-50">
           {/* Ambient Glow behind text */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-black/40 blur-3xl rounded-full -z-10"></div>

          {/* Reduced font size for mobile (text-3xl) to prevent line breaks, larger on desktop */}
          <p className="font-serif text-3xl sm:text-4xl md:text-6xl tracking-wider leading-tight whitespace-nowrap"
             style={{ 
               color: '#FFFFFF',
               fontFamily: '"Playfair Display", serif',
               // Layered shadows: 1. Hard black for contrast 2. Gold glow 3. Wide ambient glow
               textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 20px #FFD700, 0 0 40px #FF8C00'
             }}
          >
            小昕昕圣诞快乐！
          </p>
          <p className="mt-4 md:mt-6 font-serif text-xl md:text-4xl tracking-widest text-yellow-100"
             style={{
               fontFamily: '"Cinzel", serif',
               textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 15px #FFD700'
             }}
          >
            我们成都见！
          </p>
        </div>
      </header>

      {/* Footer / Controls */}
      <footer className="flex flex-col items-center mb-8 pointer-events-auto">
        <button
          onClick={toggleState}
          className={`
            group relative px-12 py-4 
            border-2 border-yellow-600/50 
            bg-gradient-to-b from-emerald-950/90 to-black/90 
            backdrop-blur-md 
            overflow-hidden 
            transition-all duration-700 ease-out
            hover:border-yellow-400 hover:shadow-[0_0_40px_rgba(255,215,0,0.5)]
            rounded-sm
          `}
        >
          {/* Internal Glow */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-yellow-400 transition-opacity duration-700" />
          
          <span className="relative z-10 font-luxury text-xl md:text-2xl text-yellow-100 tracking-[0.2em] group-hover:text-white transition-colors drop-shadow-md">
            {isChaos ? 'RESTORE ORDER' : 'UNLEASH CHAOS'}
          </span>
          
          {/* Decorative Corners */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-yellow-500" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-yellow-500" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-yellow-500" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-yellow-500" />
        </button>

        <div className="mt-6 flex space-x-8 text-yellow-500/50 text-xs font-luxury tracking-widest uppercase">
            <span>React 19</span>
            <span>Three.js</span>
            <span>R3F</span>
        </div>
      </footer>
    </div>
  );
};

export default UI;