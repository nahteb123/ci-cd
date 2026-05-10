import './App.css'

function App() {
    return (
        <div className="app-container">
            {/* --- HEADER --- */}
            <nav className="navbar">
                <div className="nav-content">
                    <div className="nav-logo">
                        <span className="logo-icon">🚀</span>
                        <span className="logo-text">CI-CD</span>
                    </div>
                    <ul className="nav-links">
                        <li><a href="#" className="active">Support</a></li>
                        <li><a href="#">Docs</a></li>
                    </ul>
                    <div className="nav-actions">
                        <button className="btn-secondary"></button>
                    </div>
                </div>
            </nav>

            {/* --- TON BODY (FORMULAIRE) ICI --- */}
            <main className="container-main">
                {/* La card du formulaire va ici */}
            </main>

            {/* --- NOUVEAU FOOTER --- */}
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-info">
                        <p>© 2026 CI-CD Project.</p>
                    </div>

                    <div className="footer-socials">
                        <a href="https://github.com/nahteb123/ci-cd"> Repôt GitHub</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default App