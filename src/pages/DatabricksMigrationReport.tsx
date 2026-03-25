

// //18/02
// import { useState, useEffect, useRef } from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { StatusBadge } from "@/components/StatusBadge";
// import { Progress } from "@/components/ui/progress";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
// } from "@/components/ui/table";
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select";
// import {
//     Search,
//     Filter,
//     Download,
//     CheckCircle2,
//     XCircle,
//     Loader2,
//     Home,
//     ChevronRight,
//     AlertTriangle,
//     List,
//     Minus,
//     RefreshCw,
// } from "lucide-react";
// import type { Status } from "@/types/migration";
// import { DatabricksMigrationReportDialog } from "@/components/modals/DatabricksMigrationReportDialogue";
// import { useToast } from "@/hooks/use-toast";
// import { ReplaceNotebooksDialog } from "@/components/modals/ReplaceNotebookDialog";
// import { useFabricCredentials } from "@/contexts/FabricCredentialsContext";
// import { useDatabricksCredentials } from "@/contexts/DatabricksCredentialsContext";
// import { LogsViewerDialog } from "@/components/modals/DatabricksLogsViewerDialog";
// import { FileText } from "lucide-react";
 
// interface DatabricksMigrationItem {
//     id: string;
//     name: string;
//     type: "Job" | "Notebook" | "Cluster";
//     status: Status;
//     targetWorkspace?: string;
//     targetWorkspaceId?: string;
//     errorMessage?: string;
//     fabricPipelineId?: string;
//     runId?: string;
//     schedule?: string;
//     cluster?: string;
//     language?: string;
//     path?: string;
//     runtime?: string;
//     workers?: string;
// }
 
// interface DatabricksMigrationReportProps {
//     items: DatabricksMigrationItem[];
//     onLogout: () => void;
//     onBackToHome: () => void;
//     targetWorkspaceId: string;
//     onMigrationUpdate: (updateFn: (prev: DatabricksMigrationItem[]) => DatabricksMigrationItem[]) => void;
// }
 
// export function DatabricksMigrationReport({
//     items, // ✅ Now the ONLY source of truth
//     onLogout,
//     onBackToHome,
//     targetWorkspaceId,
//     onMigrationUpdate
// }: DatabricksMigrationReportProps) {
//     console.log("🎯 DatabricksMigrationReport rendered with items:", items.length);
 
//     const { toast } = useToast();
//     const { credentials: fabricCredentials } = useFabricCredentials();
//     const { credentials: databricksCredentials } = useDatabricksCredentials();
//     const [statusFilter, setStatusFilter] = useState<string>("all");
//     const [typeFilter, setTypeFilter] = useState<string>("all");
//     const [searchQuery, setSearchQuery] = useState("");
//     const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
//     const [showReportDialog, setShowReportDialog] = useState(false);
//     const [showReplaceDialog, setShowReplaceDialog] = useState(false);
//     const [pausedNotebooks, setPausedNotebooks] = useState<DatabricksMigrationItem[]>([]);
//     const [isReplacing, setIsReplacing] = useState(false);
//     const hasShownReplaceDialog = useRef(false);
 
//     const [logsDialog, setLogsDialog] = useState<{
//         open: boolean;
//         jobName: string;
//         runId: string;
//     } | null>(null);
 
//     const databricksTypes = [
//         { value: "Job", label: "Job" },
//         { value: "Notebook", label: "Notebook" },
//         { value: "Cluster", label: "Cluster" },
//     ];
 
//     // ✅ SIMPLIFIED: Detect paused notebooks (no more complex sync logic)
//     useEffect(() => {
//         if (isReplacing) {
//             return; // Skip during replacement
//         }
 
//         const paused = items.filter(
//             item => item.type === "Notebook" &&
//                 item.status === "Failed" &&
//                 item.errorMessage?.includes("already exists")
//         );
 
//         const hasChanged = paused.length !== pausedNotebooks.length ||
//             paused.some(p => !pausedNotebooks.find(pn => pn.id === p.id));
 
//         if (hasChanged) {
//             console.log(`📋 Found ${paused.length} paused notebooks`);
//             setPausedNotebooks(paused);
//         }
 
//         if (paused.length > 0 && !showReplaceDialog && !hasShownReplaceDialog.current) {
//             console.log("🔔 Showing replace dialog");
//             setShowReplaceDialog(true);
//             hasShownReplaceDialog.current = true;
//         }
//     }, [items, showReplaceDialog, isReplacing]);
 
//     // ✅ REMOVED: Complex parent sync useEffect - no longer needed!
 
//     const stats = {
//         total: items.length,
//         success: items.filter(i => i.status === "Success").length,
//         running: items.filter(i => i.status === "Running").length,
//         failed: items.filter(i => i.status === "Failed").length,
//         skipped: items.filter(i => i.status === "Skipped").length,
//         replaced: items.filter(i => i.status === "Replaced").length,
//     };
 
//     const hasRunningItems = stats.running > 0;
//     const progress = stats.total > 0
//         ? ((stats.success + stats.failed + stats.replaced + stats.skipped) / stats.total) * 100
//         : 0;
 
//     const filteredItems = items.filter(item => {
//         const matchesStatus = statusFilter === "all" || item.status === statusFilter;
//         const matchesType = typeFilter === "all" || item.type === typeFilter;
//         const matchesSearch =
//             searchQuery === "" ||
//             item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//             item.path?.toLowerCase().includes(searchQuery.toLowerCase());
//         return matchesStatus && matchesType && matchesSearch;
//     });
 
//     const toggleItemSelection = (itemId: string) => {
//         setSelectedItems(prev => {
//             const newSet = new Set(prev);
//             if (newSet.has(itemId)) {
//                 newSet.delete(itemId);
//             } else {
//                 newSet.add(itemId);
//             }
//             return newSet;
//         });
//     };
 
//     const toggleAllItems = () => {
//         if (selectedItems.size === filteredItems.length) {
//             setSelectedItems(new Set());
//         } else {
//             setSelectedItems(new Set(filteredItems.map(item => item.id)));
//         }
//     };
 
//     const allFilteredSelected = filteredItems.length > 0 && selectedItems.size === filteredItems.length;
 
//     const openReportPreview = () => {
//         setShowReportDialog(true);
//     };
 
//     // ✅ SIMPLIFIED: All updates go directly to parent
//     const handleReplaceNotebooks = async (notebooksToReplace: any[]) => {
//         console.log("🔄 Starting notebook replacement...");
//         console.log("📋 Notebooks to replace:", notebooksToReplace.map(nb => nb.name));
 
//         setIsReplacing(true);
//         setShowReplaceDialog(false);
 
//         if (!fabricCredentials || !databricksCredentials) {
//             console.error("❌ Missing credentials");
//             toast({
//                 title: "Missing Credentials",
//                 description: "Fabric or Databricks credentials not found",
//                 variant: "destructive",
//             });
//             setIsReplacing(false);
//             return;
//         }
 
//         const notebooksToSkip = pausedNotebooks.filter(
//             nb => !notebooksToReplace.find(r => r.id === nb.id)
//         );
 
//         console.log(`✅ Replacing: ${notebooksToReplace.length} notebooks`);
//         console.log(`⏭️ Skipping: ${notebooksToSkip.length} notebooks`);
 
//         // ✅ STEP 1: Mark skipped notebooks FIRST (immutable status)
//         if (notebooksToSkip.length > 0) {
//             console.log("⏭️ Setting skipped notebooks to Skipped status");
//             onMigrationUpdate((prevItems) =>
//                 prevItems.map(prevItem => {
//                     if (notebooksToSkip.find(nb => nb.id === prevItem.id)) {
//                         console.log(`  ⏭️ "${prevItem.name}" → Skipped`);
//                         return {
//                             ...prevItem,
//                             status: "Skipped" as Status,
//                             errorMessage: undefined
//                         };
//                     }
//                     return prevItem;
//                 })
//             );
//         }
 
//         if (notebooksToReplace.length === 0) {
//             toast({
//                 title: "No Notebooks Selected",
//                 description: "All notebooks have been skipped",
//             });
//             setIsReplacing(false);
//             setPausedNotebooks([]);
//             return;
//         }
 
//         // ✅ STEP 2: Set selected notebooks to Running
//         console.log("🏃 Setting selected notebooks to Running status");
//         onMigrationUpdate((prevItems) =>
//             prevItems.map(prevItem => {
//                 if (notebooksToReplace.find(nb => nb.id === prevItem.id)) {
//                     console.log(`  🏃 "${prevItem.name}" → Running`);
//                     return { ...prevItem, status: "Running" as Status };
//                 }
//                 return prevItem;
//             })
//         );
 
