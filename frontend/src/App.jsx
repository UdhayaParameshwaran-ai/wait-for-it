import "./App.css";
import ErrorBoundary from "./ErrorBoundary";
import { Routes, Route, BrowserRouter, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CreateNote from "./pages/CreateNote";
import YourNotes from "./pages/YourNotes";
import ViewNote from "./pages/ViewNote";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/";
  return (
    <ErrorBoundary>
      {!hideNavbar && <Header />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create-note" element={<CreateNote />} />
        <Route path="/notes/:id" element={<ViewNote />} />
        <Route path="/your-notes" element={<YourNotes />} />
      </Routes>
      {!hideNavbar && <Footer />}
    </ErrorBoundary>
  );
}

export default App;
