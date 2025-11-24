"use client"
import { useState, useMemo } from "react"
import { useRemoteStorageContext } from "../contexts/RemoteStorageContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, RefreshCw, AlertCircle } from "lucide-react"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

export default function LogViewer() {
  const { 
    isConnected, 
    logsList, 
    selectedLog, 
    selectedLogContent, 
    loadLogContent, 
    reload,
    isLoading 
  } = useRemoteStorageContext()

  // Format the content for display
  const formattedContent = useMemo(() => {
    if (!selectedLogContent) return null;

    if (typeof selectedLogContent === 'object') {
      return JSON.stringify(selectedLogContent, null, 2);
    }

    // Try to parse string as JSON
    try {
      const parsed = JSON.parse(selectedLogContent);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      // Not JSON, return as is
      return selectedLogContent;
    }
  }, [selectedLogContent]);

  // Extract action from content
  const logAction = useMemo(() => {
    if (!selectedLogContent) return null;
    try {
      const parsed = typeof selectedLogContent === 'object' 
        ? selectedLogContent 
        : JSON.parse(selectedLogContent);
      return parsed.action;
    } catch (e) {
      return null;
    }
  }, [selectedLogContent]);

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto mt-10">
        <CardHeader>
          <CardTitle>Connect to RemoteStorage</CardTitle>
          <CardDescription>
            Please connect your RemoteStorage account using the widget in the bottom right corner to view your logs.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
      {/* Sidebar - Log List */}
      <Card className="md:col-span-1 flex flex-col h-full">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Logs</CardTitle>
            <Button variant="ghost" size="icon" onClick={reload} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <CardDescription>
            {logsList.length} log files found
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full">
             {logsList.length === 0 && !isLoading ? (
                <div className="text-center p-4 text-muted-foreground text-sm">
                  No logs found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="w-[180px]">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logsList.map((log) => {
                      // Extract timestamp from filename: log-1762612747613-63h71b
                      let dateDisplay = '-';
                      try {
                        const match = log.name.match(/log-(\d+)-/);
                        if (match && match[1]) {
                          const timestamp = parseInt(match[1], 10);
                          if (!isNaN(timestamp)) {
                            dateDisplay = new Date(timestamp).toLocaleString();
                          }
                        } else if (log.lastUpdated) {
                           // Fallback to lastUpdated if filename doesn't match
                           dateDisplay = new Date(log.lastUpdated).toLocaleDateString();
                        }
                      } catch (e) {
                        // ignore error
                      }

                      return (
                        <TableRow 
                          key={log.name} 
                          className={`cursor-pointer hover:bg-muted/50 ${selectedLog === log.name ? "bg-muted" : ""}`}
                          onClick={() => loadLogContent(log.name)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span className="truncate max-w-[150px]" title={log.name}>{log.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {dateDisplay}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main Content - Log Viewer */}
      <Card className="md:col-span-2 flex flex-col h-full">
        <CardHeader className="pb-3 border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{selectedLog || "Select a log"}</CardTitle>
              {selectedLog && (
                <CardDescription>
                  Viewing content of {selectedLog}
                </CardDescription>
              )}
            </div>
            {logAction && (
              <Badge variant="outline">
                {logAction}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden bg-muted/20">
          <ScrollArea className="h-full w-full">
            <div className="p-4">
              {selectedLog ? (
                <div className="rounded-md overflow-hidden border shadow-sm">
                  <SyntaxHighlighter 
                    language="json" 
                    style={vscDarkPlus}
                    customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.875rem' }}
                    wrapLongLines={true}
                  >
                    {formattedContent || ''}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <FileText className="h-12 w-12 mb-4 opacity-20" />
                  <p>Select a log file from the list to view its contents</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
