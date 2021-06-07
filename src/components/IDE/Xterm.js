import React, { useEffect, useRef } from 'react';

import TerminalUI from './TerminalUI';
import io from 'socket.io-client';


// IMPORTANT: Make sure you replace this address with your server address.

const serverAddress = 'http://localhost:4500';

const XTerm = () => {
  const terminal = useRef()

  useEffect(() => {
    connectToSocket(serverAddress).then(socket => {
        startTerminal(terminal.current, socket);
    });
  }, []);

  

  function connectToSocket(serverAddress) {
    return new Promise(res => {
      const socket = io(serverAddress);
      res(socket);
    });
  }

  function startTerminal(container, socket) {
    // Create an xterm.js instance.
    const terminal = new TerminalUI(socket);

    // Attach created terminal to a DOM element.
    terminal.attachTo(container);

    // When terminal attached to DOM, start listening for input, output events.
    // Check TerminalUI startListening() function for details.
    terminal.startListening();
  }

  return <div ref={terminal} style={{width: 500, height: 400}}>

  </div>
};

export default XTerm;
