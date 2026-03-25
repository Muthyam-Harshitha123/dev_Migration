// import { useState, useEffect } from "react";
// import {
//     Dialog,
//     DialogContent,
//     DialogHeader,
//     DialogTitle,
//     DialogDescription,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Loader2, AlertCircle, FileText, RefreshCw, Clock, Zap } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { cn } from "@/lib/utils";

// interface LogEntry {
//     timestamp: string;
//     message: string;
//     severity: number;
// }

// interface LogsViewerDialogProps {
//     open: boolean;
//     onClose: () => void;
//     jobName: string;
//     runId: string;
// }

// export function LogsViewerDialog({
//     open,
//     onClose,
//     jobName,
//     runId,
// }: LogsViewerDialogProps) {
//     const { toast } = useToast();
//     const [logs, setLogs] = useState<LogEntry[]>([]);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
//     const [retryCount, setRetryCount] = useState(0);
//     const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

//     const MAX_RETRIES = 6; // 6 retries × 5 seconds = 30 seconds total
//     const RETRY_INTERVAL = 5000; // 5 seconds

//     const fetchLogs = async (isAutoRetry: boolean = false) => {
//         setIsLoading(true);
//         setError(null);

//         try {
//             console.log(`🔍 Fetching logs for runId: ${runId} (retry: ${retryCount}/${MAX_RETRIES})`);

//             const encodedRunId = encodeURIComponent(runId);
//             const url = `https://databrickstofabric-fuhdb8a7dhbebrf5.eastus-01.azurewebsites.net/api/Logs?code=OVzXk4eiC8MJjDk4hxLlVLs_EyUe2O6DTXR1J9e0UXuJAzFuCv4Qgg==&run_id=${encodedRunId}`;

//             console.log("📡 Fetching from URL:", url);

//             const response = await fetch(url);

//             console.log("📥 Response status:", response.status);

//             if (!response.ok) {
//                 const errorText = await response.text();
//                 console.error("❌ API Error Response:", errorText);
//                 throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
//             }

//             const data = await response.json();
//             console.log("📊 Logs data received:", data);
//             console.log("📊 Number of log entries:", Array.isArray(data) ? data.length : 'Not an array');

//             if (!Array.isArray(data)) {
//                 throw new Error("Invalid response format: expected an array");
//             }

//             if (data.length === 0) {
//                 // ✅ NEW: If no logs found and we haven't exceeded retries, keep trying
//                 if (autoRefreshEnabled && retryCount < MAX_RETRIES && !isAutoRetry) {
//                     console.log(`⏳ No logs yet, will auto-retry in ${RETRY_INTERVAL / 1000}s...`);
//                     setError(`Logs are still processing... Will check again in ${RETRY_INTERVAL / 1000} seconds.`);
//                     setRetryCount(prev => prev + 1);
//                 } else if (retryCount >= MAX_RETRIES) {
//                     setAutoRefreshEnabled(false);
//                     setError("No logs found after multiple attempts. The job may not have generated logs, or logs may still be processing. Try the manual refresh button.");
//                 } else {
//                     setError("No logs found for this migration run. The job may not have generated logs yet, or logs may still be processing.");
//                 }
//                 setLogs([]);
//             } else {
//                 // ✅ Logs found! Stop auto-refresh and display them
//                 console.log(`✅ Found ${data.length} log entries`);
//                 setLogs(data);
//                 setLastFetchTime(new Date());
//                 setAutoRefreshEnabled(false); // Stop auto-refresh once we have logs
//                 setError(null);
//                 setRetryCount(0);
//             }
//         } catch (err) {
//             console.error("💥 Error fetching logs:", err);
//             const errorMsg = err instanceof Error ? err.message : "Failed to fetch logs";
//             setError(errorMsg);
//             setLogs([]);
//             setAutoRefreshEnabled(false); // Stop auto-refresh on errors

//             if (!isAutoRetry) {
//                 toast({
//                     title: "Error Fetching Logs",
//                     description: errorMsg,
//                     variant: "destructive",
//                 });
//             }
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // ✅ AUTO-REFRESH: Fetch logs when dialog opens
//     useEffect(() => {
//         if (open && runId) {
//             console.log("🚀 Dialog opened, fetching logs for:", runId);
//             setRetryCount(0);
//             setAutoRefreshEnabled(true);
//             fetchLogs(false);
//         } else if (open && !runId) {
//             console.error("❌ Dialog opened but no runId provided");
//             setError("No run ID available for this job");
//             setAutoRefreshEnabled(false);
//         }

