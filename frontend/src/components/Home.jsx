// import React, { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import "./Home.css";

// const Home = () => {
//   const location = useLocation();
//   const { tripDetails, preferences } = location.state || {};

//   // 🧩 Load from localStorage if present
//   const [trip, setTrip] = useState(() => {
//     const savedTrip = localStorage.getItem("trip");
//     return savedTrip ? JSON.parse(savedTrip) : null;
//   });
//   const [activeDay, setActiveDay] = useState(() => {
//     const savedDay = localStorage.getItem("activeDay");
//     return savedDay ? Number(savedDay) : -1;
//   });
//   const [loading, setLoading] = useState(true);
//   const [spentItems, setSpentItems] = useState(() => {
//     const savedSpent = localStorage.getItem("spentItems");
//     return savedSpent ? JSON.parse(savedSpent) : {};
//   });

//   // --- Utility Functions ---
//   const getTransportIcon = (type) => {
//     switch (type) {
//       case "Train":
//         return "🚂 Train";
//       case "Bus":
//         return "🚌 Bus";
//       case "Flight":
//         return "✈ Flights";
//       default:
//         return "🚗 Transport";
//     }
//   };

//   const handleItemToggle = (itemId, price) => {
//     setSpentItems((prev) => {
//       const newItems = { ...prev };
//       const numericPrice = parseFloat(String(price).replace(/[^0-9.]/g, "")) || 0;
//       if (newItems[itemId]) {
//         delete newItems[itemId]; // Uncheck
//       } else {
//         newItems[itemId] = numericPrice; // Check
//       }
//       return newItems;
//     });
//   };

//   const calculateTotalSpent = () =>
//     Object.values(spentItems).reduce((sum, price) => sum + price, 0);

//   const ChecklistItem = ({ id, text, price }) => {
//     const isChecked = !!spentItems[id];
//     const numericPrice = parseFloat(String(price).replace(/[^0-9.]/g, "")) || 0;
//     const displayPrice = String(price).includes("k")
//       ? price
//       : `₹${numericPrice.toLocaleString()}`;

//     return (
//       <li className={isChecked ? "checked" : ""}>
//         <label>
//           <input
//             type="checkbox"
//             checked={isChecked}
//             onChange={() => handleItemToggle(id, price)}
//           />
//           <span className="item-text">{text}</span>
//           <span className="item-price">{displayPrice}</span>
//         </label>
//       </li>
//     );
//   };

//   // 🧩 Persist state changes
//   useEffect(() => {
//     if (trip) localStorage.setItem("trip", JSON.stringify(trip));
//   }, [trip]);

//   useEffect(() => {
//     localStorage.setItem("activeDay", activeDay);
//   }, [activeDay]);

//   useEffect(() => {
//     localStorage.setItem("spentItems", JSON.stringify(spentItems));
//   }, [spentItems]);

//   // --- Fetch Itinerary (live API) ---
//   useEffect(() => {
//     const fetchItinerary = async () => {
//       if (!tripDetails && !trip) {
//         setLoading(false);
//         console.error("Missing trip details or preferences.");
//         return;
//       }

//       // 🧩 Only fetch if no saved trip
//       if (trip) {
//         setLoading(false);
//         return;
//       }

//       try {
//         const response = await fetch("http://localhost:5000/api/generate-itinerary", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             destinations: tripDetails.destinations,
//             startDate: tripDetails.startDate,
//             endDate: tripDetails.endDate,
//             budget: tripDetails.budget,
//             preferences: preferences,
//           }),
//         });

//         if (!response.ok) {
//           const errorText = await response.text();
//           console.error(`HTTP error! status: ${response.status}`, errorText);
//           throw new Error(`Failed to generate itinerary. Status: ${response.status}`);
//         }

//         const data = await response.json();
//         setTrip(data);
//         localStorage.setItem("trip", JSON.stringify(data)); // 🧩 Save fetched trip
//       } catch (error) {
//         console.error("Error fetching itinerary:", error);
//         setTrip(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchItinerary();
//   }, [tripDetails, preferences]);

