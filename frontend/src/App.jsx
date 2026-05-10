import { useState, useEffect } from "react";
import "./App.css";

const OPENWEATHER_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

const FEATURED_CITIES = [
  { name: "Toronto", country: "CA", emoji: "🍁" },
  { name: "Montreal", country: "CA", emoji: "⚜️" },
  { name: "Edmonton", country: "CA", emoji: "🌾" },
  { name: "Vancouver", country: "CA", emoji: "🌊" },
  { name: "New York", country: "US", emoji: "🗽" },
  { name: "London", country: "GB", emoji: "🎡" },
];

const WEATHER_BACKGROUNDS = {
  Clear: "bg-clear",
  Clouds: "bg-clouds",
  Rain: "bg-rain",
  Drizzle: "bg-rain",
  Snow: "bg-snow",
  Thunderstorm: "bg-storm",
  Mist: "bg-mist",
  Fog: "bg-mist",
  Haze: "bg-mist",
};

const WEATHER_ICONS = {
  "01d": "☀️", "01n": "🌙",
  "02d": "🌤", "02n": "🌤",
  "03d": "🌥", "03n": "🌥",
  "04d": "☁️", "04n": "☁️",
  "09d": "🌧", "09n": "🌧",
  "10d": "🌦", "10n": "🌦",
  "11d": "⛈", "11n": "⛈",
  "13d": "❄️", "13n": "❄️",
  "50d": "🌫", "50n": "🌫",
};

