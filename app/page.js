import LogViewer from "../components/LogViewer"

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">RemoteStorage Log Viewer</h1>
        <p className="text-muted-foreground">
          View logs from your RemoteStorage apps.
        </p>
      </div>
      <LogViewer />
    </main>
  )
}

