import { createContext, useState } from "react";

export const OrdenCompraContext = createContext();

export const OrdenCompraProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);

  const info = {
    isLogged,
    setIsLogged,
  };
  return <OrdenCompraContext.Provider value={info}>{children}</OrdenCompraContext.Provider>;
};
