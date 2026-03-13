import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ConcertDetails from "./pages/ConcertDetails";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/concert/:id" element={<ConcertDetails />} />
      </Routes>
    </>
  );
}

export default App;