//         // Reset state when dialog closes
//         return () => {
//             if (!open) {
//                 setLogs([]);
//                 setError(null);
//                 setLastFetchTime(null);
//                 setRetryCount(0);
//                 setAutoRefreshEnabled(false);
//             }
//         };
//     }, [open, runId]);

//     // ✅ AUTO-REFRESH: Set up interval for retries
//     useEffect(() => {
//         if (!open || !autoRefreshEnabled || logs.length > 0 || retryCount >= MAX_RETRIES) {
//             return;
//         }

//         const intervalId = setInterval(() => {
//             console.log(`🔄 Auto-refresh triggered (attempt ${retryCount + 1}/${MAX_RETRIES})`);
//             fetchLogs(true);
//         }, RETRY_INTERVAL);

//         return () => {
//             clearInterval(intervalId);
//         };
//     }, [open, autoRefreshEnabled, retryCount, logs.length]);

//     const getSeverityColor = (severity: number) => {
//         switch (severity) {
//             case 1: return "text-blue-600 dark:text-blue-400"; // Info
//             case 2: return "text-amber-600 dark:text-amber-400"; // Warning
//             case 3: return "text-red-600 dark:text-red-400"; // Error
//             default: return "text-muted-foreground";
//         }
//     };

//     const getSeverityBgColor = (severity: number) => {
//         switch (severity) {
//             case 1: return "bg-blue-500/10"; // Info
//             case 2: return "bg-amber-500/10"; // Warning
//             case 3: return "bg-red-500/10"; // Error
//             default: return "bg-muted/30";
//         }
//     };

//     const getSeverityLabel = (severity: number) => {
//         switch (severity) {
//             case 1: return "INFO";
//             case 2: return "WARN";
//             case 3: return "ERROR";
//             default: return "LOG";
//         }
//     };

//     const formatTimestamp = (timestamp: string) => {
//         try {
//             const date = new Date(timestamp);
//             return date.toLocaleString('en-US', {
//                 month: 'short',
//                 day: '2-digit',
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 second: '2-digit',
//                 hour12: false
//             });
//         } catch {
//             return timestamp;
//         }
//     };

//     const getLogStats = () => {
//         const stats = {
//             total: logs.length,
//             info: logs.filter(l => l.severity === 1).length,
//             warnings: logs.filter(l => l.severity === 2).length,
//             errors: logs.filter(l => l.severity === 3).length,
//         };
//         return stats;
//     };

//     const stats = getLogStats();

//     return (
//         <Dialog open={open} onOpenChange={onClose}>
//             <DialogContent className="max-w-6xl h-[95vh] flex flex-col p-0">
//                 <DialogHeader className="px-4 py-3 border-b shrink-0">
//                     <div className="flex items-center justify-between gap-4">
//                         <div className="flex items-center gap-3 min-w-0">
//                             <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
//                                 <FileText className="w-3.5 h-3.5 text-primary" />
//                             </div>
//                             <div className="min-w-0">
//                                 <DialogTitle className="text-base font-semibold truncate">
//                                     {jobName}
//                                 </DialogTitle>
//                                 <DialogDescription className="text-xs font-mono truncate">
//                                     {runId}
//                                 </DialogDescription>
//                             </div>
//                         </div>

//                         {/* Compact Stats */}
//                         {!isLoading && logs.length > 0 && (
//                             <div className="flex items-center gap-2 shrink-0 mr-2">
//                                 <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded text-xs">
//                                     <span className="text-muted-foreground">Total:</span>
//                                     <span className="font-semibold">{stats.total}</span>
//                                 </div>
//                                 {stats.info > 0 && (
//                                     <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 rounded text-xs">
//                                         <span className="text-blue-600 dark:text-blue-400">Info:</span>
//                                         <span className="font-semibold text-blue-600 dark:text-blue-400">{stats.info}</span>
//                                     </div>
//                                 )}
//                                 {stats.warnings > 0 && (
//                                     <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 rounded text-xs">
//                                         <span className="text-amber-600 dark:text-amber-400">Warn:</span>
//                                         <span className="font-semibold text-amber-600 dark:text-amber-400">{stats.warnings}</span>
//                                     </div>
//                                 )}
//                                 {stats.errors > 0 && (
//                                     <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 rounded text-xs">
//                                         <span className="text-red-600 dark:text-red-400">Err:</span>
//                                         <span className="font-semibold text-red-600 dark:text-red-400">{stats.errors}</span>
//                                     </div>
//                                 )}
//                             </div>
//                         )}
//                     </div>
//                 </DialogHeader>

