


//updated 20 feb
// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox";
// import { StatusBadge } from "@/components/StatusBadge";
// import { SelectTargetModal } from "@/components/modals/SelectTargetModal";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { useToast } from "@/hooks/use-toast";
// import { useDatabricksCredentials } from "@/contexts/DatabricksCredentialsContext";
// import type { Status } from "@/types/migration";

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from "@/components/ui/tabs";
// import {
//   Search,
//   Filter,
//   CheckCircle2,
//   Database,
//   BookOpen,
//   Briefcase,
//   ArrowRight,
//   X,
//   ChevronRight,
//   ChevronLeft,
//   Layers,
//   LogOut,
//   Server,
//   Loader2,
//   AlertCircle,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { useFabricCredentials } from "@/contexts/FabricCredentialsContext";
// import { ConnectFabricModal } from "@/components/modals/ConnectFabricModal";

// interface DatabricksMigrationWorkspaceProps {
//   onLogout: () => void;
//   onBack: () => void;
//   onMigrationComplete: (items: any[]) => void;
//   onMigrationUpdate: (updateFn: (prev: any[]) => any[]) => void;
//   onWorkspaceSelected: (workspaceId: string) => void
//   apiResponse: {
//     counts: {
//       notebooks: number;
//       folders: number;
//       jobs: number;
//       clusters: number;
//     };
//     notebooks: any[];
//     folders: any[];
//     jobs: any[];
//     clusters: any[];
//   };
// }

// type TabType = "jobs" | "notebooks" | "clusters";

// const inventoryItems = [
//   { id: "jobs", label: "Jobs", icon: Briefcase },
//   { id: "notebooks", label: "Notebooks", icon: BookOpen },
//   { id: "clusters", label: "Clusters", icon: Server },
// ];

// export function DatabricksMigrationWorkspace({
//   onLogout,
//   onBack,
//   onMigrationComplete,
//   onMigrationUpdate,
//   onWorkspaceSelected,
//   apiResponse
// }: DatabricksMigrationWorkspaceProps) {
//   const { toast } = useToast();
//   const { credentials: databricksCredentials } = useDatabricksCredentials();
//   const { credentials: fabricCredentials, setCredentials: setFabricCredentials } = useFabricCredentials();

//   const transformedJobs = (apiResponse?.jobs || []).map((job: any, index: number) => ({
//     id: job.job_id?.toString() || index.toString(),
//     name: job.settings?.name || `Job ${index + 1}`,
//     schedule: job.settings?.schedule?.quartz_cron_expression ||
//       job.settings?.trigger?.pause_status || "Manual",
//     lastRun: job.last_run?.start_time ?
//       new Date(job.last_run.start_time).toLocaleString() : "N/A",
//     cluster: job.settings?.tasks?.[0]?.existing_cluster_id ||
//       job.settings?.job_clusters?.[0]?.new_cluster?.cluster_name ||
//       job.settings?.new_cluster?.cluster_name || "N/A",
//     status: (job.last_run?.state?.life_cycle_state === "TERMINATED" &&
//       job.last_run?.state?.result_state === "SUCCESS") ? "Success" :
//       job.last_run?.state?.life_cycle_state === "RUNNING" ? "Running" :
//         job.last_run?.state?.result_state === "FAILED" ? "Failed" : "Ready" as Status,
//   }));

//   const transformedNotebooks = (apiResponse?.notebooks || []).map((notebook: any, index: number) => ({
//     id: index.toString(),
//     name: notebook.name || notebook.path?.split('/').pop() || `Notebook ${index + 1}`,
//     language: notebook.language || "Unknown",
//     lastModified: "N/A",
//     path: notebook.path || "/",
//     status: "Ready" as Status,
//   }));

//   const transformedClusters = (apiResponse?.clusters || []).map((cluster: any, index: number) => ({
//     id: cluster.cluster_id || index.toString(),
//     name: cluster.cluster_name || `Cluster ${index + 1}`,
//     type: cluster.cluster_source || "Interactive",
//     state: cluster.state || "Unknown",
//     runtime: cluster.spark_version || "N/A",
//     workers: cluster.num_workers !== undefined ? cluster.num_workers.toString() : "N/A",
//     status: "Ready" as Status,
//   }));

//   const [activeTab, setActiveTab] = useState<TabType>("jobs");
//   const [selectedItems, setSelectedItems] = useState<Record<TabType, string[]>>({
//     jobs: [],
//     notebooks: [],
//     clusters: [],
//   });
//   const [showReview, setShowReview] = useState(false);
//   const [showTargetModal, setShowTargetModal] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState<string>("all");
//   const [showStatusMenu, setShowStatusMenu] = useState(false);
//   const [isMigrating, setIsMigrating] = useState(false);
//   const [showFabricModal, setShowFabricModal] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [rowsPerPage, setRowsPerPage] = useState(10);

//   const paginateData = (data: any[]) => {
//     const startIndex = (currentPage - 1) * rowsPerPage;
//     return data.slice(startIndex, startIndex + rowsPerPage);
//   };

//   // Reset to page 1 when switching tabs
//   const handleTabChange = (tab: TabType) => {
//     setActiveTab(tab);
//     setCurrentPage(1);
//   };

//   const handleFabricConnect = (apiResponse: any) => {
//     setShowFabricModal(false);
//     setShowReview(true);
//   };

//   const handleMigrateClick = () => {
//     const selectedDetails = getSelectedItemDetails();
//     const hasNotebooks = selectedDetails.some(item => item.type === "Notebook");
//     const hasJobs = selectedDetails.some(item => item.type === "Job");
//     const hasClusters = selectedDetails.some(item => item.type === "Cluster");

//     if (!hasNotebooks && !hasJobs && !hasClusters) {
//       toast({
//         title: "No Items Selected",
//         description: "Please select at least one item to migrate.",
//         variant: "destructive",
//       });
//       return;
//     }

//     if (!fabricCredentials) {
//       setShowFabricModal(true);
//     } else {
//       setShowReview(true);
//     }
//   };

//   const toggleSelection = (tab: TabType, id: string) => {
//     setSelectedItems((prev) => ({
//       ...prev,
//       [tab]: prev[tab].includes(id)
//         ? prev[tab].filter((i) => i !== id)
//         : [...prev[tab], id],
//     }));
//   };

//   const toggleAll = (tab: TabType, items: { id: string }[]) => {
//     const allIds = items.map((i) => i.id);
//     const allSelected = allIds.every((id) => selectedItems[tab].includes(id));
//     setSelectedItems((prev) => ({
//       ...prev,
//       [tab]: allSelected ? [] : allIds,
//     }));
//   };

//   const filterItems = <T extends Record<string, any>>(items: T[]) => {
//     return items.filter((item) => {
//       const searchableFields = Object.values(item).join(' ').toLowerCase();
//       const matchesSearch = searchableFields.includes(searchQuery.toLowerCase());

//       const matchesStatus = statusFilter === "all" || item.status === statusFilter;
//       return matchesSearch && matchesStatus;
//     });
//   };

//   const filteredJobs = filterItems(transformedJobs);
//   const filteredNotebooks = filterItems(transformedNotebooks);
//   const filteredClusters = filterItems(transformedClusters);

//   const statusOptions = ["all", "Success", "Running", "Failed", "Ready"];

//   const totalSelected =
//     selectedItems.jobs.length +
//     selectedItems.notebooks.length +
//     selectedItems.clusters.length;

//   const getSelectedItemDetails = () => {
//     const items: any[] = [];
//     selectedItems.jobs.forEach((id) => {
//       const item = transformedJobs.find((j) => j.id === id);
//       if (item) items.push({ ...item, type: "Job", source: "databricks" });
//     });
//     selectedItems.notebooks.forEach((id) => {
//       const item = transformedNotebooks.find((n) => n.id === id);
//       if (item) items.push({ ...item, type: "Notebook", source: "databricks" });
//     });
//     selectedItems.clusters.forEach((id) => {
//       const item = transformedClusters.find((c) => c.id === id);
//       if (item) items.push({ ...item, type: "Cluster", source: "databricks" });
//     });
//     return items;
//   };

//   const removeFromSelection = (type: string, id: string) => {
//     const tabMap: Record<string, TabType> = {
//       Job: "jobs",
//       Notebook: "notebooks",
//       Cluster: "clusters",
//     };
//     const tab = tabMap[type];
//     if (tab) {
//       setSelectedItems((prev) => ({
//         ...prev,
//         [tab]: prev[tab].filter((i) => i !== id),
//       }));
//     }
//   };

//   const migrateNotebooks = async (workspace: any, notebooks: any[], replaceIfExists: boolean = false) => {
//     const payload = {
//       tenantId: fabricCredentials!.tenantId,
//       clientId: fabricCredentials!.clientId,
//       clientSecret: fabricCredentials!.clientSecret,
//       workspaceId: workspace.id,
//       databricksUrl: databricksCredentials!.databricksUrl,
//       personalAccessToken: databricksCredentials!.personalAccessToken,
//       replaceIfExists: replaceIfExists,
//       notebooks: notebooks.map(nb => ({
//         name: nb.name,
//         path: nb.path
//       }))
//     };

//     console.log("📤 Notebook migration payload:", payload);

//     try {
//       const response = await fetch(
//         "https://20.106.196.248/DbMigrateNotebooks",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(payload),
//         }
//       );

//       console.log(`📥 Notebook API Response Status: ${response.status} ${response.statusText}`);

//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error(`❌ Notebook API Error Response:`, errorText);
//         throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`);
//       }

//       const result = await response.json();
//       console.log("📊 Notebook migration result:", JSON.stringify(result, null, 2));

//       // ✅ VALIDATE RESPONSE STRUCTURE
//       if (!result.details || !Array.isArray(result.details)) {
//         console.error("❌ Invalid response structure:", result);
//         throw new Error(`Invalid API response: missing 'details' array`);
//       }

//       // ✅ PROCESS EACH NOTEBOOK with field preservation
//       notebooks.forEach(item => {
//         const detail = result.details.find((d: any) => d.name === item.name);

//         let status: Status = "Success";
//         let errorMessage: string | undefined = undefined;
//         let runId: string | undefined = undefined;  // ✅ ADD THIS

//         if (detail) {
//           console.log(`Processing notebook "${item.name}" with status: ${detail.status}`);

//           runId = detail.run_id || result.run_id;  // ✅ CAPTURE run_id from detail or root level

//           // ✅ HANDLE ALL STATUS CASES
//           if (detail.status === "created") {
//             status = "Success";
//           } else if (detail.status === "replaced") {
//             status = "Replaced";
//           } else if (detail.status === "already-exists") {
//             status = "Failed";
//             errorMessage = "already exists";
//           } else if (detail.status === "skipped") {
//             status = "Skipped";
//             errorMessage = "already exists";
//           } else if (detail.status === "failed") {
//             status = "Failed";
//             errorMessage = detail.error || "Migration failed";
//           } else if (detail.status === "export-failed") {
//             status = "Failed";
//             errorMessage = detail.error || "Failed to export from Databricks";
//           } else if (detail.status === "invalid-input") {
//             status = "Failed";
//             errorMessage = "Invalid notebook name or path";
//           } else {
//             console.warn(`⚠️ Unknown status "${detail.status}" for notebook "${item.name}"`);
//             status = "Failed";
//             errorMessage = `Unknown status: ${detail.status}`;
//           }
//         } else {
//           console.error(`⚠️ Notebook "${item.name}" not found in API response`);
//           status = "Failed";
//           errorMessage = "Not returned in API response";
//           runId = result.run_id;  // ✅ Still save root-level run_id even if detail missing
//         }

//         console.log(`📝 Updating notebook "${item.name}" with runId:`, runId);  // ✅ DEBUG LOG

//         // ✅ CRITICAL: Preserve ALL fields when updating + ADD runId
//         onMigrationUpdate((prevItems) =>
//           prevItems.map(prevItem =>
//             prevItem.id === item.id
//               ? {
//                 ...prevItem,
//                 status,
//                 errorMessage,
//                 runId,  // ✅ ADD THIS
//                 targetWorkspace: workspace.name
//               }
//               : prevItem
//           )
//         );
//       });

//       return null;

//     } catch (error) {
//       console.error("💥 Notebook migration error:", error);
//       throw error;
//     }
//   };

// const migrateJobs = async (workspace: any, jobs: any[]) => {
//   const payload = {
//     tenantId: fabricCredentials!.tenantId,
//     clientId: fabricCredentials!.clientId,
//     clientSecret: fabricCredentials!.clientSecret,
//     workspaceId: workspace.id,
//     databricksUrl: databricksCredentials!.databricksUrl,
//     personalAccessToken: databricksCredentials!.personalAccessToken,
//     jobid: jobs.map(job => job.id)
//   };

//   console.log("📤 Job migration payload:", payload);

//   try {
//     // Step 1: Start the durable orchestration
//     const startResponse = await fetch(
//       "https://20.106.196.248/MigrateJobsHttpStarter",
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       }
//     );

//     if (!startResponse.ok) {
//       const errorText = await startResponse.text();
//       throw new Error(`Failed to start job migration: HTTP ${startResponse.status}: ${errorText.substring(0, 200)}`);
//     }

//     const orchestrationInfo = await startResponse.json();
//     const statusQueryUri = orchestrationInfo.statusQueryGetUri;

//     if (!statusQueryUri) {
//       throw new Error("No statusQueryGetUri returned from orchestration starter");
//     }

//     console.log(`🚀 Job migration orchestration started. Instance ID: ${orchestrationInfo.instanceId}`);
//     console.log(`🔍 Polling status at: ${statusQueryUri}`);

//     // Step 2: Poll until completed
//     const MAX_POLLS = 120;       // 10 minutes max (120 * 5s)
//     const POLL_INTERVAL_MS = 5000;

//     let result: any = null;

//     for (let attempt = 1; attempt <= MAX_POLLS; attempt++) {
//       await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));

//       const statusResponse = await fetch(statusQueryUri);

//       if (!statusResponse.ok) {
//         console.warn(`⚠️ Poll attempt ${attempt} failed: HTTP ${statusResponse.status}`);
//         continue;
//       }

//       const statusData = await statusResponse.json();
//       console.log(`📊 Poll ${attempt}: runtimeStatus = ${statusData.runtimeStatus}`);

//       if (statusData.runtimeStatus === "Completed") {
//         result = statusData.output;
//         console.log("✅ Orchestration completed:", JSON.stringify(result, null, 2));
//         break;
//       } else if (statusData.runtimeStatus === "Failed" || statusData.runtimeStatus === "Terminated") {
//         throw new Error(`Job migration orchestration ${statusData.runtimeStatus.toLowerCase()}`);
//       }
//       // runtimeStatus === "Running" or "Pending" — keep polling
//     }

//     if (!result) {
//       throw new Error("Job migration timed out after polling");
//     }

//     // Step 3: Process results (same logic as before)
//     if (!result || typeof result !== 'object') {
//       throw new Error(`Invalid API response: expected object, got ${typeof result}`);
//     }

//     jobs.forEach(item => {
//       const createdDetail = result.created?.find((d: any) => d.job_id === item.id);
//       const existsDetail = result.already_exist?.find((d: any) => d.job_id === item.id);
//       const failedDetail = result.failed?.find((d: any) => d.job_id === item.id);

//       let status: Status = "Failed";
//       let errorMessage: string | undefined = undefined;
//       let fabricPipelineId: string | undefined = undefined;
//       let runId: string | undefined = undefined;

//       if (createdDetail) {
//         status = "Success";
//         fabricPipelineId = createdDetail.fabric_pipeline_id;
//         runId = createdDetail.run_id;
//         console.log(`✅ Job "${item.name}" - Success with runId:`, runId);
//       } else if (existsDetail) {
//         status = "Failed";
//         errorMessage = "already exists";
//         fabricPipelineId = existsDetail.pipeline_id;
//         runId = existsDetail.run_id;
//         console.log(`⚠️ Job "${item.name}" - Already exists with runId:`, runId);
//       } else if (failedDetail) {
//         status = "Failed";
//         errorMessage = failedDetail.error || "Migration failed";
//         runId = failedDetail.run_id;
//         console.log(`❌ Job "${item.name}" - Failed with runId:`, runId, "Error:", errorMessage);
//       } else {
//         console.error(`⚠️ Job "${item.name}" (${item.id}) not found in any response array`);
//         errorMessage = "Not returned in API response";
//       }

//       console.log(`📝 Updating job "${item.name}" with:`, { status, errorMessage, runId, fabricPipelineId });

//       onMigrationUpdate((prevItems) =>
//         prevItems.map(prevItem =>
//           prevItem.id === item.id
//             ? { ...prevItem, status, errorMessage, fabricPipelineId, runId, targetWorkspace: workspace.name }
//             : prevItem
//         )
//       );
//     });

//     return null;

//   } catch (error) {
//     console.error("💥 Job migration error:", error);
//     throw error;
//   }
// };

// const migrateClusters = async (workspace: any, clusters: any[], capacityId: string) => {
//     const payload = {
//       databricks: {
//         host: databricksCredentials!.databricksUrl,
//         pat: databricksCredentials!.personalAccessToken
//       },
//       fabric: {
//         tenantId: fabricCredentials!.tenantId,
//         clientId: fabricCredentials!.clientId,
//         clientSecret: fabricCredentials!.clientSecret,
//         capacityId: capacityId,
//         workspaceId: workspace.id
//       },
//       selectedClusters: clusters.map(cluster => cluster.id)
//     };

//     console.log("📤 Cluster migration payload:", payload);

//     try {
//       const response = await fetch(
//         "https://20.106.196.248/DbClusterMigration",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(payload),
//         }
//       );

//       console.log(`📥 Cluster API Response Status: ${response.status} ${response.statusText}`);

//       // ✅ FIX: Try to parse JSON even on non-OK responses
//       let result;
//       const responseText = await response.text();

//       try {
//         result = JSON.parse(responseText);
//         console.log("📊 Cluster migration result:", JSON.stringify(result, null, 2));
//       } catch (parseError) {
//         console.error("❌ Failed to parse response as JSON:", responseText);
//         throw new Error(`HTTP ${response.status}: ${responseText.substring(0, 200)}`);
//       }

//       if (!result || typeof result !== 'object') {
//         console.error("❌ Invalid response structure:", result);
//         throw new Error(`Invalid API response: expected object, got ${typeof result}`);
//       }

