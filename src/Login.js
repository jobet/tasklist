import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { MdError } from "react-icons/md";
import bcrypt from "bcryptjs";
import { Link, useNavigate } from "react-router-dom";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey) 


function Login({onLogin}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorWrapper, setErrorWrapper] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setErrorWrapper(false);

    try {
      const { data, error } = await supabase
      .from("tasklist_users")
      .select("*")
      .eq("user_username", username);

      if (error) {
        setErrorMessage("Account doesn't exists.");
        setErrorWrapper(true);
      } else {
        if (data.length > 0) {
          const user = data[0];
          const isPasswordValid = await bcrypt.compare(password, user.user_password);

          if (isPasswordValid) {
            console.log("Authentication successful");
            onLogin(user.user_id);
            navigate("/");
          } else {
            setErrorMessage("Invalid password.");
            setErrorWrapper(true);
          }
        } else {
          setErrorMessage("User not found.");
          setErrorWrapper(true);
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
              <label className={`${errorWrapper ? "errorMessageDisplay" : "errorMessage"}`}>
                <MdError className="errorSymbol" />
                <span>{errorMessage}</span>   
              </label>
              <span>Username</span>
              <input
                placeholder="Username"
                type="text"
                id="username"
                value={username}
                className="loginInput"
                onChange={(e) => setUsername(e.target.value)}
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