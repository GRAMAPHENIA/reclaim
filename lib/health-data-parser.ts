// Utility functions to parse and normalize health data from various sources

export interface HealthMetric {
  date: Date
  steps?: number
  heartRate?: number
  sleepDuration?: number
  sleepStage?: string
  calories?: number
  [key: string]: any
}

export interface ProcessedHealthData {
  steps: HealthMetric[]
  heartRate: HealthMetric[]
  sleep: HealthMetric[]
  calories: HealthMetric[]
}

// Detect and extract health metrics from JSON data
export function parseHealthJSON(jsonData: any): HealthMetric[] {
  const metrics: HealthMetric[] = []

  // Handle Samsung Health exercise format
  if (jsonData.type && jsonData.type.includes("samsung.health") && jsonData.live_data) {
    // Extract exercise-level data
    const exerciseDate = parseDate(jsonData.start_time)
    if (exerciseDate) {
      const exerciseMetric: HealthMetric = {
        date: exerciseDate,
        heartRate: jsonData.mean_heart_rate,
        calories: jsonData.calorie,
      }
      if (exerciseMetric.heartRate || exerciseMetric.calories) {
        metrics.push(exerciseMetric)
      }
    }

    // Extract live data points
    if (Array.isArray(jsonData.live_data)) {
      jsonData.live_data.forEach((item: any) => {
        const date = parseDate(item.timestamp)
        if (date && item.heart_rate) {
          metrics.push({
            date,
            heartRate: item.heart_rate,
          })
        }
      })
    }
  }

  // Handle Samsung Health format with metrics object
  else if (jsonData.metrics && typeof jsonData.metrics === "object") {
    const metricsObj = jsonData.metrics

    // Handle heart rate data in various formats
    const heartRateArrays = [
      metricsObj.heart_rate,
      metricsObj.heartRate,
      metricsObj.hr,
      metricsObj.pulse,
      metricsObj.bpm
    ].filter(Array.isArray)

    heartRateArrays.forEach(heartRateArray => {
      heartRateArray.forEach((item: any) => {
        const date = parseDate(item.timestamp || item.time || item.date)
        const heartRate = findNumericField(item, ["bpm", "heart_rate", "heartRate", "hr", "pulse", "value"])
        
        if (date && heartRate) {
          metrics.push({
            date,
            heartRate,
          })
        }
      })
    })

    // Process other metric types
    if (Array.isArray(metricsObj.steps)) {
      metricsObj.steps.forEach((item: any) => {
        const metric = extractMetric(item)
        if (metric) metrics.push(metric)
      })
    }

    if (Array.isArray(metricsObj.sleep)) {
      metricsObj.sleep.forEach((item: any) => {
        const metric = extractMetric(item)
        if (metric) metrics.push(metric)
      })
    }

    if (Array.isArray(metricsObj.calories)) {
      metricsObj.calories.forEach((item: any) => {
        const metric = extractMetric(item)
        if (metric) metrics.push(metric)
      })
    }
  }

  // Fallback to original parsing logic for other formats
  if (metrics.length === 0) {
    if (Array.isArray(jsonData)) {
      jsonData.forEach((item) => {
        const metric = extractMetric(item)
        if (metric) metrics.push(metric)
      })
    } else if (typeof jsonData === "object") {
      const extracted = extractFromNested(jsonData)
      metrics.push(...extracted)
    }
  }

  // Additional fallback: look for heart rate data in common Samsung Health structures
  if (jsonData.data && Array.isArray(jsonData.data)) {
    jsonData.data.forEach((item: any) => {
      const metric = extractMetric(item)
      if (metric) metrics.push(metric)
    })
  }

  // Look for direct heart rate arrays
  const possibleHRKeys = ['heart_rate', 'heartRate', 'hr_data', 'pulse_data', 'bpm_data']
  possibleHRKeys.forEach(key => {
    if (jsonData[key] && Array.isArray(jsonData[key])) {
      jsonData[key].forEach((item: any) => {
        const metric = extractMetric(item)
        if (metric) metrics.push(metric)
      })
    }
  })

  return metrics.sort((a, b) => a.date.getTime() - b.date.getTime())
}