//       // ✅ PROCESS EACH CLUSTER
//       clusters.forEach(item => {
//         // ✅ FIX: Find this cluster in Success array (returns full object with run_id)
//         const successDetail = result.Success?.find((successItem: any) => {
//           // Handle both string and object responses
//           if (typeof successItem === 'string') {
//             return successItem === item.name || successItem === item.id;
//           }
//           return successItem.name === item.name || successItem.name === item.id;
//         });

//         const failedDetail = result.Failed?.find((f: any) =>
//           f.name === item.name || f.name === item.id
//         );

//         let status: Status = "Failed";
//         let errorMessage: string | undefined = undefined;
//         let runId: string | undefined = undefined;

//         if (successDetail) {
//           console.log(`✅ Cluster "${item.name}" migrated successfully`);
//           status = "Success";
//           // ✅ CRITICAL FIX: Get run_id from the Success detail object
//           runId = typeof successDetail === 'object' ? successDetail.run_id : undefined;
//           console.log(`✅ Cluster "${item.name}" - Success with runId:`, runId);
//         } else if (failedDetail) {
//           console.error(`❌ Cluster "${item.name}" failed:`, failedDetail.message);
//           status = "Failed";

//           // ✅ CLEAN ERROR MESSAGE: Extract only the key part
//           const rawMessage = failedDetail.message || "Migration failed";
//           if (rawMessage.toLowerCase().includes("already exists")) {
//             errorMessage = "already exists";
//           } else {
//             errorMessage = rawMessage;
//           }

//           // ✅ CRITICAL FIX: Get run_id from the Failed detail object
//           runId = failedDetail.run_id;
//           console.log(`❌ Cluster "${item.name}" - Failed with runId:`, runId);
//         } else {
//           console.error(`⚠️ Cluster "${item.name}" (${item.id}) not found in API response`);
//           errorMessage = "Not returned in API response";
//           // No run_id available if not in either array
//         }

//         console.log(`📝 Updating cluster "${item.name}" with:`, {
//           status,
//           errorMessage,
//           runId,
//           targetWorkspace: workspace.name
//         });

//         // ✅ CRITICAL: Preserve ALL fields when updating
//         onMigrationUpdate((prevItems) =>
//           prevItems.map(prevItem =>
//             prevItem.id === item.id
//               ? {
//                 ...prevItem,  // ✅ Spread first - keeps runtime, workers, type, etc
//                 status,
//                 errorMessage,
//                 runId,  // ✅ CRITICAL: Must include runId
//                 targetWorkspace: workspace.name
//               }
//               : prevItem
//           )
//         );
//       });

//       return null;

//     } catch (error) {
//       console.error("💥 Cluster migration error:", error);
//       throw error;
//     }
//   };

//   const handleStartMigration = async (workspace: any) => {
//     const selectedDetails = getSelectedItemDetails();
//     const notebooksToMigrate = selectedDetails.filter(item => item.type === "Notebook");
//     const jobsToMigrate = selectedDetails.filter(item => item.type === "Job");
//     const clustersToMigrate = selectedDetails.filter(item => item.type === "Cluster");

//     if (notebooksToMigrate.length === 0 && jobsToMigrate.length === 0 && clustersToMigrate.length === 0) {
//       toast({
//         title: "No Items Selected",
//         description: "Please select at least one item to migrate.",
//         variant: "destructive",
//       });
//       return;
//     }

//     if (!databricksCredentials?.databricksUrl || !databricksCredentials?.personalAccessToken) {
//       toast({
//         title: "Missing Databricks Credentials",
//         description: "Databricks credentials not found. Please reconnect.",
//         variant: "destructive",
//       });
//       return;
//     }

//     if (!fabricCredentials?.tenantId || !fabricCredentials?.clientId || !fabricCredentials?.clientSecret) {
//       toast({
//         title: "Missing Fabric Credentials",
//         description: "Fabric credentials not found. Please connect to Fabric.",
//         variant: "destructive",
//       });
//       return;
//     }

//     onWorkspaceSelected(workspace.id);

//     setIsMigrating(true);
//     setShowTargetModal(false);

//     // Step 1: Create initial items with "Running" status
//     const allItemsToMigrate = [...notebooksToMigrate, ...jobsToMigrate, ...clustersToMigrate];
//     const initialMigrationItems = allItemsToMigrate.map(item => ({
//       ...item,
//       targetWorkspace: workspace.name,
//       targetWorkspaceId: workspace.id,
//       status: "Running" as const,
//     }));
//     // ✅ ADD THIS DEBUG LOG
//     console.log("🚀 Initial migration items created:", initialMigrationItems.length);
//     console.log("Items:", initialMigrationItems);
//     // Step 2: Navigate to report immediately with "Running" status
//     console.log("📤 Calling onMigrationComplete with items:", initialMigrationItems.length);
//     onMigrationComplete(initialMigrationItems);
//     console.log("✅ onMigrationComplete called");

//     // Step 3: Start migrations in parallel
//     try {
//       console.log("🚀 Starting migrations:", {
//         notebooks: notebooksToMigrate.length,
//         jobs: jobsToMigrate.length,
//         clusters: clustersToMigrate.length
//       });

//       const results = await Promise.allSettled([
//         notebooksToMigrate.length > 0 ? migrateNotebooks(workspace, notebooksToMigrate, false) : Promise.resolve(null),
//         jobsToMigrate.length > 0 ? migrateJobs(workspace, jobsToMigrate) : Promise.resolve(null),
//         clustersToMigrate.length > 0 ? migrateClusters(workspace, clustersToMigrate, workspace.capacity) : Promise.resolve(null)
//       ]);

//       const [notebookResult, jobResult, clusterResult] = results;

//       console.log("📊 Migration results:", {
//         notebooks: notebookResult.status,
//         jobs: jobResult.status,
//         clusters: clusterResult.status
//       });

//       // ✅ IMPROVED: Handle rejected promises with detailed error messages
//       if (notebookResult.status === 'rejected') {
//         console.error("❌ Notebook migration promise rejected:", notebookResult.reason);
//         const errorMsg = notebookResult.reason instanceof Error
//           ? notebookResult.reason.message
//           : String(notebookResult.reason);

//         notebooksToMigrate.forEach(item => {
//           onMigrationUpdate((prevItems) =>
//             prevItems.map(prevItem =>
//               prevItem.id === item.id
//                 ? {
//                   ...prevItem,
//                   status: "Failed" as const,
//                   errorMessage: errorMsg.substring(0, 200), // Truncate long errors
//                   targetWorkspace: workspace.name
//                 }
//                 : prevItem
//             )
//           );
//         });
//       }

//       if (jobResult.status === 'rejected') {
//         console.error("❌ Job migration promise rejected:", jobResult.reason);
//         const errorMsg = jobResult.reason instanceof Error
//           ? jobResult.reason.message
//           : String(jobResult.reason);

//         jobsToMigrate.forEach(item => {
//           onMigrationUpdate((prevItems) =>
//             prevItems.map(prevItem =>
//               prevItem.id === item.id
//                 ? {
//                   ...prevItem,
//                   status: "Failed" as const,
//                   errorMessage: errorMsg.substring(0, 200),
//                   targetWorkspace: workspace.name
//                 }
//                 : prevItem
//             )
//           );
//         });
//       }

//       if (clusterResult.status === 'rejected') {
//         console.error("❌ Cluster migration promise rejected:", clusterResult.reason);
//         const errorMsg = clusterResult.reason instanceof Error
//           ? clusterResult.reason.message
//           : String(clusterResult.reason);

//         clustersToMigrate.forEach(item => {
//           onMigrationUpdate((prevItems) =>
//             prevItems.map(prevItem =>
//               prevItem.id === item.id
//                 ? {
//                   ...prevItem,
//                   status: "Failed" as const,
//                   errorMessage: errorMsg.substring(0, 200),
//                   targetWorkspace: workspace.name
//                 }
//                 : prevItem
//             )
//           );
//         });
//       }

//       // Show completion toast
//       const hasFailures = notebookResult.status === 'rejected' ||
//         jobResult.status === 'rejected' ||
//         clusterResult.status === 'rejected';

//       toast({
//         title: hasFailures ? "Migration Completed with Errors" : "Migration Complete",
//         description: hasFailures
//           ? "Some migrations failed. Check the report for details."
//           : "Check the report for detailed results",
//         variant: hasFailures ? "destructive" : "default"
//       });

//     } catch (error) {
//       console.error("💥 Unexpected migration error:", error);

//       // Update all items to Failed status
//       allItemsToMigrate.forEach(item => {
//         onMigrationUpdate((prevItems) =>
//           prevItems.map(prevItem =>
//             prevItem.id === item.id
//               ? {
//                 ...prevItem,
//                 status: "Failed" as const,
//                 errorMessage: error instanceof Error ? error.message : "An unexpected error occurred",
//                 targetWorkspace: workspace.name
//               }
//               : prevItem
//           )
//         );
//       });

//       toast({
//         title: "Migration Failed",
//         description: error instanceof Error ? error.message : "An unexpected error occurred during migration",
//         variant: "destructive",
//       });
//     } finally {
//       setIsMigrating(false);
//     }
//   };


//   const totalAssets = transformedJobs.length + transformedNotebooks.length + transformedClusters.length;

//   if (showReview) {
//     const selectedDetails = getSelectedItemDetails();
//     const hasNotebooks = selectedDetails.some(item => item.type === "Notebook");
//     const hasJobs = selectedDetails.some(item => item.type === "Job");
//     const hasClusters = selectedDetails.some(item => item.type === "Cluster");

//     return (
//       <div className="min-h-screen bg-background">
//         <main className="p-6 max-w-4xl mx-auto animate-fade-in">
//           <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
//             <button onClick={() => setShowReview(false)} className="hover:text-foreground">
//               Discovery Results
//             </button>
//             <ChevronRight className="w-4 h-4" />
//             <span className="text-foreground font-medium">Review Selection</span>
//           </div>

//           <Card>
//             <CardHeader>
//               <CardTitle>Review Selected Items</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               {!hasNotebooks && !hasJobs && !hasClusters && (
//                 <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-600">
//                   <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
//                   <p>Please select at least one item to migrate.</p>
//                 </div>
//               )}

//               {selectedItems.jobs.length > 0 && (
//                 <div>
//                   <h4 className="font-medium mb-3 flex items-center gap-2">
//                     <Briefcase className="w-4 h-4 text-primary" />
//                     Jobs ({selectedItems.jobs.length})
//                   </h4>
//                   <div className="space-y-2">
//                     {selectedDetails
//                       .filter((i) => i.type === "Job")
//                       .map((item) => (
//                         <div
//                           key={item.id}
//                           className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
//                         >
//                           <div>
//                             <p className="font-medium">{item.name}</p>
//                             <p className="text-sm text-muted-foreground">
//                               {item.schedule} • {item.cluster}
//                             </p>
//                           </div>
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             onClick={() => removeFromSelection("Job", item.id)}
//                           >
//                             <X className="w-4 h-4" />
//                           </Button>
//                         </div>
//                       ))}
//                   </div>
//                 </div>
//               )}

//               {selectedItems.notebooks.length > 0 && (
//                 <div>
//                   <h4 className="font-medium mb-3 flex items-center gap-2">
//                     <BookOpen className="w-4 h-4 text-primary" />
//                     Notebooks ({selectedItems.notebooks.length})
//                   </h4>
//                   <div className="space-y-2">
//                     {selectedDetails
//                       .filter((i) => i.type === "Notebook")
//                       .map((item) => (
//                         <div
//                           key={item.id}
//                           className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
//                         >
//                           <div>
//                             <p className="font-medium">{item.name}</p>
//                             <p className="text-sm text-muted-foreground">
//                               {item.language} • {item.path}
//                             </p>
//                           </div>
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             onClick={() => removeFromSelection("Notebook", item.id)}
//                           >
//                             <X className="w-4 h-4" />
//                           </Button>
//                         </div>
//                       ))}
//                   </div>
//                 </div>
//               )}

//               {selectedItems.clusters.length > 0 && (
//                 <div>
//                   <h4 className="font-medium mb-3 flex items-center gap-2">
//                     <Server className="w-4 h-4 text-primary" />
//                     Clusters ({selectedItems.clusters.length})
//                   </h4>
//                   <div className="space-y-2">
//                     {selectedDetails
//                       .filter((i) => i.type === "Cluster")
//                       .map((item) => (
//                         <div
//                           key={item.id}
//                           className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
//                         >
//                           <div>
//                             <p className="font-medium">{item.name}</p>
//                             <p className="text-sm text-muted-foreground">
//                               {item.type} • {item.runtime}
//                             </p>
//                           </div>
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             onClick={() => removeFromSelection("Cluster", item.id)}
//                           >
//                             <X className="w-4 h-4" />
//                           </Button>
//                         </div>
//                       ))}
//                   </div>
//                 </div>
//               )}

//               <div className="flex justify-between pt-4 border-t">
//                 <Button variant="outline" onClick={() => setShowReview(false)}>
//                   Back to Selection
//                 </Button>
//                 <Button
//                   variant="azure"
//                   onClick={() => setShowTargetModal(true)}
//                   disabled={(!hasNotebooks && !hasJobs && !hasClusters) || isMigrating}
//                 >
//                   {isMigrating && <Loader2 className="w-4 h-4 animate-spin" />}
//                   Migrate
//                   <ArrowRight className="w-4 h-4" />
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </main>

//         <SelectTargetModal
//           open={showTargetModal}
//           onClose={() => setShowTargetModal(false)}
//           onConfirm={handleStartMigration}
//         />

//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background flex">
//       <aside className="w-64 min-h-screen bg-sidebar border-r flex flex-col">
//         <div className="p-4 border-b">
//           <button
//             onClick={onBack}
//             className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2"
//           >
//             <ChevronLeft className="w-4 h-4" />
//             Back to Home
//           </button>
//           <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent">
//             <Avatar className="w-8 h-8">
//               <AvatarFallback className="bg-primary/20 text-primary text-xs">
//                 DB
//               </AvatarFallback>
//             </Avatar>
//             <div className="flex-1 min-w-0">
//               <p className="text-sm font-medium text-sidebar-foreground truncate">
//                 Databricks Workspace
//               </p>
//               <p className="text-xs text-muted-foreground">Admin Access</p>
//             </div>
//           </div>
//         </div>

//         <nav className="flex-1 p-3 pt-16">
//           <ul className="space-y-1">
//             <li>
//               <button
//                 className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors bg-sidebar-accent text-sidebar-accent-foreground font-medium"
//               >
//                 <Layers className="w-4 h-4" />
//                 Inventory
//               </button>

//               <ul className="ml-4 mt-1 space-y-1 border-l pl-3">
//                 {inventoryItems.map((item) => (
//                   <li key={item.id}>
//                     <button
//                       onClick={() => setActiveTab(item.id as TabType)}
//                       className={cn(
//                         "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors",
//                         activeTab === item.id
//                           ? "text-primary font-medium"
//                           : "text-muted-foreground hover:text-sidebar-foreground"
//                       )}
//                     >
//                       <item.icon className="w-3.5 h-3.5" />
//                       {item.label}
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </li>
//           </ul>
//         </nav>
//       </aside>

//       <div className="flex-1">
//         <main className="p-6 animate-fade-in">
//           <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
//             <span>Home</span>
//             <ChevronRight className="w-4 h-4" />
//             <span>Databricks Workspace</span>
//             <ChevronRight className="w-4 h-4" />
//             <span className="text-foreground font-medium">Discovery Results</span>
//           </div>

//           <div className="flex items-start justify-between mb-6">
//             <div>
//               <h1 className="text-2xl font-bold text-foreground mb-1">Discovery Results</h1>
//               <p className="text-sm text-success flex items-center gap-1.5">
//                 <CheckCircle2 className="w-4 h-4" />
//                 Scan completed successfully
//               </p>
//             </div>
//             <Button
//               variant="azure"
//               disabled={totalSelected === 0 || isMigrating}
//               onClick={handleMigrateClick}
//             >
//               {isMigrating && <Loader2 className="w-4 h-4 animate-spin" />}
//               Migrate Selected ({totalSelected})
//             </Button>
//           </div>

//           <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v as TabType)}>
//             <TabsList className="bg-muted/50 mb-4">
//               <TabsTrigger value="jobs" className="gap-2">
//                 <Briefcase className="w-4 h-4" />
//                 Jobs
//                 <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
//                   {transformedJobs.length}
//                 </span>
//               </TabsTrigger>
//               <TabsTrigger value="notebooks" className="gap-2">
//                 <BookOpen className="w-4 h-4" />
//                 Notebooks
//                 <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
//                   {transformedNotebooks.length}
//                 </span>
//               </TabsTrigger>
//               <TabsTrigger value="clusters" className="gap-2">
//                 <Server className="w-4 h-4" />
//                 Clusters
//                 <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
//                   {transformedClusters.length}
//                 </span>
//               </TabsTrigger>
//             </TabsList>

