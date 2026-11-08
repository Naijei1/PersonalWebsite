import { CloudWatchClient, GetMetricDataCommand } from '@aws-sdk/client-cloudwatch'
import { fromNodeProviderChain } from '@aws-sdk/credential-providers'
import { HOSTING_REGION, type MetricQuerier } from './hosting.js'

export function createCloudWatchQuerier(): MetricQuerier {
  const client = new CloudWatchClient({
    region: HOSTING_REGION,
    maxAttempts: 2,
    credentials: fromNodeProviderChain(),
  })
  return async (input) => {
    const output = await client.send(
      new GetMetricDataCommand({
        StartTime: input.start,
        EndTime: input.end,
        MaxDatapoints: 200,
        MetricDataQueries: input.queries.map((query) => ({
          Id: query.id,
          MetricStat: {
            Metric: {
              Namespace: query.namespace,
              MetricName: query.metricName,
              Dimensions: [{ Name: query.dimensionName, Value: query.dimensionValue }],
            },
            Period: query.period,
            Stat: query.stat,
          },
        })),
      }),
      { abortSignal: AbortSignal.timeout(8000) },
    )
    return (output.MetricDataResults ?? []).map((result) => {
      if (result.StatusCode && result.StatusCode !== 'Complete') {
        throw new Error('CloudWatch metric result was not complete')
      }
      const timestamps = result.Timestamps ?? []
      const values = result.Values ?? []
      const points = []
      for (let index = 0; index < timestamps.length; index += 1) {
        const timestamp = timestamps[index]
        const value = values[index]
        if (!timestamp || value === undefined) continue
        points.push({ timestamp: timestamp.toISOString(), value })
      }
      return { id: result.Id ?? '', points }
    })
  }
}
