import { useState, useEffect } from "react";
import tips from "../tips.json";

export default function FooterMarquee() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % tips.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <footer style={footerStyle}>
      <div style={marqueeStyle}>{tips[index]}</div>
    </footer>
  );
}

const footerStyle = {
  position: "fixed",
  bottom: 0,
  width: "100%",
  background: "#2c3e50",
  color: "#fff",
  textAlign: "center",
  padding: "10px 0",
  fontSize: "1.2rem",
  fontWeight: "500",
  overflow: "hidden"
};

const marqueeStyle = {
  display: "inline-block",
  whiteSpace: "nowrap",
  opacity: 1,
  transition: "opacity 1s ease-in-out"
};
