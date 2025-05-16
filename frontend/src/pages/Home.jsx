import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";

function Home() {
  const { token, logout, email, name } = useContext(AuthContext);
  const [longUrl, setLongUrl] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [userUrls, setUserUrls] = useState([]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        await fetchUserUrls();
      } catch (err) {
        console.error("Failed to fetch URLs", err);
      }
    })();
  }, [token]);

  const fetchUserUrls = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/urls`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserUrls(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShorten = async () => {
    try {
      const config = token
        ? {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        : {}; // no auth headers for guest

      const res = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/shorten`,
        { longUrl, customUrl },
        config
      );

      setShortUrl(`https://slashbyhash.vercel.app/${res.data.shortUrl}`);
      setQrCode(res.data.qrCode);

      // fetch user URLs only if logged in
      if (token) {
        fetchUserUrls();
      }
    } catch (err) {
      alert(err.response?.data?.error || "Error occurred");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this URL?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/urls/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchUserUrls();
    } catch (err) {
      alert("Failed to delete");
    }
  };
  console.log("token in Home:", token);

  // if (!token) return <p>Please login to shorten URLs and manage your links.</p>;

  return (
    <div className="px-4 sm:px-8 md:px-16 lg:px-24 mt-26">
      {token ? (
        <h1 className="text-xl sm:text-4xl md:font-semibold text-center mb-8">
          Welcome, {email || name}!
        </h1>
      ) : (
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-semibold">
            Welcome to SlashByHash!
          </h1>
          <p className="mt-2">
            <a href="/login" className="text-indigo-500 underline">
              Login
            </a>{" "}
            or{" "}
            <a href="/register" className="text-indigo-500 underline">
              Register
            </a>{" "}
            to manage your URLs.
          </p>
        </div>
      )}

      {/* URL Shortener Form + QR */}
      <div className="bg-[#0F172B] border border-[#121D3E] rounded-lg flex flex-col lg:flex-row items-center gap-8 px-6 sm:px-10 pt-4 pb-12 text-white">
        {/* Form */}
        <div className="w-full lg:w-1/2">
          <h2 className="text-3xl pt-2 sm:text-3xl font-semibold text-center mb-4">
            Shorten a URL
          </h2>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="long-url"
                className="text-sm md:text-md block mb-2"
              >
                Paste your long URL here*:
              </label>
              <input
                id="long-url"
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                placeholder="https://www.example.com/long-url"
                className="w-full md:px-4 md:py-3 py-2 px-2  border border-gray-700 bg-gray-700 rounded-md text-sm focus:outline-none focus:ring-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="custom-url"
                className="text-sm md:text-md block mb-2"
              >
                Enter your desired text:
              </label>
              <input
                id="custom-url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="Custom URL (optional)"
                className="w-full md:px-4 md:py-3 py-2 px-2 border border-gray-700 bg-gray-700 rounded-md text-sm focus:outline-none focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={handleShorten}
              className="w-1/2 md:px-4 md:py-3 mx-auto py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md font-medium text-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Shorten
            </button>

            {shortUrl && (
              <div className="text-center break-words text-xl sm:text-2xl mt-4">
                <p>
                  <strong>Short URL:</strong>{" "}
                  <a href={shortUrl} className="text-indigo-400 underline">
                    {shortUrl}
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* QR Code */}
        {shortUrl && qrCode && (
          <div className="flex flex-col items-center justify-center text-center w-full lg:w-1/2">
            <p className="text-xl sm:text-2xl font-semibold mb-4">QR Code:</p>
            <img
              src={qrCode}
              alt="QR Code"
              className="h-64 w-64 object-contain rounded-lg shadow-lg"
            />
          </div>
        )}
      </div>

      {/* URLs Table */}
      {token && (
        <div className="md:py-16 pt-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-8">
            Your URLs
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-[#0F172B] text-white overflow-hidden rounded-lg shadow-md text-sm sm:text-base">
              <thead className="bg-[#121D3E] text-left">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Short URL</th>
                  <th className="py-3 px-4 sm:px-6 hidden md:block ">
                    Original URL
                  </th>
                  <th className="py-3 px-4 sm:px-6">Action</th>
                </tr>
              </thead>
              <tbody>
                {userUrls.map((url) => {
                  const fullShort = `https://slashbyhash.vercel.app/${
                    url.customUrl || url.shortUrl
                  }`;
                  return (
                    <tr key={url._id} className="border-t border-gray-700">
                      <td className="py-4 px-4 sm:px-6 break-words max-w-xs">
                        <a
                          href={fullShort}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-300 underline"
                        >
                          {fullShort}
                        </a>
                      </td>
                      <td className="hidden md:block py-4 px-4 sm:px-6 break-words max-w-3xl">
                        {url.longUrl}
                      </td>
                      <td className="py-4 px-4 sm:px-6 max-w-sm">
                        <button
                          onClick={() => handleDelete(url._id)}
                          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="text-sm bottom-0 md:mt-29 mt-84 text-[white] p-4 border-t-2 border-gray-600 text-center">
        Developed with ❤️ by{" "}
        <a
          className="underline"
          href="https://www.linkedin.com/in/yuvrajkpatil"
        >
          Yuvraj Patil
        </a>
        .
      </div>
    </div>
  );
}

export default Home;
