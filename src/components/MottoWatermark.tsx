export function MottoWatermark() {
  // Trailing space keeps a single "." between repeats (no "..")
  const latin = ". Omnes Unum in Domino ".repeat(8);
  const english = ". All Are One In The Lord ".repeat(8);

  return (
    <div className="motto-watermark" aria-hidden="true">
      <div className="motto-watermark__stack">
        <div className="motto-watermark__track motto-watermark__track--left">
          <span className="motto-watermark__text">{latin}</span>
          <span className="motto-watermark__text">{latin}</span>
        </div>
        <div className="motto-watermark__track motto-watermark__track--left">
          <span className="motto-watermark__text">{english}</span>
          <span className="motto-watermark__text">{english}</span>
        </div>
      </div>
    </div>
  );
}
