// Shown immediately on tab change while the server queries run. Fades in after a short delay,
// so fast loads never flash a skeleton.
export default function Loading() {
  return (
    <div className="skeleton" aria-busy="true" aria-label="Loading">
      <div className="sk sk-title" />
      <div className="grid2">
        <div className="sk sk-panel" />
        <div className="sk sk-panel" />
      </div>
      <div className="sk sk-block" />
    </div>
  );
}
