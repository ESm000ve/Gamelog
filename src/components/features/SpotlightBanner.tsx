import { useState, useEffect } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getSpotlight, type SpotlightData } from "../services/spotlight";
import "./SpotlightBanner.css";

export function SpotlightBanner() {
  const [spotlight, setSpotlight] = useState<SpotlightData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getSpotlight().then(setSpotlight);
  }, []);

  if (!spotlight) return null;

  return (
    <div className="spotlight-banner" onClick={() => navigate(`/game/${spotlight.game.igdbId}`)}>
      <div className="spotlight-banner-cover">
        {spotlight.game.coverUrl && (
          <img src={spotlight.game.coverUrl} alt={spotlight.game.title} />
        )}
      </div>

      <div className="spotlight-banner-body">
        <div className="spotlight-banner-label">
          <Sparkles size={14} color="var(--apple-yellow)" />
          <span>Game of the Week</span>
        </div>
        <h2 className="spotlight-banner-title">{spotlight.game.title}</h2>
        <p className="spotlight-banner-reason">{spotlight.reason}</p>
      </div>

      <div className="spotlight-banner-arrow">
        <ArrowRight size={16} />
      </div>
    </div>
  );
}