function CityCard({ city }) {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city.name},${city.country}&appid=${OPENWEATHER_KEY}&units=metric`
    )
      .then((r) => r.json())
      .then((d) => {
        if (d.cod !== 200) throw new Error();
        setWeather(d);
      })
      .catch(() => setError(true));
  }, [city.name]);

  const bgClass = weather
    ? WEATHER_BACKGROUNDS[weather.weather[0].main] || "bg-clouds"
    : "bg-loading";

  return (
    <div className={`city-card ${bgClass}`}>
      <div className="city-card-inner">
        <div className="city-top">
          <span className="city-emoji">{city.emoji}</span>
          <div>
            <div className="city-name">{city.name}</div>
            <div className="city-country">{city.country}</div>
          </div>
        </div>
        {error ? (
          <div className="city-error">Unavailable</div>
        ) : weather ? (
          <>
            <div className="city-temp">
              {Math.round(weather.main.temp)}
              <span className="city-unit">°C</span>
            </div>
            <div className="city-meta">
              <span className="city-icon">
                {WEATHER_ICONS[weather.weather[0].icon] || "🌡"}
              </span>
              <span className="city-desc">{weather.weather[0].description}</span>
            </div>
            <div className="city-details">
              <div className="city-detail">
                <span className="detail-label">Humidity</span>
                <span className="detail-val">{weather.main.humidity}%</span>
              </div>
              <div className="city-detail">
                <span className="detail-label">Wind</span>
                <span className="detail-val">{Math.round(weather.wind.speed)} m/s</span>
              </div>
              <div className="city-detail">
                <span className="detail-label">Feels</span>
                <span className="detail-val">{Math.round(weather.main.feels_like)}°C</span>
              </div>
            </div>
          </>
        ) : (
          <div className="city-loading">
            <div className="spinner" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [form, setForm] = useState({ email: "", city: "", time: "", days: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    if (!form.email || !form.city) {
      setError("Please fill in your email and city.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        "https://weather-notifier-fn-12345.azurewebsites.net/api/createsubscription",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Could not connect to server. Please try again.");
    }
    setLoading(false);
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="app">
      {/* Cursor glow */}
      <div
        className="cursor-glow"
        style={{ left: cursorPos.x, top: cursorPos.y }}
      />

      {/* Noise overlay */}
      <div className="noise" />

      {/* Nav */}
      <nav className="nav">
        <div className="nav-logo">
          <span className="nav-logo-icon">◈</span>
          KnowWeather
        </div>
        <div className="nav-time">
          <span className="nav-date">{dateStr}</span>
          <span className="nav-clock">{timeStr}</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-tag">Real-time · Global · Free</div>
        <h1 className="hero-title">
          Weather that<br />
          <em>finds you.</em>
        </h1>
        <p className="hero-sub">
          Subscribe once. Get beautifully formatted daily weather updates
          delivered straight to your inbox — every morning, for your city.
        </p>
        <div className="hero-scroll">
          <span>Scroll to explore</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* Live City Grid */}
      <section className="cities-section">
        <div className="section-label">Live · Updated now</div>
        <h2 className="section-title">Around the world</h2>
        <div className="cities-grid">
          {FEATURED_CITIES.map((city) => (
            <CityCard key={city.name} city={city} />
          ))}
        </div>
      </section>

      {/* Subscribe Form */}
      <section className="subscribe-section">
        <div className="subscribe-inner">
          <div className="subscribe-left">
            <div className="section-label">Daily Notifications</div>
            <h2 className="section-title">Stay in the know.</h2>
            <p className="subscribe-desc">
              Enter your city and we'll send you a daily weather briefing
              with temperature, humidity, wind speed and conditions —
              every morning before you step outside.
            </p>
            <div className="subscribe-features">
              <div className="feature">✦ Real-time OpenWeatherMap data</div>
              <div className="feature">✦ Beautiful HTML emails via SendGrid</div>
              <div className="feature">✦ Cancel anytime</div>
            </div>
          </div>

          <div className="subscribe-right">
            {submitted ? (
              <div className="success-card">
                <div className="success-icon">✓</div>
                <div className="success-title">You're subscribed!</div>
                <div className="success-sub">
                  Weather updates will arrive at <strong>{form.email}</strong> for{" "}
                  <strong>{form.city}</strong> starting tomorrow morning.
                </div>
                <button
                  className="btn-ghost"
                  onClick={() => { setSubmitted(false); setForm({ email: "", city: "", time: "", days: "" }); }}
                >
                  Add another city →
                </button>
              </div>
            ) : (
              <div className="form-card">
                <div className="form-row">
                  <label className="form-label">Email address</label>
                  <input
                    className="form-input"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-row">
                  <label className="form-label">Your city</label>
                  <input
                    className="form-input"
                    name="city"
                    type="text"
                    placeholder="Toronto, London, Tokyo..."
                    value={form.city}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-row-split">
                  <div className="form-row">
                    <label className="form-label">Preferred time</label>
                    <input
                      className="form-input"
                      name="time"
                      type="time"
                      value={form.time}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-row">
                    <label className="form-label">Days (e.g. 7)</label>
                    <input
                      className="form-input"
                      name="days"
                      type="number"
                      placeholder="7"
                      min="1"
                      max="365"
                      value={form.days}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                {error && <div className="form-error">{error}</div>}
                <button
                  className="btn-primary"
                  onClick={submit}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="btn-loading"><span className="spinner-sm" /> Subscribing…</span>
                  ) : (
                    "Get Daily Weather →"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Developer Note Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo">◈ KnowWeather</div>
          <div className="footer-divider" />
          <div className="dev-note">
            <div className="dev-note-label">Developer Note</div>
            <p className="dev-note-text">
              This project is a fully serverless weather notification system built as a personal learning project
              exploring cloud-native architecture and real-time data pipelines.
            </p>
            <div className="stack-grid">
              <div className="stack-item">
                <span className="stack-icon">⚛</span>
                <span className="stack-name">React + Vite</span>
                <span className="stack-desc">Frontend UI</span>
              </div>
              <div className="stack-item">
                <span className="stack-icon">⚡</span>
                <span className="stack-name">Azure Functions</span>
                <span className="stack-desc">Serverless backend (Node.js v4)</span>
              </div>
              <div className="stack-item">
                <span className="stack-icon">🗄</span>
                <span className="stack-name">Azure Table Storage</span>
                <span className="stack-desc">Subscriber persistence</span>
              </div>
              <div className="stack-item">
                <span className="stack-icon">🌤</span>
                <span className="stack-name">OpenWeatherMap API</span>
                <span className="stack-desc">Real-time weather data</span>
              </div>
              <div className="stack-item">
                <span className="stack-icon">✉</span>
                <span className="stack-name">SendGrid</span>
                <span className="stack-desc">Transactional email delivery</span>
              </div>
              <div className="stack-item">
                <span className="stack-icon">▲</span>
                <span className="stack-name">Vercel</span>
                <span className="stack-desc">Frontend hosting + CDN</span>
              </div>
            </div>
          </div>
          <div className="footer-divider" />
          <div className="footer-bottom">
            <span>Built with care · {new Date().getFullYear()}</span>
            <span>knowweather.vercel.app</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
