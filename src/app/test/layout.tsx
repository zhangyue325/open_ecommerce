import AuthenticatedLayout from "../components/authenticated-layout";

export default function TestLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
