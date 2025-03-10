import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/login-email")({
  component: LoginEmail,
});

function LoginEmail() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically call your API to send the magic link
    console.log("Sending magic link to:", email);
    setIsSubmitted(true);
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold text-center">
            Magic Link Login
          </h2>

          {!isSubmitted ? (
            <>
              <p className="text-center text-gray-600">
                Enter your email address and we'll send you a magic link to sign
                in instantly.
              </p>
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-1">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    className="input input-bordered w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Send Magic Link
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="my-4">
                <svg
                  className="mx-auto h-12 w-12 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium">Check your inbox</h3>
              <p className="mt-2 text-gray-600">
                We've sent a magic link to <strong>{email}</strong>. Click the
                link in the email to sign in.
              </p>
              <button
                className="btn btn-outline mt-4"
                onClick={() => setIsSubmitted(false)}
              >
                Back
              </button>
            </div>
          )}

          <div className="divider">OR</div>

          <div className="flex flex-col gap-2">
            <Link to="/login" className="btn btn-outline">
              Sign in with Password
            </Link>
            <Link
              to="/register"
              className="text-sm text-gray-500 hover:text-gray-700 text-center"
            >
              Don't have an account? Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
