import React from 'react';

interface PlaceholderProps {
  title: string;
  emoji: string;
}

const Placeholder: React.FC<PlaceholderProps> = ({ title, emoji }) => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
      <div className="card text-center py-12">
        <div className="text-6xl mb-4">{emoji}</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">{title} Page</h2>
        <p className="text-gray-600">This feature is coming soon!</p>
        <p className="text-sm text-gray-500 mt-2">You can add the full implementation here.</p>
      </div>
    </div>
  );
};

export default Placeholder;