"use client";

export default function GradientBlobs() {
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Primary indigo blob — top left */}
      <div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-25 animate-blob"
        style={{
          background:
            "radial-gradient(circle, #6366f1 0%, transparent 70%)",
          filter: "blur(60px)",
          animationDelay: "0s",
        }}
      />
      {/* Violet blob — top right */}
      <div
        className="absolute -top-20 -right-40 w-[500px] h-[500px] rounded-full opacity-20 animate-blob"
        style={{
          background:
            "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
          filter: "blur(80px)",
          animationDelay: "3.5s",
        }}
      />
      {/* Subtle indigo blob — bottom center */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-15 animate-blob"
        style={{
          background:
            "radial-gradient(ellipse, #4f46e5 0%, transparent 60%)",
          filter: "blur(100px)",
          animationDelay: "7s",
        }}
      />
    </div>
  );
}