//                 <div className="flex-1 overflow-hidden px-4 flex flex-col">

//                     {isLoading && (
//                         <div className="flex-1 flex flex-col items-center justify-center">
//                             <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
//                             <p className="text-sm text-muted-foreground">
//                                 {retryCount > 0 ? `Checking for logs... (attempt ${retryCount}/${MAX_RETRIES})` : 'Loading migration logs...'}
//                             </p>
//                         </div>
//                     )}

//                     {/* Error/Empty State with Auto-Refresh Info */}
//                     {!isLoading && error && (
//                         <div className="flex-1 flex flex-col items-center justify-center">
//                             <div className="w-full max-w-md">
//                                 <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
//                                     {autoRefreshEnabled ? (
//                                         <Zap className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0 animate-pulse" />
//                                     ) : (
//                                         <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
//                                     )}
//                                     <div className="flex-1">
//                                         <p className="text-sm font-medium text-amber-600">
//                                             {autoRefreshEnabled ? 'Waiting for Logs...' : 'No Logs Available'}
//                                         </p>
//                                         <p className="text-sm text-amber-600/80 mt-1">{error}</p>

//                                         {/* Show auto-refresh status */}
//                                         {autoRefreshEnabled && retryCount < MAX_RETRIES && (
//                                             <div className="mt-3 p-2 bg-amber-500/5 rounded text-xs text-amber-600 flex items-center gap-2">
//                                                 <RefreshCw className="w-3 h-3 animate-spin" />
//                                                 <span>Auto-refreshing every {RETRY_INTERVAL / 1000}s ({retryCount}/{MAX_RETRIES} attempts)</span>
//                                             </div>
//                                         )}

//                                         <Button
//                                             variant="outline"
//                                             size="sm"
//                                             onClick={() => {
//                                                 setRetryCount(0);
//                                                 setAutoRefreshEnabled(false);
//                                                 fetchLogs(false);
//                                             }}
//                                             className="mt-3"
//                                             disabled={isLoading}
//                                         >
//                                             <RefreshCw className={cn("w-3 h-3 mr-2", isLoading && "animate-spin")} />
//                                             Try Again Manually
//                                         </Button>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     )}

//                     {/* Empty State (no error, just no logs) */}
//                     {!isLoading && !error && logs.length === 0 && (
//                         <div className="flex-1 flex flex-col items-center justify-center">
//                             <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
//                                 <FileText className="w-8 h-8 text-muted-foreground" />
//                             </div>
//                             <p className="text-sm font-medium text-foreground">No logs available</p>
//                             <p className="text-sm text-muted-foreground mt-1">
//                                 Logs may still be generating or were not created for this job
//                             </p>
//                         </div>
//                     )}

//                     {/* Logs List */}
//                     {!isLoading && logs.length > 0 && (
//                         <div className="flex-1 flex flex-col overflow-hidden mt-3">
//                             <div className="flex items-center justify-between mb-2 shrink-0">
//                                 <div className="flex items-center gap-2 text-xs text-muted-foreground">
//                                     <Clock className="w-3 h-3" />
//                                     {lastFetchTime && (
//                                         <span>Updated: {lastFetchTime.toLocaleTimeString()}</span>
//                                     )}
//                                 </div>
//                                 <Button
//                                     variant="outline"
//                                     size="sm"
//                                     onClick={() => fetchLogs(false)}
//                                     disabled={isLoading}
//                                     className="h-7 text-xs"
//                                 >
//                                     <RefreshCw className={cn("w-3 h-3 mr-1.5", isLoading && "animate-spin")} />
//                                     Refresh
//                                 </Button>
//                             </div>

