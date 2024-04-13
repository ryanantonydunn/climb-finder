import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          position: "relative",
          width: "100%",
          height: "100%",
          background: "rgba(20,10,20)",
        }}
      >
        <div
          style={{
            width: "110%",
            height: "110%",
            top: "45%",
            left: "10%",
            position: "absolute",
            transform: "rotate(45deg)",
            backgroundColor: "rgb(130, 100, 130)",
          }}
        ></div>
        <div
          style={{
            width: "110%",
            height: "110%",
            top: "60%",
            left: "-25%",
            position: "absolute",
            transform: "rotate(45deg)",
            backgroundColor: "rgb(170, 130, 170)",
          }}
        ></div>
      </div>
    ),
    {
      ...size,
    }
  );
}
