import TopNav from "./top-nav";

export default function AuthenticatedLayout({
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