//                             <ScrollArea className="flex-1 rounded-lg border bg-muted/20">
//                                 <div className="p-3 space-y-1.5">
//                                     {logs.map((log, index) => (
//                                         <div
//                                             key={index}
//                                             className={cn(
//                                                 "p-2.5 rounded-md hover:bg-accent/50 transition-colors",
//                                                 getSeverityBgColor(log.severity)
//                                             )}
//                                         >
//                                             <div className="flex items-start gap-3 font-mono text-[13px]">
//                                                 <span
//                                                     className={cn(
//                                                         "font-bold px-1.5 py-0.5 rounded text-[10px] min-w-[42px] text-center shrink-0",
//                                                         getSeverityColor(log.severity)
//                                                     )}
//                                                 >
//                                                     {getSeverityLabel(log.severity)}
//                                                 </span>
//                                                 <span className="text-muted-foreground/80 min-w-[130px] shrink-0 text-[11px]">
//                                                     {formatTimestamp(log.timestamp)}
//                                                 </span>
//                                                 <span className="flex-1 break-words text-foreground leading-relaxed">
//                                                     {log.message}
//                                                 </span>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </ScrollArea>
//                         </div>
//                     )}
//                 </div>

//                 {/* Footer Actions */}
//                 <div className="px-4 py-2.5 border-t shrink-0">
//                     <div className="flex justify-end">
//                         <Button variant="outline" onClick={onClose} size="sm">
//                             Close
//                         </Button>
//                     </div>
//                 </div>
//             </DialogContent>
//         </Dialog>
//     );
// }

//18/02

// import { useState, useEffect } from "react";
// import {
//     Dialog,
//     DialogContent,
//     DialogHeader,
//     DialogTitle,
//     DialogDescription,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Loader2, AlertCircle, FileText, RefreshCw, Clock } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { cn } from "@/lib/utils";
 
// interface LogEntry {
//     timestamp: string;
//     message: string;
//     severity: number;
//     type?: string;
// }
 
// interface LogsResponse {
//     run_id: string;
//     log_count: number;
//     logs: LogEntry[];
// }
 
// interface LogsViewerDialogProps {
//     open: boolean;
//     onClose: () => void;
//     jobName: string;
//     runId: string;
// }
 
// export function LogsViewerDialog({
//     open,
//     onClose,
//     jobName,
//     runId,
// }: LogsViewerDialogProps) {
//     const { toast } = useToast();
//     const [logs, setLogs] = useState<LogEntry[]>([]);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
 
//     const fetchLogs = async () => {
//         setIsLoading(true);
//         setError(null);
 
//         try {
//             console.log(`🔍 Fetching logs for runId: ${runId}`);
 
//             const url = `https://20.106.196.248/Getlogs`;
 
//             console.log("📡 Fetching from URL:", url);
 
//             const response = await fetch(url, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({ run_id: runId }),
//             });
//             console.log("📥 Response status:", response.status);
 
//             if (!response.ok) {
//                 const errorText = await response.text();
//                 console.error("❌ API Error Response:", errorText);
//                 throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
//             }
 
//             const data: LogsResponse | LogEntry[] = await response.json();
//             console.log("📊 Logs data received:", data);
 
//             // Handle new nested format: { run_id, log_count, logs: [...] }
//             // OR legacy flat array format: [...]
//             let logsArray: LogEntry[];
 
//             if (Array.isArray(data)) {
//                 // Legacy format: direct array
//                 logsArray = data;
//                 console.log("📦 Using legacy array format");
//             } else if (data && typeof data === 'object' && 'logs' in data) {
//                 // New format: nested object with logs property
//                 logsArray = data.logs;
//                 console.log(`📦 Using new nested format (log_count: ${data.log_count})`);
//             } else {
//                 throw new Error("Invalid response format: expected logs array or response object");
//             }
 
//             if (!Array.isArray(logsArray)) {
//                 throw new Error("Invalid response format: logs must be an array");
//             }
 
//             if (logsArray.length === 0) {
//                 setError("empty"); // Special flag for empty state
//                 setLogs([]);
//             } else {
//                 console.log(`✅ Found ${logsArray.length} log entries`);
//                 setLogs(logsArray);
//                 setLastFetchTime(new Date());
//                 setError(null);
//             }
//         } catch (err) {
//             console.error("💥 Error fetching logs:", err);
//             const errorMsg = err instanceof Error ? err.message : "Failed to fetch logs";
//             setError(errorMsg);
//             setLogs([]);
 
//             toast({
//                 title: "Error Fetching Logs",
//                 description: errorMsg,
//                 variant: "destructive",
//             });
//         } finally {
//             setIsLoading(false);
//         }
//     };
 
