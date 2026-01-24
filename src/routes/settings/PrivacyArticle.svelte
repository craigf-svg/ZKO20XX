<script>
const exampleData = `{
  timestamp: "2025-07-28 15:34:44",
  user_id: "C4B2",
  session_id: "1337149",
  event_name: "app_start",
  string_props: {},
  numeric_props: {},
  os_name: "Windows",
  os_version: "10.0.1",
  locale: "en-us",
  app_version: "0.1.0",
  app_build_number: "",
  engine_name: "WebView2",
  engine_version: "138.0.335",
  country_code: "US",
  country_name: "United States",
  region_name: "Iowa"
}`;
</script>

<article>
    <p class="text-s">
        If enabled, I collect minimal anonymous analytics via Aptabase to better
        understand app usage and share aggregated metrics with the community.
    </p>
    <div class="p-3 rounded text-sm">
        <p class="font-semibold mb-2">Exact data collected:</p>
        <pre class="bg-gray-900 text-green-300 text-xs border border-gray-800 p-2 font-mono leading-tight overflow-x-auto rounded">{exampleData}</pre>
    </div>
    <div class="text-sm space-y-1">
        <p>
            <strong>✓</strong> No personal data, IP addresses, or device identifiers
            collected
        </p>
        <p>
            <strong>✓</strong> User ID is a daily-changing hashed value for privacy
        </p>
        <p>
            <strong>✓</strong> Only two events tracked: app_start + app_exit
        </p>
    </div>
</article>
