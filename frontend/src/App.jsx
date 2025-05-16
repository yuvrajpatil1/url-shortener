import Home from "./pages/Home";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/navBar";
import Footer from "./components/footer";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./AuthContext";
import Login from "./Login";
import Register from "./Register";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
        <Footer />
      </AuthProvider>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