//     // Fetch logs when dialog opens
//     useEffect(() => {
//         if (open && runId) {
//             console.log("🚀 Dialog opened, fetching logs for:", runId);
//             fetchLogs();
//         } else if (open && !runId) {
//             console.error("❌ Dialog opened but no runId provided");
//             setError("No run ID available for this job");
//         }
 
//         // Reset state when dialog closes
//         return () => {
//             if (!open) {
//                 setLogs([]);
//                 setError(null);
//                 setLastFetchTime(null);
//             }
//         };
//     }, [open, runId]);
 
//     const getSeverityColor = (severity: number) => {
//         switch (severity) {
//             case 1: return "text-blue-600 dark:text-blue-400"; // Info
//             case 2: return "text-amber-600 dark:text-amber-400"; // Warning
//             case 3: return "text-red-600 dark:text-red-400"; // Error
//             default: return "text-muted-foreground";
//         }
//     };
 
//     const getSeverityBgColor = (severity: number) => {
//         switch (severity) {
//             case 1: return "bg-blue-500/10"; // Info
//             case 2: return "bg-amber-500/10"; // Warning
//             case 3: return "bg-red-500/10"; // Error
//             default: return "bg-muted/30";
//         }
//     };
 
//     const getSeverityLabel = (severity: number) => {
//         switch (severity) {
//             case 1: return "INFO";
//             case 2: return "WARN";
//             case 3: return "ERROR";
//             default: return "LOG";
//         }
//     };
 
//     const formatTimestamp = (timestamp: string) => {
//         try {
//             const date = new Date(timestamp);
//             return date.toLocaleString('en-US', {
//                 month: 'short',
//                 day: '2-digit',
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 second: '2-digit',
//                 hour12: false
//             });
//         } catch {
//             return timestamp;
//         }
//     };
 
//     const getLogStats = () => {
//         const stats = {
//             total: logs.length,
//             info: logs.filter(l => l.severity === 1).length,
//             warnings: logs.filter(l => l.severity === 2).length,
//             errors: logs.filter(l => l.severity === 3).length,
//         };
//         return stats;
//     };
 
//     const stats = getLogStats();
 
//     return (
//         <Dialog open={open} onOpenChange={onClose}>
//             <DialogContent className="max-w-6xl h-[95vh] flex flex-col p-0">
//                 <DialogHeader className="px-4 py-3 border-b shrink-0">
//                     <div className="flex items-center justify-between gap-4">
//                         <div className="flex items-center gap-3 min-w-0">
//                             <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
//                                 <FileText className="w-3.5 h-3.5 text-primary" />
//                             </div>
//                             <div className="min-w-0">
//                                 <DialogTitle className="text-base font-semibold truncate">
//                                     {jobName}
//                                 </DialogTitle>
//                                 <DialogDescription className="text-xs font-mono truncate">
//                                     {runId}
//                                 </DialogDescription>
//                             </div>
//                         </div>
 
//                         {/* Compact Stats */}
//                         {!isLoading && logs.length > 0 && (
//                             <div className="flex items-center gap-2 shrink-0 mr-2">
//                                 <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded text-xs">
//                                     <span className="text-muted-foreground">Total:</span>
//                                     <span className="font-semibold">{stats.total}</span>
//                                 </div>
//                                 {stats.info > 0 && (
//                                     <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 rounded text-xs">
//                                         <span className="text-blue-600 dark:text-blue-400">Info:</span>
//                                         <span className="font-semibold text-blue-600 dark:text-blue-400">{stats.info}</span>
//                                     </div>
//                                 )}
//                                 {stats.warnings > 0 && (
//                                     <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 rounded text-xs">
//                                         <span className="text-amber-600 dark:text-amber-400">Warn:</span>
//                                         <span className="font-semibold text-amber-600 dark:text-amber-400">{stats.warnings}</span>
//                                     </div>
//                                 )}
//                                 {stats.errors > 0 && (
//                                     <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 rounded text-xs">
//                                         <span className="text-red-600 dark:text-red-400">Err:</span>
//                                         <span className="font-semibold text-red-600 dark:text-red-400">{stats.errors}</span>
//                                     </div>
//                                 )}
//                             </div>
//                         )}
//                     </div>
//                 </DialogHeader>
 
//                 <div className="flex-1 overflow-y-hidden overflow-x-hidden px-4 flex flex-col min-w-0">
 
