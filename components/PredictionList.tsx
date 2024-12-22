'use client'

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import Image from 'next/image'
import { ClubIcon as Soccer, Trophy, Clock, Calendar, Target, BarChart, RefreshCw, AlertTriangle } from 'lucide-react'

interface Prediction {
  matchId: string;
  homeTeamName: string;
  awayTeamName: string;
  dateTime: string;
  homePrediction: string;
  awayPrediction: string;
  probHomeWin: number;
  probDraw: number;
  probAwayWin: number;
  expectedHomeGoals: number;
  expectedAwayGoals: number;
}

function calculateTimeRemaining(matchTime: string): string {
  const now = new Date();
  const matchDate = new Date(matchTime);
  const timeDiff = matchDate.getTime() - now.getTime();
  
  if (timeDiff < 0) {
    return "Match ended";
  }

  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function determineOutcome(match: Prediction): string {
  const { probHomeWin, probDraw, probAwayWin } = match;
  const maxProb = Math.max(probHomeWin, probDraw, probAwayWin);

  if (maxProb === probHomeWin) {
    return `${match.homeTeamName} likely to win`;
  } else if (maxProb === probAwayWin) {
    return `${match.awayTeamName} likely to win`;
  } else {
    return "Draw likely";
  }
}

function formatPercentage(value: number): string {
  return `${(value * 1).toFixed(0)}%`;
}

function getTeamLogo(teamName: string): string {
  // Replace spaces with hyphens and convert to lowercase
  const formattedName = teamName.replace(/\s+/g, '-').toLowerCase();
  return `https://img.icons8.com/color/96/${formattedName}.png`;
}

export default function PredictionList() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPredictions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/predictions');
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setPredictions(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching predictions:', err);
      setError('Failed to load predictions. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();

    // Set up daily updates
    const updateInterval = setInterval(() => {
      fetchPredictions();
    }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds

    return () => clearInterval(updateInterval);
  }, []);

  if (isLoading) {
    return (
      <motion.div 
        className="text-center text-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <RefreshCw className="inline-block mr-2 animate-spin" size={24} />
        <p>Loading predictions...</p>
        <p className="text-sm mt-2">This may take a few moments</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="text-center text-red-500 text-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <AlertTriangle className="inline-block mr-2" size={24} />
        <p>{error}</p>
        <button 
          onClick={fetchPredictions} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center justify-center mx-auto"
        >
          <RefreshCw className="mr-2" size={16} />
          Try Again
        </button>
      </motion.div>
    );
  }

  if (predictions.length === 0) {
    return (
      <motion.div 
        className="text-center text-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Soccer className="inline-block mr-2" size={24} />
        <p>No predictions available for today.</p>
        <p className="text-sm mt-2">Check back later for updates!</p>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {lastUpdated && (
          <p className="text-center text-sm mb-4">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        )}
        <div className="space-y-6">
          {predictions.map((match, index) => (
            <motion.div
              key={match.matchId}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-white/10 backdrop-blur-lg text-white overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <CardHeader>
                  <CardTitle className="text-2xl flex justify-between items-center">
                    <motion.div 
                      className="flex items-center space-x-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Image
                        src={getTeamLogo(match.homeTeamName)}
                        alt={`${match.homeTeamName} logo`}
                        width={40}
                        height={40}
                        className="rounded-full bg-white p-1"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=40&width=40";
                        }}
                      />
                      <span>{match.homeTeamName}</span>
                    </motion.div>
                    <span className="text-yellow-400 text-3xl">VS</span>
                    <motion.div 
                      className="flex items-center space-x-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>{match.awayTeamName}</span>
                      <Image
                        src={getTeamLogo(match.awayTeamName)}
                        alt={`${match.awayTeamName} logo`}
                        width={40}
                        height={40}
                        className="rounded-full bg-white p-1"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=40&width=40";
                        }}
                      />
                    </motion.div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-lg mb-2 flex items-center">
                        <Calendar className="inline-block mr-2" size={18} />
                        {new Date(match.dateTime).toLocaleString()}
                      </p>
                      <p className="text-md mb-4 flex items-center">
                        <Clock className="inline-block mr-2" size={18} />
                        {calculateTimeRemaining(match.dateTime) === "Match ended" 
                          ? "Match ended" 
                          : `Time Remaining: ${calculateTimeRemaining(match.dateTime)}`}
                      </p>
                      <motion.p 
                        className="text-xl font-bold mb-4 text-green-400 flex items-center"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Trophy className="inline-block mr-2" size={18} />
                        {determineOutcome(match)}
                      </motion.p>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-2 flex items-center">
                        <Target className="inline-block mr-2" size={18} />
                        Predicted Result
                      </h4>
                      <motion.div 
                        className="flex justify-between items-center mb-4 text-2xl font-bold"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <span>{match.homePrediction}</span>
                        <span>-</span>
                        <span>{match.awayPrediction}</span>
                      </motion.div>
                      <h4 className="text-lg font-semibold mb-2 flex items-center">
                        <Soccer className="inline-block mr-2" size={18} />
                        Expected Goals
                      </h4>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-2xl">{match.expectedHomeGoals.toFixed(1)}</span>
                        <span className="text-lg">-</span>
                        <span className="text-2xl">{match.expectedAwayGoals.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-2 flex items-center">
                      <BarChart className="inline-block mr-2" size={18} />
                      Match Outcome Probabilities
                    </h4>
                    <div className="space-y-4">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                      >
                        <div className="flex justify-between text-sm mb-1">
                          <span>{match.homeTeamName} Win</span>
                          <span>{formatPercentage(match.probHomeWin)}</span>
                        </div>
                        <Progress value={match.probHomeWin * 100} className="h-2 bg-gray-700 [&>div]:bg-green-500" />
                      </motion.div>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                      >
                        <div className="flex justify-between text-sm mb-1">
                          <span>Draw</span>
                          <span>{formatPercentage(match.probDraw)}</span>
                        </div>
                        <Progress value={match.probDraw * 100} className="h-2 bg-gray-700 [&>div]:bg-yellow-500" />
                      </motion.div>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 0.9, duration: 0.5 }}
                      >
                        <div className="flex justify-between text-sm mb-1">
                          <span>{match.awayTeamName} Win</span>
                          <span>{formatPercentage(match.probAwayWin)}</span>
                        </div>
                        <Progress value={match.probAwayWin * 100} className="h-2 bg-gray-700 [&>div]:bg-red-500" />
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

