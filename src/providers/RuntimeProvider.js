import React, { createContext } from "react";

export const RuntimeContext = createContext({});

function RuntimeProvider ({children}) {
  const runtime = {
    servers: [],
  }
  
  const createRuntime = () => {

  }

  return (
    <RuntimeContext.Provider value={runtime}>
      {children}
    </RuntimeContext.Provider>
  );
}

export default RuntimeProvider;
