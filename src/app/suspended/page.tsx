export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <span className="text-2xl">🔴</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          This platform is temporarily unavailable
        </h1>
        <p className="text-muted-foreground">
          Please check back later or contact your administrator.
        </p>
      </div>
    </div>
  )
}
