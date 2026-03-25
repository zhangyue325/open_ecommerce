
export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main>
        <div className="flex flex-col gap-6">{children}</div>
      </main>
    </>
  );
}
