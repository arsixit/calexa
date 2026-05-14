import AuthStatus from "./auth-status";

interface AuthPageProps {
  searchParams?: {
    status?: string | null;
    message?: string | null;
  };
}

export default function AuthPage({ searchParams }: AuthPageProps) {
  return (
    <AuthStatus
      status={searchParams?.status ?? null}
      message={searchParams?.message ?? null}
    />
  );
}
