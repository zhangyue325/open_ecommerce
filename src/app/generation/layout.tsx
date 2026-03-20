import AuthenticatedLayout from "../components/authenticated-layout";

export default function GenerationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
