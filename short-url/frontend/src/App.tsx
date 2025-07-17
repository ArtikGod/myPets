import React, { useState } from 'react';
import CreateForm from './components/CreateForm';
import UrlInfo from './components/UrlInfo';
import UrlTable from './components/UrlTable';
import './styles.css';

const App: React.FC = () => {
  const [refresh, setRefresh] = useState(0);

  const handleCreated = () => {
    setRefresh((prev) => prev + 1);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>URL Shortener</h1>
      </header>

      <main className="main-content">
        <section className="form-section" aria-label="Create short URL form">
          <CreateForm onCreated={handleCreated} />
        </section>

        <section className="info-section" aria-label="Short URL information">
          <UrlInfo />
        </section>
      </main>

      <section className="url-list-section" aria-label="List of all short URLs">
        <UrlTable refresh={refresh} />
      </section>

      <footer className="app-footer">
        <p>Created by: ArtikGo</p>
      </footer>
    </div>
  );
};

export default App;
