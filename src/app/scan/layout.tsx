import AuthenticatedLayout from "../components/authenticated-layout";

export default function ScanLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
