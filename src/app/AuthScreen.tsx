import { FormEvent } from "react";
import { Role } from "./types";

type AuthFormState = {
  name: string;
  email: string;
  identifier: string;
  password: string;
};

type AuthScreenProps = {
  role: Role;
  mode: "login" | "signup";
  form: AuthFormState;
  status: string;
  onBack: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSwitch: () => void;
  onChange: (patch: Partial<AuthFormState>) => void;
};

export default function AuthScreen({
  role,
  mode,
  form,
  status,
  onBack,
  onSubmit,
  onSwitch,
  onChange,
}: AuthScreenProps) {
  const isSignup = mode === "signup";

  return (
    <div className="auth-page">
      <div className="auth-card">
        <button className="back-button" onClick={onBack}>
          Back
        </button>
        <p className="eyebrow">{role === "farmer" ? "Farmer Access" : "Buyer Access"}</p>
        <h1>{isSignup ? "Create your account" : "Continue to your account"}</h1>
        <p className="auth-copy">
          {role === "farmer"
            ? "Farmers can register, fill land and crop details, then unlock matched loan options."
            : "Buyers can access market listings and crop intelligence from one place."}
        </p>

        <form className="auth-form-shell" onSubmit={onSubmit}>
          {isSignup ? (
            <>
              <label>
                Full name
                <input value={form.name} onChange={(event) => onChange({ name: event.target.value })} required />
              </label>
              <label>
                Email
                <input type="email" value={form.email} onChange={(event) => onChange({ email: event.target.value })} required />
              </label>
            </>
          ) : (
            <label>
              Email or name
              <input value={form.identifier} onChange={(event) => onChange({ identifier: event.target.value })} required />
            </label>
          )}

          <label>
            Password
            <input type="password" value={form.password} onChange={(event) => onChange({ password: event.target.value })} required />
          </label>

          <button type="submit">{isSignup ? "Create account" : "Login"}</button>
        </form>

        <p className="auth-switch-row">
          {isSignup ? "Already have an account?" : "Need an account?"}
          <button className="link-button" onClick={onSwitch}>
            {isSignup ? "Login" : "Sign up"}
          </button>
        </p>
        {status ? <p className="status-line">{status}</p> : null}
      </div>
    </div>
  );
}