function extractMetric(item: any): HealthMetric | null {
  const dateStr = findDateField(item)
  if (!dateStr) return null

  const date = parseDate(dateStr)
  if (!date) return null

  // Debug: Log Samsung Health format detection
  if (item.mStepCount !== undefined || item.mCalorie !== undefined || item.mStartTime !== undefined) {
    console.log('Detectado formato Samsung Health con campos m-prefixed:', Object.keys(item))
  } else if (item.heart_rate !== undefined && item.start_time !== undefined && item.elapsed_time !== undefined) {
    console.log('Detectado formato Samsung Health de ejercicio/ritmo cardíaco:', Object.keys(item))
  } else if (item.acc !== undefined && item.rri_info !== undefined) {
    console.log('Detectado formato Samsung Health avanzado con acelerómetro y RRI:', {
      acc_points: Array.isArray(item.acc) ? item.acc.length : 'N/A',
      rri_measurements: Array.isArray(item.rri_info) ? item.rri_info.length : 'N/A'
    })
  }

  // Get raw sleep duration and normalize it to minutes
  const rawSleepDuration = findNumericField(item, [
    "duration_minutes", 
    "sleep_duration", 
    "duration", 
    "sleep", 
    "sleep_time",
    "total_sleep_time",
    "sleep_length",
    "bedtime_duration",
    // Samsung Health m-prefixed fields
    "mSleepDuration", "mTotalSleepTime", "mSleepTime"
  ])
  const sleepDuration = rawSleepDuration ? normalizeSleepDuration(rawSleepDuration, item) : undefined

  return {
    date,
    steps: findNumericField(item, [
      "steps", "step_count", "count",
      // Samsung Health m-prefixed fields
      "mStepCount", "mWalkStepCount", "mRunStepCount", "mTotalStepCount"
    ]) || extractActivityFromAccelerometer(item),
    heartRate: findNumericField(item, [
      "heart_rate", "bpm", "hr", "heartRate", "pulse", "value", "rate",
      // Samsung Health m-prefixed fields
      "mHeartRate", "mBpm", "mPulse"
    ]) || extractHeartRateFromRRI(item),
    sleepDuration,
    sleepStage: findStringField(item, ["sleep_stage", "stage"]),
    calories: findNumericField(item, [
      "calories", "kcal", "energy",
      // Samsung Health m-prefixed fields
      "mCalorie", "mEnergy", "mKcal"
    ]),
  }
}

function extractFromNested(obj: any, path: string[] = []): HealthMetric[] {
  const metrics: HealthMetric[] = []

  for (const key in obj) {
    const value = obj[key]
    if (Array.isArray(value)) {
      value.forEach((item) => {
        const metric = extractMetric(item)
        if (metric) metrics.push(metric)
      })
    } else if (typeof value === "object" && value !== null) {
      metrics.push(...extractFromNested(value, [...path, key]))
    }
  }

  return metrics
}

function findDateField(obj: any): string | null {
  const dateKeys = [
    "date", "timestamp", "time", "create_time", "start_time", "end_time",
    // Samsung Health m-prefixed fields
    "mStartTime", "mEndTime", "mTime",
    // Samsung Health exercise/heart rate fields
    "elapsed_time"
  ]
  for (const key of dateKeys) {
    if (obj[key]) return obj[key]
  }
  return null
}

function parseDate(dateStr: any): Date | null {
  if (dateStr instanceof Date) return dateStr
  if (typeof dateStr === "number") return new Date(dateStr)
  if (typeof dateStr === "string") {
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? null : date
  }
  return null
}