//         // ✅ STEP 3: Execute API call
//         try {
//             const payload = {
//                 tenantId: fabricCredentials.tenantId,
//                 clientId: fabricCredentials.clientId,
//                 clientSecret: fabricCredentials.clientSecret,
//                 workspaceId: targetWorkspaceId,
//                 databricksUrl: databricksCredentials.databricksUrl,
//                 personalAccessToken: databricksCredentials.personalAccessToken,
//                 replaceIfExists: true,
//                 notebooks: notebooksToReplace.map(nb => ({
//                     name: nb.name,
//                     path: nb.path
//                 }))
//             };
 
//             console.log("📤 Sending replacement request...");
 
//             const response = await fetch(
//                 "https://20.106.196.248/DbMigrateNotebooks",
//                 {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify(payload),
//                 }
//             );
 
//             if (!response.ok) {
//                 const errorText = await response.text();
//                 console.error("❌ Response Error:", errorText);
//                 throw new Error(`HTTP ${response.status}: ${errorText}`);
//             }
 
//             const result = await response.json();
//             console.log("📥 Replacement response:", result);
 
//             if (!result.details || !Array.isArray(result.details)) {
//                 throw new Error(`Invalid API response: missing 'details' array`);
//             }
 
//             // ✅ STEP 4: Update with final results (one batch update)
//             console.log("✅ Updating parent with final results");
           
//             onMigrationUpdate((prevItems) =>
//                 prevItems.map(prevItem => {
//                     // Find if this item was in the replacement batch
//                     const wasInReplacementBatch = notebooksToReplace.find(nb => nb.id === prevItem.id);
//                     if (!wasInReplacementBatch) {
//                         return prevItem; // Not affected by this replacement
//                     }
 
//                     // Find the API result for this notebook
//                     const detail = result.details.find((d: any) => d.name === prevItem.name);
 
//                     let status: Status = "Failed";
//                     let errorMessage: string | undefined = undefined;
//                     let runId: string | undefined = undefined;
 
//                     if (detail) {
//                         runId = detail.run_id || result.run_id;
 
//                         if (detail.status === "replaced") {
//                             status = "Replaced";
//                             errorMessage = undefined;
//                         } else if (detail.status === "created") {
//                             status = "Success";
//                             errorMessage = undefined;
//                         } else if (detail.status === "failed" || detail.status === "export-failed") {
//                             status = "Failed";
//                             errorMessage = detail.error || "Replacement failed";
//                         } else if (detail.status === "invalid-input") {
//                             status = "Failed";
//                             errorMessage = "Invalid notebook name or path";
//                         } else {
//                             status = "Failed";
//                             errorMessage = `Unknown status: ${detail.status}`;
//                         }
//                     } else {
//                         status = "Failed";
//                         errorMessage = "Not returned in API response";
//                         runId = result.run_id;
//                     }
 
//                     console.log(`  📝 "${prevItem.name}" → ${status}${errorMessage ? ` (${errorMessage})` : ''}`);
 
//                     return { ...prevItem, status, errorMessage, runId };
//                 })
//             );
 
//             const replacedCount = result.details.filter((d: any) => d.status === "replaced").length;
//             const createdCount = result.details.filter((d: any) => d.status === "created").length;
//             const failedCount = result.details.filter((d: any) =>
//                 d.status === "failed" || d.status === "export-failed"
//             ).length;
 
//             toast({
//                 title: failedCount > 0 ? "Completed with Errors" : "Replacement Complete",
//                 description: `${replacedCount} replaced, ${createdCount} created, ${notebooksToSkip.length} skipped${failedCount > 0 ? `, ${failedCount} failed` : ''}`,
//                 variant: failedCount > 0 ? "destructive" : "default"
//             });
 
//         } catch (error) {
//             console.error("❌ Replacement error:", error);
 
//             // Update failed items
//             onMigrationUpdate((prevItems) =>
//                 prevItems.map(prevItem => {
//                     if (notebooksToReplace.find(nb => nb.id === prevItem.id)) {
//                         return {
//                             ...prevItem,
//                             status: "Failed" as Status,
//                             errorMessage: error instanceof Error ? error.message : "Replacement failed"
//                         };
//                     }
//                     return prevItem;
//                 })
//             );
 
//             toast({
//                 title: "Replacement Failed",
//                 description: error instanceof Error ? error.message : "Failed to replace notebooks",
//                 variant: "destructive",
//             });
//         } finally {
//             console.log("✅ Replacement cleanup complete");
//             setIsReplacing(false);
//             setPausedNotebooks([]);
//         }
//     };
 
//     // ✅ SIMPLIFIED: Skip all - single parent update
//     const handleSkipNotebooks = () => {
//         console.log("⏭️ Skipping all notebooks");
//         setShowReplaceDialog(false);
 
//         onMigrationUpdate((prevItems) =>
//             prevItems.map(prevItem => {
//                 if (pausedNotebooks.find(nb => nb.id === prevItem.id)) {
//                     console.log(`  ⏭️ "${prevItem.name}" → Skipped`);
//                     return {
//                         ...prevItem,
//                         status: "Skipped" as Status,
//                         errorMessage: undefined
//                     };
//                 }
//                 return prevItem;
//             })
//         );
 
//         toast({
//             title: "All Notebooks Skipped",
//             description: `${pausedNotebooks.length} notebook(s) skipped`,
//         });
 
//         setPausedNotebooks([]);
//     };
 
//     const itemsToExport = selectedItems.size > 0
//         ? items.filter(item => selectedItems.has(item.id))
//         : items;
 
//       return (
//         <div className="min-h-screen bg-background">
//             <main className="p-6 max-w-7xl mx-auto animate-fade-in">
//                 <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
//                     <button onClick={onBackToHome} className="hover:text-foreground flex items-center gap-1">
//                         <Home className="w-4 h-4" />
//                         Home
//                     </button>
//                     <ChevronRight className="w-4 h-4" />
//                     <span className="text-foreground font-medium">Databricks Migration Report</span>
//                 </div>
 
//                 <div className="flex items-start justify-between mb-6">
//                     <div>
//                         <h1 className="text-2xl font-bold text-foreground mb-1">Databricks Migration Report</h1>
//                         <p className="text-sm text-muted-foreground">
//                             Track the progress of your Databricks to Fabric migration
//                         </p>
//                     </div>
//                     <div className="flex gap-3">
//                         <Button
//                             variant="outline"
//                             onClick={openReportPreview}
//                             disabled={hasRunningItems}
//                             title={hasRunningItems ? "Wait for all items to complete before exporting" : "Export migration report"}
//                         >
//                             <Download className="w-4 h-4" />
//                             Export Report {selectedItems.size > 0 && `(${selectedItems.size})`}
//                         </Button>
//                         <Button variant="azure" onClick={onBackToHome}>
//                             <Home className="w-4 h-4" />
//                             Back to Home
//                         </Button>
//                     </div>
//                 </div>
 
//                 <Card className="mb-6">
//                     <CardContent className="py-5">
//                         <div className="flex items-center justify-between mb-3">
//                             <h3 className="font-medium text-foreground">Overall Migration Progress</h3>
//                             <span className="text-sm text-muted-foreground">
//                                 {stats.success + stats.replaced + stats.skipped + stats.failed} of {stats.total} completed
//                             </span>
//                         </div>
//                         <Progress value={progress} className="h-3" />
//                         <div className="flex gap-6 mt-4">
//                             <div className="flex items-center gap-2">
//                                 <div className="w-3 h-3 rounded-full bg-success" />
//                                 <span className="text-sm text-muted-foreground">
//                                     Created: {stats.success}
//                                 </span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                                 <div className={`w-3 h-3 rounded-full bg-running ${stats.running > 0 ? 'animate-pulse' : ''}`} />
//                                 <span className="text-sm text-muted-foreground">
//                                     Running: {stats.running}
//                                 </span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                                 <div className="w-3 h-3 rounded-full bg-destructive" />
//                                 <span className="text-sm text-muted-foreground">
//                                     Failed: {stats.failed}
//                                 </span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                                 <div className="w-3 h-3 rounded-full bg-blue-600" />
//                                 <span className="text-sm text-muted-foreground">
//                                     Replaced: {stats.replaced}
//                                 </span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                                 <div className="w-3 h-3 rounded-full bg-gray-600" />
//                                 <span className="text-sm text-muted-foreground">
//                                     Skipped: {stats.skipped}
//                                 </span>
//                             </div>
//                         </div>
//                     </CardContent>
//                 </Card>
 
