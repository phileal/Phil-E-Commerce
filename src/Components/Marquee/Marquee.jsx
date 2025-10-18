import { useState, useEffect } from "react";

export default function Marquee() {
  const [text, setText] = useState("");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#000000");

  useEffect(() => {
    const savedMarquee = localStorage.getItem("marquee");
    if (savedMarquee) {
      const { text, bgColor, textColor } = JSON.parse(savedMarquee);
      setText(text || "");
      setBgColor(bgColor || "#ffffff");
      setTextColor(textColor || "#000000");
    }
  }, []);

  if (!text) return null;

  return (
    <div>
      <div
        className="w-full overflow-hidden whitespace-nowrap py-4"
        style={{ backgroundColor: bgColor }}
      >
        <div
          className="inline-block animate-marquee"
          style={{
            paddingLeft: "100%",
            fontFamily: "'Roboto Slab', serif",
            fontWeight: 700,
            fontSize: "2rem",
            color: textColor,
          }}
        >
          {text}
        </div>
      </div>

      {/* Footer */}
      <div className="w-full text-center py-2 text-xs text-gray-400 bg-gray-800">
        ©2025 Philemon E-Commerce. All Rights Reserved.
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          white-space: nowrap;
          animation: marquee 15s linear infinite;
        }
      `}</style>
    </div>
  );
}