function findNumericField(obj: any, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = obj[key]
    if (typeof value === "number" && value > 0) return value
    if (typeof value === "string") {
      const parsed = Number.parseFloat(value)
      if (!isNaN(parsed) && parsed > 0) return parsed
    }
  }
  return undefined
}

function findStringField(obj: any, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = obj[key]
    if (typeof value === "string") return value
  }
  return undefined
}

function extractHeartRateFromRRI(item: any): number | undefined {
  // Extract heart rate from RRI (RR interval) data
  if (item.rri_info && Array.isArray(item.rri_info)) {
    // RRI format appears to be [type, bpm, interval_ms]
    const rriData = item.rri_info
    if (rriData.length > 0) {
      // Calculate average BPM from RRI data
      const bpmValues = rriData
        .filter((rri: any) => Array.isArray(rri) && rri.length >= 2)
        .map((rri: any) => rri[1]) // Second element appears to be BPM
        .filter((bpm: any) => typeof bpm === 'number' && bpm > 0)
      
      if (bpmValues.length > 0) {
        const avgBpm = bpmValues.reduce((sum: number, bpm: number) => sum + bpm, 0) / bpmValues.length
        console.log(`Extraído ritmo cardíaco de RRI: ${Math.round(avgBpm)} BPM (${bpmValues.length} mediciones)`)
        return Math.round(avgBpm)
      }
    }
  }
  return undefined
}

function extractActivityFromAccelerometer(item: any): number | undefined {
  // Extract activity level from accelerometer data
  if (item.acc && Array.isArray(item.acc) && item.acc.length > 0) {
    // Calculate activity intensity from accelerometer variance
    const accData = item.acc.filter((val: any) => typeof val === 'number')
    if (accData.length >= 3) {
      // Simple activity estimation based on accelerometer variance
      const variance = accData.reduce((sum: number, val: number, idx: number) => {
        if (idx === 0) return 0
        return sum + Math.abs(val - accData[idx - 1])
      }, 0) / (accData.length - 1)
      
      // Convert variance to approximate step count (very rough estimation)
      const estimatedSteps = Math.min(Math.round(variance / 1000000), 100) // Cap at 100 steps per sample
      if (estimatedSteps > 0) {
        console.log(`Actividad estimada del acelerómetro: ${estimatedSteps} pasos (varianza: ${Math.round(variance)})`)
        return estimatedSteps
      }
    }
  }
  return undefined
}

function normalizeSleepDuration(duration: number, item: any): number {
  console.log(`🛌 Normalizando duración de sueño: ${duration}`)
  console.log(`📋 Campos disponibles:`, Object.keys(item))
  
  // If duration is 0 or negative, filter it out
  if (duration <= 0) {
    console.log(`❌ Duración inválida: ${duration}`)
    return 0
  }
  
  let normalizedMinutes = duration
  
  // Detect unit based on magnitude
  if (duration > 86400000) {
    // Very large numbers (> 86400000) are likely milliseconds
    normalizedMinutes = Math.round(duration / (1000 * 60))
    console.log(`🔄 Convertido de milisegundos: ${duration} -> ${normalizedMinutes}min (${(normalizedMinutes/60).toFixed(1)}h)`)
  } else if (duration > 86400) {
    // Large numbers (> 86400) might be milliseconds or microseconds
    normalizedMinutes = Math.round(duration / (1000 * 60))
    console.log(`🔄 Convertido de milisegundos: ${duration} -> ${normalizedMinutes}min (${(normalizedMinutes/60).toFixed(1)}h)`)
  } else if (duration > 1440) {
    // Numbers > 1440 are likely seconds
    normalizedMinutes = Math.round(duration / 60)
    console.log(`🔄 Convertido de segundos: ${duration} -> ${normalizedMinutes}min (${(normalizedMinutes/60).toFixed(1)}h)`)
  } else {
    // Numbers <= 1440 are likely already minutes
    console.log(`✅ Asumiendo minutos: ${duration}min (${(duration/60).toFixed(1)}h)`)
  }
  
  // Validate final result is reasonable (30 minutes to 16 hours)
  if (normalizedMinutes < 30 || normalizedMinutes > 960) {
    console.warn(`⚠️ Duración fuera de rango realista: ${normalizedMinutes}min (${(normalizedMinutes/60).toFixed(1)}h) - filtrando`)
    return 0
  }
  
  console.log(`✅ Duración normalizada: ${normalizedMinutes}min (${(normalizedMinutes/60).toFixed(1)}h)`)
  return normalizedMinutes
}