//   if (loading) {
//     return <div className="loading">✨ Generating your AI itinerary...</div>;
//   }

//   if (!trip) {
//     return (
//       <div className="error">
//         ❌ Failed to generate itinerary. Please ensure your backend server is running and try refreshing.
//       </div>
//     );
//   }

//   const itineraryDays = [
//     { day: "Pre-Trip", date: trip.startDate, title: "Setup & Essential Booking" },
//     ...(trip.days || []),
//   ];

//   const renderItineraryContent = () => {
//     const totalSpent = calculateTotalSpent();
//     const formattedTotalSpent = totalSpent.toLocaleString();

//     if (activeDay === -1) {
//       const transportType = trip.transport?.type || "Transport";
//       const transportDetails = trip.transport?.detail || "No travel details found.";
//       const transportPrice = trip.transport?.price || "0";

//       return (
//         <div className="itinerary-sections">
//           <div className="budget-summary-floating">
//             Current Spent: 💰 ₹{formattedTotalSpent}
//           </div>

//           <section className="itinerary-section">
//             <h2>{getTransportIcon(transportType)}</h2>
//             <ul className="list checklist-list">
//               <ChecklistItem
//                 key="transport-booking"
//                 id="transport-booking"
//                 text={transportDetails}
//                 price={transportPrice}
//               />
//             </ul>
//           </section>

//           <section className="itinerary-section">
//             <h2>🏨 Stays</h2>
//             <ul className="list checklist-list">
//               {trip.stays &&
//                 trip.stays.map((item, index) => (
//                   <ChecklistItem
//                     key={`stay-${index}`}
//                     id={`stay-${index}`}
//                     text={item.detail}
//                     price={item.price}
//                   />
//                 ))}
//             </ul>
//           </section>

//           <section className="itinerary-section">
//             <h2>📦 Packing List</h2>
//             <ol className="list">
//               {trip.packingList &&
//                 trip.packingList.map((item, index) => (
//                   <li key={index}>{item}</li>
//                 ))}
//             </ol>
//           </section>

//           <section className="itinerary-section highlight">
//             <h2>📱 Essential Apps</h2>
//             <ul className="list">
//               {trip.apps &&
//                 trip.apps.map((item, index) => <li key={index}>{item}</li>)}
//             </ul>
//           </section>
//         </div>
//       );
//     }

//     const currentDay = trip.days[activeDay];
//     if (currentDay) {
//       return (
//         <div className="daily-itinerary-detail">
//           <div className="budget-summary-floating">
//             Current Spent: 💰 ₹{formattedTotalSpent}
//           </div>

//           <h2>
//             📅 {currentDay.day} - {currentDay.title}
//           </h2>
//           <ul className="list activities-list checklist-list">
//             {currentDay.activities &&
//               currentDay.activities.map((activity, index) => (
//                 <ChecklistItem
//                   key={`${currentDay.day}-activity-${index}`}
//                   id={`${currentDay.day}-activity-${index}`}
//                   text={activity.name}
//                   price={activity.price}
//                 />
//               ))}
//           </ul>
//         </div>
//       );
//     }

//     return <div className="info">Select a day to view its itinerary.</div>;
//   };

//   return (
//     <div className="home-container">
//       <main className="main-content">
//         <div className="trip-header">
//           <h1>{trip.title}</h1>
//           <div className="trip-meta">
//             <span>
//               {trip.startDate} to {trip.endDate}
//             </span>
//             <span className="budget">Total Budget {trip.budget}</span>
//           </div>
//         </div>

