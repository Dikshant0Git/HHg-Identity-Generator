import React from 'react';
import AnimatedCursor from 'react-animated-cursor';
import Header from './components/Header';
import Home from './pages/Home';

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white selection:bg-purple-500 selection:text-white transition-colors duration-300">
      {/* Custom Animated Cursor */}
      <AnimatedCursor
        innerSize={8}
        outerSize={35}
        innerScale={1}
        outerScale={1.7}
        outerAlpha={0.15}
        hasBlendMode={true}
        innerStyle={{
          backgroundColor: 'rgb(168, 85, 247)' // Purple-500
        }}
        outerStyle={{
          border: '3px solid rgb(168, 85, 247)'
        }}
        clickables={[
          'a',
          'input[type="text"]',
          'input[type="email"]',
          'input[type="number"]',
          'input[type="submit"]',
          'input[image]',
          'label[for]',
          'select',
          'textarea',
          'button',
          '.link'
        ]}
      />

      <Header />
      <main className="container mx-auto px-4 py-8">
        <Home />
      </main>
    </div>
  );
}

export default App;
