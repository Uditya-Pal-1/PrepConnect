import React from 'react';
import { BrowserRouter, Routes, Route } from './router';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Register from './pages/Register';
import Home from './pages/Home';
import Footer from './components/Footer';
import Opportunities from './pages/Opportunities';
import Contact from './pages/Contact';
import About from './pages/About';
import NgoDash from './pages/NgoDash';
import Chat from './pages/Chat';
import Profile from './pages/Profile';

export default function App() {
  return <BrowserRouter><AuthProvider><div className="main-content-wrapper">
    <Routes>
      <Route path="/" element={<Home />} /><Route path="/home" element={<Home />} />
      <Route path="/opportunities" element={<Opportunities />} /><Route path="/contact" element={<Contact />} />
      <Route path="/about" element={<About />} /><Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} /><Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/profile" element={<Profile />} /><Route path="/ngodash" element={<NgoDash />} />
      <Route path="/chat" element={<Chat />} /><Route path="*" element={<main className="page-shell"><h1>Page not found</h1><a href="/">Return home</a></main>} />
    </Routes>
  </div><Footer /></AuthProvider></BrowserRouter>;
}
