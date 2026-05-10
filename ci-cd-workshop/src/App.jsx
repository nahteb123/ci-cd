import './App.css'

function App() {
  return (
    <main className="app">
      <div className="card">
        <div className="card-header">
          <p className="badge">CI/CD WORKFLOW</p>
          <h1>Contact DevOps Team</h1>
          <p className="subtitle">
            Need support about deployment, pipelines or infrastructure?
          </p>
        </div>

        <form className="contact-form">
          <div className="input-group">
            <label>Full Name</label>
            <input type="text" placeholder="John Doe" />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input type="email" placeholder="john@company.com" />
          </div>

          <div className="input-group">
            <label>Environment</label>

            <select>
              <option>Production</option>
              <option>Staging</option>
              <option>Development</option>
            </select>
          </div>

          <div className="input-group">
            <label>Message</label>

            <textarea
              rows="5"
              placeholder="Describe your issue..."
            ></textarea>
          </div>

          <button type="submit">Create Ticket</button>
        </form>
      </div>
    </main>
  )
}

export default App