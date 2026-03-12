import TopNav from "./components/top-nav";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <TopNav />
      <main>
        <div className="flex flex-col gap-6">{children}</div>
      </main>
    </>
  );
}