//                     {/* Loading State */}
//                     {isLoading && (
//                         <div className="flex-1 flex flex-col items-center justify-center">
//                             <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
//                             <p className="text-sm text-muted-foreground">Loading migration logs...</p>
//                         </div>
//                     )}
 
//                     {/* Empty State - No Logs Yet */}
//                     {!isLoading && error === "empty" && (
//                         <div className="flex-1 flex flex-col items-center justify-center">
//                             <div className="w-full max-w-md">
//                                 <div className="flex flex-col items-center text-center p-6">
//                                     <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
//                                         <FileText className="w-8 h-8 text-muted-foreground" />
//                                     </div>
//                                     <h3 className="text-base font-semibold mb-2">No Logs Available Yet</h3>
//                                     <p className="text-sm text-muted-foreground mb-4">
//                                         Logs may still be processing. Try refreshing in a moment.
//                                     </p>
 
//                                     <Button
//                                         variant="default"
//                                         size="sm"
//                                         onClick={fetchLogs}
//                                         disabled={isLoading}
//                                     >
//                                         <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
//                                         Refresh Logs
//                                     </Button>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
 
//                     {/* Error State */}
//                     {!isLoading && error && error !== "empty" && (
//                         <div className="flex-1 flex flex-col items-center justify-center">
//                             <div className="w-full max-w-md">
//                                 <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
//                                     <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
//                                     <div className="flex-1">
//                                         <p className="text-sm font-medium text-red-600">Error Loading Logs</p>
//                                         <p className="text-sm text-red-600/80 mt-1">{error}</p>
//                                         <Button
//                                             variant="outline"
//                                             size="sm"
//                                             onClick={fetchLogs}
//                                             className="mt-3"
//                                             disabled={isLoading}
//                                         >
//                                             <RefreshCw className={cn("w-3 h-3 mr-2", isLoading && "animate-spin")} />
//                                             Try Again
//                                         </Button>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
 
//                     {/* Logs List */}
//                     {!isLoading && logs.length > 0 && (
//                         <div className="flex-1 flex flex-col overflow-hidden mt-3 min-w-0">
//                             <div className="flex items-center justify-between mb-2 shrink-0">
//                                 <div className="flex items-center gap-2 text-xs text-muted-foreground">
//                                     <Clock className="w-3 h-3" />
//                                     {lastFetchTime && (
//                                         <span>Updated: {lastFetchTime.toLocaleTimeString()}</span>
//                                     )}
//                                 </div>
//                                 <Button
//                                     variant="outline"
//                                     size="sm"
//                                     onClick={fetchLogs}
//                                     disabled={isLoading}
//                                     className="h-7 text-xs"
//                                 >
//                                     <RefreshCw className={cn("w-3 h-3 mr-1.5", isLoading && "animate-spin")} />
//                                     Refresh
//                                 </Button>
//                             </div>
 
//                             <ScrollArea className="flex-1 rounded-lg border bg-muted/20 min-w-0">
//                                 <div className="p-3 space-y-1.5 min-w-0">
//                                     {logs.map((log, index) => (
//                                         <div
//                                             key={index}
//                                             className={cn(
//                                                 "p-2.5 rounded-md hover:bg-accent/50 transition-colors min-w-0",
//                                                 getSeverityBgColor(log.severity)
//                                             )}
//                                         >
//                                             <div className="flex items-start gap-3 font-mono text-[13px] min-w-0">
//                                                 <span
//                                                     className={cn(
//                                                         "font-bold px-1.5 py-0.5 rounded text-[10px] min-w-[42px] text-center shrink-0",
//                                                         getSeverityColor(log.severity)
//                                                     )}
//                                                 >
//                                                     {getSeverityLabel(log.severity)}
//                                                 </span>
//                                                 <span className="text-muted-foreground/80 min-w-[130px] shrink-0 text-[11px]">
//                                                     {formatTimestamp(log.timestamp)}
//                                                 </span>
//                                                 <span className="flex-1 break-all whitespace-pre-wrap text-foreground leading-relaxed min-w-0">
//                                                     {log.message}
//                                                 </span>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </ScrollArea>
//                         </div>
//                     )}
//                 </div>
 
