import PredictionList from './components/PredictionList';
import { ClubIcon as Soccer } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-4">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center py-8 animate-fade-in flex items-center justify-center">
          <Soccer className="inline-block mr-4 animate-bounce" size={36} />
          Football Predictions
          <Soccer className="inline-block ml-4 animate-bounce" size={36} />
        </h1>
        <PredictionList />
      </div>
    </main>
  );
}

