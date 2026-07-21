export function MottoWatermark() {
  const motto = ". Omnes Unum in Domino .";
  const line = Array.from({ length: 6 }, () => motto).join("   ");

  return (
    <div className="motto-watermark" aria-hidden="true">
      <div className="motto-watermark__track">
        <span className="motto-watermark__text">{line}</span>
        <span className="motto-watermark__text">{line}</span>
      </div>
    </div>
  );
}
