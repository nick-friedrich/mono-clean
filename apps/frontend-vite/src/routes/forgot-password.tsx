import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPassword,
});

function ForgotPassword() {
  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold text-center">
            Forgot Password
          </h2>
          <p className="text-center text-gray-600">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                className="input input-bordered w-full"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Send Reset Link
            </button>
          </form>
          <div className="divider"></div>
          <div className="flex justify-between">
            <Link
              to="/login"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Back to Login
            </Link>
            <Link
              to="/register"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
