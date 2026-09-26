const PARTICLE_COUNT = 150;

const palette = [
  "blue",
  "blue",
  "blue",
  "purple",
  "purple",
  "red",
  "yellow",
];

function ParticleField() {
  const particles = Array.from(
    { length: PARTICLE_COUNT },
    (_, index) => {
      const angle =
        (index / PARTICLE_COUNT) * Math.PI * 2;

      const ring =
        18 +
        ((index * 37) % 82);

      const x =
        Math.cos(angle) * ring;

      const y =
        Math.sin(angle) *
        ring *
        0.72;

      const size =
        2 +
        ((index * 17) % 4);

      const delay =
        -((index * 83) % 8000);

      const duration =
        6500 +
        ((index * 31) % 5000);

      return {
        id: index,
        x,
        y,
        size,
        delay,
        duration,
        color:
          palette[
            index % palette.length
          ],
      };
    }
  );

  return (
    <div className="particle-field" aria-hidden="true">
      <div className="particle-glow" />

      {particles.map((particle) => (
        <span
          key={particle.id}
          className={`particle particle-${particle.color}`}
          style={{
            "--x": `${particle.x}%`,
            "--y": `${particle.y}%`,
            "--size": `${particle.size}px`,
            "--delay": `${particle.delay}ms`,
            "--duration": `${particle.duration}ms`,
          }}
        />
      ))}
    </div>
  );
}

export default ParticleField;