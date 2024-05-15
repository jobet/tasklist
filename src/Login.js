import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { MdError, MdInfo } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey) 


function Login({onLogin}) {
  const location = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorWrapper, setErrorWrapper] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [infoWrapper, setInfoWrapper] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get("signup") === "success") {
      setInfoWrapper(true);
      setInfoMessage("Account created. Please confirm your email first to log in.");
      navigate("/login");
    }
  }, [location]);

  
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get("confirm") === "success") {
      setInfoWrapper(true);
      setInfoMessage("Account confirmed. You can now log in.");
      navigate("/login");
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setErrorWrapper(false);
  
    try {
      // Fetch data from tasklist_users table
      const { data: tasklistUsers, error: tasklistUsersError } = await supabase
        .from("tasklist_users")
        .select("user_uuid, user_username")
        .ilike("user_username", `%${identifier}%`);
  
      if (tasklistUsersError) {
        setErrorMessage("Error fetching user data.");
        setErrorWrapper(true);
        return;
      }
  
      // Fetch data from auth.users table using admin.listUsers
      const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();
  
      if (authUsersError) {
        setErrorMessage("Error fetching user data.");
        setErrorWrapper(true);
        return;
      }
  
      // Find the user by username or email
      const user =
      authUsers.users.find(
        (u) =>
          tasklistUsers.some((t) => t.user_uuid === u.id && t.user_username === identifier) ||
          u.email === identifier
      ) || null;
  
      if (!user) {
        setErrorMessage("User not found.");
        setErrorWrapper(true);
      } else {
        // Authenticate the user against the auth.users table
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password,
        });
  
        if (signInError) {
          if (signInError.message === "Email not confirmed") {
            setErrorMessage("Email not confirmed. Please check your inbox for the confirmation link.");
            setErrorWrapper(true);
          } else {
            setErrorMessage("Invalid username/email or password.");
            setErrorWrapper(true);
          }
        }
        else {
          console.log("Authentication successful");
          onLogin(user);
          navigate("/");
        }
      }
    } catch (error) {
      setErrorMessage("Error: ", error);
      setErrorWrapper(true);
    }
  };

  return (
    <div className="container">
        <div className="loginWindow">
          <h1>Login to TaskList</h1>
          <form onSubmit={handleLogin}>
              <label className={`${errorWrapper ? "errorMessageDisplay" : "noMessage"}`}>
                <MdError className="wrapperSymbol" />
                <span>{errorMessage}</span>   
              </label>
              <label className={`${infoWrapper ? "infoMessageDisplay" : "noMessage"}`}>
                <MdInfo className="wrapperSymbol" />
                <span>{infoMessage}</span>   
              </label>
              <span>Username or Email</span>
              <input
                placeholder="Username or Email"
                type="text"
                id="identifier"
                value={identifier}
                className="loginInput"
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
              <span>Password</span>
              <input
                placeholder="Password"
                type="password"
                id="password"
                value={password}
                className="loginInput"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Link to="/forgotpass" className="forgotPass">Forgot password?</Link>
            <button type="submit" className="mainBtn">Login</button>
            <p>Don"t have an account? <Link to="/signup" className="redirectLink">Sign up</Link></p>
          </form>
      </div>
    </div>
  );
};

export default Login;