//         <div className="days-section">
//           <div className="days-header">
//             {itineraryDays.map((dayItem, index) => (
//               <div
//                 key={index}
//                 className={`day ${index - 1 === activeDay ? "active" : ""}`}
//                 onClick={() => setActiveDay(index - 1)}
//               >
//                 <span className="day-label">{dayItem.day}</span>
//                 <span className="day-date">{dayItem.date}</span>
//                 {dayItem.title && (
//                   <span className="day-title">{dayItem.title}</span>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         {renderItineraryContent()}
//       </main>
//     </div>
//   );
// };

// // export default Home;
// import React, { useState, useEffect } from "react";
// import { useLocation, useParams, useNavigate } from "react-router-dom";
// import "./Home.css";

// const Home = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { id } = useParams(); // ✅ For viewing saved trips
//   const { tripDetails, preferences } = location.state || {};

//   const [trip, setTrip] = useState(() => {
//     const savedTrip = localStorage.getItem("trip");
//     return savedTrip ? JSON.parse(savedTrip) : null;
//   });
//   const [activeDay, setActiveDay] = useState(() => {
//     const savedDay = localStorage.getItem("activeDay");
//     return savedDay ? Number(savedDay) : -1;
//   });
//   const [loading, setLoading] = useState(true);
//   const [spentItems, setSpentItems] = useState(() => {
//     const savedSpent = localStorage.getItem("spentItems");
//     return savedSpent ? JSON.parse(savedSpent) : {};
//   });

//   // --- Utility Functions ---
//   const getTransportIcon = (type) => {
//     switch (type) {
//       case "Train":
//         return "🚂 Train";
//       case "Bus":
//         return "🚌 Bus";
//       case "Flight":
//         return "✈ Flights";
//       default:
//         return "🚗 Transport";
//     }
//   };

//   const handleItemToggle = (itemId, price) => {
//     setSpentItems((prev) => {
//       const newItems = { ...prev };
//       const numericPrice = parseFloat(String(price).replace(/[^0-9.]/g, "")) || 0;
//       if (newItems[itemId]) {
//         delete newItems[itemId];
//       } else {
//         newItems[itemId] = numericPrice;
//       }
//       return newItems;
//     });
//   };

//   const calculateTotalSpent = () =>
//     Object.values(spentItems).reduce((sum, price) => sum + price, 0);

//   const ChecklistItem = ({ id, text, price }) => {
//     const isChecked = !!spentItems[id];
//     const numericPrice = parseFloat(String(price).replace(/[^0-9.]/g, "")) || 0;
//     const displayPrice = String(price).includes("k")
//       ? price
//       : `₹${numericPrice.toLocaleString()}`;

//     return (
//       <li className={isChecked ? "checked" : ""}>
//         <label>
//           <input
//             type="checkbox"
//             checked={isChecked}
//             onChange={() => handleItemToggle(id, price)}
//           />
//           <span className="item-text">{text}</span>
//           <span className="item-price">{displayPrice}</span>
//         </label>
//       </li>
//     );
//   };

//   // --- Fetch Saved Trip ---
//   useEffect(() => {
//     const fetchSavedItinerary = async () => {
//       if (!id) return;
//       try {
//         const response = await fetch(`http://localhost:5000/api/itineraries/${id}`);
//         const data = await response.json();
//         setTrip(data);
//       } catch (error) {
//         console.error("Error fetching saved itinerary:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     if (id) fetchSavedItinerary();
//   }, [id]);

//   // --- Generate New Trip (if no saved one) ---
//   useEffect(() => {
//     if (id) return; // ✅ Skip regeneration when viewing saved trip
//     const fetchItinerary = async () => {
//       if (!tripDetails && !trip) {
//         setLoading(false);
//         console.error("Missing trip details or preferences.");
//         return;
//       }
//       if (trip) {
//         setLoading(false);
//         return;
//       }
//       try {
//         const response = await fetch("http://localhost:5000/api/generate-itinerary", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             destinations: tripDetails.destinations,
//             startDate: tripDetails.startDate,
//             endDate: tripDetails.endDate,
//             budget: tripDetails.budget,
//             preferences: preferences,
//           }),
//         });
//         const data = await response.json();
//         setTrip(data);
//         localStorage.setItem("trip", JSON.stringify(data));
//       } catch (error) {
//         console.error("Error fetching itinerary:", error);
//         setTrip(null);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchItinerary();
//   }, [tripDetails, preferences]);

