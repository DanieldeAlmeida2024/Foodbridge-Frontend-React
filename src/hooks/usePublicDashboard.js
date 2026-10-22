import { useEffect, useState } from "react";
import api from "../api/client";

export default function usePublicDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    api.get("/dashboards/publico", { signal: controller.signal })
      .then(response => { if (!controller.signal.aborted) setData(response.data); })
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [revision]);

  return { data, loading, error, refresh: () => setRevision(value => value + 1) };
}
