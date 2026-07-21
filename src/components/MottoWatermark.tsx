export function MottoWatermark() {
  // Trailing space keeps a single "." between repeats (no "..")
  const latin = ". Omnes Unum in Domino ".repeat(8);
  const english = ". All Are One In The Lord ".repeat(8);

  // Alternate Latin / English rows to fill the screen top → bottom
  const rows = Array.from({ length: 14 }, (_, i) =>
    i % 2 === 0 ? { text: latin, key: `latin-${i}` } : { text: english, key: `english-${i}` }
  );

  return (
    <div className="motto-watermark" aria-hidden="true">
      <div className="motto-watermark__stack">
        {rows.map((row) => (
          <div key={row.key} className="motto-watermark__track motto-watermark__track--left">
            <span className="motto-watermark__text">{row.text}</span>
            <span className="motto-watermark__text">{row.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
