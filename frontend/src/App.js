// App.js - Updated routes
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./components/LoginPage.jsx";
import RegisterPage from "./components/RegisterPage.jsx";
import LandingPage from "./components/LandingPage.jsx";
import TripDetails from "./components/tripdetails.jsx";
import Preference from "./components/preference.jsx";
import Home from "./components/Home.jsx";
import Layout from "./components/Layout.js";
import Memories from "./components/Memories.jsx";
import Journal from "./components/Journal.jsx";
import Budget from "./components/Budget.jsx";
import Profile from "./components/Profile.jsx";
import EditPreference from "./components/editpreference.jsx";
import MyTrips from "./components/MyTrips.jsx";
import TripComplete from "./components/TripComplete.jsx";


function App() {
  return (
    <Router>
      <Routes>
        {/* Login Page (Default Page) */}
        <Route path="/" element={<Login />} />

        {/* Register Page */}
        <Route path="/register" element={<RegisterPage />} />

        {/* Landing Page After Login */}
        <Route path="/landing" element={<LandingPage />} />

        {/* Trip Details and Preference Pages */}
        <Route path="/tripdetails" element={<TripDetails />} />
        <Route path="/preference" element={<Preference />} />

        {/* TripComplete - STANDALONE PAGE (NO NAVBAR) */}

        {/* Layout Wrapper - Pages WITH navbar/sidebar */}
        <Route element={<Layout />}>
          <Route path="home" element={<Home />} />
          <Route path="home/:id" element={<Home />} />
          <Route path="MyTrip" element={<MyTrips />} />
          <Route path="memories" element={<Memories />} />
          <Route path="journal" element={<Journal />} />
          <Route path="budget" element={<Budget />} />
          <Route path="profile" element={<Profile />} />
          <Route path="editpreferences" element={<EditPreference />} />
          <Route path="tripComplete/:id" element={<TripComplete />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;