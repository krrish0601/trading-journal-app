import { useEffect, useState } from "react";
import { getDeviceId } from "@/lib/device-id";
import { trpc } from "@/lib/trpc";

/**
 * Custom hook to fetch trades for the current device
 * Handles device ID initialization and passes it to the query
 */
export function useDeviceTrades() {
  const [deviceId, setDeviceId] = useState<string>("");

  useEffect(() => {
    getDeviceId().then(setDeviceId).catch(console.error);
  }, []);

  const query = trpc.trades.list.useQuery(
    { deviceId },
    { enabled: !!deviceId }
  );

  return query;
}
