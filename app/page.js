import LogViewer from "../components/LogViewer"
import LogCharts from "../components/LogCharts"

export default function Home() {
  return (
    <main className="container mx-auto p-4 h-screen flex flex-col">
      <div className="flex flex-col gap-4 mb-6 flex-none">
        <h1 className="text-3xl font-bold tracking-tight">RemoteStorage Log Viewer</h1>
        <p className="text-muted-foreground">
          View logs from your RemoteStorage apps.
        </p>
        <LogCharts />
      </div>
      <div className="flex-1 min-h-0">
        <LogViewer />
      </div>
    </main>
  )
}

