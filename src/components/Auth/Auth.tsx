import { useState, type FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";

const Auth = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [data, setData] = useState({ email: "", password: "" });

  const { handleSignIn, handleSignUp, loading, error, clearError } = useAuth();

  const toggle = () => {
    setIsSignIn(!isSignIn);
    clearError(); // Clear error when switching between sign in/up
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) {
      clearError();
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    (isSignIn ? handleSignIn : handleSignUp)(data);
  };
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">{isSignIn ? "Sign In" : "Sign Up"}</h1>
          <p className="auth-subtitle">
            {isSignIn
              ? "Welcome back! Please sign in to your account"
              : "Create a new account to get started"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Error Message */}
          {error && (
            <div className="error-message-container">
              <div className="error-message-content">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{error}</span>
                <button
                  type="button"
                  className="error-close"
                  onClick={clearError}
                  aria-label="Close error message"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={data.email}
              onChange={handleInput}
              className="form-input"
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={data.password}
              onChange={handleInput}
              className="form-input"
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className={`auth-button ${
              !data.email.trim() || !data.password.trim() || loading
                ? "auth-button-disabled"
                : "auth-button-enabled"
            }`}
            disabled={!data.email?.trim() || !data.password?.trim() || loading}
          >
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <span>Processing...</span>
              </div>
            ) : isSignIn ? (
              "Sign In"
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-switch-text">
            {isSignIn ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button type="button" className="auth-switch-button" onClick={toggle}>
            {isSignIn ? "Register Account" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
