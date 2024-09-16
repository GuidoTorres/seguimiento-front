import "./App.css";
import { OrdenCompraProvider } from "./context/OrdenCompraContext";

import MainPage from "./Pages/MainPage";
import { BrowserRouter as Router } from "react-router-dom";

function App() {
  return (
    <OrdenCompraProvider>
      <div className="App">
        <Router>
          <MainPage />
        </Router>
      </div>
    </OrdenCompraProvider>
  );
}

export default App;