//   if (loading)
//     return <div className="loading">✨ Generating your AI itinerary...</div>;

//   if (!trip)
//     return (
//       <div className="error">
//         ❌ Failed to load itinerary. Please ensure your backend server is running.
//       </div>
//     );

//   const itineraryDays = [
//     { day: "Pre-Trip", date: trip.startDate, title: "Setup & Essential Booking" },
//     ...(trip.days || []),
//   ];

//   const renderItineraryContent = () => {
//     const totalSpent = calculateTotalSpent();
//     const formattedTotalSpent = totalSpent.toLocaleString();

//     if (activeDay === -1) {
//       const transportType = trip.transport?.type || "Transport";
//       const transportDetails = trip.transport?.detail || "No travel details found.";
//       const transportPrice = trip.transport?.price || "0";

//       return (
//         <div className="itinerary-sections">
//           <div className="budget-summary-floating">
//             Current Spent: 💰 ₹{formattedTotalSpent}
//           </div>

//           <section className="itinerary-section">
//             <h2>{getTransportIcon(transportType)}</h2>
//             <ul className="list checklist-list">
//               <ChecklistItem
//                 key="transport-booking"
//                 id="transport-booking"
//                 text={transportDetails}
//                 price={transportPrice}
//               />
//             </ul>
//           </section>

//           <section className="itinerary-section">
//             <h2>🏨 Stays</h2>
//             <ul className="list checklist-list">
//               {trip.stays &&
//                 trip.stays.map((item, index) => (
//                   <ChecklistItem
//                     key={`stay-${index}`}
//                     id={`stay-${index}`}
//                     text={item.detail}
//                     price={item.price}
//                   />
//                 ))}
//             </ul>
//           </section>

//           <section className="itinerary-section">
//             <h2>📦 Packing List</h2>
//             <ol className="list">
//               {trip.packingList &&
//                 trip.packingList.map((item, index) => (
//                   <li key={index}>{item}</li>
//                 ))}
//             </ol>
//           </section>

//           <section className="itinerary-section highlight">
//             <h2>📱 Essential Apps</h2>
//             <ul className="list">
//               {trip.apps &&
//                 trip.apps.map((item, index) => <li key={index}>{item}</li>)}
//             </ul>
//           </section>
//         </div>
//       );
//     }

//     const currentDay = trip.days[activeDay];
//     if (currentDay) {
//       return (
//         <div className="daily-itinerary-detail">
//           <div className="budget-summary-floating">
//             Current Spent: 💰 ₹{formattedTotalSpent}
//           </div>

//           <h2>
//             📅 {currentDay.day} - {currentDay.title}
//           </h2>
//           <ul className="list activities-list checklist-list">
//             {currentDay.activities &&
//               currentDay.activities.map((activity, index) => (
//                 <ChecklistItem
//                   key={`${currentDay.day}-activity-${index}`}
//                   id={`${currentDay.day}-activity-${index}`}
//                   text={activity.name}
//                   price={activity.price}
//                 />
//               ))}
//           </ul>
//         </div>
//       );
//     }

//     return <div className="info">Select a day to view its itinerary.</div>;
//   };

//   return (
//     <div className="home-container">
//       <main className="main-content">
//         <button className="back-btn" onClick={() => navigate("/MyTrip")}>
//           ← Back to My Trips
//         </button>

//         <div className="trip-header">
//           <h1>{trip.title}</h1>
//           <div className="trip-meta">
//             <span>{trip.startDate} to {trip.endDate}</span>
//             <span className="budget">Total Budget {trip.budget}</span>
//           </div>
//         </div>