//                 <div className="grid grid-cols-6 gap-4 mb-6">
//                     <Card className="p-4">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm text-muted-foreground">Total Items</p>
//                                 <p className="text-2xl font-bold text-foreground">{stats.total}</p>
//                             </div>
//                             <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
//                                 <List className="w-5 h-5 text-primary" />
//                             </div>
//                         </div>
//                     </Card>
 
//                     <Card className="p-4">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm text-muted-foreground">Created</p>
//                                 <p className="text-2xl font-bold text-success">{stats.success}</p>
//                             </div>
//                             <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
//                                 <CheckCircle2 className="w-5 h-5 text-success" />
//                             </div>
//                         </div>
//                     </Card>
 
//                     <Card className="p-4">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm text-muted-foreground">Running</p>
//                                 <p className="text-2xl font-bold text-running">{stats.running}</p>
//                             </div>
//                             <div className="w-10 h-10 rounded-lg bg-running/10 flex items-center justify-center">
//                                 <Loader2 className={`w-5 h-5 text-running ${stats.running > 0 ? 'animate-spin' : ''}`} />
//                             </div>
//                         </div>
//                     </Card>
 
//                     <Card className="p-4">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm text-muted-foreground">Failed</p>
//                                 <p className="text-2xl font-bold text-destructive">{stats.failed}</p>
//                             </div>
//                             <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
//                                 <XCircle className="w-5 h-5 text-destructive" />
//                             </div>
//                         </div>
//                     </Card>
 
//                     <Card className="p-4">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm text-muted-foreground">Replaced</p>
//                                 <p className="text-2xl font-bold text-blue-600">{stats.replaced}</p>
//                             </div>
//                             <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
//                                 <RefreshCw className="w-5 h-5 text-blue-600" />
//                             </div>
//                         </div>
//                     </Card>
 
//                     <Card className="p-4">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm text-muted-foreground">Skipped</p>
//                                 <p className="text-2xl font-bold text-gray-600">{stats.skipped}</p>
//                             </div>
//                             <div className="w-10 h-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
//                                 <Minus className="w-5 h-5 text-gray-600" />
//                             </div>
//                         </div>
//                     </Card>
//                 </div>
 
//                 <div className="flex items-center gap-3 mb-4">
//                     <div className="relative flex-1 max-w-sm">
//                         <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
//                         <Input
//                             placeholder="Search by name or path..."
//                             className="pl-9"
//                             value={searchQuery}
//                             onChange={(e) => setSearchQuery(e.target.value)}
//                         />
//                     </div>
//                     <Select value={statusFilter} onValueChange={setStatusFilter}>
//                         <SelectTrigger className="w-40">
//                             <Filter className="w-4 h-4 mr-2" />
//                             <SelectValue placeholder="Status" />
//                         </SelectTrigger>
//                         <SelectContent className="bg-popover">
//                             <SelectItem value="all">All Status</SelectItem>
//                             <SelectItem value="Success">Created</SelectItem>
//                             <SelectItem value="Running">Running</SelectItem>
//                             <SelectItem value="Failed">Failed</SelectItem>
//                             <SelectItem value="Replaced">Replaced</SelectItem>
//                             <SelectItem value="Skipped">Skipped</SelectItem>
//                         </SelectContent>
//                     </Select>
//                     <Select value={typeFilter} onValueChange={setTypeFilter}>
//                         <SelectTrigger className="w-40">
//                             <SelectValue placeholder="Type" />
//                         </SelectTrigger>
//                         <SelectContent className="bg-popover">
//                             <SelectItem value="all">All Types</SelectItem>
//                             {databricksTypes.map((type) => (
//                                 <SelectItem key={type.value} value={type.value}>
//                                     {type.label}
//                                 </SelectItem>
//                             ))}
//                         </SelectContent>
//                     </Select>
//                 </div>
 
//                 <Card>
//                     <Table>
//                         <TableHeader>
//                             <TableRow>
//                                 <TableHead className="w-[50px]">
//                                     <Checkbox
//                                         checked={allFilteredSelected}
//                                         onCheckedChange={toggleAllItems}
//                                         aria-label="Select all items"
//                                     />
//                                 </TableHead>
//                                 <TableHead className="w-[250px]">ITEM NAME</TableHead>
//                                 <TableHead>TYPE</TableHead>
//                                 <TableHead>TARGET WORKSPACE</TableHead>
//                                 <TableHead>STATUS</TableHead>
//                                 <TableHead>ERROR MESSAGE</TableHead>
//                                 <TableHead className="w-[100px]">Logs</TableHead>
//                             </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                             {filteredItems.map((item) => (
//                                 <TableRow key={item.id} className="hover:bg-muted/50">
//                                     <TableCell>
//                                         <Checkbox
//                                             checked={selectedItems.has(item.id)}
//                                             onCheckedChange={() => toggleItemSelection(item.id)}
//                                             aria-label={`Select ${item.name}`}
//                                         />
//                                     </TableCell>
//                                     <TableCell className="font-medium">{item.name}</TableCell>
//                                     <TableCell>
//                                         <span className="px-2 py-1 rounded bg-muted text-xs">
//                                             {databricksTypes.find(t => t.value === item.type)?.label ?? item.type}
//                                         </span>
//                                     </TableCell>
//                                     <TableCell className="text-muted-foreground">
//                                         {item.targetWorkspace ?? "-"}
//                                     </TableCell>
//                                     <TableCell>
//                                         <StatusBadge status={item.status} />
//                                     </TableCell>
//                                     <TableCell>
//                                         {item.errorMessage ? (
//                                             <div className="flex items-center gap-2 text-sm">
//                                                 {item.errorMessage.includes("already exists") ? (
//                                                     <>
//                                                         <AlertTriangle className="w-4 h-4 text-amber-500" />
//                                                         <span className="text-amber-600">{item.errorMessage}</span>
//                                                     </>
//                                                 ) : (
//                                                     <>
//                                                         <AlertTriangle className="w-4 h-4 text-destructive" />
//                                                         <span className="text-destructive">{item.errorMessage}</span>
//                                                     </>
//                                                 )}
//                                             </div>
//                                         ) : (
//                                             <span className="text-muted-foreground">-</span>
//                                         )}
//                                     </TableCell>
 
//                                     <TableCell>
//                                         {item.runId ? (
//                                             <Button
//                                                 variant="ghost"
//                                                 size="sm"
//                                                 onClick={() => {
//                                                     console.log(`🔍 Opening logs for ${item.type} "${item.name}" with runId:`, item.runId);
//                                                     setLogsDialog({
//                                                         open: true,
//                                                         jobName: item.name,
//                                                         runId: item.runId!
//                                                     });
//                                                 }}
//                                                 title="View migration logs"
//                                             >
//                                                 <FileText className="w-4 h-4" />
//                                             </Button>
//                                         ) : (
//                                             <span className="text-xs text-muted-foreground">
//                                                 -
//                                             </span>
//                                         )}
//                                     </TableCell>
//                                 </TableRow>
//                             ))}
//                         </TableBody>
//                     </Table>
//                 </Card>
 
//                 {filteredItems.length === 0 && (
//                     <div className="text-center py-12">
//                         <p className="text-muted-foreground">No items match your filters</p>
//                     </div>
//                 )}
//             </main>
 
//             <DatabricksMigrationReportDialog
//                 open={showReportDialog}
//                 onOpenChange={setShowReportDialog}
//                 items={itemsToExport}
//                 selectedOnly={selectedItems.size > 0}
//             />
 
//             <ReplaceNotebooksDialog
//                 open={showReplaceDialog}
//                 notebooks={pausedNotebooks}
//                 isMigrating={isReplacing}
//                 onReplace={handleReplaceNotebooks}
//                 onSkipAll={handleSkipNotebooks}
//             />
 
//             {logsDialog && (
//                 <LogsViewerDialog
//                     open={logsDialog.open}
//                     onClose={() => setLogsDialog(null)}
//                     jobName={logsDialog.jobName}
//                     runId={logsDialog.runId}
//                 />
//             )}
//         </div>
//     );
// }
 


