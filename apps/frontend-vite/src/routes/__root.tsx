import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>{" "}
        <Link to="/login" className="[&.active]:font-bold">
          Login
        </Link>{" "}
        <Link to="/login-email" className="[&.active]:font-bold">
          Magic Link
        </Link>{" "}
        <Link to="/register" className="[&.active]:font-bold">
          Register
        </Link>{" "}
        <Link to="/forgot-password" className="[&.active]:font-bold">
          Forgot Password
        </Link>{" "}
        <Link to="/reset-password" className="[&.active]:font-bold">
          Reset Password
        </Link>
      </div>
      <hr />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
