export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {children}
    </div>
  )
} 