// //24/03
// import { useState, useEffect, useRef } from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { StatusBadge } from "@/components/StatusBadge";
// import { Progress } from "@/components/ui/progress";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
// } from "@/components/ui/table";
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select";
// import {
//     Search,
//     Filter,
//     Download,
//     CheckCircle2,
//     XCircle,
//     Loader2,
//     Home,
//     ChevronRight,
//     AlertTriangle,
//     List,
//     Minus,
//     RefreshCw,
// } from "lucide-react";
// import type { Status } from "@/types/migration";
// import { DatabricksMigrationReportDialog } from "@/components/modals/DatabricksMigrationReportDialogue";
// import { useToast } from "@/hooks/use-toast";
// import { ReplaceNotebooksDialog } from "@/components/modals/ReplaceNotebookDialog";
// import { useFabricCredentials } from "@/contexts/FabricCredentialsContext";
// import { useDatabricksCredentials } from "@/contexts/DatabricksCredentialsContext";
// import { LogsViewerDialog } from "@/components/modals/DatabricksLogsViewerDialog";
// import { FileText } from "lucide-react";

// interface DatabricksMigrationItem {
//     id: string;
//     name: string;
//     type: "Job" | "Notebook" | "Cluster" | "Catalog"|"Warehouse";
//     status: Status;
//     targetWorkspace?: string;
//     targetWorkspaceId?: string;
//     errorMessage?: string;
//     fabricPipelineId?: string;
//     runId?: string;
//     schedule?: string;
//     cluster?: string;
//     language?: string;
//     path?: string;
//     runtime?: string;
//     workers?: string;
// }

// interface DatabricksMigrationReportProps {
//     items: DatabricksMigrationItem[];
//     onLogout: () => void;
//     onBackToHome: () => void;
//     targetWorkspaceId: string;
//     onMigrationUpdate: (updateFn: (prev: DatabricksMigrationItem[]) => DatabricksMigrationItem[]) => void;
// }

// export function DatabricksMigrationReport({
//     items, // ✅ Now the ONLY source of truth
//     onLogout,
//     onBackToHome,
//     targetWorkspaceId,
//     onMigrationUpdate
// }: DatabricksMigrationReportProps) {
//     console.log("🎯 DatabricksMigrationReport rendered with items:", items.length);

//     const { toast } = useToast();
//     const { credentials: fabricCredentials } = useFabricCredentials();
//     const { credentials: databricksCredentials } = useDatabricksCredentials();
//     const [statusFilter, setStatusFilter] = useState<string>("all");
//     const [typeFilter, setTypeFilter] = useState<string>("all");
//     const [searchQuery, setSearchQuery] = useState("");
//     const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
//     const [showReportDialog, setShowReportDialog] = useState(false);
//     const [showReplaceDialog, setShowReplaceDialog] = useState(false);
//     const [pausedNotebooks, setPausedNotebooks] = useState<DatabricksMigrationItem[]>([]);
//     const [isReplacing, setIsReplacing] = useState(false);
//     const hasShownReplaceDialog = useRef(false);

//     const [logsDialog, setLogsDialog] = useState<{
//         open: boolean;
//         jobName: string;
//         runId: string;
//     } | null>(null);

//     const databricksTypes = [
//         { value: "Job", label: "Job" },
//         { value: "Notebook", label: "Notebook" },
//         { value: "Cluster", label: "Cluster" },
//     ];

//     // ✅ SIMPLIFIED: Detect paused notebooks (no more complex sync logic)
//     useEffect(() => {
//         if (isReplacing) {
//             return; // Skip during replacement
//         }

//         const paused = items.filter(
//             item => item.type === "Notebook" &&
//                 item.status === "Failed" &&
//                 item.errorMessage?.includes("already exists")
//         );

//         const hasChanged = paused.length !== pausedNotebooks.length ||
//             paused.some(p => !pausedNotebooks.find(pn => pn.id === p.id));

//         if (hasChanged) {
//             console.log(`📋 Found ${paused.length} paused notebooks`);
//             setPausedNotebooks(paused);
//         }

//         if (paused.length > 0 && !showReplaceDialog && !hasShownReplaceDialog.current) {
//             console.log("🔔 Showing replace dialog");
//             setShowReplaceDialog(true);
//             hasShownReplaceDialog.current = true;
//         }
//     }, [items, showReplaceDialog, isReplacing]);

//     // ✅ REMOVED: Complex parent sync useEffect - no longer needed!

//    const stats = {
//   total: items.length,
//   success: items.filter(i => i.status === "Success").length,
//   running: items.filter(i => i.status === "Running").length,
//   failed: items.filter(i => i.status === "Failed").length,
//   skipped: items.filter(i => i.status === "Skipped").length,
//   replaced: items.filter(i => i.status === "Replaced").length,
// };

//     const hasRunningItems = stats.running > 0;
//     const progress = stats.total > 0
//   ? ((stats.success + stats.failed + stats.replaced + stats.skipped) / stats.total) * 100
//   : 0;

//     const filteredItems = items.filter(item => {
//         const matchesStatus = statusFilter === "all" || item.status === statusFilter;
//         const matchesType = typeFilter === "all" || item.type === typeFilter;
//         const matchesSearch =
//             searchQuery === "" ||
//             item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//             item.path?.toLowerCase().includes(searchQuery.toLowerCase());
//         return matchesStatus && matchesType && matchesSearch;
//     });

//     const toggleItemSelection = (itemId: string) => {
//         setSelectedItems(prev => {
//             const newSet = new Set(prev);
//             if (newSet.has(itemId)) {
//                 newSet.delete(itemId);
//             } else {
//                 newSet.add(itemId);
//             }
//             return newSet;
//         });
//     };

//     const toggleAllItems = () => {
//         if (selectedItems.size === filteredItems.length) {
//             setSelectedItems(new Set());
//         } else {
//             setSelectedItems(new Set(filteredItems.map(item => item.id)));
//         }
//     };

//     const allFilteredSelected = filteredItems.length > 0 && selectedItems.size === filteredItems.length;

//     const openReportPreview = () => {
//         setShowReportDialog(true);
//     };

//     // ✅ SIMPLIFIED: All updates go directly to parent
//     const handleReplaceNotebooks = async (notebooksToReplace: any[]) => {
//         console.log("🔄 Starting notebook replacement...");
//         console.log("📋 Notebooks to replace:", notebooksToReplace.map(nb => nb.name));

//         setIsReplacing(true);
//         setShowReplaceDialog(false);

//         if (!fabricCredentials || !databricksCredentials) {
//             console.error("❌ Missing credentials");
//             toast({
//                 title: "Missing Credentials",
//                 description: "Fabric or Databricks credentials not found",
//                 variant: "destructive",
//             });
//             setIsReplacing(false);
//             return;
//         }

//         const notebooksToSkip = pausedNotebooks.filter(
//             nb => !notebooksToReplace.find(r => r.id === nb.id)
//         );

//         console.log(`✅ Replacing: ${notebooksToReplace.length} notebooks`);
//         console.log(`⏭️ Skipping: ${notebooksToSkip.length} notebooks`);

//         // ✅ STEP 1: Mark skipped notebooks FIRST (immutable status)
//         if (notebooksToSkip.length > 0) {
//             console.log("⏭️ Setting skipped notebooks to Skipped status");
//             onMigrationUpdate((prevItems) =>
//                 prevItems.map(prevItem => {
//                     if (notebooksToSkip.find(nb => nb.id === prevItem.id)) {
//                         console.log(`  ⏭️ "${prevItem.name}" → Skipped`);
//                         return {
//                             ...prevItem,
//                             status: "Skipped" as Status,
//                             errorMessage: undefined
//                         };
//                     }
//                     return prevItem;
//                 })
//             );
//         }

//         if (notebooksToReplace.length === 0) {
//             toast({
//                 title: "No Notebooks Selected",
//                 description: "All notebooks have been skipped",
//             });
//             setIsReplacing(false);
//             setPausedNotebooks([]);
//             return;
//         }

//         // ✅ STEP 2: Set selected notebooks to Running
//         console.log("🏃 Setting selected notebooks to Running status");
//         onMigrationUpdate((prevItems) =>
//             prevItems.map(prevItem => {
//                 if (notebooksToReplace.find(nb => nb.id === prevItem.id)) {
//                     console.log(`  🏃 "${prevItem.name}" → Running`);
//                     return { ...prevItem, status: "Running" as Status };
//                 }
//                 return prevItem;
//             })
//         );

//         // ✅ STEP 3: Execute API call
//         try {
//             const payload = {
//                 tenantId: fabricCredentials.tenantId,
//                 clientId: fabricCredentials.clientId,
//                 clientSecret: fabricCredentials.clientSecret,
//                 workspaceId: targetWorkspaceId,
//                 databricksUrl: databricksCredentials.databricksUrl,
//                 personalAccessToken: databricksCredentials.personalAccessToken,
//                 replaceIfExists: true,
//                 notebooks: notebooksToReplace.map(nb => ({
//                     name: nb.name,
//                     path: nb.path
//                 }))
//             };

