import { ReactNode } from "react";
import { Logo } from "@/components/layout/Logo";
import { PublicPage } from "@/components/layout/PublicPage";

type AuthScreenProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthScreen({
  title,
  description,
  children,
  footer,
}: AuthScreenProps) {
  return (
    <PublicPage>
      <div className="mx-auto max-w-md py-8 sm:py-14">
        <div className="mb-8 flex justify-center">
          <Logo variant="lockup" href="/" className="w-40 sm:w-44" />
        </div>
        <h1 className="text-h1 text-navy">{title}</h1>
        <p className="mt-2 text-body text-muted">{description}</p>
        <div className="mt-8">{children}</div>
        {footer ? <div className="mt-6 text-small text-muted">{footer}</div> : null}
      </div>
    </PublicPage>
  );
}
