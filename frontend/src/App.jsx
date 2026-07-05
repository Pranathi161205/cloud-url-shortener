import { useEffect, useState } from "react";
import axios from "axios";
import { FaCopy, FaLink } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

function App() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [urls, setUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedShortCode, setCopiedShortCode] = useState(null);

  const formatUrl = (value) => {
    return value.length > 35 ? `${value.substring(0, 35)}...` : value;
  };

  const shortenUrl = async () => {
    if (!url.trim()) return;

    setIsLoading(true);

    try {
      const response = await axios.post("/api/shorten", {
        url: url,
      });

      setShortUrl(response.data.shortUrl);
      setUrl("");
      fetchUrls();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUrls = async () => {
    try {
      const response = await axios.get("/api/urls");
      setUrls(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteUrl = async (shortCode) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/url/${shortCode}`);
      fetchUrls();
    } catch (error) {
      console.log(error);
    }
  };

  const copyUrl = async (shortCode) => {
    const fullUrl = `/${shortCode}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedShortCode(shortCode);
      setTimeout(() => setCopiedShortCode(null), 2000);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  return (
    <div className="app-shell">
      <div className="card">
        <div className="brand">
          <FaLink className="brand-icon" />
          <h1>CloudURL</h1>
        </div>

        <p className="subtitle">
          Shorten long links and keep your dashboard organized.
        </p>

        <div className="input-row">
          <input
            type="text"
            placeholder="Enter Long URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="url-input"
          />

          <button onClick={shortenUrl} className="primary-btn" disabled={isLoading}>
            {isLoading ? "Shortening..." : "Shorten URL"}
          </button>
        </div>

        {shortUrl && (
          <div className="short-url-box">
            <h3>Short URL</h3>
            <a href={shortUrl} target="_blank" rel="noreferrer">
              {shortUrl}
            </a>
          </div>
        )}

        {copiedShortCode && <div className="success-message">✅ URL Copied</div>}

        <div className="table-section">
          <h2>All URLs</h2>
          <div className="table-wrapper">
            <table className="url-table">
              <thead>
                <tr>
                  <th>Original URL</th>
                  <th>Short URL</th>
                  <th>Clicks</th>
                  <th>Copy</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {urls.map((item) => (
                  <tr key={item.shortCode}>
                    <td title={item.originalUrl}>{formatUrl(item.originalUrl)}</td>
                    <td>
                      <a
                        href={`http://localhost:8000/${item.shortCode}`}
                        target="_blank"
                        rel="noreferrer"
                        className="short-link"
                      >
                        {item.shortCode}
                      </a>
                    </td>
                    <td>{item.clicks}</td>
                    <td>
                      <button
                        className="icon-btn copy-btn"
                        onClick={() => copyUrl(item.shortCode)}
                      >
                        <FaCopy /> <span>Copy</span>
                      </button>
                    </td>
                    <td>
                      <button
                        className="icon-btn delete-btn"
                        onClick={() => deleteUrl(item.shortCode)}
                      >
                        <MdDelete /> <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;