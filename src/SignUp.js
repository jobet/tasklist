import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { MdError } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);


function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorWrapper, setErrorWrapper] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  const navigate = useNavigate();
  

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setErrorWrapper(false);

    // Validate username
    if (username.length < 5) {
      setErrorMessage("Username should be at least 5 characters long.");
      setErrorWrapper(true);
      return;
    }

    // Validate email
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      setErrorWrapper(true);
      return;
    }

    // Validate password
    if (!passwordRegex.test(password)) {
      setErrorMessage("Password should be at least 8 characters long and contain at least one capital letter and one number.");
      setErrorWrapper(true);
      return;
    }

    // Validate confirm password
    if (password !== confPassword) {
      setErrorMessage("Passwords do not match.");
      setErrorWrapper(true);
      return;
    }

    try {
      //Check if username exists.
      const { data: existingUsers, error: userError } = await supabase
        .from("tasklist_users")
        .select("*")
        .or(`user_username.eq.${username}`);
      
      if (userError) {
        setErrorMessage("Error checking for existing users.");
        setErrorWrapper(true);
        return;
      }
      else if (existingUsers.length > 0) {
        setErrorMessage("Username is taken.");
        setErrorWrapper(true);
        return;
      }

      //Check if email exists.
      const { data: existingEmail, error: emailError } = await supabase.auth.admin.listUsers();
    
      if (emailError) {
        setErrorMessage("Error checking for emails.");
        setErrorWrapper(true);
        return;
      }
      const emailFind = existingEmail.users.find(u => u.email === email) || null;

      if(emailFind) {
        setErrorMessage("Email is taken.");
        setErrorWrapper(true);
        return;
      }

      // Sign up with email and password
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
 
      if (error) {
        setErrorMessage("Error sending confirmation email.", error.message);
        setErrorWrapper(true);
      } else {
        // Insert the user's UUID and username into the tasklist_users table
        const { user } = data;
        const { error: insertError } = await supabase
          .from("tasklist_users")
          .insert([{ user_uuid: user.id, user_username: username }]);
  
        if (insertError) {
          setErrorMessage("Error inserting user data:", insertError.message);
          setErrorWrapper(true);
        } else {
          navigate("/login?signup=success");
        }
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div className="container">
        <div className="loginWindow">
          <h1>Sign-Up to TaskList</h1>
          <form onSubmit={handleSignUp}>
              <label className={`${errorWrapper ? "errorMessageDisplay" : "noMessage"}`}>
                <MdError className="wrapperSymbol" />
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
              <span>Email</span>
              <input
                placeholder="Email"
                type="text"
                id="email"
                value={email}
                className="loginInput"
                onChange={(e) => setEmail(e.target.value)}
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
              <span>Confirm Password</span>
              <input
                placeholder="Confirm Password"
                type="password"
                id="confPassword"
                value={confPassword}
                className="loginInput"
                onChange={(e) => setConfPassword(e.target.value)}
                required
              />
              <button type="submit" className="mainBtn">Sign-Up</button>
              <p>Already have an account? <Link className="redirectLink" to="/login">Login</Link></p>
          </form>
      </div>
    </div>
  );
};

export default SignUp;