//                 {/* Footer Actions */}
//                 <div className="px-4 py-2.5 border-t shrink-0">
//                     <div className="flex justify-end">
//                         <Button variant="outline" onClick={onClose} size="sm">
//                             Close
//                         </Button>
//                     </div>
//                 </div>
//             </DialogContent>
//         </Dialog>
//     );
// }
 



//25/03

 import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, AlertCircle, FileText, RefreshCw, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface LogEntry {
    timestamp: string;
    message: string;
    severity: number;
    type?: string;
}

interface LogsViewerDialogProps {
    open: boolean;
    onClose: () => void;
    jobName: string;
    runId: string;
    databricksUrl: string;
    personalAccessToken: string;
}

export function LogsViewerDialog({
    open,
    onClose,
    jobName,
    runId,
    databricksUrl,
    personalAccessToken,
}: LogsViewerDialogProps) {
    const { toast } = useToast();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

    const fetchLogs = async () => {
        setIsLoading(true);
        setError(null);

        try {
            console.log(`🔍 Fetching logs for runId: ${runId}`);

            const response = await fetch(`https://20.106.196.248/Getlogs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    run_id: runId,
                    databricksUrl,
                    personalAccessToken,
                }),
            });

            console.log("📥 Response status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ API Error Response:", errorText);
                throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
            }

            const data = await response.json();
            console.log("📊 Logs data received:", data);

            let logsArray: LogEntry[] = [];

            // New format: { total_runs, results: [{ run_id, source, log_count, logs }] }
            if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
                const firstResult = data.results[0];
                if (firstResult && Array.isArray(firstResult.logs)) {
                    logsArray = firstResult.logs;
                    console.log(`📦 Using new results format (log_count: ${firstResult.log_count})`);
                }
            // Legacy nested format: { run_id, log_count, logs: [...] }
            } else if (data && typeof data === 'object' && 'logs' in data && Array.isArray(data.logs)) {
                logsArray = data.logs;
                console.log("📦 Using legacy nested format");
            // Legacy flat array format: [...]
            } else if (Array.isArray(data)) {
                logsArray = data;
                console.log("📦 Using legacy array format");
            } else {
                throw new Error("Invalid response format: expected results array, logs object, or flat array");
            }

            if (logsArray.length === 0) {
                setError("empty");
                setLogs([]);
            } else {
                console.log(`✅ Found ${logsArray.length} log entries`);
                setLogs(logsArray);
                setLastFetchTime(new Date());
                setError(null);
            }
        } catch (err) {
            console.error("💥 Error fetching logs:", err);
            const errorMsg = err instanceof Error ? err.message : "Failed to fetch logs";
            setError(errorMsg);
            setLogs([]);

            toast({
                title: "Error Fetching Logs",
                description: errorMsg,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (open && runId) {
            console.log("🚀 Dialog opened, fetching logs for:", runId);
            fetchLogs();
        } else if (open && !runId) {
            console.error("❌ Dialog opened but no runId provided");
            setError("No run ID available for this job");
        }

        return () => {
            if (!open) {
                setLogs([]);
                setError(null);
                setLastFetchTime(null);
            }
        };
    }, [open, runId]);

    const getSeverityColor = (severity: number) => {
        switch (severity) {
            case 1: return "text-blue-600 dark:text-blue-400";
            case 2: return "text-amber-600 dark:text-amber-400";
            case 3: return "text-red-600 dark:text-red-400";
            default: return "text-muted-foreground";
        }
    };

    const getSeverityBgColor = (severity: number) => {
        switch (severity) {
            case 1: return "bg-blue-500/10";
            case 2: return "bg-amber-500/10";
            case 3: return "bg-red-500/10";
            default: return "bg-muted/30";
        }
    };

    const getSeverityLabel = (severity: number) => {
        switch (severity) {
            case 1: return "INFO";
            case 2: return "WARN";
            case 3: return "ERROR";
            default: return "LOG";
        }
    };

    const formatTimestamp = (timestamp: string) => {
        try {
            const date = new Date(timestamp);
            return date.toLocaleString('en-US', {
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
        } catch {
            return timestamp;
        }
    };

    const getLogStats = () => ({
        total: logs.length,
        info: logs.filter(l => l.severity === 1).length,
        warnings: logs.filter(l => l.severity === 2).length,
        errors: logs.filter(l => l.severity === 3).length,
    });

    const stats = getLogStats();

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl h-[95vh] flex flex-col p-0">
                <DialogHeader className="px-4 py-3 border-b shrink-0">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <FileText className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <div className="min-w-0">
                                <DialogTitle className="text-base font-semibold truncate">
                                    {jobName}
                                </DialogTitle>
                                <DialogDescription className="text-xs font-mono truncate">
                                    {runId}
                                </DialogDescription>
                            </div>
                        </div>

                        {!isLoading && logs.length > 0 && (
                            <div className="flex items-center gap-2 shrink-0 mr-2">
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded text-xs">
                                    <span className="text-muted-foreground">Total:</span>
                                    <span className="font-semibold">{stats.total}</span>
                                </div>
                                {stats.info > 0 && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 rounded text-xs">
                                        <span className="text-blue-600 dark:text-blue-400">Info:</span>
                                        <span className="font-semibold text-blue-600 dark:text-blue-400">{stats.info}</span>
                                    </div>
                                )}
                                {stats.warnings > 0 && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 rounded text-xs">
                                        <span className="text-amber-600 dark:text-amber-400">Warn:</span>
                                        <span className="font-semibold text-amber-600 dark:text-amber-400">{stats.warnings}</span>
                                    </div>
                                )}
                                {stats.errors > 0 && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 rounded text-xs">
                                        <span className="text-red-600 dark:text-red-400">Err:</span>
                                        <span className="font-semibold text-red-600 dark:text-red-400">{stats.errors}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-hidden overflow-x-hidden px-4 flex flex-col min-w-0">

                    {isLoading && (
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                            <p className="text-sm text-muted-foreground">Loading migration logs...</p>
                        </div>
                    )}

                    {!isLoading && error === "empty" && (
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <div className="w-full max-w-md">
                                <div className="flex flex-col items-center text-center p-6">
                                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                        <FileText className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-base font-semibold mb-2">No Logs Available Yet</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Logs may still be processing. Try refreshing in a moment.
                                    </p>
                                    <Button variant="default" size="sm" onClick={fetchLogs} disabled={isLoading}>
                                        <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
                                        Refresh Logs
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isLoading && error && error !== "empty" && (
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <div className="w-full max-w-md">
                                <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-red-600">Error Loading Logs</p>
                                        <p className="text-sm text-red-600/80 mt-1">{error}</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={fetchLogs}
                                            className="mt-3"
                                            disabled={isLoading}
                                        >
                                            <RefreshCw className={cn("w-3 h-3 mr-2", isLoading && "animate-spin")} />
                                            Try Again
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isLoading && logs.length > 0 && (
                        <div className="flex-1 flex flex-col overflow-hidden mt-3 min-w-0">
                            <div className="flex items-center justify-between mb-2 shrink-0">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    {lastFetchTime && (
                                        <span>Updated: {lastFetchTime.toLocaleTimeString()}</span>
                                    )}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={fetchLogs}
                                    disabled={isLoading}
                                    className="h-7 text-xs"
                                >
                                    <RefreshCw className={cn("w-3 h-3 mr-1.5", isLoading && "animate-spin")} />
                                    Refresh
                                </Button>
                            </div>

                            <ScrollArea className="flex-1 rounded-lg border bg-muted/20 min-w-0">
                                <div className="p-3 space-y-1.5 min-w-0">
                                    {logs.map((log, index) => (
                                        <div
                                            key={index}
                                            className={cn(
                                                "p-2.5 rounded-md hover:bg-accent/50 transition-colors min-w-0",
                                                getSeverityBgColor(log.severity)
                                            )}
                                        >
                                            <div className="flex items-start gap-3 font-mono text-[13px] min-w-0">
                                                <span className={cn(
                                                    "font-bold px-1.5 py-0.5 rounded text-[10px] min-w-[42px] text-center shrink-0",
                                                    getSeverityColor(log.severity)
                                                )}>
                                                    {getSeverityLabel(log.severity)}
                                                </span>
                                                <span className="text-muted-foreground/80 min-w-[130px] shrink-0 text-[11px]">
                                                    {formatTimestamp(log.timestamp)}
                                                </span>
                                                <span className="flex-1 break-all whitespace-pre-wrap text-foreground leading-relaxed min-w-0">
                                                    {log.message}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </div>

                <div className="px-4 py-2.5 border-t shrink-0">
                    <div className="flex justify-end">
                        <Button variant="outline" onClick={onClose} size="sm">
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}