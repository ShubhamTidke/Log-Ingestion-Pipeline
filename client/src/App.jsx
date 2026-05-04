import "./App.css";

export default function App() {
  return (
    <div className="container">
      <div className="card">
        <div className="icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4 6h16M4 10h16M4 14h10M4 18h7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h1>Log Ingestion Service</h1>
        <p className="subtitle">This is a Log ingestion service.</p>
        <div className="badges">
          <span className="badge">Redis Streams</span>
          <span className="badge">Elasticsearch</span>
          <span className="badge">Node.js</span>
        </div>
        <div className="endpoints">
          <h2>API Endpoints</h2>
          <ul>
            <li>
              <span className="method post">POST</span>
              <code>/logs</code>
              <span className="desc">Ingest a log entry</span>
            </li>
            <li>
              <span className="method get">GET</span>
              <code>/logs</code>
              <span className="desc">Search logs</span>
            </li>
            <li>
              <span className="method get">GET</span>
              <code>/health</code>
              <span className="desc">Service health check</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
