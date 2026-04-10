import SiteNavBar from "../components/site-nav-bar";

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-[#050608]">
      <SiteNavBar mode="fluid" />
      <div className="min-h-[calc(100dvh-4rem)]">{children}</div>
    </div>
  );
}