//             <div className="flex items-center gap-3 mb-4">
//               <div className="relative flex-1 max-w-sm">
//                 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
//                 <Input
//                   placeholder="Search across all fields..."
//                   className="pl-9"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//               </div>
//               <div className="relative">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setShowStatusMenu(!showStatusMenu)}
//                 >
//                   <Filter className="w-4 h-4" />
//                   Status
//                   {statusFilter !== "all" && (
//                     <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary rounded text-primary-foreground">
//                       1
//                     </span>
//                   )}
//                 </Button>
//                 {showStatusMenu && (
//                   <div className="absolute top-full mt-1 right-0 bg-popover border rounded-lg shadow-lg p-1 min-w-[160px] z-10">
//                     {statusOptions.map((status) => (
//                       <button
//                         key={status}
//                         onClick={() => {
//                           setStatusFilter(status);
//                           setShowStatusMenu(false);
//                         }}
//                         className={cn(
//                           "w-full text-left px-3 py-2 text-sm rounded hover:bg-accent transition-colors",
//                           statusFilter === status && "bg-accent font-medium"
//                         )}
//                       >
//                         {status === "all" ? "All Statuses" : status}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//               {(searchQuery || statusFilter !== "all") && (
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={() => {
//                     setSearchQuery("");
//                     setStatusFilter("all");
//                   }}
//                 >
//                   <X className="w-4 h-4" />
//                   Clear
//                 </Button>
//               )}
//               <div className="ml-auto text-sm text-muted-foreground">
//                 {totalSelected} selected
//               </div>
//             </div>

//             <TabsContent value="jobs">
//               <Card>
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead className="w-12">
//                         <Checkbox
//                           checked={filteredJobs.length > 0 && filteredJobs.every((j) => selectedItems.jobs.includes(j.id))}
//                           onCheckedChange={() => toggleAll("jobs", filteredJobs)}
//                         />
//                       </TableHead>
//                       <TableHead>JOB NAME</TableHead>
//                       <TableHead>SCHEDULE</TableHead>
//                       <TableHead>STATUS</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {filteredJobs.length === 0 ? (
//                       <TableRow>
//                         <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
//                           No jobs found matching your filters
//                         </TableCell>
//                       </TableRow>
//                     ) : (
//                       paginateData(filteredJobs).map((job) => (
//                         <TableRow key={job.id} className="hover:bg-muted/50">
//                           <TableCell>
//                             <Checkbox
//                               checked={selectedItems.jobs.includes(job.id)}
//                               onCheckedChange={() => toggleSelection("jobs", job.id)}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <div className="flex items-center gap-2">
//                               <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
//                                 <Briefcase className="w-3 h-3 text-primary" />
//                               </div>
//                               <span className="font-medium text-primary">{job.name}</span>
//                             </div>
//                           </TableCell>
                          
//                           <TableCell>{job.schedule}</TableCell>
                          
//                           <TableCell>
//                             <StatusBadge status={job.status} />
//                           </TableCell>
//                         </TableRow>
//                       ))
//                     )}
//                   </TableBody>
//                 </Table>
//               </Card>
//             </TabsContent>

//             <TabsContent value="notebooks">
//               <Card>
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead className="w-12">
//                         <Checkbox
//                           checked={filteredNotebooks.length > 0 && filteredNotebooks.every((n) => selectedItems.notebooks.includes(n.id))}
//                           onCheckedChange={() => toggleAll("notebooks", filteredNotebooks)}
//                         />
//                       </TableHead>
//                       <TableHead className="min-w-[200px]">NOTEBOOK NAME</TableHead>
//                       <TableHead className="w-[120px]">LANGUAGE</TableHead>
//                       <TableHead className="min-w-[250px] max-w-[350px]">PATH</TableHead>
//                       <TableHead className="w-[100px]">STATUS</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {filteredNotebooks.length === 0 ? (
//                       <TableRow>
//                         <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
//                           No notebooks found matching your filters
//                         </TableCell>
//                       </TableRow>
//                     ) : (
//                       paginateData(filteredNotebooks).map((notebook) => (
//                         <TableRow key={notebook.id} className="hover:bg-muted/50">
//                           <TableCell>
//                             <Checkbox
//                               checked={selectedItems.notebooks.includes(notebook.id)}
//                               onCheckedChange={() => toggleSelection("notebooks", notebook.id)}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <div className="flex items-center gap-2">
//                               <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
//                                 <BookOpen className="w-3 h-3 text-primary" />
//                               </div>
//                               <span className="font-medium text-primary">{notebook.name}</span>
//                             </div>
//                           </TableCell>
//                           <TableCell>{notebook.language}</TableCell>
//                           <TableCell>
//                             <div className="max-w-[350px] break-words whitespace-normal">
//                               {notebook.path}
//                             </div>
//                           </TableCell>
//                           <TableCell>
//                             <StatusBadge status={notebook.status} />
//                           </TableCell>
//                         </TableRow>
//                       ))
//                     )}
//                   </TableBody>
//                 </Table>
//               </Card>
//             </TabsContent>

//             <TabsContent value="clusters">
//               <Card>
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead className="w-12">
//                         <Checkbox
//                           checked={filteredClusters.length > 0 && filteredClusters.every((c) => selectedItems.clusters.includes(c.id))}
//                           onCheckedChange={() => toggleAll("clusters", filteredClusters)}
//                         />
//                       </TableHead>
//                       <TableHead>CLUSTER NAME</TableHead>
//                       <TableHead>TYPE</TableHead>
//                       <TableHead>RUNTIME</TableHead>
//                       <TableHead>WORKERS</TableHead>
//                       <TableHead>STATUS</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {filteredClusters.length === 0 ? (
//                       <TableRow>
//                         <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
//                           No clusters found matching your filters
//                         </TableCell>
//                       </TableRow>
//                     ) : (
//                       paginateData(filteredClusters).map((cluster) => (
//                         <TableRow key={cluster.id} className="hover:bg-muted/50">
//                           <TableCell>
//                             <Checkbox
//                               checked={selectedItems.clusters.includes(cluster.id)}
//                               onCheckedChange={() => toggleSelection("clusters", cluster.id)}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <div className="flex items-center gap-2">
//                               <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
//                                 <Server className="w-3 h-3 text-primary" />
//                               </div>
//                               <span className="font-medium text-primary">{cluster.name}</span>
//                             </div>
//                           </TableCell>
//                           <TableCell>{cluster.type}</TableCell>
//                           <TableCell>{cluster.runtime}</TableCell>
//                           <TableCell>{cluster.workers}</TableCell>
//                           <TableCell>
//                             <StatusBadge status={cluster.status} />
//                           </TableCell>
//                         </TableRow>
//                       ))
//                     )}
//                   </TableBody>
//                 </Table>
//               </Card>
//             </TabsContent>
//           </Tabs>

//           {/* Pagination */}
//           <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
//             <span>
//               Showing {currentPage === 1 ? 1 : (currentPage - 1) * rowsPerPage + 1}-
//               {Math.min(currentPage * rowsPerPage,
//                 activeTab === "jobs" ? filteredJobs.length :
//                   activeTab === "notebooks" ? filteredNotebooks.length :
//                     filteredClusters.length
//               )} of {
//                 activeTab === "jobs" ? filteredJobs.length :
//                   activeTab === "notebooks" ? filteredNotebooks.length :
//                     filteredClusters.length
//               } {activeTab}
//             </span>

//             <div className="flex items-center gap-3">
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="h-8 w-8"
//                 onClick={() => setCurrentPage(p => p - 1)}
//                 disabled={currentPage === 1}
//               >
//                 <ChevronLeft className="w-4 h-4" />
//               </Button>

//               <span className="text-foreground">
//                 Page {currentPage} of {Math.ceil((
//                   activeTab === "jobs" ? filteredJobs.length :
//                     activeTab === "notebooks" ? filteredNotebooks.length :
//                       filteredClusters.length
//                 ) / rowsPerPage)}
//               </span>

//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="h-8 w-8"
//                 onClick={() => setCurrentPage(p => p + 1)}
//                 disabled={currentPage * rowsPerPage >= (
//                   activeTab === "jobs" ? filteredJobs.length :
//                     activeTab === "notebooks" ? filteredNotebooks.length :
//                       filteredClusters.length
//                 )}
//               >
//                 <ChevronRight className="w-4 h-4" />
//               </Button>
//             </div>
//           </div>
//         </main>

//         <footer className="text-center py-4 text-sm text-muted-foreground border-t">
//           © 2024 Migration Tool v3.1.0
//         </footer>
//       </div>
//       <ConnectFabricModal
//         open={showFabricModal}
//         onClose={() => setShowFabricModal(false)}
//         onConnect={handleFabricConnect}
//       />
//     </div>
//   );
// }





// //24/03
// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox";
// import { StatusBadge } from "@/components/StatusBadge";
// import { SelectTargetModal } from "@/components/modals/SelectTargetModal";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { useToast } from "@/hooks/use-toast";
// import { useDatabricksCredentials } from "@/contexts/DatabricksCredentialsContext";
// import type { Status } from "@/types/migration";

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from "@/components/ui/tabs";
// import {
//   Search,
//   Filter,
//   CheckCircle2,
//   Database,
//   BookOpen,
//   Briefcase,
//   ArrowRight,
//   X,
//   ChevronRight,
//   ChevronLeft,
//   Layers,
//   LogOut,
//   Server,
//   Loader2,
//   AlertCircle,
//   LayoutGrid
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { useFabricCredentials } from "@/contexts/FabricCredentialsContext";
// import { CatalogTreeScreen } from "@/components/CatalogTreeScreen";
// import { ConnectFabricModal } from "@/components/modals/ConnectFabricModal";

// interface DatabricksMigrationWorkspaceProps {
//   onLogout: () => void;
//   onBack: () => void;
//   onMigrationComplete: (items: any[]) => void;
//   onMigrationUpdate: (updateFn: (prev: any[]) => any[]) => void;
//   onWorkspaceSelected: (workspaceId: string) => void
//   apiResponse: {
//     counts: {
//       notebooks: number;
//       folders: number;
//       jobs: number;
//       clusters: number;
//       catalogs?: number;
//       sql_warehouses?: number;
//     };
//     notebooks: any[];
//     folders: any[];
//     jobs: any[];
//     clusters: any[];
//     sql_warehouses?: {
//       id: string;
//       name: string;
//       size: string;
//       cluster_size: string;
//       warehouse_type: string;
//       state: string;
//       enable_photon: boolean;
//       enable_serverless_compute: boolean;
//       auto_stop_mins: number;
//       creator_name: string;
//     }[];
//     unity_catalog_summary?: {
//       name: string;
//       schemas: { name: string; table_count: number; table_names: string[]; }[];
//     }[];
//   };
// }

// type TabType = "jobs" | "notebooks" | "clusters" | "warehouses";

// const inventoryItems = [
//   { id: "jobs", label: "Jobs", icon: Briefcase },
//   { id: "notebooks", label: "Notebooks", icon: BookOpen },
//   { id: "clusters", label: "Clusters", icon: Server },
//   { id: "warehouses", label: "SQL Warehouses", icon: LayoutGrid },
// ];

// export function DatabricksMigrationWorkspace({
//   onLogout,
//   onBack,
//   onMigrationComplete,
//   onMigrationUpdate,
//   onWorkspaceSelected,
//   apiResponse
// }: DatabricksMigrationWorkspaceProps) {
//   const { toast } = useToast();
//   const { credentials: databricksCredentials } = useDatabricksCredentials();
//   const { credentials: fabricCredentials, setCredentials: setFabricCredentials } = useFabricCredentials();

//   const transformedJobs = (apiResponse?.jobs || []).map((job: any, index: number) => ({
//     id: job.job_id?.toString() || index.toString(),
//     name: job.settings?.name || `Job ${index + 1}`,
//     schedule: job.settings?.schedule?.quartz_cron_expression ||
//       job.settings?.trigger?.pause_status || "Manual",
//     lastRun: job.last_run?.start_time ?
//       new Date(job.last_run.start_time).toLocaleString() : "N/A",
//     cluster: job.settings?.tasks?.[0]?.existing_cluster_id ||
//       job.settings?.job_clusters?.[0]?.new_cluster?.cluster_name ||
//       job.settings?.new_cluster?.cluster_name || "N/A",
//     status: (job.last_run?.state?.life_cycle_state === "TERMINATED" &&
//       job.last_run?.state?.result_state === "SUCCESS") ? "Success" :
//       job.last_run?.state?.life_cycle_state === "RUNNING" ? "Running" :
//         job.last_run?.state?.result_state === "FAILED" ? "Failed" : "Ready" as Status,
//   }));

//   const transformedNotebooks = (apiResponse?.notebooks || []).map((notebook: any, index: number) => ({
//     id: index.toString(),
//     name: notebook.name || notebook.path?.split('/').pop() || `Notebook ${index + 1}`,
//     language: notebook.language || "Unknown",
//     lastModified: "N/A",
//     path: notebook.path || "/",
//     status: "Ready" as Status,
//   }));

//   const transformedClusters = (apiResponse?.clusters || []).map((cluster: any, index: number) => ({
//     id: cluster.cluster_id || index.toString(),
//     name: cluster.cluster_name || `Cluster ${index + 1}`,
//     type: cluster.cluster_source || "Interactive",
//     state: cluster.state || "Unknown",
//     runtime: cluster.spark_version || "N/A",
//     workers: cluster.num_workers !== undefined ? cluster.num_workers.toString() : "N/A",
//     status: "Ready" as Status,
//   }));

//   const transformedCatalogs = (apiResponse?.unity_catalog_summary || []).flatMap(
//     (catalog: any) =>
//       catalog.schemas.map((schema: any) => ({
//         id: `${catalog.name}.${schema.name}`,
//         catalogName: catalog.name,
//         schemaName: schema.name,
//         tableCount: schema.table_count,
//         tableNames: schema.table_names,
//         status: "Ready" as Status,
//       }))
//   );

//   const transformedWarehouses = (apiResponse?.sql_warehouses || []).map((wh: any) => ({
//     id: wh.id,
//     name: wh.name,
//     size: wh.cluster_size,
//     type: wh.warehouse_type,
//     state: wh.state,
//     photon: wh.enable_photon ? "Enabled" : "Disabled",
//     serverless: wh.enable_serverless_compute ? "Enabled" : "Disabled",
//     autoStop: `${wh.auto_stop_mins} min`,
//     creator: wh.creator_name,
//     status: "Ready" as Status,
//   }));

//   const [activeTab, setActiveTab] = useState<TabType>("jobs");
//   const [selectedItems, setSelectedItems] = useState<Record<TabType, string[]>>({
//     jobs: [],
//     notebooks: [],
//     clusters: [],
//     warehouses: [],
//   });
//   const [showReview, setShowReview] = useState(false);
//   const [showCatalogScreen, setShowCatalogScreen] = useState(false);
//   const [selectedCatalogIds, setSelectedCatalogIds] = useState<string[]>([]);
//   const [showTargetModal, setShowTargetModal] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState<string>("all");
//   const [showStatusMenu, setShowStatusMenu] = useState(false);
//   const [isMigrating, setIsMigrating] = useState(false);
//   const [showFabricModal, setShowFabricModal] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const removeCatalog = (catalogName: string) => {
//     setSelectedCatalogIds((prev) =>
//       prev.filter((id) => !id.startsWith(`${catalogName}.`))
//     );
//   };

//   const paginateData = (data: any[]) => {
//     const startIndex = (currentPage - 1) * rowsPerPage;
//     return data.slice(startIndex, startIndex + rowsPerPage);
//   };

//   const handleTabChange = (tab: TabType) => {
//     setActiveTab(tab);
//     setCurrentPage(1);
//   };

//   const handleFabricConnect = (apiResponse: any) => {
//     setShowFabricModal(false);
//     setShowReview(true);
//   };

//   const handleMigrateClick = () => {
//     const selectedDetails = getSelectedItemDetails();
//     const hasNotebooks = selectedDetails.some(item => item.type === "Notebook");
//     const hasJobs = selectedDetails.some(item => item.type === "Job");
//     const hasClusters = selectedDetails.some(item => item.type === "Cluster");
//     const hasWarehouses = selectedDetails.some(item => item.type === "Warehouse");
//     if (!hasNotebooks && !hasJobs && !hasClusters && !hasWarehouses) {
//       toast({
//         title: "No Items Selected",
//         description: "Please select at least one item to migrate.",
//         variant: "destructive",
//       });
//       return;
//     }

//     if (!fabricCredentials) {
//       setShowFabricModal(true);
//     } else {
//       setShowReview(true);
//     }
//   };

//   const toggleSelection = (tab: TabType, id: string) => {
//     setSelectedItems((prev) => ({
//       ...prev,
//       [tab]: prev[tab].includes(id)
//         ? prev[tab].filter((i) => i !== id)
//         : [...prev[tab], id],
//     }));
//   };

//   const toggleAll = (tab: TabType, items: { id: string }[]) => {
//     const allIds = items.map((i) => i.id);
//     const allSelected = allIds.every((id) => selectedItems[tab].includes(id));
//     setSelectedItems((prev) => ({
//       ...prev,
//       [tab]: allSelected ? [] : allIds,
//     }));
//   };

//   const filterItems = <T extends Record<string, any>>(items: T[]) => {
//     return items.filter((item) => {
//       const searchableFields = Object.values(item).join(' ').toLowerCase();
//       const matchesSearch = searchableFields.includes(searchQuery.toLowerCase());
//       const matchesStatus = statusFilter === "all" || item.status === statusFilter;
//       return matchesSearch && matchesStatus;
//     });
//   };

//   const filteredJobs = filterItems(transformedJobs);
//   const filteredNotebooks = filterItems(transformedNotebooks);
//   const filteredClusters = filterItems(transformedClusters);
//   const filteredWarehouses = filterItems(transformedWarehouses);

//   const statusOptions = ["all", "Success", "Running", "Failed", "Ready"];

//   const totalSelected =
//     selectedItems.jobs.length +
//     selectedItems.notebooks.length +
//     selectedItems.clusters.length +
//     selectedItems.warehouses.length;

//   const getSelectedItemDetails = () => {
//     const items: any[] = [];
//     selectedItems.jobs.forEach((id) => {
//       const item = transformedJobs.find((j) => j.id === id);
//       if (item) items.push({ ...item, type: "Job", source: "databricks" });
//     });
//     selectedItems.notebooks.forEach((id) => {
//       const item = transformedNotebooks.find((n) => n.id === id);
//       if (item) items.push({ ...item, type: "Notebook", source: "databricks" });
//     });
//     selectedItems.clusters.forEach((id) => {
//       const item = transformedClusters.find((c) => c.id === id);
//       if (item) items.push({ ...item, type: "Cluster", source: "databricks" });
//     });
//     selectedItems.warehouses.forEach((id) => {
//       const item = transformedWarehouses.find((w) => w.id === id);
//       if (item) items.push({
//         ...item,
//         type: "Warehouse",
//         warehouseType: item.type,
//         source: "databricks"
//       });
//     });
//     return items;
//   };

//   const removeFromSelection = (type: string, id: string) => {
//     const tabMap: Record<string, TabType> = {
//       Job: "jobs",
//       Notebook: "notebooks",
//       Cluster: "clusters",
//       Warehouse: "warehouses",
//     };
//     const tab = tabMap[type];
//     if (tab) {
//       setSelectedItems((prev) => ({
//         ...prev,
//         [tab]: prev[tab].filter((i) => i !== id),
//       }));
//     }
//   };

//   const migrateNotebooks = async (workspace: any, notebooks: any[], replaceIfExists: boolean = false) => {
//     const payload = {
//       tenantId: fabricCredentials!.tenantId,
//       clientId: fabricCredentials!.clientId,
//       clientSecret: fabricCredentials!.clientSecret,
//       workspaceId: workspace.id,
//       databricksUrl: databricksCredentials!.databricksUrl,
//       personalAccessToken: databricksCredentials!.personalAccessToken,
//       replaceIfExists: replaceIfExists,
//       notebooks: notebooks.map(nb => ({
//         name: nb.name,
//         path: nb.path
//       }))
//     };

//     console.log("📤 Notebook migration payload:", payload);

//     try {
//       const response = await fetch(
//         "https://20.106.196.248/DbMigrateNotebooks",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(payload),
//         }
//       );

//       console.log(`📥 Notebook API Response Status: ${response.status} ${response.statusText}`);

//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error(`❌ Notebook API Error Response:`, errorText);
//         throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`);
//       }

//       const result = await response.json();
//       console.log("📊 Notebook migration result:", JSON.stringify(result, null, 2));

//       if (!result.details || !Array.isArray(result.details)) {
//         console.error("❌ Invalid response structure:", result);
//         throw new Error(`Invalid API response: missing 'details' array`);
//       }

//       notebooks.forEach(item => {
//         const detail = result.details.find((d: any) => d.name === item.name);

//         let status: Status = "Success";
//         let errorMessage: string | undefined = undefined;
//         let runId: string | undefined = undefined;

//         if (detail) {
//           console.log(`Processing notebook "${item.name}" with status: ${detail.status}`);

//           runId = detail.run_id || result.run_id;

//           if (detail.status === "created") {
//             status = "Success";
//           } else if (detail.status === "replaced") {
//             status = "Replaced";
//           } else if (detail.status === "already-exists") {
//             status = "Failed";
//             errorMessage = "already exists";
//           } else if (detail.status === "skipped") {
//             status = "Skipped";
//             errorMessage = "already exists";
//           } else if (detail.status === "failed") {
//             status = "Failed";
//             errorMessage = detail.error || "Migration failed";
//           } else if (detail.status === "export-failed") {
//             status = "Failed";
//             errorMessage = detail.error || "Failed to export from Databricks";
//           } else if (detail.status === "invalid-input") {
//             status = "Failed";
//             errorMessage = "Invalid notebook name or path";
//           } else {
//             console.warn(`⚠️ Unknown status "${detail.status}" for notebook "${item.name}"`);
//             status = "Failed";
//             errorMessage = `Unknown status: ${detail.status}`;
//           }
//         } else {
//           console.error(`⚠️ Notebook "${item.name}" not found in API response`);
//           status = "Failed";
//           errorMessage = "Not returned in API response";
//           runId = result.run_id;
//         }

//         console.log(`📝 Updating notebook "${item.name}" with runId:`, runId);

//         onMigrationUpdate((prevItems) =>
//           prevItems.map(prevItem =>
//             prevItem.id === item.id
//               ? {
//                 ...prevItem,
//                 status,
//                 errorMessage,
//                 runId,
//                 targetWorkspace: workspace.name
//               }
//               : prevItem
//           )
//         );
//       });

//       return null;

//     } catch (error) {
//       console.error("💥 Notebook migration error:", error);
//       throw error;
//     }
//   };

//   const migrateJobs = async (workspace: any, jobs: any[]) => {
//     const payload = {
//       tenantId: fabricCredentials!.tenantId,
//       clientId: fabricCredentials!.clientId,
//       clientSecret: fabricCredentials!.clientSecret,
//       workspaceId: workspace.id,
//       databricksUrl: databricksCredentials!.databricksUrl,
//       personalAccessToken: databricksCredentials!.personalAccessToken,
//       jobid: jobs.map(job => job.id)
//     };

//     console.log("📤 Job migration payload:", payload);

//     try {
//       const startResponse = await fetch(
//         "https://20.106.196.248/MigrateJobsHttpStarter",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         }
//       );

//       if (!startResponse.ok) {
//         const errorText = await startResponse.text();
//         throw new Error(`Failed to start job migration: HTTP ${startResponse.status}: ${errorText.substring(0, 200)}`);
//       }

//       const orchestrationInfo = await startResponse.json();
//       const statusQueryUri = orchestrationInfo.statusQueryGetUri;

//       if (!statusQueryUri) {
//         throw new Error("No statusQueryGetUri returned from orchestration starter");
//       }

//       console.log(`🚀 Job migration orchestration started. Instance ID: ${orchestrationInfo.instanceId}`);
//       console.log(`🔍 Polling status at: ${statusQueryUri}`);

//       const MAX_POLLS = 120;
//       const POLL_INTERVAL_MS = 5000;

//       let result: any = null;

//       for (let attempt = 1; attempt <= MAX_POLLS; attempt++) {
//         await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));

//         const statusResponse = await fetch(statusQueryUri);

//         if (!statusResponse.ok) {
//           console.warn(`⚠️ Poll attempt ${attempt} failed: HTTP ${statusResponse.status}`);
//           continue;
//         }

//         const statusData = await statusResponse.json();
//         console.log(`📊 Poll ${attempt}: runtimeStatus = ${statusData.runtimeStatus}`);

//         if (statusData.runtimeStatus === "Completed") {
//           result = statusData.output;
//           console.log("✅ Orchestration completed:", JSON.stringify(result, null, 2));
//           break;
//         } else if (statusData.runtimeStatus === "Failed" || statusData.runtimeStatus === "Terminated") {
//           throw new Error(`Job migration orchestration ${statusData.runtimeStatus.toLowerCase()}`);
//         }
//       }

//       if (!result) {
//         throw new Error("Job migration timed out after polling");
//       }

//       if (!result || typeof result !== 'object') {
//         throw new Error(`Invalid API response: expected object, got ${typeof result}`);
//       }

//       jobs.forEach(item => {
//         const createdDetail = result.created?.find((d: any) => d.job_id === item.id);
//         const existsDetail = result.already_exist?.find((d: any) => d.job_id === item.id);
//         const failedDetail = result.failed?.find((d: any) => d.job_id === item.id);

//         let status: Status = "Failed";
//         let errorMessage: string | undefined = undefined;
//         let fabricPipelineId: string | undefined = undefined;
//         let runId: string | undefined = undefined;

//         if (createdDetail) {
//           status = "Success";
//           fabricPipelineId = createdDetail.fabric_pipeline_id;
//           runId = createdDetail.run_id;
//           console.log(`✅ Job "${item.name}" - Success with runId:`, runId);
//         } else if (existsDetail) {
//           status = "Failed";
//           errorMessage = "already exists";
//           fabricPipelineId = existsDetail.pipeline_id;
//           runId = existsDetail.run_id;
//           console.log(`⚠️ Job "${item.name}" - Already exists with runId:`, runId);
//         } else if (failedDetail) {
//           status = "Failed";
//           errorMessage = failedDetail.error || "Migration failed";
//           runId = failedDetail.run_id;
//           console.log(`❌ Job "${item.name}" - Failed with runId:`, runId, "Error:", errorMessage);
//         } else {
//           console.error(`⚠️ Job "${item.name}" (${item.id}) not found in any response array`);
//           errorMessage = "Not returned in API response";
//         }

//         console.log(`📝 Updating job "${item.name}" with:`, { status, errorMessage, runId, fabricPipelineId });

//         onMigrationUpdate((prevItems) =>
//           prevItems.map(prevItem =>
//             prevItem.id === item.id
//               ? { ...prevItem, status, errorMessage, fabricPipelineId, runId, targetWorkspace: workspace.name }
//               : prevItem
//           )
//         );
//       });

//       return null;

//     } catch (error) {
//       console.error("💥 Job migration error:", error);
//       throw error;
//     }
//   };

//   const migrateClusters = async (workspace: any, clusters: any[], capacityId: string) => {
//     const payload = {
//       databricks: {
//         host: databricksCredentials!.databricksUrl,
//         pat: databricksCredentials!.personalAccessToken
//       },
//       fabric: {
//         tenantId: fabricCredentials!.tenantId,
//         clientId: fabricCredentials!.clientId,
//         clientSecret: fabricCredentials!.clientSecret,
//         capacityId: capacityId,
//         workspaceId: workspace.id
//       },
//       selectedClusters: clusters.map(cluster => cluster.id)
//     };

//     console.log("📤 Cluster migration payload:", payload);

//     try {
//       const response = await fetch(
//         "https://20.106.196.248/DbClusterMigration",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(payload),
//         }
//       );

//       console.log(`📥 Cluster API Response Status: ${response.status} ${response.statusText}`);

//       let result;
//       const responseText = await response.text();

//       try {
//         result = JSON.parse(responseText);
//         console.log("📊 Cluster migration result:", JSON.stringify(result, null, 2));
//       } catch (parseError) {
//         console.error("❌ Failed to parse response as JSON:", responseText);
//         throw new Error(`HTTP ${response.status}: ${responseText.substring(0, 200)}`);
//       }

//       if (!result || typeof result !== 'object') {
//         console.error("❌ Invalid response structure:", result);
//         throw new Error(`Invalid API response: expected object, got ${typeof result}`);
//       }

//       clusters.forEach(item => {
//         const successDetail = result.Success?.find((successItem: any) => {
//           if (typeof successItem === 'string') {
//             return successItem === item.name || successItem === item.id;
//           }
//           return successItem.name === item.name || successItem.name === item.id;
//         });

//         const failedDetail = result.Failed?.find((f: any) =>
//           f.name === item.name || f.name === item.id
//         );

//         let status: Status = "Failed";
//         let errorMessage: string | undefined = undefined;
//         let runId: string | undefined = undefined;

//         if (successDetail) {
//           console.log(`✅ Cluster "${item.name}" migrated successfully`);
//           status = "Success";
//           runId = typeof successDetail === 'object' ? successDetail.run_id : undefined;
//           console.log(`✅ Cluster "${item.name}" - Success with runId:`, runId);
//         } else if (failedDetail) {
//           console.error(`❌ Cluster "${item.name}" failed:`, failedDetail.message);
//           status = "Failed";

//           const rawMessage = failedDetail.message || "Migration failed";
//           if (rawMessage.toLowerCase().includes("already exists")) {
//             errorMessage = "already exists";
//           } else {
//             errorMessage = rawMessage;
//           }

//           runId = failedDetail.run_id;
//           console.log(`❌ Cluster "${item.name}" - Failed with runId:`, runId);
//         } else {
//           console.error(`⚠️ Cluster "${item.name}" (${item.id}) not found in API response`);
//           errorMessage = "Not returned in API response";
//         }

//         console.log(`📝 Updating cluster "${item.name}" with:`, {
//           status,
//           errorMessage,
//           runId,
//           targetWorkspace: workspace.name
//         });

//         onMigrationUpdate((prevItems) =>
//           prevItems.map(prevItem =>
//             prevItem.id === item.id
//               ? {
//                 ...prevItem,
//                 status,
//                 errorMessage,
//                 runId,
//                 targetWorkspace: workspace.name
//               }
//               : prevItem
//           )
//         );
//       });

//       return null;

//     } catch (error) {
//       console.error("💥 Cluster migration error:", error);
//       throw error;
//     }
//   };

//   const migrateCatalogs = async (workspace: any, catalogNames: string[]) => {
//     const payload = {
//       databricksUrl: databricksCredentials!.databricksUrl,
//       personalAccessToken: databricksCredentials!.personalAccessToken,
//       jobId: 967101084886600,
//       catalogs: catalogNames,
//       fabric: {
//         tenantId: fabricCredentials!.tenantId,
//         clientId: fabricCredentials!.clientId,
//         clientSecret: fabricCredentials!.clientSecret,
//         workspaceId: workspace.id,
//       },
//     };

//     console.log("📤 Catalog migration payload:", payload);

//     const response = await fetch("https://20.106.196.248/CatalogMigration", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });

//     const responseText = await response.text();
//     let result: any;
//     try {
//       result = JSON.parse(responseText);
//     } catch {
//       throw new Error(`HTTP ${response.status}: ${responseText.substring(0, 200)}`);
//     }

//     if (!response.ok) {
//       throw new Error(result?.message || `HTTP ${response.status}`);
//     }

//     console.log("📊 Catalog migration result:", JSON.stringify(result, null, 2));

//     const created: any[] = result.created ?? [];
//     const alreadyExist: any[] = result.already_exist ?? [];
//     const failed: any[] = result.failed ?? [];

//     catalogNames.forEach((catalogName) => {
//       const itemId = `catalog-${catalogName}`;

//       const createdDetail = created.find((d) => d.catalog === catalogName);
//       const existsDetail = alreadyExist.find((d) => d.catalog === catalogName);
//       const failedDetail = failed.find((d) => d.catalog === catalogName);

//       let status: Status = "Failed";
//       let errorMessage: string | undefined;
//       let runId: string | undefined;

//       if (createdDetail) {
//         status = "Success";
//         runId = createdDetail.run_id?.toString();
//       } else if (existsDetail) {
//         status = "Failed";
//         errorMessage = "already exists";
//         runId = existsDetail.run_id?.toString();
//       } else if (failedDetail) {
//         status = "Failed";
//         errorMessage = failedDetail.error || "Catalog migration failed";
//         runId = failedDetail.run_id?.toString();
//       } else {
//         status = "Failed";
//         errorMessage = "Not returned in API response";
//       }

//       onMigrationUpdate((prevItems) =>
//         prevItems.map((prevItem) =>
//           prevItem.id === itemId
//             ? { ...prevItem, status, errorMessage, runId, targetWorkspace: workspace.name }
//             : prevItem
//         )
//       );
//     });
//   };

//   const migrateWarehouses = async (workspace: any, warehouses: any[]) => {
//     const payload = {
//       databricks: {
//         host: databricksCredentials!.databricksUrl,
//         pat: databricksCredentials!.personalAccessToken,
//       },
//       fabric: {
//         tenantId: fabricCredentials!.tenantId,
//         clientId: fabricCredentials!.clientId,
//         clientSecret: fabricCredentials!.clientSecret,
//         workspaceId: workspace.id,
//       },
//       "Warehouse Ids": warehouses.map((wh) => wh.id),
//     };

//     console.log("📤 Warehouse migration payload:", payload);

//     const response = await fetch("https://20.106.196.248/Sqlwarehouse", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });

//     const responseText = await response.text();
//     let result: any;
//     try {
//       result = JSON.parse(responseText);
//     } catch {
//       throw new Error(`HTTP ${response.status}: ${responseText.substring(0, 200)}`);
//     }

//     if (!response.ok) {
//       throw new Error(result?.message || `HTTP ${response.status}`);
//     }

//     console.log("📊 Warehouse migration result:", JSON.stringify(result, null, 2));

//     const created: any[] = result.created ?? [];
//     const alreadyExist: any[] = result.already_exist ?? [];
//     const failed: any[] = result.failed ?? [];

//     warehouses.forEach((item) => {
//       const createdDetail = created.find((d) => d.databricks_id === item.id);
//       const existsDetail = alreadyExist.find((d) => d.databricks_id === item.id);
//       const failedDetail = failed.find((d) => d.databricks_id === item.id);

//       let status: Status = "Failed";
//       let errorMessage: string | undefined;
//       let runId: string | undefined;

//       if (createdDetail) {
//         status = "Success";
//         runId = createdDetail.runId;
//       } else if (existsDetail) {
//         status = "Failed";
//         errorMessage = "already exists";
//         runId = existsDetail.runId;
//       } else if (failedDetail) {
//         status = "Failed";
//         errorMessage = failedDetail.error || "Warehouse migration failed";
//         runId = failedDetail.runId;
//       } else {
//         status = "Failed";
//         errorMessage = "Not returned in API response";
//       }

//       console.log(`📝 Warehouse "${item.name}" → ${status}`);

//       onMigrationUpdate((prevItems) =>
//         prevItems.map((prevItem) =>
//           prevItem.id === item.id
//             ? { ...prevItem, status, errorMessage, runId, targetWorkspace: workspace.name }
//             : prevItem
//         )
//       );
//     });
//   };

//   const handleStartMigration = async (workspace: any) => {
//     const selectedDetails = getSelectedItemDetails();
//     const notebooksToMigrate = selectedDetails.filter(item => item.type === "Notebook");
//     const jobsToMigrate = selectedDetails.filter(item => item.type === "Job");
//     const clustersToMigrate = selectedDetails.filter(item => item.type === "Cluster");
//     const warehousesToMigrate = selectedDetails.filter(item => item.type === "Warehouse"); // ← moved up

//     const catalogNamesToMigrate = [...new Set(
//       selectedCatalogIds.map(id => id.split(".")[0])
//     )];

//     if (
//       notebooksToMigrate.length === 0 &&
//       jobsToMigrate.length === 0 &&
//       clustersToMigrate.length === 0 &&
//       warehousesToMigrate.length === 0 &&  // ← added to validation
//       catalogNamesToMigrate.length === 0
//     ) {
//       toast({
//         title: "No Items Selected",
//         description: "Please select at least one item to migrate.",
//         variant: "destructive",
//       });
//       return;
//     }

//     if (!databricksCredentials?.databricksUrl || !databricksCredentials?.personalAccessToken) {
//       toast({
//         title: "Missing Databricks Credentials",
//         description: "Databricks credentials not found. Please reconnect.",
//         variant: "destructive",
//       });
//       return;
//     }

//     if (!fabricCredentials?.tenantId || !fabricCredentials?.clientId || !fabricCredentials?.clientSecret) {
//       toast({
//         title: "Missing Fabric Credentials",
//         description: "Fabric credentials not found. Please connect to Fabric.",
//         variant: "destructive",
//       });
//       return;
//     }

//     onWorkspaceSelected(workspace.id);
//     setIsMigrating(true);
//     setShowTargetModal(false);

//     const catalogItems = catalogNamesToMigrate.map(catalogName => ({
//       id: `catalog-${catalogName}`,
//       name: catalogName,
//       type: "Catalog" as const,
//       source: "databricks",
//       targetWorkspace: workspace.name,
//       targetWorkspaceId: workspace.id,
//       status: "Running" as const,
//     }));

//     const allItemsToMigrate = [
//       ...notebooksToMigrate,
//       ...jobsToMigrate,
//       ...clustersToMigrate,
//       ...warehousesToMigrate,
//     ];

//     const initialMigrationItems = [
//       ...allItemsToMigrate.map(item => ({
//         ...item,
//         targetWorkspace: workspace.name,
//         targetWorkspaceId: workspace.id,
//         status: "Running" as const,
//       })),
//       ...catalogItems,
//     ];

//     console.log("🚀 Initial migration items created:", initialMigrationItems.length);
//     onMigrationComplete(initialMigrationItems);

//     try {
//       console.log("🚀 Starting migrations:", {
//         notebooks: notebooksToMigrate.length,
//         jobs: jobsToMigrate.length,
//         clusters: clustersToMigrate.length,
//         warehouses: warehousesToMigrate.length,
//         catalogs: catalogNamesToMigrate.length,
//       });

//       const results = await Promise.allSettled([
//         notebooksToMigrate.length > 0 ? migrateNotebooks(workspace, notebooksToMigrate, false) : Promise.resolve(null),
//         jobsToMigrate.length > 0 ? migrateJobs(workspace, jobsToMigrate) : Promise.resolve(null),
//         clustersToMigrate.length > 0 ? migrateClusters(workspace, clustersToMigrate, workspace.capacity) : Promise.resolve(null),
//         catalogNamesToMigrate.length > 0 ? migrateCatalogs(workspace, catalogNamesToMigrate) : Promise.resolve(null),
//         warehousesToMigrate.length > 0 ? migrateWarehouses(workspace, warehousesToMigrate) : Promise.resolve(null),
//       ]);

//       // ← single destructure, 5 elements
//       const [notebookResult, jobResult, clusterResult, catalogResult, warehouseResult] = results;

//       console.log("📊 Migration results:", {
//         notebooks: notebookResult.status,
//         jobs: jobResult.status,
//         clusters: clusterResult.status,
//         catalogs: catalogResult.status,
//         warehouses: warehouseResult.status,
//       });

//       if (notebookResult.status === 'rejected') {
//         console.error("❌ Notebook migration promise rejected:", notebookResult.reason);
//         const errorMsg = notebookResult.reason instanceof Error
//           ? notebookResult.reason.message : String(notebookResult.reason);
//         notebooksToMigrate.forEach(item => {
//           onMigrationUpdate((prevItems) =>
//             prevItems.map(prevItem =>
//               prevItem.id === item.id
//                 ? { ...prevItem, status: "Failed" as const, errorMessage: errorMsg.substring(0, 200), targetWorkspace: workspace.name }
//                 : prevItem
//             )
//           );
//         });
//       }

//       if (jobResult.status === 'rejected') {
//         console.error("❌ Job migration promise rejected:", jobResult.reason);
//         const errorMsg = jobResult.reason instanceof Error
//           ? jobResult.reason.message : String(jobResult.reason);
//         jobsToMigrate.forEach(item => {
//           onMigrationUpdate((prevItems) =>
//             prevItems.map(prevItem =>
//               prevItem.id === item.id
//                 ? { ...prevItem, status: "Failed" as const, errorMessage: errorMsg.substring(0, 200), targetWorkspace: workspace.name }
//                 : prevItem
//             )
//           );
//         });
//       }

//       if (clusterResult.status === 'rejected') {
//         console.error("❌ Cluster migration promise rejected:", clusterResult.reason);
//         const errorMsg = clusterResult.reason instanceof Error
//           ? clusterResult.reason.message : String(clusterResult.reason);
//         clustersToMigrate.forEach(item => {
//           onMigrationUpdate((prevItems) =>
//             prevItems.map(prevItem =>
//               prevItem.id === item.id
//                 ? { ...prevItem, status: "Failed" as const, errorMessage: errorMsg.substring(0, 200), targetWorkspace: workspace.name }
//                 : prevItem
//             )
//           );
//         });
//       }

//       if (catalogResult.status === 'rejected') {
//         console.error("❌ Catalog migration promise rejected:", catalogResult.reason);
//         const errorMsg = catalogResult.reason instanceof Error
//           ? catalogResult.reason.message : String(catalogResult.reason);
//         catalogNamesToMigrate.forEach(catalogName => {
//           onMigrationUpdate((prevItems) =>
//             prevItems.map(prevItem =>
//               prevItem.id === `catalog-${catalogName}`
//                 ? { ...prevItem, status: "Failed" as const, errorMessage: errorMsg.substring(0, 200), targetWorkspace: workspace.name }
//                 : prevItem
//             )
//           );
//         });
//       }

//       if (warehouseResult.status === 'rejected') {
//         console.error("❌ Warehouse migration promise rejected:", warehouseResult.reason);
//         const errorMsg = warehouseResult.reason instanceof Error
//           ? warehouseResult.reason.message : String(warehouseResult.reason);
//         warehousesToMigrate.forEach(item => {
//           onMigrationUpdate((prevItems) =>
//             prevItems.map(prevItem =>
//               prevItem.id === item.id
//                 ? { ...prevItem, status: "Failed" as const, errorMessage: errorMsg.substring(0, 200), targetWorkspace: workspace.name }
//                 : prevItem
//             )
//           );
//         });
//       }

//       const hasFailures =
//         notebookResult.status === 'rejected' ||
//         jobResult.status === 'rejected' ||
//         clusterResult.status === 'rejected' ||
//         catalogResult.status === 'rejected' ||
//         warehouseResult.status === 'rejected';

//       toast({
//         title: hasFailures ? "Migration Completed with Errors" : "Migration Complete",
//         description: hasFailures
//           ? "Some migrations failed. Check the report for details."
//           : "Check the report for detailed results",
//         variant: hasFailures ? "destructive" : "default",
//       });

//     } catch (error) {
//       console.error("💥 Unexpected migration error:", error);
//       allItemsToMigrate.forEach(item => {
//         onMigrationUpdate((prevItems) =>
//           prevItems.map(prevItem =>
//             prevItem.id === item.id
//               ? {
//                 ...prevItem,
//                 status: "Failed" as const,
//                 errorMessage: error instanceof Error ? error.message : "An unexpected error occurred",
//                 targetWorkspace: workspace.name,
//               }
//               : prevItem
//           )
//         );
//       });
//       toast({
//         title: "Migration Failed",
//         description: error instanceof Error ? error.message : "An unexpected error occurred during migration",
//         variant: "destructive",
//       });
//     } finally {
//       setIsMigrating(false);
//     }
//   };

//   const totalAssets = transformedJobs.length + transformedNotebooks.length + transformedClusters.length;

//   if (showCatalogScreen) {
//     const catalogTree = (apiResponse?.unity_catalog_summary || []).map((catalog: any) => ({
//       name: catalog.name,
//       schemas: catalog.schemas,
//     }));

//     return (
//       <CatalogTreeScreen
//         catalogs={catalogTree}
//         selectedCatalogIds={selectedCatalogIds}
//         onSelectionChange={setSelectedCatalogIds}
//         onConfirm={() => { setShowCatalogScreen(false); setShowReview(true); }}
//         onBack={() => { setShowCatalogScreen(false); setShowReview(true); }}
//         onBackToDiscovery={() => { setShowCatalogScreen(false); setShowReview(false); }}
//       />
//     );
//   }

//   if (showReview) {
//     const selectedDetails = getSelectedItemDetails();
//     const hasNotebooks = selectedDetails.some(item => item.type === "Notebook");
//     const hasJobs = selectedDetails.some(item => item.type === "Job");
//     const hasClusters = selectedDetails.some(item => item.type === "Cluster");
//     const hasWarehouses = selectedDetails.some(item => item.type === "Warehouse");

//     return (
//       <div className="min-h-screen bg-background">
//         <main className="p-6 max-w-4xl mx-auto animate-fade-in">
//           <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
//             <button onClick={() => setShowReview(false)} className="hover:text-foreground">
//               Discovery Results
//             </button>
//             <ChevronRight className="w-4 h-4" />
//             <span className="text-foreground font-medium">Review Selection</span>
//           </div>

//           <Card>
//             <CardHeader>
//               <CardTitle>Review Selected Items</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               {!hasNotebooks && !hasJobs && !hasClusters && !hasWarehouses && (
//                 <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-600">
//                   <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
//                   <p>Please select at least one item to migrate.</p>
//                 </div>
//               )}

//               {selectedItems.jobs.length > 0 && (
//                 <div>
//                   <h4 className="font-medium mb-3 flex items-center gap-2">
//                     <Briefcase className="w-4 h-4 text-primary" />
//                     Jobs ({selectedItems.jobs.length})
//                   </h4>
//                   <div className="space-y-2">
//                     {selectedDetails.filter((i) => i.type === "Job").map((item) => (
//                       <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
//                         <div>
//                           <p className="font-medium">{item.name}</p>
//                           <p className="text-sm text-muted-foreground">{item.schedule} • {item.cluster}</p>
//                         </div>
//                         <Button variant="ghost" size="icon" onClick={() => removeFromSelection("Job", item.id)}>
//                           <X className="w-4 h-4" />
//                         </Button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {selectedItems.notebooks.length > 0 && (
//                 <div>
//                   <h4 className="font-medium mb-3 flex items-center gap-2">
//                     <BookOpen className="w-4 h-4 text-primary" />
//                     Notebooks ({selectedItems.notebooks.length})
//                   </h4>
//                   <div className="space-y-2">
//                     {selectedDetails.filter((i) => i.type === "Notebook").map((item) => (
//                       <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
//                         <div>
//                           <p className="font-medium">{item.name}</p>
//                           <p className="text-sm text-muted-foreground">{item.language} • {item.path}</p>
//                         </div>
//                         <Button variant="ghost" size="icon" onClick={() => removeFromSelection("Notebook", item.id)}>
//                           <X className="w-4 h-4" />
//                         </Button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {selectedItems.clusters.length > 0 && (
//                 <div>
//                   <h4 className="font-medium mb-3 flex items-center gap-2">
//                     <Server className="w-4 h-4 text-primary" />
//                     Clusters ({selectedItems.clusters.length})
//                   </h4>
//                   <div className="space-y-2">
//                     {selectedDetails.filter((i) => i.type === "Cluster").map((item) => (
//                       <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
//                         <div>
//                           <p className="font-medium">{item.name}</p>
//                           <p className="text-sm text-muted-foreground">{item.type} • {item.runtime}</p>
//                         </div>
//                         <Button variant="ghost" size="icon" onClick={() => removeFromSelection("Cluster", item.id)}>
//                           <X className="w-4 h-4" />
//                         </Button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {selectedItems.warehouses.length > 0 && (
//                 <div>
//                   <h4 className="font-medium mb-3 flex items-center gap-2">
//                     <LayoutGrid className="w-4 h-4 text-primary" />
//                     SQL Warehouses ({selectedItems.warehouses.length})
//                   </h4>
//                   <div className="space-y-2">
//                     {selectedDetails.filter((i) => i.type === "Warehouse").map((item) => (
//                       <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
//                         <div>
//                           <p className="font-medium">{item.name}</p>
//                           <p className="text-sm text-muted-foreground">{item.type} • {item.size}</p>
//                         </div>
//                         <Button variant="ghost" size="icon" onClick={() => removeFromSelection("Warehouse", item.id)}>
//                           <X className="w-4 h-4" />
//                         </Button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {selectedCatalogIds.length > 0 && (
//                 <div>
//                   <h4 className="font-medium mb-3 flex items-center gap-2">
//                     <Database className="w-4 h-4 text-primary" />
//                     Catalogs ({[...new Set(selectedCatalogIds.map(id => id.split(".")[0]))].length})
//                   </h4>

//                   <div className="space-y-2">
//                     {[...new Set(selectedCatalogIds.map(id => id.split(".")[0]))].map((catalogName) => {
//                       const schemasForCatalog = selectedCatalogIds.filter(
//                         id => id.split(".")[0] === catalogName
//                       );

//                       return (
//                         <div
//                           key={catalogName}
//                           className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
//                         >
//                           <div>
//                             <p className="font-medium">{catalogName}</p>
//                             <p className="text-sm text-muted-foreground">
//                               {schemasForCatalog.length} schema{schemasForCatalog.length !== 1 ? "s" : ""} selected
//                             </p>
//                           </div>

//                           {/* ❌ REMOVE BUTTON */}
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             onClick={() => removeCatalog(catalogName)}
//                           >
//                             <X className="w-4 h-4" />
//                           </Button>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}

//               <div className="flex justify-between pt-4 border-t">
//                 <Button variant="outline" onClick={() => setShowReview(false)}>
//                   Back to Selection
//                 </Button>
//                 <div className="flex items-center gap-3">
//                   {transformedCatalogs.length > 0 && (
//                     <Button
//                       variant="outline"
//                       onClick={() => { setShowReview(false); setShowCatalogScreen(true); }}
//                     >
//                       <Database className="w-4 h-4" />
//                       Migrate Data
//                       {selectedCatalogIds.length > 0 && (
//                         <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
//                           {[...new Set(selectedCatalogIds.map(id => id.split(".")[0]))].length}
//                         </span>
//                       )}
//                     </Button>
//                   )}
//                   <Button
//                     variant="azure"
//                     onClick={() => setShowTargetModal(true)}
//                     disabled={(!hasNotebooks && !hasJobs && !hasClusters && !hasWarehouses) || isMigrating}
//                   >
//                     {isMigrating && <Loader2 className="w-4 h-4 animate-spin" />}
//                     Migrate
//                     <ArrowRight className="w-4 h-4" />
//                   </Button>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </main>

//         <SelectTargetModal
//           open={showTargetModal}
//           onClose={() => setShowTargetModal(false)}
//           onConfirm={handleStartMigration}
//         />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background flex">
//       <aside className="w-64 min-h-screen bg-sidebar border-r flex flex-col">
//         <div className="p-4 border-b">
//           <button
//             onClick={onBack}
//             className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2"
//           >
//             <ChevronLeft className="w-4 h-4" />
//             Back to Home
//           </button>
//           <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent">
//             <Avatar className="w-8 h-8">
//               <AvatarFallback className="bg-primary/20 text-primary text-xs">
//                 DB
//               </AvatarFallback>
//             </Avatar>
//             <div className="flex-1 min-w-0">
//               <p className="text-sm font-medium text-sidebar-foreground truncate">
//                 Databricks Workspace
//               </p>
//               <p className="text-xs text-muted-foreground">Admin Access</p>
//             </div>
//           </div>
//         </div>

//         <nav className="flex-1 p-3 pt-16">
//           <ul className="space-y-1">
//             <li>
//               <button
//                 className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors bg-sidebar-accent text-sidebar-accent-foreground font-medium"
//               >
//                 <Layers className="w-4 h-4" />
//                 Inventory
//               </button>

//               <ul className="ml-4 mt-1 space-y-1 border-l pl-3">
//                 {inventoryItems.map((item) => (
//                   <li key={item.id}>
//                     <button
//                       onClick={() => setActiveTab(item.id as TabType)}
//                       className={cn(
//                         "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors",
//                         activeTab === item.id
//                           ? "text-primary font-medium"
//                           : "text-muted-foreground hover:text-sidebar-foreground"
//                       )}
//                     >
//                       <item.icon className="w-3.5 h-3.5" />
//                       {item.label}
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </li>
//           </ul>
//         </nav>
//       </aside>

//       <div className="flex-1">
//         <main className="p-6 animate-fade-in">
//           <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
//             <span>Home</span>
//             <ChevronRight className="w-4 h-4" />
//             <span>Databricks Workspace</span>
//             <ChevronRight className="w-4 h-4" />
//             <span className="text-foreground font-medium">Discovery Results</span>
//           </div>

//           <div className="flex items-start justify-between mb-6">
//             <div>
//               <h1 className="text-2xl font-bold text-foreground mb-1">Discovery Results</h1>
//               <p className="text-sm text-success flex items-center gap-1.5">
//                 <CheckCircle2 className="w-4 h-4" />
//                 Scan completed successfully
//               </p>
//             </div>
//             <Button
//               variant="azure"
//               disabled={totalSelected === 0 || isMigrating}
//               onClick={handleMigrateClick}
//             >
//               {isMigrating && <Loader2 className="w-4 h-4 animate-spin" />}
//               Migrate Selected ({totalSelected})
//             </Button>
//           </div>

//           <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v as TabType)}>
//             <TabsList className="bg-muted/50 mb-4">
//               <TabsTrigger value="jobs" className="gap-2">
//                 <Briefcase className="w-4 h-4" />
//                 Jobs
//                 <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
//                   {transformedJobs.length}
//                 </span>
//               </TabsTrigger>
//               <TabsTrigger value="notebooks" className="gap-2">
//                 <BookOpen className="w-4 h-4" />
//                 Notebooks
//                 <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
//                   {transformedNotebooks.length}
//                 </span>
//               </TabsTrigger>
//               <TabsTrigger value="clusters" className="gap-2">
//                 <Server className="w-4 h-4" />
//                 Clusters
//                 <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
//                   {transformedClusters.length}
//                 </span>
//               </TabsTrigger>
//               <TabsTrigger value="warehouses" className="gap-2">
//                 <LayoutGrid className="w-4 h-4" />
//                 SQL Warehouses
//                 <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
//                   {transformedWarehouses.length}
//                 </span>
//               </TabsTrigger>
//             </TabsList>

//             <div className="flex items-center gap-3 mb-4">
//               <div className="relative flex-1 max-w-sm">
//                 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
//                 <Input
//                   placeholder="Search across all fields..."
//                   className="pl-9"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//               </div>
//               <div className="relative">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setShowStatusMenu(!showStatusMenu)}
//                 >
//                   <Filter className="w-4 h-4" />
//                   Status
//                   {statusFilter !== "all" && (
//                     <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary rounded text-primary-foreground">
//                       1
//                     </span>
//                   )}
//                 </Button>
//                 {showStatusMenu && (
//                   <div className="absolute top-full mt-1 right-0 bg-popover border rounded-lg shadow-lg p-1 min-w-[160px] z-10">
//                     {statusOptions.map((status) => (
//                       <button
//                         key={status}
//                         onClick={() => {
//                           setStatusFilter(status);
//                           setShowStatusMenu(false);
//                         }}
//                         className={cn(
//                           "w-full text-left px-3 py-2 text-sm rounded hover:bg-accent transition-colors",
//                           statusFilter === status && "bg-accent font-medium"
//                         )}
//                       >
//                         {status === "all" ? "All Statuses" : status}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//               {(searchQuery || statusFilter !== "all") && (
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={() => {
//                     setSearchQuery("");
//                     setStatusFilter("all");
//                   }}
//                 >
//                   <X className="w-4 h-4" />
//                   Clear
//                 </Button>
//               )}
//               <div className="ml-auto text-sm text-muted-foreground">
//                 {totalSelected} selected
//               </div>
//             </div>

//             <TabsContent value="jobs">
//               <Card>
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead className="w-12">
//                         <Checkbox
//                           checked={filteredJobs.length > 0 && filteredJobs.every((j) => selectedItems.jobs.includes(j.id))}
//                           onCheckedChange={() => toggleAll("jobs", filteredJobs)}
//                         />
//                       </TableHead>
//                       <TableHead>JOB NAME</TableHead>
//                       <TableHead>SCHEDULE</TableHead>
//                       <TableHead>STATUS</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {filteredJobs.length === 0 ? (
//                       <TableRow>
//                         <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
//                           No jobs found matching your filters
//                         </TableCell>
//                       </TableRow>
//                     ) : (
//                       paginateData(filteredJobs).map((job) => (
//                         <TableRow key={job.id} className="hover:bg-muted/50">
//                           <TableCell>
//                             <Checkbox
//                               checked={selectedItems.jobs.includes(job.id)}
//                               onCheckedChange={() => toggleSelection("jobs", job.id)}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <div className="flex items-center gap-2">
//                               <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
//                                 <Briefcase className="w-3 h-3 text-primary" />
//                               </div>
//                               <span className="font-medium text-primary">{job.name}</span>
//                             </div>
//                           </TableCell>
//                           <TableCell>{job.schedule}</TableCell>
//                           <TableCell>
//                             <StatusBadge status={job.status} />
//                           </TableCell>
//                         </TableRow>
//                       ))
//                     )}
//                   </TableBody>
//                 </Table>
//               </Card>
//             </TabsContent>

//             <TabsContent value="notebooks">
//               <Card>
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead className="w-12">
//                         <Checkbox
//                           checked={filteredNotebooks.length > 0 && filteredNotebooks.every((n) => selectedItems.notebooks.includes(n.id))}
//                           onCheckedChange={() => toggleAll("notebooks", filteredNotebooks)}
//                         />
//                       </TableHead>
//                       <TableHead className="min-w-[200px]">NOTEBOOK NAME</TableHead>
//                       <TableHead className="w-[120px]">LANGUAGE</TableHead>
//                       <TableHead className="min-w-[250px] max-w-[350px]">PATH</TableHead>
//                       <TableHead className="w-[100px]">STATUS</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {filteredNotebooks.length === 0 ? (
//                       <TableRow>
//                         <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
//                           No notebooks found matching your filters
//                         </TableCell>
//                       </TableRow>
//                     ) : (
//                       paginateData(filteredNotebooks).map((notebook) => (
//                         <TableRow key={notebook.id} className="hover:bg-muted/50">
//                           <TableCell>
//                             <Checkbox
//                               checked={selectedItems.notebooks.includes(notebook.id)}
//                               onCheckedChange={() => toggleSelection("notebooks", notebook.id)}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <div className="flex items-center gap-2">
//                               <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
//                                 <BookOpen className="w-3 h-3 text-primary" />
//                               </div>
//                               <span className="font-medium text-primary">{notebook.name}</span>
//                             </div>
//                           </TableCell>
//                           <TableCell>{notebook.language}</TableCell>
//                           <TableCell>
//                             <div className="max-w-[350px] break-words whitespace-normal">
//                               {notebook.path}
//                             </div>
//                           </TableCell>
//                           <TableCell>
//                             <StatusBadge status={notebook.status} />
//                           </TableCell>
//                         </TableRow>
//                       ))
//                     )}
//                   </TableBody>
//                 </Table>
//               </Card>
//             </TabsContent>

//             <TabsContent value="clusters">
//               <Card>
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead className="w-12">
//                         <Checkbox
//                           checked={filteredClusters.length > 0 && filteredClusters.every((c) => selectedItems.clusters.includes(c.id))}
//                           onCheckedChange={() => toggleAll("clusters", filteredClusters)}
//                         />
//                       </TableHead>
//                       <TableHead>CLUSTER NAME</TableHead>
//                       <TableHead>TYPE</TableHead>
//                       <TableHead>RUNTIME</TableHead>
//                       <TableHead>WORKERS</TableHead>
//                       <TableHead>STATUS</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {filteredClusters.length === 0 ? (
//                       <TableRow>
//                         <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
//                           No clusters found matching your filters
//                         </TableCell>
//                       </TableRow>
//                     ) : (
//                       paginateData(filteredClusters).map((cluster) => (
//                         <TableRow key={cluster.id} className="hover:bg-muted/50">
//                           <TableCell>
//                             <Checkbox
//                               checked={selectedItems.clusters.includes(cluster.id)}
//                               onCheckedChange={() => toggleSelection("clusters", cluster.id)}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <div className="flex items-center gap-2">
//                               <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
//                                 <Server className="w-3 h-3 text-primary" />
//                               </div>
//                               <span className="font-medium text-primary">{cluster.name}</span>
//                             </div>
//                           </TableCell>
//                           <TableCell>{cluster.type}</TableCell>
//                           <TableCell>{cluster.runtime}</TableCell>
//                           <TableCell>{cluster.workers}</TableCell>
//                           <TableCell>
//                             <StatusBadge status={cluster.status} />
//                           </TableCell>
//                         </TableRow>
//                       ))
//                     )}
//                   </TableBody>
//                 </Table>
//               </Card>
//             </TabsContent>

//             <TabsContent value="warehouses">
//               <Card>
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead className="w-12">
//                         <Checkbox
//                           checked={filteredWarehouses.length > 0 && filteredWarehouses.every((w) => selectedItems.warehouses.includes(w.id))}
//                           onCheckedChange={() => toggleAll("warehouses", filteredWarehouses)}
//                         />
//                       </TableHead>
//                       <TableHead>WAREHOUSE NAME</TableHead>
//                       <TableHead>TYPE</TableHead>
//                       <TableHead>SIZE</TableHead>
//                       <TableHead>STATE</TableHead>
//                       <TableHead>PHOTON</TableHead>
//                       <TableHead>AUTO STOP</TableHead>
//                       <TableHead>STATUS</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {filteredWarehouses.length === 0 ? (
//                       <TableRow>
//                         <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
//                           No SQL warehouses found matching your filters
//                         </TableCell>
//                       </TableRow>
//                     ) : (
//                       paginateData(filteredWarehouses).map((wh) => (
//                         <TableRow key={wh.id} className="hover:bg-muted/50">
//                           <TableCell>
//                             <Checkbox
//                               checked={selectedItems.warehouses.includes(wh.id)}
//                               onCheckedChange={() => toggleSelection("warehouses", wh.id)}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <div className="flex items-center gap-2">
//                               <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
//                                 <LayoutGrid className="w-3 h-3 text-primary" />
//                               </div>
//                               <span className="font-medium text-primary">{wh.name}</span>
//                             </div>
//                           </TableCell>
//                           <TableCell>{wh.type}</TableCell>
//                           <TableCell>{wh.size}</TableCell>
//                           <TableCell>{wh.state}</TableCell>
//                           <TableCell>{wh.photon}</TableCell>
//                           <TableCell>{wh.autoStop}</TableCell>
//                           <TableCell>
//                             <StatusBadge status={wh.status} />
//                           </TableCell>
//                         </TableRow>
//                       ))
//                     )}
//                   </TableBody>
//                 </Table>
//               </Card>
//             </TabsContent>
//           </Tabs>

//           {/* Pagination */}
//           <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
//             <span>
//               Showing {currentPage === 1 ? 1 : (currentPage - 1) * rowsPerPage + 1}-
//               {Math.min(currentPage * rowsPerPage,
//                 activeTab === "jobs" ? filteredJobs.length :
//                   activeTab === "notebooks" ? filteredNotebooks.length :
//                     activeTab === "warehouses" ? filteredWarehouses.length :
//                       filteredClusters.length
//               )} of {
//                 activeTab === "jobs" ? filteredJobs.length :
//                   activeTab === "notebooks" ? filteredNotebooks.length :
//                     activeTab === "warehouses" ? filteredWarehouses.length :
//                       filteredClusters.length
//               } {activeTab}
//             </span>

//             <div className="flex items-center gap-3">
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="h-8 w-8"
//                 onClick={() => setCurrentPage(p => p - 1)}
//                 disabled={currentPage === 1}
//               >
//                 <ChevronLeft className="w-4 h-4" />
//               </Button>

//               <span className="text-foreground">
//                 Page {currentPage} of {Math.ceil((
//                   activeTab === "jobs" ? filteredJobs.length :
//                     activeTab === "notebooks" ? filteredNotebooks.length :
//                       activeTab === "warehouses" ? filteredWarehouses.length :
//                         filteredClusters.length
//                 ) / rowsPerPage)}
//               </span>

//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="h-8 w-8"
//                 onClick={() => setCurrentPage(p => p + 1)}
//                 disabled={currentPage * rowsPerPage >= (
//                   activeTab === "jobs" ? filteredJobs.length :
//                     activeTab === "notebooks" ? filteredNotebooks.length :
//                       activeTab === "warehouses" ? filteredWarehouses.length :
//                         filteredClusters.length
//                 )}
//               >
//                 <ChevronRight className="w-4 h-4" />
//               </Button>
//             </div>
//           </div>
//         </main>

//         <footer className="text-center py-4 text-sm text-muted-foreground border-t">
//           © 2024 Migration Tool v3.1.0
//         </footer>
//       </div>
//       <ConnectFabricModal
//         open={showFabricModal}
//         onClose={() => setShowFabricModal(false)}
//         onConnect={handleFabricConnect}
//       />
//     </div>
//   );
// }





//25/03
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/StatusBadge";
import { SelectTargetModal } from "@/components/modals/SelectTargetModal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useDatabricksCredentials } from "@/contexts/DatabricksCredentialsContext";
import type { Status } from "@/types/migration";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Search,
  Filter,
  CheckCircle2,
  Database,
  BookOpen,
  Briefcase,
  ArrowRight,
  X,
  ChevronRight,
  ChevronLeft,
  Layers,
  LogOut,
  Server,
  Loader2,
  AlertCircle,
  LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFabricCredentials } from "@/contexts/FabricCredentialsContext";
import { CatalogTreeScreen } from "@/components/CatalogTreeScreen";
import { ConnectFabricModal } from "@/components/modals/ConnectFabricModal";

interface DatabricksMigrationWorkspaceProps {
  onLogout: () => void;
  onBack: () => void;
  onMigrationComplete: (items: any[]) => void;
  onMigrationUpdate: (updateFn: (prev: any[]) => any[]) => void;
  onWorkspaceSelected: (workspaceId: string) => void
  apiResponse: {
    counts: {
      notebooks: number;
      folders: number;
      jobs: number;
      clusters: number;
      catalogs?: number;
      sql_warehouses?: number;
    };
    notebooks: any[];
    folders: any[];
    jobs: any[];
    clusters: any[];
    sql_warehouses?: {
      id: string;
      name: string;
      size: string;
      cluster_size: string;
      warehouse_type: string;
      state: string;
      enable_photon: boolean;
      enable_serverless_compute: boolean;
      auto_stop_mins: number;
      creator_name: string;
    }[];
    unity_catalog_summary?: {
      name: string;
      schemas: { name: string; table_count: number; table_names: string[]; }[];
    }[];
  };
}

type TabType = "jobs" | "notebooks" | "clusters" | "warehouses";

const inventoryItems = [
  { id: "jobs", label: "Jobs", icon: Briefcase },
  { id: "notebooks", label: "Notebooks", icon: BookOpen },
  { id: "clusters", label: "Clusters", icon: Server },
  { id: "warehouses", label: "SQL Warehouses", icon: LayoutGrid },
];

export function DatabricksMigrationWorkspace({
  onLogout,
  onBack,
  onMigrationComplete,
  onMigrationUpdate,
  onWorkspaceSelected,
  apiResponse
}: DatabricksMigrationWorkspaceProps) {
  const { toast } = useToast();
  const { credentials: databricksCredentials } = useDatabricksCredentials();
  const { credentials: fabricCredentials, setCredentials: setFabricCredentials } = useFabricCredentials();

  const transformedJobs = (apiResponse?.jobs || []).map((job: any, index: number) => ({
    id: job.job_id?.toString() || index.toString(),
    name: job.settings?.name || `Job ${index + 1}`,
    schedule: job.settings?.schedule?.quartz_cron_expression ||
      job.settings?.trigger?.pause_status || "Manual",
    lastRun: job.last_run?.start_time ?
      new Date(job.last_run.start_time).toLocaleString() : "N/A",
    cluster: job.settings?.tasks?.[0]?.existing_cluster_id ||
      job.settings?.job_clusters?.[0]?.new_cluster?.cluster_name ||
      job.settings?.new_cluster?.cluster_name || "N/A",
    status: (job.last_run?.state?.life_cycle_state === "TERMINATED" &&
      job.last_run?.state?.result_state === "SUCCESS") ? "Success" :
      job.last_run?.state?.life_cycle_state === "RUNNING" ? "Running" :
        job.last_run?.state?.result_state === "FAILED" ? "Failed" : "Ready" as Status,
  }));

  const transformedNotebooks = (apiResponse?.notebooks || []).map((notebook: any, index: number) => ({
    id: index.toString(),
    name: notebook.name || notebook.path?.split('/').pop() || `Notebook ${index + 1}`,
    language: notebook.language || "Unknown",
    lastModified: "N/A",
    path: notebook.path || "/",
    status: "Ready" as Status,
  }));

  const transformedClusters = (apiResponse?.clusters || []).map((cluster: any, index: number) => ({
    id: cluster.cluster_id || index.toString(),
    name: cluster.cluster_name || `Cluster ${index + 1}`,
    type: cluster.cluster_source || "Interactive",
    state: cluster.state || "Unknown",
    runtime: cluster.spark_version || "N/A",
    workers: cluster.num_workers !== undefined ? cluster.num_workers.toString() : "N/A",
    status: "Ready" as Status,
  }));

  const transformedCatalogs = (apiResponse?.unity_catalog_summary || []).flatMap(
    (catalog: any) =>
      catalog.schemas.map((schema: any) => ({
        id: `${catalog.name}.${schema.name}`,
        catalogName: catalog.name,
        schemaName: schema.name,
        tableCount: schema.table_count,
        tableNames: schema.table_names,
        status: "Ready" as Status,
      }))
  );

  const transformedWarehouses = (apiResponse?.sql_warehouses || []).map((wh: any) => ({
    id: wh.id,
    name: wh.name,
    size: wh.cluster_size,
    type: wh.warehouse_type,
    state: wh.state,
    photon: wh.enable_photon ? "Enabled" : "Disabled",
    serverless: wh.enable_serverless_compute ? "Enabled" : "Disabled",
    autoStop: `${wh.auto_stop_mins} min`,
    creator: wh.creator_name,
    status: "Ready" as Status,
  }));

  const [activeTab, setActiveTab] = useState<TabType>("jobs");
  const [selectedItems, setSelectedItems] = useState<Record<TabType, string[]>>({
    jobs: [],
    notebooks: [],
    clusters: [],
    warehouses: [],
  });
  const [showReview, setShowReview] = useState(false);
  const [showCatalogScreen, setShowCatalogScreen] = useState(false);
  const [selectedCatalogIds, setSelectedCatalogIds] = useState<string[]>([]);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [showFabricModal, setShowFabricModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const removeCatalog = (catalogName: string) => {
    setSelectedCatalogIds((prev) =>
      prev.filter((id) => !id.startsWith(`${catalogName}.`))
    );
  };

  const paginateData = (data: any[]) => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return data.slice(startIndex, startIndex + rowsPerPage);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleFabricConnect = (apiResponse: any) => {
    setShowFabricModal(false);
    setShowReview(true);
  };

  const handleMigrateClick = () => {
    const selectedDetails = getSelectedItemDetails();
    const hasNotebooks = selectedDetails.some(item => item.type === "Notebook");
    const hasJobs = selectedDetails.some(item => item.type === "Job");
    const hasClusters = selectedDetails.some(item => item.type === "Cluster");
    const hasWarehouses = selectedDetails.some(item => item.type === "Warehouse");
    if (!hasNotebooks && !hasJobs && !hasClusters && !hasWarehouses) {
      toast({
        title: "No Items Selected",
        description: "Please select at least one item to migrate.",
        variant: "destructive",
      });
      return;
    }

    if (!fabricCredentials) {
      setShowFabricModal(true);
    } else {
      setShowReview(true);
    }
  };

  const toggleSelection = (tab: TabType, id: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [tab]: prev[tab].includes(id)
        ? prev[tab].filter((i) => i !== id)
        : [...prev[tab], id],
    }));
  };

  const toggleAll = (tab: TabType, items: { id: string }[]) => {
    const allIds = items.map((i) => i.id);
    const allSelected = allIds.every((id) => selectedItems[tab].includes(id));
    setSelectedItems((prev) => ({
      ...prev,
      [tab]: allSelected ? [] : allIds,
    }));
  };

  const filterItems = <T extends Record<string, any>>(items: T[]) => {
    return items.filter((item) => {
      const searchableFields = Object.values(item).join(' ').toLowerCase();
      const matchesSearch = searchableFields.includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const filteredJobs = filterItems(transformedJobs);
  const filteredNotebooks = filterItems(transformedNotebooks);
  const filteredClusters = filterItems(transformedClusters);
  const filteredWarehouses = filterItems(transformedWarehouses);

  const statusOptions = ["all", "Success", "Running", "Failed", "Ready"];

  const totalSelected =
    selectedItems.jobs.length +
    selectedItems.notebooks.length +
    selectedItems.clusters.length +
    selectedItems.warehouses.length;

  const getSelectedItemDetails = () => {
    const items: any[] = [];
    selectedItems.jobs.forEach((id) => {
      const item = transformedJobs.find((j) => j.id === id);
      if (item) items.push({ ...item, type: "Job", source: "databricks" });
    });
    selectedItems.notebooks.forEach((id) => {
      const item = transformedNotebooks.find((n) => n.id === id);
      if (item) items.push({ ...item, type: "Notebook", source: "databricks" });
    });
    selectedItems.clusters.forEach((id) => {
      const item = transformedClusters.find((c) => c.id === id);
      if (item) items.push({ ...item, type: "Cluster", source: "databricks" });
    });
    selectedItems.warehouses.forEach((id) => {
      const item = transformedWarehouses.find((w) => w.id === id);
      if (item) items.push({
        ...item,
        type: "Warehouse",
        warehouseType: item.type,
        source: "databricks"
      });
    });
    return items;
  };

  const removeFromSelection = (type: string, id: string) => {
    const tabMap: Record<string, TabType> = {
      Job: "jobs",
      Notebook: "notebooks",
      Cluster: "clusters",
      Warehouse: "warehouses",
    };
    const tab = tabMap[type];
    if (tab) {
      setSelectedItems((prev) => ({
        ...prev,
        [tab]: prev[tab].filter((i) => i !== id),
      }));
    }
  };

  const migrateNotebooks = async (workspace: any, notebooks: any[], replaceIfExists: boolean = false) => {
    const payload = {
      tenantId: fabricCredentials!.tenantId,
      clientId: fabricCredentials!.clientId,
      clientSecret: fabricCredentials!.clientSecret,
      workspaceId: workspace.id,
      databricksUrl: databricksCredentials!.databricksUrl,
      personalAccessToken: databricksCredentials!.personalAccessToken,
      replaceIfExists: replaceIfExists,
      notebooks: notebooks.map(nb => ({
        name: nb.name,
        path: nb.path
      }))
    };

    console.log("📤 Notebook migration payload:", payload);

    try {
      const response = await fetch(
        "https://20.106.196.248/DbMigrateNotebooks",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      console.log(`📥 Notebook API Response Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Notebook API Error Response:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`);
      }

      const result = await response.json();
      console.log("📊 Notebook migration result:", JSON.stringify(result, null, 2));

      if (!result.details || !Array.isArray(result.details)) {
        console.error("❌ Invalid response structure:", result);
        throw new Error(`Invalid API response: missing 'details' array`);
      }

      notebooks.forEach(item => {
        const detail = result.details.find((d: any) => d.name === item.name);

        let status: Status = "Success";
        let errorMessage: string | undefined = undefined;
        let runId: string | undefined = undefined;

        if (detail) {
          console.log(`Processing notebook "${item.name}" with status: ${detail.status}`);

          runId = detail.run_id || result.run_id;

          if (detail.status === "created") {
            status = "Success";
          } else if (detail.status === "replaced") {
            status = "Replaced";
          } else if (detail.status === "already-exists") {
            status = "Failed";
            errorMessage = "already exists";
          } else if (detail.status === "skipped") {
            status = "Skipped";
            errorMessage = "already exists";
          } else if (detail.status === "failed") {
            status = "Failed";
            errorMessage = detail.error || "Migration failed";
          } else if (detail.status === "export-failed") {
            status = "Failed";
            errorMessage = detail.error || "Failed to export from Databricks";
          } else if (detail.status === "invalid-input") {
            status = "Failed";
            errorMessage = "Invalid notebook name or path";
          } else {
            console.warn(`⚠️ Unknown status "${detail.status}" for notebook "${item.name}"`);
            status = "Failed";
            errorMessage = `Unknown status: ${detail.status}`;
          }
        } else {
          console.error(`⚠️ Notebook "${item.name}" not found in API response`);
          status = "Failed";
          errorMessage = "Not returned in API response";
          runId = result.run_id;
        }

        console.log(`📝 Updating notebook "${item.name}" with runId:`, runId);

        onMigrationUpdate((prevItems) =>
          prevItems.map(prevItem =>
            prevItem.id === item.id
              ? {
                ...prevItem,
                status,
                errorMessage,
                runId,
                targetWorkspace: workspace.name
              }
              : prevItem
          )
        );
      });

      return null;

    } catch (error) {
      console.error("💥 Notebook migration error:", error);
      throw error;
    }
  };

  const migrateJobs = async (workspace: any, jobs: any[]) => {
    const payload = {
      tenantId: fabricCredentials!.tenantId,
      clientId: fabricCredentials!.clientId,
      clientSecret: fabricCredentials!.clientSecret,
      workspaceId: workspace.id,
      databricksUrl: databricksCredentials!.databricksUrl,
      personalAccessToken: databricksCredentials!.personalAccessToken,
      jobid: jobs.map(job => job.id)
    };

    console.log("📤 Job migration payload:", payload);

    try {
      const startResponse = await fetch(
        "https://20.106.196.248/MigrateJobsHttpStarter",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!startResponse.ok) {
        const errorText = await startResponse.text();
        throw new Error(`Failed to start job migration: HTTP ${startResponse.status}: ${errorText.substring(0, 200)}`);
      }

      const orchestrationInfo = await startResponse.json();
      const statusQueryUri = orchestrationInfo.statusQueryGetUri;

      if (!statusQueryUri) {
        throw new Error("No statusQueryGetUri returned from orchestration starter");
      }

      console.log(`🚀 Job migration orchestration started. Instance ID: ${orchestrationInfo.instanceId}`);
      console.log(`🔍 Polling status at: ${statusQueryUri}`);

      const MAX_POLLS = 120;
      const POLL_INTERVAL_MS = 5000;

      let result: any = null;

      for (let attempt = 1; attempt <= MAX_POLLS; attempt++) {
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));

        const statusResponse = await fetch(statusQueryUri);

        if (!statusResponse.ok) {
          console.warn(`⚠️ Poll attempt ${attempt} failed: HTTP ${statusResponse.status}`);
          continue;
        }

        const statusData = await statusResponse.json();
        console.log(`📊 Poll ${attempt}: runtimeStatus = ${statusData.runtimeStatus}`);

        if (statusData.runtimeStatus === "Completed") {
          result = statusData.output;
          console.log("✅ Orchestration completed:", JSON.stringify(result, null, 2));
          break;
        } else if (statusData.runtimeStatus === "Failed" || statusData.runtimeStatus === "Terminated") {
          throw new Error(`Job migration orchestration ${statusData.runtimeStatus.toLowerCase()}`);
        }
      }

      if (!result) {
        throw new Error("Job migration timed out after polling");
      }

      if (!result || typeof result !== 'object') {
        throw new Error(`Invalid API response: expected object, got ${typeof result}`);
      }

      jobs.forEach(item => {
        const createdDetail = result.created?.find((d: any) => d.job_id === item.id);
        const existsDetail = result.already_exist?.find((d: any) => d.job_id === item.id);
        const failedDetail = result.failed?.find((d: any) => d.job_id === item.id);

        let status: Status = "Failed";
        let errorMessage: string | undefined = undefined;
        let fabricPipelineId: string | undefined = undefined;
        let runId: string | undefined = undefined;

        if (createdDetail) {
          status = "Success";
          fabricPipelineId = createdDetail.fabric_pipeline_id;
          runId = createdDetail.run_id;
          console.log(`✅ Job "${item.name}" - Success with runId:`, runId);
        } else if (existsDetail) {
          status = "Failed";
          errorMessage = "already exists";
          fabricPipelineId = existsDetail.pipeline_id;
          runId = existsDetail.run_id;
          console.log(`⚠️ Job "${item.name}" - Already exists with runId:`, runId);
        } else if (failedDetail) {
          status = "Failed";
          errorMessage = failedDetail.error || "Migration failed";
          runId = failedDetail.run_id;
          console.log(`❌ Job "${item.name}" - Failed with runId:`, runId, "Error:", errorMessage);
        } else {
          console.error(`⚠️ Job "${item.name}" (${item.id}) not found in any response array`);
          errorMessage = "Not returned in API response";
        }

        console.log(`📝 Updating job "${item.name}" with:`, { status, errorMessage, runId, fabricPipelineId });

        onMigrationUpdate((prevItems) =>
          prevItems.map(prevItem =>
            prevItem.id === item.id
              ? { ...prevItem, status, errorMessage, fabricPipelineId, runId, targetWorkspace: workspace.name }
              : prevItem
          )
        );
      });

      return null;

    } catch (error) {
      console.error("💥 Job migration error:", error);
      throw error;
    }
  };

  const migrateClusters = async (workspace: any, clusters: any[], capacityId: string) => {
    const payload = {
      databricks: {
        host: databricksCredentials!.databricksUrl,
        pat: databricksCredentials!.personalAccessToken
      },
      fabric: {
        tenantId: fabricCredentials!.tenantId,
        clientId: fabricCredentials!.clientId,
        clientSecret: fabricCredentials!.clientSecret,
        capacityId: capacityId,
        workspaceId: workspace.id
      },
      selectedClusters: clusters.map(cluster => cluster.id)
    };

    console.log("📤 Cluster migration payload:", payload);

    try {
      const response = await fetch(
        "https://20.106.196.248/DbClusterMigration",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      console.log(`📥 Cluster API Response Status: ${response.status} ${response.statusText}`);

      let result;
      const responseText = await response.text();

      try {
        result = JSON.parse(responseText);
        console.log("📊 Cluster migration result:", JSON.stringify(result, null, 2));
      } catch (parseError) {
        console.error("❌ Failed to parse response as JSON:", responseText);
        throw new Error(`HTTP ${response.status}: ${responseText.substring(0, 200)}`);
      }

      if (!result || typeof result !== 'object') {
        console.error("❌ Invalid response structure:", result);
        throw new Error(`Invalid API response: expected object, got ${typeof result}`);
      }

      clusters.forEach(item => {
        const successDetail = result.Success?.find((successItem: any) => {
          if (typeof successItem === 'string') {
            return successItem === item.name || successItem === item.id;
          }
          return successItem.name === item.name || successItem.name === item.id;
        });

        const failedDetail = result.Failed?.find((f: any) =>
          f.name === item.name || f.name === item.id
        );

        let status: Status = "Failed";
        let errorMessage: string | undefined = undefined;
        let runId: string | undefined = undefined;

        if (successDetail) {
          console.log(`✅ Cluster "${item.name}" migrated successfully`);
          status = "Success";
          runId = typeof successDetail === 'object' ? successDetail.run_id : undefined;
          console.log(`✅ Cluster "${item.name}" - Success with runId:`, runId);
        } else if (failedDetail) {
          console.error(`❌ Cluster "${item.name}" failed:`, failedDetail.message);
          status = "Failed";

          const rawMessage = failedDetail.message || "Migration failed";
          if (rawMessage.toLowerCase().includes("already exists")) {
            errorMessage = "already exists";
          } else {
            errorMessage = rawMessage;
          }

          runId = failedDetail.run_id;
          console.log(`❌ Cluster "${item.name}" - Failed with runId:`, runId);
        } else {
          console.error(`⚠️ Cluster "${item.name}" (${item.id}) not found in API response`);
          errorMessage = "Not returned in API response";
        }

        console.log(`📝 Updating cluster "${item.name}" with:`, {
          status,
          errorMessage,
          runId,
          targetWorkspace: workspace.name
        });

        onMigrationUpdate((prevItems) =>
          prevItems.map(prevItem =>
            prevItem.id === item.id
              ? {
                ...prevItem,
                status,
                errorMessage,
                runId,
                targetWorkspace: workspace.name
              }
              : prevItem
          )
        );
      });

      return null;

    } catch (error) {
      console.error("💥 Cluster migration error:", error);
      throw error;
    }
  };

  const migrateCatalogs = async (workspace: any, catalogNames: string[]) => {
    const payload = {
      databricksUrl: databricksCredentials!.databricksUrl,
      personalAccessToken: databricksCredentials!.personalAccessToken,
      jobId: 967101084886600,
      catalogs: catalogNames,
      fabric: {
        tenantId: fabricCredentials!.tenantId,
        clientId: fabricCredentials!.clientId,
        clientSecret: fabricCredentials!.clientSecret,
        workspaceId: workspace.id,
      },
    };

    console.log("📤 Catalog migration payload:", payload);

    const response = await fetch("https://20.106.196.248/CatalogMigration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let result: any;
    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error(`HTTP ${response.status}: ${responseText.substring(0, 200)}`);
    }

    if (!response.ok) {
      throw new Error(result?.message || `HTTP ${response.status}`);
    }

    console.log("📊 Catalog migration result:", JSON.stringify(result, null, 2));

    const created: any[] = result.created ?? [];
    const alreadyExist: any[] = result.already_exist ?? [];
    const failed: any[] = result.failed ?? [];

    catalogNames.forEach((catalogName) => {
      const itemId = `catalog-${catalogName}`;

      const createdDetail = created.find((d) => d.catalog === catalogName);
      const existsDetail = alreadyExist.find((d) => d.catalog === catalogName);
      const failedDetail = failed.find((d) => d.catalog === catalogName);

      let status: Status = "Failed";
      let errorMessage: string | undefined;
      let runId: string | undefined;

      if (createdDetail) {
        status = "Success";
        runId = createdDetail.run_id?.toString();
      } else if (existsDetail) {
        status = "Failed";
        errorMessage = "already exists";
        runId = existsDetail.run_id?.toString();
      } else if (failedDetail) {
        status = "Failed";
        errorMessage = failedDetail.error || "Catalog migration failed";
        runId = failedDetail.run_id?.toString();
      } else {
        status = "Failed";
        errorMessage = "Not returned in API response";
      }

      onMigrationUpdate((prevItems) =>
        prevItems.map((prevItem) =>
          prevItem.id === itemId
            ? { ...prevItem, status, errorMessage, runId, targetWorkspace: workspace.name }
            : prevItem
        )
      );
    });
  };

  const migrateWarehouses = async (workspace: any, warehouses: any[]) => {
    const payload = {
      databricks: {
        host: databricksCredentials!.databricksUrl,
        pat: databricksCredentials!.personalAccessToken,
      },
      fabric: {
        tenantId: fabricCredentials!.tenantId,
        clientId: fabricCredentials!.clientId,
        clientSecret: fabricCredentials!.clientSecret,
        workspaceId: workspace.id,
      },
      "Warehouse Ids": warehouses.map((wh) => wh.id),
    };

    console.log("📤 Warehouse migration payload:", payload);

    const response = await fetch("https://20.106.196.248/Sqlwarehouse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let result: any;
    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error(`HTTP ${response.status}: ${responseText.substring(0, 200)}`);
    }

    if (!response.ok) {
      throw new Error(result?.message || `HTTP ${response.status}`);
    }

    console.log("📊 Warehouse migration result:", JSON.stringify(result, null, 2));

    const created: any[] = result.created ?? [];
    const alreadyExist: any[] = result.already_exist ?? [];
    const failed: any[] = result.failed ?? [];

    warehouses.forEach((item) => {
      const createdDetail = created.find((d) => d.databricks_id === item.id);
      const existsDetail = alreadyExist.find((d) => d.databricks_id === item.id);
      const failedDetail = failed.find((d) => d.databricks_id === item.id);

      let status: Status = "Failed";
      let errorMessage: string | undefined;
      let runId: string | undefined;

      if (createdDetail) {
        status = "Success";
        runId = createdDetail.runId;
      } else if (existsDetail) {
        status = "Failed";
        errorMessage = "already exists";
        runId = existsDetail.runId;
      } else if (failedDetail) {
        status = "Failed";
        errorMessage = failedDetail.error || "Warehouse migration failed";
        runId = failedDetail.runId;
      } else {
        status = "Failed";
        errorMessage = "Not returned in API response";
      }

      console.log(`📝 Warehouse "${item.name}" → ${status}`);

      onMigrationUpdate((prevItems) =>
        prevItems.map((prevItem) =>
          prevItem.id === item.id
            ? { ...prevItem, status, errorMessage, runId, targetWorkspace: workspace.name }
            : prevItem
        )
      );
    });
  };

  const handleStartMigration = async (workspace: any) => {
    const selectedDetails = getSelectedItemDetails();
    const notebooksToMigrate = selectedDetails.filter(item => item.type === "Notebook");
    const jobsToMigrate = selectedDetails.filter(item => item.type === "Job");
    const clustersToMigrate = selectedDetails.filter(item => item.type === "Cluster");
    const warehousesToMigrate = selectedDetails.filter(item => item.type === "Warehouse"); // ← moved up

    const catalogNamesToMigrate = [...new Set(
      selectedCatalogIds.map(id => id.split(".")[0])
    )];

    if (
      notebooksToMigrate.length === 0 &&
      jobsToMigrate.length === 0 &&
      clustersToMigrate.length === 0 &&
      warehousesToMigrate.length === 0 &&  // ← added to validation
      catalogNamesToMigrate.length === 0
    ) {
      toast({
        title: "No Items Selected",
        description: "Please select at least one item to migrate.",
        variant: "destructive",
      });
      return;
    }

    if (!databricksCredentials?.databricksUrl || !databricksCredentials?.personalAccessToken) {
      toast({
        title: "Missing Databricks Credentials",
        description: "Databricks credentials not found. Please reconnect.",
        variant: "destructive",
      });
      return;
    }

    if (!fabricCredentials?.tenantId || !fabricCredentials?.clientId || !fabricCredentials?.clientSecret) {
      toast({
        title: "Missing Fabric Credentials",
        description: "Fabric credentials not found. Please connect to Fabric.",
        variant: "destructive",
      });
      return;
    }

    onWorkspaceSelected(workspace.id);
    setIsMigrating(true);
    setShowTargetModal(false);

    const catalogItems = catalogNamesToMigrate.map(catalogName => ({
      id: `catalog-${catalogName}`,
      name: catalogName,
      type: "Catalog" as const,
      source: "databricks",
      targetWorkspace: workspace.name,
      targetWorkspaceId: workspace.id,
      status: "Running" as const,
      databricksUrl: databricksCredentials!.databricksUrl,
      personalAccessToken: databricksCredentials!.personalAccessToken,
    }));

    const allItemsToMigrate = [
      ...notebooksToMigrate,
      ...jobsToMigrate,
      ...clustersToMigrate,
      ...warehousesToMigrate,
    ];

    const initialMigrationItems = [
      ...allItemsToMigrate.map(item => ({
        ...item,
        targetWorkspace: workspace.name,
        targetWorkspaceId: workspace.id,
        status: "Running" as const,
      })),
      ...catalogItems,
    ];

    console.log("🚀 Initial migration items created:", initialMigrationItems.length);
    onMigrationComplete(initialMigrationItems);

    try {
      console.log("🚀 Starting migrations:", {
        notebooks: notebooksToMigrate.length,
        jobs: jobsToMigrate.length,
        clusters: clustersToMigrate.length,
        warehouses: warehousesToMigrate.length,
        catalogs: catalogNamesToMigrate.length,
      });

      const results = await Promise.allSettled([
        notebooksToMigrate.length > 0 ? migrateNotebooks(workspace, notebooksToMigrate, false) : Promise.resolve(null),
        jobsToMigrate.length > 0 ? migrateJobs(workspace, jobsToMigrate) : Promise.resolve(null),
        clustersToMigrate.length > 0 ? migrateClusters(workspace, clustersToMigrate, workspace.capacity) : Promise.resolve(null),
        catalogNamesToMigrate.length > 0 ? migrateCatalogs(workspace, catalogNamesToMigrate) : Promise.resolve(null),
        warehousesToMigrate.length > 0 ? migrateWarehouses(workspace, warehousesToMigrate) : Promise.resolve(null),
      ]);

      // ← single destructure, 5 elements
      const [notebookResult, jobResult, clusterResult, catalogResult, warehouseResult] = results;

      console.log("📊 Migration results:", {
        notebooks: notebookResult.status,
        jobs: jobResult.status,
        clusters: clusterResult.status,
        catalogs: catalogResult.status,
        warehouses: warehouseResult.status,
      });

      if (notebookResult.status === 'rejected') {
        console.error("❌ Notebook migration promise rejected:", notebookResult.reason);
        const errorMsg = notebookResult.reason instanceof Error
          ? notebookResult.reason.message : String(notebookResult.reason);
        notebooksToMigrate.forEach(item => {
          onMigrationUpdate((prevItems) =>
            prevItems.map(prevItem =>
              prevItem.id === item.id
                ? { ...prevItem, status: "Failed" as const, errorMessage: errorMsg.substring(0, 200), targetWorkspace: workspace.name }
                : prevItem
            )
          );
        });
      }

      if (jobResult.status === 'rejected') {
        console.error("❌ Job migration promise rejected:", jobResult.reason);
        const errorMsg = jobResult.reason instanceof Error
          ? jobResult.reason.message : String(jobResult.reason);
        jobsToMigrate.forEach(item => {
          onMigrationUpdate((prevItems) =>
            prevItems.map(prevItem =>
              prevItem.id === item.id
                ? { ...prevItem, status: "Failed" as const, errorMessage: errorMsg.substring(0, 200), targetWorkspace: workspace.name }
                : prevItem
            )
          );
        });
      }

      if (clusterResult.status === 'rejected') {
        console.error("❌ Cluster migration promise rejected:", clusterResult.reason);
        const errorMsg = clusterResult.reason instanceof Error
          ? clusterResult.reason.message : String(clusterResult.reason);
        clustersToMigrate.forEach(item => {
          onMigrationUpdate((prevItems) =>
            prevItems.map(prevItem =>
              prevItem.id === item.id
                ? { ...prevItem, status: "Failed" as const, errorMessage: errorMsg.substring(0, 200), targetWorkspace: workspace.name }
                : prevItem
            )
          );
        });
      }

      if (catalogResult.status === 'rejected') {
        console.error("❌ Catalog migration promise rejected:", catalogResult.reason);
        const errorMsg = catalogResult.reason instanceof Error
          ? catalogResult.reason.message : String(catalogResult.reason);
        catalogNamesToMigrate.forEach(catalogName => {
          onMigrationUpdate((prevItems) =>
            prevItems.map(prevItem =>
              prevItem.id === `catalog-${catalogName}`
                ? { ...prevItem, status: "Failed" as const, errorMessage: errorMsg.substring(0, 200), targetWorkspace: workspace.name }
                : prevItem
            )
          );
        });
      }

      if (warehouseResult.status === 'rejected') {
        console.error("❌ Warehouse migration promise rejected:", warehouseResult.reason);
        const errorMsg = warehouseResult.reason instanceof Error
          ? warehouseResult.reason.message : String(warehouseResult.reason);
        warehousesToMigrate.forEach(item => {
          onMigrationUpdate((prevItems) =>
            prevItems.map(prevItem =>
              prevItem.id === item.id
                ? { ...prevItem, status: "Failed" as const, errorMessage: errorMsg.substring(0, 200), targetWorkspace: workspace.name }
                : prevItem
            )
          );
        });
      }

      const hasFailures =
        notebookResult.status === 'rejected' ||
        jobResult.status === 'rejected' ||
        clusterResult.status === 'rejected' ||
        catalogResult.status === 'rejected' ||
        warehouseResult.status === 'rejected';

      toast({
        title: hasFailures ? "Migration Completed with Errors" : "Migration Complete",
        description: hasFailures
          ? "Some migrations failed. Check the report for details."
          : "Check the report for detailed results",
        variant: hasFailures ? "destructive" : "default",
      });

    } catch (error) {
      console.error("💥 Unexpected migration error:", error);
      allItemsToMigrate.forEach(item => {
        onMigrationUpdate((prevItems) =>
          prevItems.map(prevItem =>
            prevItem.id === item.id
              ? {
                ...prevItem,
                status: "Failed" as const,
                errorMessage: error instanceof Error ? error.message : "An unexpected error occurred",
                targetWorkspace: workspace.name,
              }
              : prevItem
          )
        );
      });
      toast({
        title: "Migration Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred during migration",
        variant: "destructive",
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const totalAssets = transformedJobs.length + transformedNotebooks.length + transformedClusters.length;

  if (showCatalogScreen) {
    const catalogTree = (apiResponse?.unity_catalog_summary || []).map((catalog: any) => ({
      name: catalog.name,
      schemas: catalog.schemas,
    }));

    return (
      <CatalogTreeScreen
        catalogs={catalogTree}
        selectedCatalogIds={selectedCatalogIds}
        onSelectionChange={setSelectedCatalogIds}
        onConfirm={() => { setShowCatalogScreen(false); setShowReview(true); }}
        onBack={() => { setShowCatalogScreen(false); setShowReview(true); }}
        onBackToDiscovery={() => { setShowCatalogScreen(false); setShowReview(false); }}
      />
    );
  }

  if (showReview) {
    const selectedDetails = getSelectedItemDetails();
    const hasNotebooks = selectedDetails.some(item => item.type === "Notebook");
    const hasJobs = selectedDetails.some(item => item.type === "Job");
    const hasClusters = selectedDetails.some(item => item.type === "Cluster");
    const hasWarehouses = selectedDetails.some(item => item.type === "Warehouse");

    return (
      <div className="min-h-screen bg-background">
        <main className="p-6 max-w-4xl mx-auto animate-fade-in">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <button onClick={() => setShowReview(false)} className="hover:text-foreground">
              Discovery Results
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">Review Selection</span>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Review Selected Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!hasNotebooks && !hasJobs && !hasClusters && !hasWarehouses && (
                <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-600">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>Please select at least one item to migrate.</p>
                </div>
              )}

              {selectedItems.jobs.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" />
                    Jobs ({selectedItems.jobs.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedDetails.filter((i) => i.type === "Job").map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.schedule} • {item.cluster}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeFromSelection("Job", item.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedItems.notebooks.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    Notebooks ({selectedItems.notebooks.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedDetails.filter((i) => i.type === "Notebook").map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.language} • {item.path}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeFromSelection("Notebook", item.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedItems.clusters.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Server className="w-4 h-4 text-primary" />
                    Clusters ({selectedItems.clusters.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedDetails.filter((i) => i.type === "Cluster").map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.type} • {item.runtime}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeFromSelection("Cluster", item.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedItems.warehouses.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-primary" />
                    SQL Warehouses ({selectedItems.warehouses.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedDetails.filter((i) => i.type === "Warehouse").map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.type} • {item.size}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeFromSelection("Warehouse", item.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedCatalogIds.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Database className="w-4 h-4 text-primary" />
                    Catalogs ({[...new Set(selectedCatalogIds.map(id => id.split(".")[0]))].length})
                  </h4>

                  <div className="space-y-2">
                    {[...new Set(selectedCatalogIds.map(id => id.split(".")[0]))].map((catalogName) => {
                      const schemasForCatalog = selectedCatalogIds.filter(
                        id => id.split(".")[0] === catalogName
                      );

                      return (
                        <div
                          key={catalogName}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{catalogName}</p>
                            <p className="text-sm text-muted-foreground">
                              {schemasForCatalog.length} schema{schemasForCatalog.length !== 1 ? "s" : ""} selected
                            </p>
                          </div>

                          {/* ❌ REMOVE BUTTON */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCatalog(catalogName)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => setShowReview(false)}>
                  Back to Selection
                </Button>
                <div className="flex items-center gap-3">
                  {transformedCatalogs.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => { setShowReview(false); setShowCatalogScreen(true); }}
                    >
                      <Database className="w-4 h-4" />
                      Migrate Data
                      {selectedCatalogIds.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
                          {[...new Set(selectedCatalogIds.map(id => id.split(".")[0]))].length}
                        </span>
                      )}
                    </Button>
                  )}
                  <Button
                    variant="azure"
                    onClick={() => setShowTargetModal(true)}
                    disabled={(!hasNotebooks && !hasJobs && !hasClusters && !hasWarehouses) || isMigrating}
                  >
                    {isMigrating && <Loader2 className="w-4 h-4 animate-spin" />}
                    Migrate
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

        <SelectTargetModal
          open={showTargetModal}
          onClose={() => setShowTargetModal(false)}
          onConfirm={handleStartMigration}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 min-h-screen bg-sidebar border-r flex flex-col">
        <div className="p-4 border-b">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </button>
          <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary/20 text-primary text-xs">
                DB
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                Databricks Workspace
              </p>
              <p className="text-xs text-muted-foreground">Admin Access</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 pt-16">
          <ul className="space-y-1">
            <li>
              <button
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              >
                <Layers className="w-4 h-4" />
                Inventory
              </button>

              <ul className="ml-4 mt-1 space-y-1 border-l pl-3">
                {inventoryItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id as TabType)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors",
                        activeTab === item.id
                          ? "text-primary font-medium"
                          : "text-muted-foreground hover:text-sidebar-foreground"
                      )}
                    >
                      <item.icon className="w-3.5 h-3.5" />
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </aside>

      <div className="flex-1">
        <main className="p-6 animate-fade-in">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span>Home</span>
            <ChevronRight className="w-4 h-4" />
            <span>Databricks Workspace</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">Discovery Results</span>
          </div>

          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">Discovery Results</h1>
              <p className="text-sm text-success flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Scan completed successfully
              </p>
            </div>
            <Button
              variant="azure"
              disabled={totalSelected === 0 || isMigrating}
              onClick={handleMigrateClick}
            >
              {isMigrating && <Loader2 className="w-4 h-4 animate-spin" />}
              Migrate Selected ({totalSelected})
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v as TabType)}>
            <TabsList className="bg-muted/50 mb-4">
              <TabsTrigger value="jobs" className="gap-2">
                <Briefcase className="w-4 h-4" />
                Jobs
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
                  {transformedJobs.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="notebooks" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Notebooks
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
                  {transformedNotebooks.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="clusters" className="gap-2">
                <Server className="w-4 h-4" />
                Clusters
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
                  {transformedClusters.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="warehouses" className="gap-2">
                <LayoutGrid className="w-4 h-4" />
                SQL Warehouses
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
                  {transformedWarehouses.length}
                </span>
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search across all fields..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                >
                  <Filter className="w-4 h-4" />
                  Status
                  {statusFilter !== "all" && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary rounded text-primary-foreground">
                      1
                    </span>
                  )}
                </Button>
                {showStatusMenu && (
                  <div className="absolute top-full mt-1 right-0 bg-popover border rounded-lg shadow-lg p-1 min-w-[160px] z-10">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setStatusFilter(status);
                          setShowStatusMenu(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm rounded hover:bg-accent transition-colors",
                          statusFilter === status && "bg-accent font-medium"
                        )}
                      >
                        {status === "all" ? "All Statuses" : status}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {(searchQuery || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                >
                  <X className="w-4 h-4" />
                  Clear
                </Button>
              )}
              <div className="ml-auto text-sm text-muted-foreground">
                {totalSelected} selected
              </div>
            </div>

            <TabsContent value="jobs">
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={filteredJobs.length > 0 && filteredJobs.every((j) => selectedItems.jobs.includes(j.id))}
                          onCheckedChange={() => toggleAll("jobs", filteredJobs)}
                        />
                      </TableHead>
                      <TableHead>JOB NAME</TableHead>
                      <TableHead>SCHEDULE</TableHead>
                      <TableHead>STATUS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJobs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                          No jobs found matching your filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginateData(filteredJobs).map((job) => (
                        <TableRow key={job.id} className="hover:bg-muted/50">
                          <TableCell>
                            <Checkbox
                              checked={selectedItems.jobs.includes(job.id)}
                              onCheckedChange={() => toggleSelection("jobs", job.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                                <Briefcase className="w-3 h-3 text-primary" />
                              </div>
                              <span className="font-medium text-primary">{job.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{job.schedule}</TableCell>
                          <TableCell>
                            <StatusBadge status={job.status} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="notebooks">
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={filteredNotebooks.length > 0 && filteredNotebooks.every((n) => selectedItems.notebooks.includes(n.id))}
                          onCheckedChange={() => toggleAll("notebooks", filteredNotebooks)}
                        />
                      </TableHead>
                      <TableHead className="min-w-[200px]">NOTEBOOK NAME</TableHead>
                      <TableHead className="w-[120px]">LANGUAGE</TableHead>
                      <TableHead className="min-w-[250px] max-w-[350px]">PATH</TableHead>
                      <TableHead className="w-[100px]">STATUS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNotebooks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No notebooks found matching your filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginateData(filteredNotebooks).map((notebook) => (
                        <TableRow key={notebook.id} className="hover:bg-muted/50">
                          <TableCell>
                            <Checkbox
                              checked={selectedItems.notebooks.includes(notebook.id)}
                              onCheckedChange={() => toggleSelection("notebooks", notebook.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                                <BookOpen className="w-3 h-3 text-primary" />
                              </div>
                              <span className="font-medium text-primary">{notebook.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{notebook.language}</TableCell>
                          <TableCell>
                            <div className="max-w-[350px] break-words whitespace-normal">
                              {notebook.path}
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={notebook.status} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="clusters">
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={filteredClusters.length > 0 && filteredClusters.every((c) => selectedItems.clusters.includes(c.id))}
                          onCheckedChange={() => toggleAll("clusters", filteredClusters)}
                        />
                      </TableHead>
                      <TableHead>CLUSTER NAME</TableHead>
                      <TableHead>TYPE</TableHead>
                      <TableHead>RUNTIME</TableHead>
                      <TableHead>WORKERS</TableHead>
                      <TableHead>STATUS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClusters.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No clusters found matching your filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginateData(filteredClusters).map((cluster) => (
                        <TableRow key={cluster.id} className="hover:bg-muted/50">
                          <TableCell>
                            <Checkbox
                              checked={selectedItems.clusters.includes(cluster.id)}
                              onCheckedChange={() => toggleSelection("clusters", cluster.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                                <Server className="w-3 h-3 text-primary" />
                              </div>
                              <span className="font-medium text-primary">{cluster.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{cluster.type}</TableCell>
                          <TableCell>{cluster.runtime}</TableCell>
                          <TableCell>{cluster.workers}</TableCell>
                          <TableCell>
                            <StatusBadge status={cluster.status} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="warehouses">
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={filteredWarehouses.length > 0 && filteredWarehouses.every((w) => selectedItems.warehouses.includes(w.id))}
                          onCheckedChange={() => toggleAll("warehouses", filteredWarehouses)}
                        />
                      </TableHead>
                      <TableHead>WAREHOUSE NAME</TableHead>
                      <TableHead>TYPE</TableHead>
                      <TableHead>SIZE</TableHead>
                      <TableHead>STATE</TableHead>
                      <TableHead>PHOTON</TableHead>
                      <TableHead>AUTO STOP</TableHead>
                      <TableHead>STATUS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWarehouses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No SQL warehouses found matching your filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginateData(filteredWarehouses).map((wh) => (
                        <TableRow key={wh.id} className="hover:bg-muted/50">
                          <TableCell>
                            <Checkbox
                              checked={selectedItems.warehouses.includes(wh.id)}
                              onCheckedChange={() => toggleSelection("warehouses", wh.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                                <LayoutGrid className="w-3 h-3 text-primary" />
                              </div>
                              <span className="font-medium text-primary">{wh.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{wh.type}</TableCell>
                          <TableCell>{wh.size}</TableCell>
                          <TableCell>{wh.state}</TableCell>
                          <TableCell>{wh.photon}</TableCell>
                          <TableCell>{wh.autoStop}</TableCell>
                          <TableCell>
                            <StatusBadge status={wh.status} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <span>
              Showing {currentPage === 1 ? 1 : (currentPage - 1) * rowsPerPage + 1}-
              {Math.min(currentPage * rowsPerPage,
                activeTab === "jobs" ? filteredJobs.length :
                  activeTab === "notebooks" ? filteredNotebooks.length :
                    activeTab === "warehouses" ? filteredWarehouses.length :
                      filteredClusters.length
              )} of {
                activeTab === "jobs" ? filteredJobs.length :
                  activeTab === "notebooks" ? filteredNotebooks.length :
                    activeTab === "warehouses" ? filteredWarehouses.length :
                      filteredClusters.length
              } {activeTab}
            </span>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <span className="text-foreground">
                Page {currentPage} of {Math.ceil((
                  activeTab === "jobs" ? filteredJobs.length :
                    activeTab === "notebooks" ? filteredNotebooks.length :
                      activeTab === "warehouses" ? filteredWarehouses.length :
                        filteredClusters.length
                ) / rowsPerPage)}
              </span>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage * rowsPerPage >= (
                  activeTab === "jobs" ? filteredJobs.length :
                    activeTab === "notebooks" ? filteredNotebooks.length :
                      activeTab === "warehouses" ? filteredWarehouses.length :
                        filteredClusters.length
                )}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </main>

        <footer className="text-center py-4 text-sm text-muted-foreground border-t">
          © 2024 Migration Tool v3.1.0
        </footer>
      </div>
      <ConnectFabricModal
        open={showFabricModal}
        onClose={() => setShowFabricModal(false)}
        onConnect={handleFabricConnect}
      />
    </div>
  );
}