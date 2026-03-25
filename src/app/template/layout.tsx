import SiteNavBar from "../components/site-nav-bar";

export default function TemplateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SiteNavBar />
      <main>
        <div className="flex flex-col gap-6">{children}</div>
      </main>
    </>
  );
}
