"use client"

import { useMemo } from "react"
import ReactECharts from "echarts-for-react"
import { useRemoteStorageContext } from "../contexts/RemoteStorageContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LogHeatmap() {
  const { logsList } = useRemoteStorageContext()

  const option = useMemo(() => {
    // 1. Parse timestamps and aggregate counts per day
    const counts = {}
    let minDate = new Date()
    let maxDate = new Date()
    
    // Initialize min/max with a reasonable range if no logs, or update from logs
    if (logsList.length > 0) {
      minDate = new Date(8640000000000000) // Max date
      maxDate = new Date(-8640000000000000) // Min date
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
        
        const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD
        counts[dateStr] = (counts[dateStr] || 0) + 1
      }
    })

    // If no data, show current year
    if (logsList.length === 0) {
      minDate = new Date(new Date().getFullYear(), 0, 1)
      maxDate = new Date(new Date().getFullYear(), 11, 31)
    }

    // Convert to array format for ECharts
    const data = Object.entries(counts).map(([date, count]) => [date, count])

    // Determine range for calendar
    // Ensure we show at least the current year or the range of data
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
        max: Math.max(...Object.values(counts), 5), // Dynamic max, at least 5
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        top: 'top',
        inRange: {
          color: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'] // GitHub-like colors
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

  if (logsList.length === 0) {
    return null
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Log Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ReactECharts option={option} style={{ height: '200px' }} />
      </CardContent>
    </Card>
  )
}
