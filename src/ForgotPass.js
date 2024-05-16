import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { MdError, MdInfo } from "react-icons/md";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function ForgotPass() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorWrapper, setErrorWrapper] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [infoWrapper, setInfoWrapper] = useState(false);
  const resetToken = searchParams.get("token");

  useEffect(() => {
    if (resetToken) {
      setInfoMessage("Please enter your new password.");
      setInfoWrapper(true);
    }
  }, [resetToken]);

  const handleResetPassword = async (e) => {
    setErrorMessage("");
    setErrorWrapper(false);
    setInfoMessage("");
    setInfoWrapper(false);
    e.preventDefault();
    if (!resetToken) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}${window.location.pathname}?token=TOKEN`,
        });
        if (error) {
          setErrorMessage("Error sending reset link.");
          setErrorWrapper(true);
        } else {
          setInfoMessage("Password reset link sent to your email.");
          setInfoWrapper(true);
        }
      } catch (error) {
        setErrorMessage("Error sending reset link.");
        setErrorWrapper(true);
      }
    } else {
      if (newPassword !== confirmPassword) {
        setErrorMessage("Passwords do not match.");
        setErrorWrapper(true);
        return;
      }
      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        }, resetToken);
        if (error) {
          setErrorMessage(error.message);
          setErrorWrapper(true);
        } else {
          navigate("/login?passwordreset=success");
        }
      } catch (error) {
        setErrorMessage("Error: ", error);
        setErrorWrapper(true);
      }
    }
  };

  return (
    <div className="container">
      <div className="loginWindow">
        <h1>Reset Password</h1>
        <form onSubmit={handleResetPassword}>
          <label
            className={`${errorWrapper ? "errorMessageDisplay" : "noMessage"}`}
          >
            <MdError className="wrapperSymbol" />
            <span>{errorMessage}</span>
          </label>
          <label
            className={`${infoWrapper ? "infoMessageDisplay" : "noMessage"}`}
          >
            <MdInfo className="wrapperSymbol" />
            <span>{infoMessage}</span>
          </label>
          {!resetToken && (
            <>
              <span>Email</span>
              <input
                placeholder="Email"
                type="email"
                id="email"
                value={email}
                className="loginInput"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </>
          )}
          {resetToken && (
            <>
              <span>New Password</span>
              <input
                placeholder="New Password"
                type="password"
                id="newPassword"
                value={newPassword}
                className="loginInput"
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <span>Confirm Password</span>
              <input
                placeholder="Confirm Password"
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                className="loginInput"
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </>
          )}
          <button type="submit" className="mainBtn">
            {!resetToken ? "Reset Password" : "Update Password"}
          </button>
          <p>
            <Link to="/login" className="redirectLink">
              Back to Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default ForgotPass;