//         <div className="days-section">
//           <div className="days-header">
//             {itineraryDays.map((dayItem, index) => (
//               <div
//                 key={index}
//                 className={`day ${index - 1 === activeDay ? "active" : ""}`}
//                 onClick={() => setActiveDay(index - 1)}
//               >
//                 <span className="day-label">{dayItem.day}</span>
//                 <span className="day-date">{dayItem.date}</span>
//                 {dayItem.title && (
//                   <span className="day-title">{dayItem.title}</span>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         {renderItineraryContent()}
//       </main>
//     </div>
//   );
// };

// export default Home;


import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams(); // if viewing saved itinerary
  const { tripDetails, preferences } = location.state || {};

  const [trip, setTrip] = useState(null);
  const [activeDay, setActiveDay] = useState(0);
  const [loading, setLoading] = useState(true);

  const [spentItems, setSpentItems] = useState(() => {
    const saved = localStorage.getItem("spentItems");
    return saved ? JSON.parse(saved) : {};
  });
  // Check if trip is completed (all days have passed)
  const checkTripCompletion = () => {
    if (!trip || !trip.endDate) return false;
    
    const today = new Date();
    const endDate = new Date(trip.endDate);
    
    // Reset to start of day for comparison
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    return today > endDate;
  };

  // --- Checklist ---
  const handleItemToggle = (id, price) => {
    setSpentItems((prev) => {
      const updated = { ...prev };
      const num = parseFloat(String(price).replace(/[^0-9.]/g, "")) || 0;

      if (updated[id]) delete updated[id];
      else updated[id] = num;

      return updated;
    });
  };

  const calculateTotalSpent = () =>
    Object.values(spentItems).reduce((a, b) => a + b, 0);

  // ========================
  // ⭐ 1. VIEWING SAVED TRIP
  // ========================
  useEffect(() => {
    if (!id) return;

    const fetchSaved = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/itineraries/${id}`);
        const data = await res.json();
        setTrip(data);
        setSpentItems({});
        localStorage.removeItem("spentItems");
      } catch (err) {
        console.error("Failed to load saved itinerary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, [id]);

  // ========================================
  // ⭐ 2. GENERATING A NEW ITINERARY (Home)
  // ========================================
  useEffect(() => {
    if (id) return; // skip if viewing saved itinerary

    if (!tripDetails) {
      setLoading(false);
      return;
    }

    const generate = async () => {
      try {
        // 🔥 Reset spent items when generating a NEW itinerary
        localStorage.setItem("spentItems", JSON.stringify({}));
        setSpentItems({});
        const response = await fetch("http://localhost:5000/api/generate-itinerary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tripId: tripDetails._id,
            destinations: tripDetails.destinations,
            startDate: tripDetails.startDate,
            endDate: tripDetails.endDate,
            budget: tripDetails.budget,
            preferences,
          }),
        });

        const data = await response.json();
        setTrip(data);
      } catch (err) {
        console.error("Generation error:", err);
        setTrip(null);
      } finally {
        setLoading(false);
      }
    };

    generate();
  }, [tripDetails, preferences]);

  // ====================================================
  // ⭐ 3. LOAD LAST ITINERARY IF HOME IS EMPTY
  // ====================================================
  useEffect(() => {
    if (id || tripDetails) return;

    const loadLast = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/itineraries");
        const list = await res.json();
        if (list.length > 0) {
          setTrip(list[0]); // newest itinerary
        }
      } catch (err) {
        console.error("Failed loading last itinerary:", err);
      } finally {
        setLoading(false);
      }
    };

    loadLast();
  }, [id, tripDetails]);

  // 🧩 Persist checklist
  useEffect(() => {
    localStorage.setItem("spentItems", JSON.stringify(spentItems));
  }, [spentItems]);

  // ================================
  // ⭐ FUN LOADING ANIMATION
  // ================================
  if (loading) {
  return (
    <div className="fun-loading-wrapper">
      <div className="sparkle-bg"></div>

      <div className="fun-loading">
        <div className="circle-loader">
          <div className="circle-bar"></div>
        </div>
        <p>✨ Generating your perfect itinerary...</p>
      </div>
    </div>
  );
}
    // ... your existing code above ...

if (!trip) return <div className="error">❌ Could not load itinerary.</div>;

const itineraryDays = [
  { day: "Pre-Trip", date: trip.startDate, title: "Setup & Essential Booking" },
  ...(trip.days || []),
];

// ✅ ADD THIS LINE: Calculate isLastDay
const isLastDay = activeDay === itineraryDays.length - 1;

const renderItineraryContent = () => {
  const total = calculateTotalSpent();
  const formatted = total.toLocaleString();

  const ChecklistItem = ({ id, text, price }) => {
    const numeric = parseFloat(String(price).replace(/[^0-9.]/g, "")) || 0;
    return (
      <li className={spentItems[id] ? "checked" : ""}>
        <label>
          <input
            type="checkbox"
            checked={!!spentItems[id]}
            onChange={() => handleItemToggle(id, price)}
          />
          <span className="item-text">{text}</span>
          <span className="item-price">₹{numeric.toLocaleString()}</span>
        </label>
      </li>
    );
  };

  // --- Pre-trip page ---
  if (activeDay === 0) {
    return (
      <div className="itinerary-sections">
        <div className="budget-summary-floating">
          Current Spent: ₹{formatted}
        </div>

        <section className="itinerary-section">
          <h2>🚗 Transport</h2>
          <ul className="list checklist-list">
            <ChecklistItem
              id="transport"
              text={trip.transport?.detail}
              price={trip.transport?.price}
            />
          </ul>
        </section>

        <section className="itinerary-section">
          <h2>🏨 Stays</h2>
          <ul className="list checklist-list">
            {trip.stays?.map((s, i) => (
              <ChecklistItem id={`stay-${i}`} key={i} text={s.detail} price={s.price} />
            ))}
          </ul>
        </section>

        <section className="itinerary-section">
          <h2>📦 Packing List</h2>
          <ol className="list">
            {trip.packingList?.map((p, i) => <li key={i}>{p}</li>)}
          </ol>
        </section>
      </div>
    );
  }

  // --- Daily activity page ---
  const day = trip.days[activeDay - 1];

  return (
    <div className="daily-itinerary-detail">
      <div className="budget-summary-floating">
        Current Spent: ₹{formatted}
      </div>

      <h2>
        📅 {day.day} - {day.title}
      </h2>

      <ul className="list checklist-list">
        {day.activities?.map((act, i) => (
          <ChecklistItem
            id={`${day.day}-${i}`}
            key={i}
            text={act.name}
            price={act.price}
          />
        ))}
      </ul>
      
      {/* ✅ Show "Complete Your Trip" button only on the last day */}
      {isLastDay && (
        <div className="complete-trip-button-container">
          <button 
            className="complete-trip-btn"
            onClick={() => navigate(`/tripcomplete/${trip._id}`)} 
          >
            ✅ Complete Your Trip
          </button>
        </div>
      )}
    </div>
  );
};

// ... rest of your code remains the same ...

  return (
    <div className="home-container">
      <main className="main-content">
        {id && (
          <button className="back-btn" onClick={() => navigate("/MyTrip")}>
            ← Back to My Trips
          </button>
        )}

        <div className="trip-header">
          <h1>{trip.title}</h1>
          <div className="trip-meta">
            <span>{trip.startDate} to {trip.endDate}</span>
            <span className="budget">Budget: ₹{trip.budget}</span>
          </div>
        </div>

        <div className="days-section">
          <div className="days-header">
            {itineraryDays.map((d, i) => (
              <div
                key={i}
                className={`day ${i === activeDay ? "active" : ""}`}
                onClick={() => setActiveDay(i)}
              >
                <span>{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {renderItineraryContent()}
  
      </main>
    </div>
  );
};

export default Home;