//             console.log("📤 Sending replacement request...");

//             const response = await fetch(
//                 "https://20.106.196.248/DbMigrateNotebooks",
//                 {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify(payload),
//                 }
//             );

//             if (!response.ok) {
//                 const errorText = await response.text();
//                 console.error("❌ Response Error:", errorText);
//                 throw new Error(`HTTP ${response.status}: ${errorText}`);
//             }

//             const result = await response.json();
//             console.log("📥 Replacement response:", result);

//             if (!result.details || !Array.isArray(result.details)) {
//                 throw new Error(`Invalid API response: missing 'details' array`);
//             }

//             // ✅ STEP 4: Update with final results (one batch update)
//             console.log("✅ Updating parent with final results");

//             onMigrationUpdate((prevItems) =>
//                 prevItems.map(prevItem => {
//                     // Find if this item was in the replacement batch
//                     const wasInReplacementBatch = notebooksToReplace.find(nb => nb.id === prevItem.id);
//                     if (!wasInReplacementBatch) {
//                         return prevItem; // Not affected by this replacement
//                     }

//                     // Find the API result for this notebook
//                     const detail = result.details.find((d: any) => d.name === prevItem.name);

//                     let status: Status = "Failed";
//                     let errorMessage: string | undefined = undefined;
//                     let runId: string | undefined = undefined;

//                     if (detail) {
//                         runId = detail.run_id || result.run_id;

//                         if (detail.status === "replaced") {
//                             status = "Replaced";
//                             errorMessage = undefined;
//                         } else if (detail.status === "created") {
//                             status = "Success";
//                             errorMessage = undefined;
//                         } else if (detail.status === "failed" || detail.status === "export-failed") {
//                             status = "Failed";
//                             errorMessage = detail.error || "Replacement failed";
//                         } else if (detail.status === "invalid-input") {
//                             status = "Failed";
//                             errorMessage = "Invalid notebook name or path";
//                         } else {
//                             status = "Failed";
//                             errorMessage = `Unknown status: ${detail.status}`;
//                         }
//                     } else {
//                         status = "Failed";
//                         errorMessage = "Not returned in API response";
//                         runId = result.run_id;
//                     }

//                     console.log(`  📝 "${prevItem.name}" → ${status}${errorMessage ? ` (${errorMessage})` : ''}`);

//                     return { ...prevItem, status, errorMessage, runId };
//                 })
//             );

//             const replacedCount = result.details.filter((d: any) => d.status === "replaced").length;
//             const createdCount = result.details.filter((d: any) => d.status === "created").length;
//             const failedCount = result.details.filter((d: any) =>
//                 d.status === "failed" || d.status === "export-failed"
//             ).length;

//             toast({
//                 title: failedCount > 0 ? "Completed with Errors" : "Replacement Complete",
//                 description: `${replacedCount} replaced, ${createdCount} created, ${notebooksToSkip.length} skipped${failedCount > 0 ? `, ${failedCount} failed` : ''}`,
//                 variant: failedCount > 0 ? "destructive" : "default"
//             });

//         } catch (error) {
//             console.error("❌ Replacement error:", error);

//             // Update failed items
//             onMigrationUpdate((prevItems) =>
//                 prevItems.map(prevItem => {
//                     if (notebooksToReplace.find(nb => nb.id === prevItem.id)) {
//                         return {
//                             ...prevItem,
//                             status: "Failed" as Status,
//                             errorMessage: error instanceof Error ? error.message : "Replacement failed"
//                         };
//                     }
//                     return prevItem;
//                 })
//             );

//             toast({
//                 title: "Replacement Failed",
//                 description: error instanceof Error ? error.message : "Failed to replace notebooks",
//                 variant: "destructive",
//             });
//         } finally {
//             console.log("✅ Replacement cleanup complete");
//             setIsReplacing(false);
//             setPausedNotebooks([]);
//         }
//     };

//     // ✅ SIMPLIFIED: Skip all - single parent update
//     const handleSkipNotebooks = () => {
//         console.log("⏭️ Skipping all notebooks");
//         setShowReplaceDialog(false);

//         onMigrationUpdate((prevItems) =>
//             prevItems.map(prevItem => {
//                 if (pausedNotebooks.find(nb => nb.id === prevItem.id)) {
//                     console.log(`  ⏭️ "${prevItem.name}" → Skipped`);
//                     return {
//                         ...prevItem,
//                         status: "Skipped" as Status,
//                         errorMessage: undefined
//                     };
//                 }
//                 return prevItem;
//             })
//         );

//         toast({
//             title: "All Notebooks Skipped",
//             description: `${pausedNotebooks.length} notebook(s) skipped`,
//         });

//         setPausedNotebooks([]);
//     };

//     const itemsToExport = selectedItems.size > 0
//         ? items.filter(item => selectedItems.has(item.id))
//         : items;

//     return (
//         <div className="min-h-screen bg-background">
//             <main className="p-6 max-w-7xl mx-auto animate-fade-in">
//                 <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
//                     <button onClick={onBackToHome} className="hover:text-foreground flex items-center gap-1">
//                         <Home className="w-4 h-4" />
//                         Home
//                     </button>
//                     <ChevronRight className="w-4 h-4" />
//                     <span className="text-foreground font-medium">Databricks Migration Report</span>
//                 </div>

//                 <div className="flex items-start justify-between mb-6">
//                     <div>
//                         <h1 className="text-2xl font-bold text-foreground mb-1">Databricks Migration Report</h1>
//                         <p className="text-sm text-muted-foreground">
//                             Track the progress of your Databricks to Fabric migration
//                         </p>
//                     </div>
//                     <div className="flex gap-3">
//                         <Button
//                             variant="outline"
//                             onClick={openReportPreview}
//                             disabled={hasRunningItems}
//                             title={hasRunningItems ? "Wait for all items to complete before exporting" : "Export migration report"}
//                         >
//                             <Download className="w-4 h-4" />
//                             Export Report {selectedItems.size > 0 && `(${selectedItems.size})`}
//                         </Button>
//                         <Button variant="azure" onClick={onBackToHome}>
//                             <Home className="w-4 h-4" />
//                             Back to Home
//                         </Button>
//                     </div>
//                 </div>

//                 <Card className="mb-6">
//                     <CardContent className="py-5">
//                         <div className="flex items-center justify-between mb-3">
//                             <h3 className="font-medium text-foreground">Overall Migration Progress</h3>
//                             <span className="text-sm text-muted-foreground">
//                                 {stats.success + stats.replaced + stats.skipped + stats.failed} of {stats.total} completed
//                             </span>
//                         </div>
//                         <Progress value={progress} className="h-3" />
//                         <div className="flex gap-6 mt-4">
//                             <div className="flex items-center gap-2">
//                                 <div className="w-3 h-3 rounded-full bg-success" />
//                                 <span className="text-sm text-muted-foreground">
//                                     Created: {stats.success}
//                                 </span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                                 <div className={`w-3 h-3 rounded-full bg-running ${stats.running > 0 ? 'animate-pulse' : ''}`} />
//                                 <span className="text-sm text-muted-foreground">
//                                     Running: {stats.running}
//                                 </span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                                 <div className="w-3 h-3 rounded-full bg-destructive" />
//                                 <span className="text-sm text-muted-foreground">
//                                     Failed: {stats.failed}
//                                 </span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                                 <div className="w-3 h-3 rounded-full bg-blue-600" />
//                                 <span className="text-sm text-muted-foreground">
//                                     Replaced: {stats.replaced}
//                                 </span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                                 <div className="w-3 h-3 rounded-full bg-gray-600" />
//                                 <span className="text-sm text-muted-foreground">
//                                     Skipped: {stats.skipped}
//                                 </span>
//                             </div>
//                         </div>
//                     </CardContent>
//                 </Card>

//                 <div className="grid grid-cols-6 gap-4 mb-6">
//                     <Card className="p-4">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm text-muted-foreground">Total Items</p>
//                                 <p className="text-2xl font-bold text-foreground">{stats.total}</p>
//                             </div>
//                             <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
//                                 <List className="w-5 h-5 text-primary" />
//                             </div>
//                         </div>
//                     </Card>

