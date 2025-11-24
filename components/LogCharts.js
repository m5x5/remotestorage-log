"use client"

import { useState, useMemo, useEffect } from "react"
import ReactECharts from "echarts-for-react"
import { useRemoteStorageContext } from "../contexts/RemoteStorageContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

export default function LogCharts() {
  const { logsList, analyticsData, isAnalyticsLoading, loadAnalyticsData } = useRemoteStorageContext()
  const [activeTab, setActiveTab] = useState("activity")

  // --- Heatmap Logic ---
  const heatmapOption = useMemo(() => {
    // ... (heatmap logic remains same, just ensuring it's not touched by this replacement if possible, but for replace_file_content I need to provide the block)
    // Actually, I will just replace the component body logic
    const counts = {}
    let minDate = new Date()
    let maxDate = new Date()
    
    if (logsList.length > 0) {
      minDate = new Date(8640000000000000)
      maxDate = new Date(-8640000000000000)
    }

    logsList.forEach(log => {
      let timestamp = null
      const match = log.name.match(/log-(\d+)-/)
      if (match && match[1]) {
        timestamp = parseInt(match[1], 10)
      } else if (log.lastUpdated) {
        timestamp = new Date(log.lastUpdated).getTime()
      }

      if (timestamp) {
        const date = new Date(timestamp)
        if (date < minDate) minDate = date
        if (date > maxDate) maxDate = date
        
        const dateStr = date.toISOString().split('T')[0]
        counts[dateStr] = (counts[dateStr] || 0) + 1
      }
    })

    if (logsList.length === 0) {
      minDate = new Date(new Date().getFullYear(), 0, 1)
      maxDate = new Date(new Date().getFullYear(), 11, 31)
    }

    const data = Object.entries(counts).map(([date, count]) => [date, count])
    const startYear = minDate.getFullYear()
    const endYear = maxDate.getFullYear()
    const range = startYear === endYear ? startYear : [startYear, endYear]

    return {
      tooltip: {
        position: 'top',
        formatter: function (p) {
          const format = p.data[0];
          return format + ': ' + p.data[1] + ' logs';
        }
      },
      visualMap: {
        min: 0,
        max: Math.max(...Object.values(counts), 5),
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        top: 'top',
        inRange: {
          color: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127']
        }
      },
      calendar: {
        top: 60,
        left: 30,
        right: 30,
        cellSize: ['auto', 13],
        range: range,
        itemStyle: {
          borderWidth: 0.5
        },
        yearLabel: { show: false }
      },
      series: {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: data
      }
    }
  }, [logsList])

  // --- Log Types Logic ---
  useEffect(() => {
    if (activeTab === "types") {
      loadAnalyticsData()
    }
  }, [activeTab, loadAnalyticsData])

  const typesOption = useMemo(() => {
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      series: [
        {
          type: 'treemap',
          data: analyticsData || [],
          label: {
            show: true,
            formatter: '{b}\n{c}'
          },
          breadcrumb: { show: false },
          itemStyle: {
            borderColor: '#fff'
          },
          levels: [
            {
              itemStyle: {
                borderWidth: 0,
                gapWidth: 1
              }
            }
          ]
        }
      ]
    }
  }, [analyticsData])


  if (logsList.length === 0) {
    return null
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Log Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="activity" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="types">Log Types</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activity">
            <ReactECharts option={heatmapOption} style={{ height: '200px' }} />
          </TabsContent>
          
          <TabsContent value="types">
            {isAnalyticsLoading && !analyticsData ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Analyzing logs...</span>
              </div>
            ) : (
              <ReactECharts option={typesOption} style={{ height: '300px' }} />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
