export default function Hello({ name, onLogout }) {
  return (
    <main className="hello-page">
      <h1>Hello, {name}</h1>
      <button type="button" className="secondary" onClick={onLogout}>
        Log out
      </button>
    </main>
  );
}
