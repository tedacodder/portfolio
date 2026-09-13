import type { SocialLink } from "@/types/api";

export default function Footer({
  name,
  socialLinks,
}: {
  name: string;
  socialLinks: SocialLink[];
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="container-page flex flex-col items-start justify-between gap-4 py-10 md:flex-row md:items-center">
        <p className="font-mono text-xs text-dim">
          © {year} {name || "Portfolio"}
        </p>
        <p className="font-mono text-xs text-muted">STATUS: BUILDING</p>
        {socialLinks.length > 0 && (
          <div className="flex gap-5">
            {socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target={link.url.startsWith("http") ? "_blank" : undefined}
                rel={link.url.startsWith("http") ? "noreferrer noopener" : undefined}
                className="font-mono text-xs text-muted transition-colors hover:text-accent"
              >
                {link.platform}
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}