// Group metrics by date for daily aggregation
export function groupByDate(metrics: HealthMetric[]): Map<string, HealthMetric[]> {
  const grouped = new Map<string, HealthMetric[]>()

  metrics.forEach((metric) => {
    const dateKey = metric.date.toISOString().split("T")[0]
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, [])
    }
    grouped.get(dateKey)!.push(metric)
  })

  return grouped
}

// Calculate daily aggregates - but keep individual heart rate readings for better visualization
export function calculateDailyAggregates(metrics: HealthMetric[]): HealthMetric[] {
  // For heart rate, we want to keep individual readings, not just daily averages
  // So we'll return both aggregated daily summaries AND individual heart rate readings
  
  const grouped = groupByDate(metrics)
  const aggregates: HealthMetric[] = []

  grouped.forEach((dayMetrics, dateStr) => {
    const [year, month, day] = dateStr.split("-")
    const baseDate = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))

    const stepsValues = dayMetrics.map((m) => m.steps).filter((v): v is number => v !== undefined)
    const hrValues = dayMetrics.map((m) => m.heartRate).filter((v): v is number => v !== undefined)
    const sleepValues = dayMetrics.map((m) => m.sleepDuration).filter((v): v is number => v !== undefined)
    const calorieValues = dayMetrics.map((m) => m.calories).filter((v): v is number => v !== undefined)

    // Debug sleep values for this day
    if (sleepValues.length > 0) {
      console.log(`📅 ${dateStr}: ${sleepValues.length} valores de sueño encontrados:`, sleepValues.map(v => `${v}min (${(v/60).toFixed(1)}h)`))
    }

    // For sleep, we want the total sleep duration per day, not average
    // If there are multiple sleep sessions, we sum them (naps + main sleep)
    let dailySleep: number | undefined = undefined
    if (sleepValues.length > 0) {
      // Filter out unrealistic values (less than 30min or more than 16h)
      const validSleepValues = sleepValues.filter(v => v >= 30 && v <= 960)
      
      if (validSleepValues.length > 0) {
        // If there's only one value, use it. If multiple, sum them (could be naps + main sleep)
        dailySleep = validSleepValues.length === 1 
          ? validSleepValues[0] 
          : Math.round(validSleepValues.reduce((a, b) => a + b))
        
        console.log(`📊 ${dateStr}: Sueño total del día: ${dailySleep}min (${(dailySleep/60).toFixed(1)}h) - ${validSleepValues.length} sesiones`)
      }
    }

    // Add daily aggregate for steps, sleep, calories
    if (stepsValues.length || dailySleep !== undefined || calorieValues.length) {
      aggregates.push({
        date: baseDate,
        steps: stepsValues.length ? Math.round(stepsValues.reduce((a, b) => a + b) / stepsValues.length) : undefined,
        sleepDuration: dailySleep,
        calories: calorieValues.length ? Math.round(calorieValues.reduce((a, b) => a + b)) : undefined,
      })
    }

    // Add individual heart rate readings to preserve granularity
    dayMetrics.forEach(metric => {
      if (metric.heartRate !== undefined) {
        aggregates.push({
          date: metric.date,
          heartRate: metric.heartRate,
        })
      }
    })
  })

  return aggregates.sort((a, b) => a.date.getTime() - b.date.getTime())
}
