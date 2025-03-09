import { createFileRoute } from "@tanstack/react-router";

export const Route: any = createFileRoute("/register")({
  component: Register,
});

function Register() {
  return (
    <div>
      <h3>Register</h3>
    </div>
  );
}
