import React from 'react';
import ProjectDetail from '../components/ProjectDetail';

function Connect4() {
  return (
    <ProjectDetail title="multiplayer connect 4">
      <h1>/ Multiplayer Connect 4</h1>
      
      <p>
        A real-time multiplayer implementation of the classic Connect 4 game. Play with friends online, no installation required.
      </p>

      <h2>/ the challenge</h2>
      
      <p>
        Building a multiplayer game requires solving several interesting problems: real-time synchronization, game state management, matchmaking, and handling disconnections gracefully.
      </p>

      <h2>/ technical architecture</h2>
      
      <h3>frontend</h3>
      
      <p>
        Built with React for the UI and game board rendering. The interface is clean and responsive, working well on both desktop and mobile devices.
      </p>

      <h3>backend</h3>
      
      <p>
        Uses WebSockets for real-time communication between players. The server manages game rooms, validates moves, and broadcasts state updates to connected clients.
      </p>

      <h3>game logic</h3>
      
      <p>
        The core game logic includes:
      </p>

      <ul>
        <li>Move validation - ensuring legal plays</li>
        <li>Win detection - checking for four in a row (horizontal, vertical, diagonal)</li>
        <li>Turn management - enforcing alternating plays</li>
        <li>Draw detection - identifying full boards</li>
      </ul>

      <h2>/ features</h2>
      
      <ul>
        <li>Real-time multiplayer gameplay</li>
        <li>Room-based matchmaking</li>
        <li>Move validation and win detection</li>
        <li>Spectator mode for watching games</li>
        <li>Reconnection handling</li>
        <li>Game history and replay</li>
      </ul>

      <h2>/ implementation highlights</h2>
      
      <h3>state synchronization</h3>
      
      <p>
        Keeping game state consistent across clients is crucial. The server is the source of truth, validating all moves before broadcasting updates. This prevents cheating and handles network issues gracefully.
      </p>

      <h3>optimistic updates</h3>
      
      <p>
        To make the game feel responsive, the client optimistically updates the UI when a player makes a move, then reconciles with the server's authoritative state.
      </p>

      <h2>/ what i learned</h2>
      
      <p>
        This project taught me a lot about real-time web applications, WebSocket communication, and the challenges of distributed state management. Handling edge cases like disconnections and reconnections required careful thought.
      </p>

      <p>
        <a href="https://multiplayer-connect-4-xi.vercel.app/" target="_blank" rel="noopener noreferrer">Play Connect 4</a>
      </p>
    </ProjectDetail>
  );
}

export default Connect4;
