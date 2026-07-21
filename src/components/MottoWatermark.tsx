export function MottoWatermark() {
  // Trailing space keeps a single "." between repeats (no "..")
  const unit = ". Omnes Unum in Domino ";
  const line = unit.repeat(8);

  return (
    <div className="motto-watermark" aria-hidden="true">
      <div className="motto-watermark__track">
        <span className="motto-watermark__text">{line}</span>
        <span className="motto-watermark__text">{line}</span>
      </div>
    </div>
  );
}
