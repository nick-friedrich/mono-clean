import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
});

function ResetPassword() {
  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold text-center">
            Reset Password
          </h2>
          <p className="text-center text-gray-600">
            Enter your new password below.
          </p>
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="password">New Password</label>
              <input
                type="password"
                id="password"
                className="input input-bordered w-full"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                className="input input-bordered w-full"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Reset Password
            </button>
          </form>
          <div className="divider"></div>
          <Link
            to="/login"
            className="text-sm text-gray-500 hover:text-gray-700 text-center"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
