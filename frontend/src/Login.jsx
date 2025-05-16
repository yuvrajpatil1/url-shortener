import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";

function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`/api/login`, {
        name,
        email,
        password,
      });
      login(res.data.token, res.data.email, res.data.name);
      alert("Login successful");
      navigate("/"); // Redirect to homepage
    } catch (err) {
      console.log(err);
      // alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div>
      <div>
        <div className="flex justify-center items-center mt-40">
          <div className="max-w-sm w-full">
            <div className="bg-gray-900 rounded-lg shadow-xl overflow-hidden box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
              <div className="p-8">
                <h2 className="text-center text-3xl font-bold text-white">
                  Welcome Back!
                </h2>
                <p className="mt-4 text-center text-gray-400">
                  Login to continue
                </p>
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  <div className="rounded-md shadow-sm">
                    <div>
                      <label className="sr-only" htmlFor="email">
                        Email address
                      </label>
                      <input
                        placeholder="Email address"
                        className="appearance-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        type="email"
                        required
                        value={email}
                        autoComplete="email"
                        name="email"
                        id="email"
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="mt-4">
                      <label className="sr-only" htmlFor="password">
                        Password
                      </label>
                      <input
                        placeholder="Password"
                        className="appearance-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        required
                        autoComplete="current-password"
                        type="password"
                        name="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      type="submit"
                    >
                      Login
                    </button>
                  </div>
                </form>
              </div>
              <div className="px-8 py-4 bg-gray-700 text-center">
                <span className="text-gray-300">Don't have an account? </span>
                <a
                  className="font-medium text-indigo-200 hover:text-indigo-400"
                  href="/register"
                >
                  Register
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
