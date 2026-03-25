import SiteNavBar from "../components/site-nav-bar";

export default function TemplateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-[100dvh] overflow-hidden bg-[#050608]">
      <SiteNavBar mode="fluid" />
      <div className="h-[calc(100dvh-4rem)]">{children}</div>
    </div>
  );
}
