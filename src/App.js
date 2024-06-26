import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import TaskList from "./TaskList";
import Login from "./Login";
import SignUp from "./SignUp";
import ForgotPass from "./ForgotPass";
import "./App.css";

function App() {
  const [userSession, setUserSession] = useState(() => {
    const storedSession = Cookies.get("userSession");
    return storedSession ? JSON.parse(storedSession) : null;
  });

  useEffect(() => {
    Cookies.set("userSession", JSON.stringify(userSession));
  }, [userSession]);

  const PrivateRoute = ({ children }) => {
    return userSession ? children : <Navigate to="/login" replace />;
  };

  const RedirectIfLoggedIn = ({ children }) => {
    return userSession ? <Navigate to="/" replace /> : children;
  };

  return (
    <Router>
      <div>
        <Routes>
          <Route
            path="/login"
            element={
              <RedirectIfLoggedIn>
                <Login onLogin={setUserSession} />
              </RedirectIfLoggedIn>
            }
          />
          <Route
            path="/signup"
            element={
              <RedirectIfLoggedIn>
                <SignUp />
              </RedirectIfLoggedIn>
            }
          />
          <Route
            path="/forgotpass"
            element={
              <RedirectIfLoggedIn>
                <ForgotPass />
              </RedirectIfLoggedIn>
            }
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <TaskList userSession={userSession} setUserSession={setUserSession} />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Login onLogin={setUserSession} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;