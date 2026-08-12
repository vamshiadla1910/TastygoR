import { useState } from "react";
import "../Signup/Signup.css";

import { useDispatch } from "react-redux";
import { signup } from "../../Slices/authenticationSlice";

function SignupPage({ onClose, onShowLogin }) {
  const [signupData, setSignupData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSignupChange = (event) => {
    const { id, value } = event.target;
    setSignupData((prev) => ({ ...prev, [id]: value }));
  };

 
  const dispatch = useDispatch();

  const handleSignupSubmit = (event) => {
  event.preventDefault();

  dispatch(signup(signupData));

  console.log("Signup submitted:", signupData);

  onShowLogin();
};

  return (
    <div className="signuppage">
      {onClose && (
        <button
          type="button"
          className="signup-close-btn"
          onClick={onClose}
          aria-label="Close signup"
        >
          &times;
        </button>
      )}

      <h2 className="signup-heading">Sign Up</h2>

      <form onSubmit={handleSignupSubmit}>
        <label htmlFor="fullName" className="signup-label">Full Name</label>
        <input
          type="text"
          id="fullName"
          placeholder="Enter your full name"
          value={signupData.fullName}
          onChange={handleSignupChange}
        />

        <label htmlFor="mobile" className="signup-label">Mobile Number</label>
        <input
          type="tel"
          id="mobile"
          placeholder="Enter your mobile number"
          value={signupData.mobile}
          onChange={handleSignupChange}
        />

        <label htmlFor="email" className="signup-label">Email</label>
        <input
          type="email"
          id="email"
          placeholder="Enter your email"
          value={signupData.email}
          onChange={handleSignupChange}
        />

        <label htmlFor="password" className="signup-label">Password</label>
        <input
          type="password"
          id="password"
          placeholder="Create a password"
          value={signupData.password}
          onChange={handleSignupChange}
        />

        <label htmlFor="confirmPassword" className="signup-label">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          placeholder="Confirm your password"
          value={signupData.confirmPassword}
          onChange={handleSignupChange}
        />

        <button type="submit" className="signup-submit-btn">
          Create Account
        </button>
      </form>

      <p className="signup-to-login">
        Already have an account?{" "}
        <button
          type="button"
          className="signup-login-btn"
          onClick={onShowLogin}
        >
          Login
        </button>
      </p>
    </div>
  );
}

export default SignupPage;