//                     <Card className="p-4">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm text-muted-foreground">Created</p>
//                                 <p className="text-2xl font-bold text-success">{stats.success}</p>
//                             </div>
//                             <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
//                                 <CheckCircle2 className="w-5 h-5 text-success" />
//                             </div>
//                         </div>
//                     </Card>

//                     <Card className="p-4">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm text-muted-foreground">Running</p>
//                                 <p className="text-2xl font-bold text-running">{stats.running}</p>
//                             </div>
//                             <div className="w-10 h-10 rounded-lg bg-running/10 flex items-center justify-center">
//                                 <Loader2 className={`w-5 h-5 text-running ${stats.running > 0 ? 'animate-spin' : ''}`} />
//                             </div>
//                         </div>
//                     </Card>

//                     <Card className="p-4">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm text-muted-foreground">Failed</p>
//                                 <p className="text-2xl font-bold text-destructive">{stats.failed}</p>
//                             </div>
//                             <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
//                                 <XCircle className="w-5 h-5 text-destructive" />
//                             </div>
//                         </div>
//                     </Card>

//                     <Card className="p-4">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm text-muted-foreground">Replaced</p>
//                                 <p className="text-2xl font-bold text-blue-600">{stats.replaced}</p>
//                             </div>
//                             <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
//                                 <RefreshCw className="w-5 h-5 text-blue-600" />
//                             </div>
//                         </div>
//                     </Card>

//                     <Card className="p-4">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm text-muted-foreground">Skipped</p>
//                                 <p className="text-2xl font-bold text-gray-600">{stats.skipped}</p>
//                             </div>
//                             <div className="w-10 h-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
//                                 <Minus className="w-5 h-5 text-gray-600" />
//                             </div>
//                         </div>
//                     </Card>
//                 </div>

//                 <div className="flex items-center gap-3 mb-4">
//                     <div className="relative flex-1 max-w-sm">
//                         <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
//                         <Input
//                             placeholder="Search by name or path..."
//                             className="pl-9"
//                             value={searchQuery}
//                             onChange={(e) => setSearchQuery(e.target.value)}
//                         />
//                     </div>
//                     <Select value={statusFilter} onValueChange={setStatusFilter}>
//                         <SelectTrigger className="w-40">
//                             <Filter className="w-4 h-4 mr-2" />
//                             <SelectValue placeholder="Status" />
//                         </SelectTrigger>
//                         <SelectContent className="bg-popover">
//                             <SelectItem value="all">All Status</SelectItem>
//                             <SelectItem value="Success">Created</SelectItem>
//                             <SelectItem value="Running">Running</SelectItem>
//                             <SelectItem value="Failed">Failed</SelectItem>
//                             <SelectItem value="Replaced">Replaced</SelectItem>
//                             <SelectItem value="Skipped">Skipped</SelectItem>
//                         </SelectContent>
//                     </Select>
//                     <Select value={typeFilter} onValueChange={setTypeFilter}>
//                         <SelectTrigger className="w-40">
//                             <SelectValue placeholder="Type" />
//                         </SelectTrigger>
//                         <SelectContent className="bg-popover">
//                             <SelectItem value="all">All Types</SelectItem>
//                             {databricksTypes.map((type) => (
//                                 <SelectItem key={type.value} value={type.value}>
//                                     {type.label}
//                                 </SelectItem>
//                             ))}
//                         </SelectContent>
//                     </Select>
//                 </div>

//                 <Card>
//                     <Table>
//                         <TableHeader>
//                             <TableRow>
//                                 <TableHead className="w-[50px]">
//                                     <Checkbox
//                                         checked={allFilteredSelected}
//                                         onCheckedChange={toggleAllItems}
//                                         aria-label="Select all items"
//                                     />
//                                 </TableHead>
//                                 <TableHead className="w-[250px]">ITEM NAME</TableHead>
//                                 <TableHead>TYPE</TableHead>
//                                 <TableHead>TARGET WORKSPACE</TableHead>
//                                 <TableHead>STATUS</TableHead>
//                                 <TableHead>ERROR MESSAGE</TableHead>
//                                 <TableHead className="w-[100px]">Logs</TableHead>
//                             </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                             {filteredItems.map((item) => (
//                                 <TableRow key={item.id} className="hover:bg-muted/50">
//                                     <TableCell>
//                                         <Checkbox
//                                             checked={selectedItems.has(item.id)}
//                                             onCheckedChange={() => toggleItemSelection(item.id)}
//                                             aria-label={`Select ${item.name}`}
//                                         />
//                                     </TableCell>
//                                     <TableCell className="font-medium">{item.name}</TableCell>
//                                     <TableCell>
//                                         <span className="px-2 py-1 rounded bg-muted text-xs">
//                                             {databricksTypes.find(t => t.value === item.type)?.label ?? item.type}
//                                         </span>
//                                     </TableCell>
//                                     <TableCell className="text-muted-foreground">
//                                         {item.targetWorkspace ?? "-"}
//                                     </TableCell>
//                                     <TableCell>
//                                         <StatusBadge status={item.status} />
//                                     </TableCell>
//                                     <TableCell>
//                                         {item.errorMessage ? (
//                                             <div className="flex items-center gap-2 text-sm">
//                                                 {item.errorMessage.includes("already exists") ? (
//                                                     <>
//                                                         <AlertTriangle className="w-4 h-4 text-amber-500" />
//                                                         <span className="text-amber-600">{item.errorMessage}</span>
//                                                     </>
//                                                 ) : (
//                                                     <>
//                                                         <AlertTriangle className="w-4 h-4 text-destructive" />
//                                                         <span className="text-destructive">{item.errorMessage}</span>
//                                                     </>
//                                                 )}
//                                             </div>
//                                         ) : (
//                                             <span className="text-muted-foreground">-</span>
//                                         )}
//                                     </TableCell>

//                                     <TableCell>
//                                         {item.runId && item.type !== "Catalog" ? (
//                                             <Button
//                                                 variant="ghost"
//                                                 size="sm"
//                                                 onClick={() => {
//                                                     console.log(`🔍 Opening logs for ${item.type} "${item.name}" with runId:`, item.runId);
//                                                     setLogsDialog({
//                                                         open: true,
//                                                         jobName: item.name,
//                                                         runId: item.runId!
//                                                     });
//                                                 }}
//                                                 title="View migration logs"
//                                             >
//                                                 <FileText className="w-4 h-4" />
//                                             </Button>
//                                         ) : (
//                                             <span className="text-xs text-muted-foreground">
//                                                 -
//                                             </span>
//                                         )}
//                                     </TableCell>
//                                 </TableRow>
//                             ))}
//                         </TableBody>
//                     </Table>
//                 </Card>

//                 {filteredItems.length === 0 && (
//                     <div className="text-center py-12">
//                         <p className="text-muted-foreground">No items match your filters</p>
//                     </div>
//                 )}
//             </main>

//             <DatabricksMigrationReportDialog
//                 open={showReportDialog}
//                 onOpenChange={setShowReportDialog}
//                 items={itemsToExport}
//                 selectedOnly={selectedItems.size > 0}
//             />

//             <ReplaceNotebooksDialog
//                 open={showReplaceDialog}
//                 notebooks={pausedNotebooks}
//                 isMigrating={isReplacing}
//                 onReplace={handleReplaceNotebooks}
//                 onSkipAll={handleSkipNotebooks}
//             />

//             {logsDialog && (
//                 <LogsViewerDialog
//                     open={logsDialog.open}
//                     onClose={() => setLogsDialog(null)}
//                     jobName={logsDialog.jobName}
//                     runId={logsDialog.runId}
//                 />
//             )}
//         </div>
//     );
// }




//25/03
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Search,
    Filter,
    Download,
    CheckCircle2,
    XCircle,
    Loader2,
    Home,
    ChevronRight,
    AlertTriangle,
    List,
    Minus,
    RefreshCw,
} from "lucide-react";
import type { Status } from "@/types/migration";
import { DatabricksMigrationReportDialog } from "@/components/modals/DatabricksMigrationReportDialogue";
import { useToast } from "@/hooks/use-toast";
import { ReplaceNotebooksDialog } from "@/components/modals/ReplaceNotebookDialog";
import { useFabricCredentials } from "@/contexts/FabricCredentialsContext";
import { useDatabricksCredentials } from "@/contexts/DatabricksCredentialsContext";
import { LogsViewerDialog } from "@/components/modals/DatabricksLogsViewerDialog";
import { FileText } from "lucide-react";

