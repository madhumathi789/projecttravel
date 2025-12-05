import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./TripComplete.css";

const TripComplete = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/itineraries/${id}`);
        const data = await res.json();
        setTrip(data);
      } catch (err) {
        console.error("Failed to load trip:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchTrip();
    } else {
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="trip-complete-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="trip-complete-container">
        <div className="error-message">Trip not found</div>
      </div>
    );
  }

  return (
    <div className="trip-complete-container">
      {/* Main Content Card */}
      <div className="trip-complete-card">
        {/* Trip Header */}
        <div className="trip-header-section">
          <h1 className="trip-title">{trip.title || "Your Trip"}</h1>
          <div className="trip-duration-budget">
            <span className="duration">{trip.days?.length || 0} Days</span>
            <span className="divider">•</span>
            <span className="dates">{trip.startDate} - {trip.endDate}</span>
          </div>
          <div className="total-budget">
            Total Budget: ₹{trip.budget?.toLocaleString() || "0"}
          </div>
        </div>

        {/* Success Message Box */}
        <div className="success-message-box">
          <div className="success-icon">✓</div>
          <div className="success-content">
            <h2 className="success-title">{trip.title} successfully completed!</h2>
            <p className="success-description">
              From {trip.destinations?.join(" to ") || "your journey"} — 
              {trip.title} gave us memories soaked in amazing experiences.
            </p>
          </div>
        </div>

        {/* Plan Next Trip Button */}
        <div className="next-trip-section">
          <button 
            className="plan-next-trip-btn"
            onClick={() => navigate("/tripdetails")}
          >
            Plan Your nextTrip Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripComplete;