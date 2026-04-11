import { FormEvent, useEffect, useState } from "react";
import { readJson } from "./api";
import AuthScreen from "./AuthScreen";
import BuyerScreen from "./BuyerScreen";
import FarmerScreen from "./FarmerScreen";
import LandingScreen from "./LandingScreen";
import { BootstrapResponse, emptyProfile, FarmerProfile, FarmerResponse, Role, Screen } from "./types";

export default function AppShell() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [role, setRole] = useState<Role>("farmer");
  const [bootstrap, setBootstrap] = useState<BootstrapResponse | null>(null);
  const [farmerData, setFarmerData] = useState<FarmerResponse | null>(null);
  const [buyerListings, setBuyerListings] = useState<BootstrapResponse["marketListings"]>([]);
  const [formProfile, setFormProfile] = useState<FarmerProfile>(emptyProfile);
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [authForm, setAuthForm] = useState({ name: "", email: "", identifier: "", password: "" });

  useEffect(() => {
    void readJson<BootstrapResponse>("/api/bootstrap").then((data) => {
      setBootstrap(data);
      setBuyerListings(data.marketListings);
    });
  }, []);

  const loadFarmer = async (id: string) => {
    const data = await readJson<FarmerResponse>(`/api/farmer/${id}`);
    setFarmerData(data);
    setFormProfile(data.profile);
  };

  const openAuth = (nextRole: Role, nextScreen: "login" | "signup") => {
    setRole(nextRole);
    setScreen(nextScreen);
    setStatus("");
  };

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Processing...");

    const endpoint = screen === "signup" ? "/api/auth/signup" : "/api/auth/login";
    const payload =
      screen === "signup"
        ? { role, name: authForm.name, email: authForm.email, password: authForm.password }
        : { role, identifier: authForm.identifier, password: authForm.password };

    const result = await readJson<{ userId: string; role: Role }>(endpoint, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setUserId(result.userId);
    window.localStorage.setItem("farmsetu-user-id", result.userId);
    window.localStorage.setItem("farmsetu-role", result.role);

    if (role === "farmer") {
      await loadFarmer(result.userId);
      setScreen("farmer");
    } else {
      setScreen("buyer");
    }

    setStatus("");
  };

  const handleProfileSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId) return;

    setSavingProfile(true);
    setStatus("Saving profile and checking matched loans...");

    const result = await readJson<
      Pick<FarmerResponse, "profile" | "profileComplete" | "matchedSchemes" | "matchedLoans" | "loanScore">
    >(`/api/farmer/${userId}/profile`, {
      method: "PUT",
      body: JSON.stringify(formProfile),
    });

    setFarmerData((current) =>
      current
        ? {
            ...current,
            profile: result.profile,
            profileComplete: result.profileComplete,
            matchedSchemes: result.matchedSchemes,
            matchedLoans: result.matchedLoans,
            loanScore: result.loanScore,
          }
        : current,
    );
    setSavingProfile(false);
    setStatus(result.profileComplete ? "Profile saved. Matching loan options are ready." : "Profile saved.");
  };

  const updateProfileField = <K extends keyof FarmerProfile>(key: K, value: FarmerProfile[K]) => {
    setFormProfile((current) => ({ ...current, [key]: value }));
  };

  const logout = () => {
    setScreen("landing");
    setUserId(null);
    setFarmerData(null);
    setFormProfile(emptyProfile);
    setStatus("");
    window.localStorage.removeItem("farmsetu-user-id");
    window.localStorage.removeItem("farmsetu-role");
  };

  if (!bootstrap) {
    return <div className="loading-screen">Loading FarmSetu...</div>;
  }

  if (screen === "landing") {
    return <LandingScreen bootstrap={bootstrap} onOpenAuth={openAuth} />;
  }

  if (screen === "login" || screen === "signup") {
    return (
      <AuthScreen
        role={role}
        mode={screen}
        form={authForm}
        status={status}
        onBack={() => setScreen("landing")}
        onSubmit={handleAuthSubmit}
        onSwitch={() => setScreen(screen === "signup" ? "login" : "signup")}
        onChange={(patch) => setAuthForm((current) => ({ ...current, ...patch }))}
      />
    );
  }

  if (screen === "buyer") {
    return <BuyerScreen topSignal={bootstrap.topSignal} listings={buyerListings} onLogout={logout} />;
  }

  if (screen === "farmer" && farmerData) {
    return (
      <FarmerScreen
        data={farmerData}
        formProfile={formProfile}
        savingProfile={savingProfile}
        status={status}
        onLogout={logout}
        onSave={handleProfileSave}
        onUpdateField={updateProfileField}
      />
    );
  }

  return <LandingScreen bootstrap={bootstrap} onOpenAuth={openAuth} />;
}