interface DatabricksMigrationItem {
    id: string;
    name: string;
    type: "Job" | "Notebook" | "Cluster" | "Catalog" | "Warehouse";
    status: Status;
    targetWorkspace?: string;
    targetWorkspaceId?: string;
    errorMessage?: string;
    fabricPipelineId?: string;
    runId?: string;
    schedule?: string;
    cluster?: string;
    language?: string;
    path?: string;
    runtime?: string;
    workers?: string;
}

interface DatabricksMigrationReportProps {
    items: DatabricksMigrationItem[];
    onLogout: () => void;
    onBackToHome: () => void;
    targetWorkspaceId: string;
    onMigrationUpdate: (updateFn: (prev: DatabricksMigrationItem[]) => DatabricksMigrationItem[]) => void;
}

export function DatabricksMigrationReport({
    items, // ✅ Now the ONLY source of truth
    onLogout,
    onBackToHome,
    targetWorkspaceId,
    onMigrationUpdate
}: DatabricksMigrationReportProps) {
    console.log("🎯 DatabricksMigrationReport rendered with items:", items.length);

    const { toast } = useToast();
    const { credentials: fabricCredentials } = useFabricCredentials();
    const { credentials: databricksCredentials } = useDatabricksCredentials();
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [showReportDialog, setShowReportDialog] = useState(false);
    const [showReplaceDialog, setShowReplaceDialog] = useState(false);
    const [pausedNotebooks, setPausedNotebooks] = useState<DatabricksMigrationItem[]>([]);
    const [isReplacing, setIsReplacing] = useState(false);
    const hasShownReplaceDialog = useRef(false);

    const [logsDialog, setLogsDialog] = useState<{
        open: boolean;
        jobName: string;
        runId: string;
        databricksUrl: string;
        personalAccessToken: string;
    } | null>(null);

    const databricksTypes = [
        { value: "Job", label: "Job" },
        { value: "Notebook", label: "Notebook" },
        { value: "Cluster", label: "Cluster" },
    ];

    // ✅ SIMPLIFIED: Detect paused notebooks (no more complex sync logic)
    useEffect(() => {
        if (isReplacing) {
            return; // Skip during replacement
        }

        const paused = items.filter(
            item => item.type === "Notebook" &&
                item.status === "Failed" &&
                item.errorMessage?.includes("already exists")
        );

        const hasChanged = paused.length !== pausedNotebooks.length ||
            paused.some(p => !pausedNotebooks.find(pn => pn.id === p.id));

        if (hasChanged) {
            console.log(`📋 Found ${paused.length} paused notebooks`);
            setPausedNotebooks(paused);
        }

        if (paused.length > 0 && !showReplaceDialog && !hasShownReplaceDialog.current) {
            console.log("🔔 Showing replace dialog");
            setShowReplaceDialog(true);
            hasShownReplaceDialog.current = true;
        }
    }, [items, showReplaceDialog, isReplacing]);

    // ✅ REMOVED: Complex parent sync useEffect - no longer needed!

    const stats = {
        total: items.length,
        success: items.filter(i => i.status === "Success").length,
        running: items.filter(i => i.status === "Running").length,
        failed: items.filter(i => i.status === "Failed").length,
        skipped: items.filter(i => i.status === "Skipped").length,
        replaced: items.filter(i => i.status === "Replaced").length,
    };

    const hasRunningItems = stats.running > 0;
    const progress = stats.total > 0
        ? ((stats.success + stats.failed + stats.replaced + stats.skipped) / stats.total) * 100
        : 0;

    const filteredItems = items.filter(item => {
        const matchesStatus = statusFilter === "all" || item.status === statusFilter;
        const matchesType = typeFilter === "all" || item.type === typeFilter;
        const matchesSearch =
            searchQuery === "" ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.path?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesType && matchesSearch;
    });

    const toggleItemSelection = (itemId: string) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    const toggleAllItems = () => {
        if (selectedItems.size === filteredItems.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(filteredItems.map(item => item.id)));
        }
    };

    const allFilteredSelected = filteredItems.length > 0 && selectedItems.size === filteredItems.length;

    const openReportPreview = () => {
        setShowReportDialog(true);
    };

    // ✅ SIMPLIFIED: All updates go directly to parent
    const handleReplaceNotebooks = async (notebooksToReplace: any[]) => {
        console.log("🔄 Starting notebook replacement...");
        console.log("📋 Notebooks to replace:", notebooksToReplace.map(nb => nb.name));

        setIsReplacing(true);
        setShowReplaceDialog(false);

        if (!fabricCredentials || !databricksCredentials) {
            console.error("❌ Missing credentials");
            toast({
                title: "Missing Credentials",
                description: "Fabric or Databricks credentials not found",
                variant: "destructive",
            });
            setIsReplacing(false);
            return;
        }

        const notebooksToSkip = pausedNotebooks.filter(
            nb => !notebooksToReplace.find(r => r.id === nb.id)
        );

        console.log(`✅ Replacing: ${notebooksToReplace.length} notebooks`);
        console.log(`⏭️ Skipping: ${notebooksToSkip.length} notebooks`);

        // ✅ STEP 1: Mark skipped notebooks FIRST (immutable status)
        if (notebooksToSkip.length > 0) {
            console.log("⏭️ Setting skipped notebooks to Skipped status");
            onMigrationUpdate((prevItems) =>
                prevItems.map(prevItem => {
                    if (notebooksToSkip.find(nb => nb.id === prevItem.id)) {
                        console.log(`  ⏭️ "${prevItem.name}" → Skipped`);
                        return {
                            ...prevItem,
                            status: "Skipped" as Status,
                            errorMessage: undefined
                        };
                    }
                    return prevItem;
                })
            );
        }

        if (notebooksToReplace.length === 0) {
            toast({
                title: "No Notebooks Selected",
                description: "All notebooks have been skipped",
            });
            setIsReplacing(false);
            setPausedNotebooks([]);
            return;
        }

        // ✅ STEP 2: Set selected notebooks to Running
        console.log("🏃 Setting selected notebooks to Running status");
        onMigrationUpdate((prevItems) =>
            prevItems.map(prevItem => {
                if (notebooksToReplace.find(nb => nb.id === prevItem.id)) {
                    console.log(`  🏃 "${prevItem.name}" → Running`);
                    return { ...prevItem, status: "Running" as Status };
                }
                return prevItem;
            })
        );

        // ✅ STEP 3: Execute API call
        try {
            const payload = {
                tenantId: fabricCredentials.tenantId,
                clientId: fabricCredentials.clientId,
                clientSecret: fabricCredentials.clientSecret,
                workspaceId: targetWorkspaceId,
                databricksUrl: databricksCredentials.databricksUrl,
                personalAccessToken: databricksCredentials.personalAccessToken,
                replaceIfExists: true,
                notebooks: notebooksToReplace.map(nb => ({
                    name: nb.name,
                    path: nb.path
                }))
            };

            console.log("📤 Sending replacement request...");

            const response = await fetch(
                "https://20.106.196.248/DbMigrateNotebooks",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ Response Error:", errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log("📥 Replacement response:", result);

            if (!result.details || !Array.isArray(result.details)) {
                throw new Error(`Invalid API response: missing 'details' array`);
            }

            // ✅ STEP 4: Update with final results (one batch update)
            console.log("✅ Updating parent with final results");

            onMigrationUpdate((prevItems) =>
                prevItems.map(prevItem => {
                    // Find if this item was in the replacement batch
                    const wasInReplacementBatch = notebooksToReplace.find(nb => nb.id === prevItem.id);
                    if (!wasInReplacementBatch) {
                        return prevItem; // Not affected by this replacement
                    }

                    // Find the API result for this notebook
                    const detail = result.details.find((d: any) => d.name === prevItem.name);

                    let status: Status = "Failed";
                    let errorMessage: string | undefined = undefined;
                    let runId: string | undefined = undefined;

                    if (detail) {
                        runId = detail.run_id || result.run_id;

                        if (detail.status === "replaced") {
                            status = "Replaced";
                            errorMessage = undefined;
                        } else if (detail.status === "created") {
                            status = "Success";
                            errorMessage = undefined;
                        } else if (detail.status === "failed" || detail.status === "export-failed") {
                            status = "Failed";
                            errorMessage = detail.error || "Replacement failed";
                        } else if (detail.status === "invalid-input") {
                            status = "Failed";
                            errorMessage = "Invalid notebook name or path";
                        } else {
                            status = "Failed";
                            errorMessage = `Unknown status: ${detail.status}`;
                        }
                    } else {
                        status = "Failed";
                        errorMessage = "Not returned in API response";
                        runId = result.run_id;
                    }

                    console.log(`  📝 "${prevItem.name}" → ${status}${errorMessage ? ` (${errorMessage})` : ''}`);

                    return { ...prevItem, status, errorMessage, runId };
                })
            );

            const replacedCount = result.details.filter((d: any) => d.status === "replaced").length;
            const createdCount = result.details.filter((d: any) => d.status === "created").length;
            const failedCount = result.details.filter((d: any) =>
                d.status === "failed" || d.status === "export-failed"
            ).length;

            toast({
                title: failedCount > 0 ? "Completed with Errors" : "Replacement Complete",
                description: `${replacedCount} replaced, ${createdCount} created, ${notebooksToSkip.length} skipped${failedCount > 0 ? `, ${failedCount} failed` : ''}`,
                variant: failedCount > 0 ? "destructive" : "default"
            });

        } catch (error) {
            console.error("❌ Replacement error:", error);

            // Update failed items
            onMigrationUpdate((prevItems) =>
                prevItems.map(prevItem => {
                    if (notebooksToReplace.find(nb => nb.id === prevItem.id)) {
                        return {
                            ...prevItem,
                            status: "Failed" as Status,
                            errorMessage: error instanceof Error ? error.message : "Replacement failed"
                        };
                    }
                    return prevItem;
                })
            );

            toast({
                title: "Replacement Failed",
                description: error instanceof Error ? error.message : "Failed to replace notebooks",
                variant: "destructive",
            });
        } finally {
            console.log("✅ Replacement cleanup complete");
            setIsReplacing(false);
            setPausedNotebooks([]);
        }
    };

    // ✅ SIMPLIFIED: Skip all - single parent update
    const handleSkipNotebooks = () => {
        console.log("⏭️ Skipping all notebooks");
        setShowReplaceDialog(false);

        onMigrationUpdate((prevItems) =>
            prevItems.map(prevItem => {
                if (pausedNotebooks.find(nb => nb.id === prevItem.id)) {
                    console.log(`  ⏭️ "${prevItem.name}" → Skipped`);
                    return {
                        ...prevItem,
                        status: "Skipped" as Status,
                        errorMessage: undefined
                    };
                }
                return prevItem;
            })
        );

        toast({
            title: "All Notebooks Skipped",
            description: `${pausedNotebooks.length} notebook(s) skipped`,
        });

        setPausedNotebooks([]);
    };

    const itemsToExport = selectedItems.size > 0
        ? items.filter(item => selectedItems.has(item.id))
        : items;

    return (
        <div className="min-h-screen bg-background">
            <main className="p-6 max-w-7xl mx-auto animate-fade-in">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <button onClick={onBackToHome} className="hover:text-foreground flex items-center gap-1">
                        <Home className="w-4 h-4" />
                        Home
                    </button>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-foreground font-medium">Databricks Migration Report</span>
                </div>

                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground mb-1">Databricks Migration Report</h1>
                        <p className="text-sm text-muted-foreground">
                            Track the progress of your Databricks to Fabric migration
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={openReportPreview}
                            disabled={hasRunningItems}
                            title={hasRunningItems ? "Wait for all items to complete before exporting" : "Export migration report"}
                        >
                            <Download className="w-4 h-4" />
                            Export Report {selectedItems.size > 0 && `(${selectedItems.size})`}
                        </Button>
                        <Button variant="azure" onClick={onBackToHome}>
                            <Home className="w-4 h-4" />
                            Back to Home
                        </Button>
                    </div>
                </div>

                <Card className="mb-6">
                    <CardContent className="py-5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-foreground">Overall Migration Progress</h3>
                            <span className="text-sm text-muted-foreground">
                                {stats.success + stats.replaced + stats.skipped + stats.failed} of {stats.total} completed
                            </span>
                        </div>
                        <Progress value={progress} className="h-3" />
                        <div className="flex gap-6 mt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-success" />
                                <span className="text-sm text-muted-foreground">
                                    Created: {stats.success}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full bg-running ${stats.running > 0 ? 'animate-pulse' : ''}`} />
                                <span className="text-sm text-muted-foreground">
                                    Running: {stats.running}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-destructive" />
                                <span className="text-sm text-muted-foreground">
                                    Failed: {stats.failed}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-600" />
                                <span className="text-sm text-muted-foreground">
                                    Replaced: {stats.replaced}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gray-600" />
                                <span className="text-sm text-muted-foreground">
                                    Skipped: {stats.skipped}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-6 gap-4 mb-6">
                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Items</p>
                                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <List className="w-5 h-5 text-primary" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Created</p>
                                <p className="text-2xl font-bold text-success">{stats.success}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-success" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Running</p>
                                <p className="text-2xl font-bold text-running">{stats.running}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-running/10 flex items-center justify-center">
                                <Loader2 className={`w-5 h-5 text-running ${stats.running > 0 ? 'animate-spin' : ''}`} />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Failed</p>
                                <p className="text-2xl font-bold text-destructive">{stats.failed}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                                <XCircle className="w-5 h-5 text-destructive" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Replaced</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.replaced}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <RefreshCw className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Skipped</p>
                                <p className="text-2xl font-bold text-gray-600">{stats.skipped}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
                                <Minus className="w-5 h-5 text-gray-600" />
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="flex items-center gap-3 mb-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or path..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="Success">Created</SelectItem>
                            <SelectItem value="Running">Running</SelectItem>
                            <SelectItem value="Failed">Failed</SelectItem>
                            <SelectItem value="Replaced">Replaced</SelectItem>
                            <SelectItem value="Skipped">Skipped</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                            <SelectItem value="all">All Types</SelectItem>
                            {databricksTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">
                                    <Checkbox
                                        checked={allFilteredSelected}
                                        onCheckedChange={toggleAllItems}
                                        aria-label="Select all items"
                                    />
                                </TableHead>
                                <TableHead className="w-[250px]">ITEM NAME</TableHead>
                                <TableHead>TYPE</TableHead>
                                <TableHead>TARGET WORKSPACE</TableHead>
                                <TableHead>STATUS</TableHead>
                                <TableHead>ERROR MESSAGE</TableHead>
                                <TableHead className="w-[100px]">Logs</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredItems.map((item) => (
                                <TableRow key={item.id} className="hover:bg-muted/50">
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedItems.has(item.id)}
                                            onCheckedChange={() => toggleItemSelection(item.id)}
                                            aria-label={`Select ${item.name}`}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>
                                        <span className="px-2 py-1 rounded bg-muted text-xs">
                                            {databricksTypes.find(t => t.value === item.type)?.label ?? item.type}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {item.targetWorkspace ?? "-"}
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={item.status} />
                                    </TableCell>
                                    <TableCell>
                                        {item.errorMessage ? (
                                            <div className="flex items-center gap-2 text-sm">
                                                {item.errorMessage.includes("already exists") ? (
                                                    <>
                                                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                                                        <span className="text-amber-600">{item.errorMessage}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <AlertTriangle className="w-4 h-4 text-destructive" />
                                                        <span className="text-destructive">{item.errorMessage}</span>
                                                    </>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        {item.runId ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    console.log(`🔍 Opening logs for ${item.type} "${item.name}" with runId:`, item.runId);
                                                    setLogsDialog({
                                                        open: true,
                                                        jobName: item.name,
                                                        runId: item.runId!,
                                                        databricksUrl: (item as any).databricksUrl || databricksCredentials?.databricksUrl || "",
                                                        personalAccessToken: (item as any).personalAccessToken || databricksCredentials?.personalAccessToken || "",
                                                    });
                                                }}
                                                title="View migration logs"
                                            >
                                                <FileText className="w-4 h-4" />
                                            </Button>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">
                                                -
                                            </span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>

                {filteredItems.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No items match your filters</p>
                    </div>
                )}
            </main>

            <DatabricksMigrationReportDialog
                open={showReportDialog}
                onOpenChange={setShowReportDialog}
                items={itemsToExport}
                selectedOnly={selectedItems.size > 0}
            />

            <ReplaceNotebooksDialog
                open={showReplaceDialog}
                notebooks={pausedNotebooks}
                isMigrating={isReplacing}
                onReplace={handleReplaceNotebooks}
                onSkipAll={handleSkipNotebooks}
            />

            {logsDialog && (
                <LogsViewerDialog
                    open={logsDialog.open}
                    onClose={() => setLogsDialog(null)}
                    jobName={logsDialog.jobName}
                    runId={logsDialog.runId}
                    databricksUrl={logsDialog.databricksUrl}
                    personalAccessToken={logsDialog.personalAccessToken}
                />
            )}
        </div>
    );
}
