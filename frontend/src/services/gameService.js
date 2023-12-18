// src/services/gameService.js

const API_URL = 'http://localhost:8081/api';

export const fetchAllGames = async () => {
  try {
    const response = await fetch(`${API_URL}/games`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('There was a problem fetching game data:', error);
  }
};

export const fetchLeaderboard = async () => {
  try {
    const response = await fetch(`${API_URL}/leaderboard`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('There was a problem fetching leaderboard:', error);
  }
};
