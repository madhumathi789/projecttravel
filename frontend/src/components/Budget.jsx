// Budget.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  MapPin,
  Calendar,
  Wallet,
  ArrowLeft,
  Clock,
  PieChart,
  CreditCard,
  RefreshCw
} from "lucide-react";
import "./Budget.css"; // Make sure to import your CSS

const API_BASE_URL = "http://localhost:5000/api";

/* ------------------------- Helpers -------------------------- */
const parseAmount = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  const cleaned = value.toString().replace(/[^0-9.]/g, "");
  return parseFloat(cleaned) || 0;
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const calculateDurationText = (start, end) => {
  if (!start || !end) return "N/A";
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s) || isNaN(e)) return "N/A";
  const diffDays = Math.round((e - s) / (1000 * 60 * 60 * 24));
  return `${diffDays + 1} Days`;
};

/* ------------------------- Component ------------------------- */
const Budget = () => {
  const [tripList, setTripList] = useState([]);
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDayIndex, setOpenDayIndex] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    loadTrips();
  }, []);

  // ✅ FIXED: Load trips from the correct endpoint
  const loadTrips = async () => {
    setListLoading(true);
    setError("");
    setDebugInfo("");
    
    try {
      const token = localStorage.getItem("token");
      console.log("🔍 Token check:", token ? "Present" : "Missing");
      
      if (!token) {
        setError("Please log in to view your trips.");
        setListLoading(false);
        return;
      }

      // ✅ TRY BOTH ENDPOINTS (your trips might be in either)
      const endpoints = [
        "/trips",                    // Your Trip model (from trips.js)
        "/budget/my-trips",          // Your budgetRoutes.js
        "/itineraries",              // Your itinerary routes
      ];

      let trips = [];
      let successfulEndpoint = "";

      for (const endpoint of endpoints) {
        try {
          console.log(`Trying ${endpoint}...`);
          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log(`✅ Success from ${endpoint}:`, data);
            
            // Handle different response formats
            if (Array.isArray(data)) {
              trips = data;
            } else if (data.data && Array.isArray(data.data)) {
              trips = data.data;
            } else if (data.trips && Array.isArray(data.trips)) {
              trips = data.trips;
            }
            
            if (trips.length > 0) {
              successfulEndpoint = endpoint;
              break;
            }
          }
        } catch (err) {
          console.log(`Endpoint ${endpoint} failed:`, err.message);
        }
      }

      if (trips.length === 0) {
        setDebugInfo("No trips found from any endpoint");
      } else {
        setDebugInfo(`Found ${trips.length} trips from ${successfulEndpoint}`);
        
        // Format trips for display
        const formattedTrips = trips.map(trip => ({
          _id: trip._id,
          title: trip.title || "Untitled Trip",
          destinations: Array.isArray(trip.destinations) 
            ? trip.destinations.map(d => `${d.from} → ${d.to}`)
            : [trip.destinations || "Unknown"],
          startDate: trip.startDate,
          endDate: trip.endDate,
          budget: trip.budget || trip.totalBudget || 0,
          itineraryId: trip.itineraryId || trip._id,
          // Add any other fields needed
        }));
        
        setTripList(formattedTrips);
      }

    } catch (err) {
      console.error("❌ Failed to load trips:", err);
      setError(err.message || "Failed to load trips");
    } finally {
      setListLoading(false);
    }
  };

  // ✅ FIXED: Fetch itinerary details
  const fetchItineraryDetails = async (trip) => {
    console.log("Fetching details for:", trip);
    
    setLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please log in first");

      const itineraryId = trip.itineraryId || trip._id;
      
      if (!itineraryId) {
        setError("This trip doesn't have itinerary data.");
        setLoading(false);
        return;
      }

      // Try multiple endpoints for itinerary data
      const endpoints = [
        `/itineraries/${itineraryId}`,
        `/budget/${itineraryId}`,
        `/trips/${trip._id}`  // Try the trip itself
      ];

      let itineraryData = null;
      let successfulEndpoint = "";

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            itineraryData = await response.json();
            successfulEndpoint = endpoint;
            console.log(`✅ Got data from ${endpoint}`);
            break;
          }
        } catch (err) {
          console.log(`Endpoint ${endpoint} failed:`, err.message);
        }
      }

      if (!itineraryData) {
        // If no detailed itinerary, use basic trip data
        itineraryData = {
          title: trip.title,
          startDate: trip.startDate,
          endDate: trip.endDate,
          budget: trip.budget,
          destinations: trip.destinations,
          days: [] // Empty days array
        };
        console.log("⚠️ Using basic trip data (no detailed itinerary)");
      }

      setSelectedItinerary(itineraryData);
      setOpenDayIndex(0);
      
      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (err) {
      console.error("❌ Failed to load details:", err);
      setError(err.message || "Failed to load trip details");
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const finances = useMemo(() => {
    if (!selectedItinerary) return null;
    
    const totalBudget = parseAmount(selectedItinerary.budget || 0);
    let used = 0;

    // Calculate from transport
    if (selectedItinerary.transport?.price) {
      used += parseAmount(selectedItinerary.transport.price);
    }

    // Calculate from stays
    if (Array.isArray(selectedItinerary.stays)) {
      selectedItinerary.stays.forEach((s) => {
        used += parseAmount(s.price);
      });
    }

    // Calculate from days activities
    if (Array.isArray(selectedItinerary.days)) {
      selectedItinerary.days.forEach((d) => {
        if (Array.isArray(d.activities)) {
          d.activities.forEach((a) => {
            used += parseAmount(a.price || a.cost || 0);
          });
        }
      });
    }

    const balance = totalBudget - used;
    const usedPct = totalBudget > 0 ? (used / totalBudget) * 100 : 0;
    
    return { totalBudget, used, balance, usedPct };
  }, [selectedItinerary]);

  /* ---------------------- Render UI ---------------------- */
  
  if (listLoading) {
    return (
      <div className="budget-container">
        <div className="loading-spinner">Loading trips...</div>
      </div>
    );
  }

  // Show trip list if no itinerary selected
  if (!selectedItinerary) {
    return (
      <div className="budget-container">
        <header className="budget-header">
          <h1><PieChart /> My Budgets</h1>
          <p>Select a trip to view the financial breakdown.</p>
          
          {debugInfo && (
            <div className="debug-info">
              <small>{debugInfo}</small>
            </div>
          )}
          
          <button 
            className="refresh-btn"
            onClick={loadTrips}
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </header>

        {error && (
          <div className="error-alert">
            {error}
          </div>
        )}

        {tripList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Wallet size={48} color="#4f46e5" />
            </div>
            <h3>No Trips Found</h3>
            <p>Create a trip first from the homepage.</p>
            
            <div className="debug-section">
              <h4>Troubleshooting:</h4>
              <ul>
                <li>Token: {localStorage.getItem("token") ? "✅ Present" : "❌ Missing"}</li>
                <li>API Base: {API_BASE_URL}</li>
                <li>Make sure you're logged in</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="trips-grid">
            {tripList.map((trip) => (
              <div 
                key={trip._id} 
                className="trip-card"
                onClick={() => fetchItineraryDetails(trip)}
              >
                <div className="trip-card-header">
                  <div className="trip-icon">
                    <MapPin color="#4f46e5" />
                  </div>
                  <div className="trip-info">
                    <h3>{trip.title}</h3>
                    <p>{trip.destinations.join(", ")}</p>
                  </div>
                  <span className="trip-status">Active</span>
                </div>

                <div className="trip-details">
                  <div className="trip-detail">
                    <Calendar size={14} />
                    <span>{trip.startDate?.slice(0, 10) || "TBD"}</span>
                  </div>
                  <div className="trip-detail">
                    <Wallet size={14} />
                    <span>{formatCurrency(trip.budget)}</span>
                  </div>
                </div>

                <div className="trip-footer">
                  <span>View Budget Analysis</span>
                  <ArrowLeft style={{ transform: "rotate(180deg)" }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Show detailed itinerary view
  return (
    <div className="budget-detail-container">
      {/* Header */}
      <div className="detail-header">
        <button 
          className="back-btn"
          onClick={() => setSelectedItinerary(null)}
        >
          <ArrowLeft /> Back
        </button>
        <h2>{selectedItinerary.title || "Trip Budget"}</h2>
      </div>

      {/* Info Cards */}
      <div className="info-cards">
        <div className="info-card">
          <div className="info-icon">
            <MapPin color="#4338ca" />
          </div>
          <div>
            <div className="info-label">Destination</div>
            <div className="info-value">
              {selectedItinerary.destinations?.[0] || "Unknown"}
            </div>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon">
            <Calendar color="#059669" />
          </div>
          <div>
            <div className="info-label">Duration</div>
            <div className="info-value">
              {calculateDurationText(selectedItinerary.startDate, selectedItinerary.endDate)}
            </div>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon">
            <Clock color="#ea580c" />
          </div>
          <div>
            <div className="info-label">Travel Dates</div>
            <div className="info-value">
              {new Date(selectedItinerary.startDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })} - {new Date(selectedItinerary.endDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </div>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon">
            <Wallet color="#7c3aed" />
          </div>
          <div>
            <div className="info-label">Budget</div>
            <div className="info-value">{formatCurrency(finances?.totalBudget)}</div>
          </div>
        </div>
      </div>

      {/* Budget Timeline */}
      <div className="budget-timeline">
        <div className="budget-summary">
          <div>
            <div className="budget-label">Balance Budget</div>
            <div className="budget-amount balance">
              {formatCurrency(finances?.balance)}
            </div>
          </div>
          <div>
            <div className="budget-label">Used Budget</div>
            <div className="budget-amount used">
              {formatCurrency(finances?.used)}
            </div>
          </div>
        </div>

        <div className="progress-bar">
          <div 
            className="progress-balance"
            style={{ width: `${Math.max(0, Math.min(100, finances ? (100 - finances.usedPct) : 100))}%` }}
          >
            {formatCurrency(finances?.balance)}
          </div>
          <div 
            className="progress-used"
            style={{ width: `${Math.max(0, Math.min(100, finances ? finances.usedPct : 0))}%` }}
          >
            {formatCurrency(finances?.used)}
          </div>
        </div>
      </div>

      {/* Daily Breakdown */}
      <div className="daily-breakdown">
        <h3>Daily Budget Breakdown</h3>

        <div className="days-list">
          {Array.isArray(selectedItinerary.days) && selectedItinerary.days.length > 0 ? (
            selectedItinerary.days.map((day, idx) => {
              const dayTotal = Array.isArray(day.activities) 
                ? day.activities.reduce((sum, a) => sum + parseAmount(a.price || a.cost || 0), 0)
                : 0;
              
              return (
                <div key={idx} className="day-card">
                  <button 
                    className="day-header"
                    onClick={() => setOpenDayIndex(openDayIndex === idx ? null : idx)}
                  >
                    <div className="day-info">
                      <div className="day-title">
                        Day {day.day} — {day.title || ""}
                      </div>
                      <div className="day-date">
                        {new Date(day.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="day-total">
                      <div className="day-amount">{formatCurrency(dayTotal)}</div>
                      <div className="day-toggle">
                        {openDayIndex === idx ? "Collapse" : "Expand"}
                      </div>
                    </div>
                  </button>

                  {openDayIndex === idx && (
                    <div className="day-activities">
                      {Array.isArray(day.activities) && day.activities.length > 0 ? (
                        day.activities.map((act, i) => (
                          <div key={i} className="activity-card">
                            <div className="activity-info">
                              <div className="activity-icon">
                                <CreditCard color="#0ea5a4" />
                              </div>
                              <div>
                                <div className="activity-name">
                                  {act.name || act.placeName || "Activity"}
                                </div>
                                {act.detail && (
                                  <div className="activity-detail">{act.detail}</div>
                                )}
                              </div>
                            </div>
                            <div className="activity-cost">
                              <div className="activity-price">
                                {formatCurrency(parseAmount(act.price || act.cost || 0))}
                              </div>
                              {act.time && (
                                <div className="activity-time">{act.time}</div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-activities">
                          No paid activities scheduled for this day.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="no-days">
              No day-wise data available for this itinerary.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Budget;