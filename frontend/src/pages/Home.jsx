import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from '../features/counterSlice';

const Home = () => {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
      <div className="text-center">
        <h2 className="text-4xl font-extrabold mb-2 tracking-tight">Identity Generator</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Welcome to the Hacker House Goa identity generator. Start building your frontend elements here.
        </p>
      </div>

      <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
        <button 
          onClick={() => dispatch(decrement())}
          className="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-850 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 transition-colors"
        >
          -
        </button>
        <span className="font-mono text-2xl font-bold min-w-[3ch] text-center">{count}</span>
        <button 
          onClick={() => dispatch(increment())}
          className="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-850 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default Home;
