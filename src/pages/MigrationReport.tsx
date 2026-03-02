// import { useState, useEffect } from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { StatusBadge } from "@/components/StatusBadge";
// import { Progress } from "@/components/ui/progress";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Search,
//   Filter,
//   Download,
//   CheckCircle2,
//   XCircle,
//   Loader2,
//   Home,
//   ChevronRight,
//   AlertTriangle,
// } from "lucide-react";
// import type { MigrationItem } from "@/types/migration";

// interface MigrationReportProps {
//   items: MigrationItem[];
//   onLogout: () => void;
//   onBackToHome: () => void;
// }

// export function MigrationReport({ 
//   items: initialItems, 
//   onLogout, 
//   onBackToHome
// }: MigrationReportProps) {
//   const [items, setItems] = useState<MigrationItem[]>(initialItems);
//   const [statusFilter, setStatusFilter] = useState<string>("all");
//   const [typeFilter, setTypeFilter] = useState<string>("all");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

//   const synapseTypes = [
//     { value: "SparkPool", label: "Spark Pool" },
//     { value: "Notebook", label: "Notebook" },
//     { value: "Pipeline", label: "Pipeline" },
//     { value: "LinkedService", label: "Linked Service" },
//   ];

//   useEffect(() => {
//     setItems(initialItems);
//   }, [initialItems]);

//   const stats = {
//     total: items.length,
//     success: items.filter(i => i.status === "Success").length,
//     running: items.filter(i => i.status === "Running").length,
//     failed: items.filter(i => i.status === "Failed").length,
//   };

//   const hasRunningItems = stats.running > 0;
//   const progress = stats.total > 0 ? ((stats.success + stats.failed) / stats.total) * 100 : 0;

//   const filteredItems = items.filter(item => {
//     const matchesStatus = statusFilter === "all" || item.status === statusFilter;
//     const matchesType = typeFilter === "all" || item.type === typeFilter;
//     const matchesSearch =
//       searchQuery === "" ||
//       item.name.toLowerCase().includes(searchQuery.toLowerCase());
//     return matchesStatus && matchesType && matchesSearch;
//   });

//   const toggleItemSelection = (itemId: string) => {
//     setSelectedItems(prev => {
//       const newSet = new Set(prev);
//       if (newSet.has(itemId)) {
//         newSet.delete(itemId);
//       } else {
//         newSet.add(itemId);
//       }
//       return newSet;
//     });
//   };

//   const toggleAllItems = () => {
//     if (selectedItems.size === filteredItems.length) {
//       setSelectedItems(new Set());
//     } else {
//       setSelectedItems(new Set(filteredItems.map(item => item.id)));
//     }
//   };

//   const allFilteredSelected = filteredItems.length > 0 && selectedItems.size === filteredItems.length;

//   const exportReportAsJson = () => {
//     const itemsToExport = selectedItems.size > 0 
//       ? items.filter(item => selectedItems.has(item.id))
//       : items;

//     const report = {
//       metadata: {
//         exportDate: new Date().toISOString(),
//         exportedBy: "Migration Tool",
//         source: "Azure Synapse",
//         target: "Microsoft Fabric",
//         version: "3.1.0",
//         itemsExported: itemsToExport.length,
//         selectedItemsOnly: selectedItems.size > 0
//       },
//       summary: {
//         totalItems: itemsToExport.length,
//         successful: itemsToExport.filter(i => i.status === "Success").length,
//         running: itemsToExport.filter(i => i.status === "Running").length,
//         failed: itemsToExport.filter(i => i.status === "Failed").length,
//         successRate: itemsToExport.length > 0 
//           ? ((itemsToExport.filter(i => i.status === "Success").length / itemsToExport.length) * 100).toFixed(2) + "%" 
//           : "0%"
//       },
//       items: itemsToExport.map(item => ({
//         id: item.id,
//         name: item.name,
//         type: item.type,
//         status: item.status,
//         targetWorkspace: item.targetWorkspace || "N/A",
//         errorMessage: item.errorMessage || null,
//         ...(item.runtimeVersion && { runtimeVersion: item.runtimeVersion }),
//         ...(item.nodeType && { nodeType: item.nodeType }),
//         ...(item.nodes && { nodes: item.nodes }),
//         ...(item.language && { language: item.language }),
//         ...(item.dependencies && { dependencies: item.dependencies }),
//         ...(item.activities && { activities: item.activities })
//       }))
//     };

//     const jsonString = JSON.stringify(report, null, 2);
//     const blob = new Blob([jsonString], { type: 'application/json' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
    
//     const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
//     const selectionSuffix = selectedItems.size > 0 ? '-selected' : '';
//     link.download = `synapse-migration-report${selectionSuffix}-${timestamp}.json`;

//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <main className="p-6 max-w-7xl mx-auto animate-fade-in">
//         <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
//           <button onClick={onBackToHome} className="hover:text-foreground flex items-center gap-1">
//             <Home className="w-4 h-4" />
//             Home
//           </button>
//           <ChevronRight className="w-4 h-4" />
//           <span className="text-foreground font-medium">Synapse Migration Report</span>
//         </div>

//         <div className="flex items-start justify-between mb-6">
//           <div>
//             <h1 className="text-2xl font-bold text-foreground mb-1">Synapse Migration Report</h1>
//             <p className="text-sm text-muted-foreground">
//               Track the progress of your Synapse to Fabric migration
//             </p>
//           </div>
//           <div className="flex gap-3">
//             <Button 
//               variant="outline" 
//               onClick={exportReportAsJson}
//               disabled={hasRunningItems}
//               title={hasRunningItems ? "Wait for all items to complete before exporting" : "Export migration report"}
//             >
//               <Download className="w-4 h-4" />
//               Export Report {selectedItems.size > 0 && `(${selectedItems.size})`}
//             </Button>
//             <Button variant="azure" onClick={onBackToHome}>
//               <Home className="w-4 h-4" />
//               Back to Home
//             </Button>
//           </div>
//         </div>

//         <Card className="mb-6">
//           <CardContent className="py-5">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="font-medium text-foreground">Overall Migration Progress</h3>
//               <span className="text-sm text-muted-foreground">
//                 {stats.success + stats.failed} of {stats.total} completed
//               </span>
//             </div>
//             <Progress value={progress} className="h-3" />
//             <div className="flex gap-6 mt-4">
//               <div className="flex items-center gap-2">
//                 <div className="w-3 h-3 rounded-full bg-success" />
//                 <span className="text-sm text-muted-foreground">
//                   Success: {stats.success}
//                 </span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-3 h-3 rounded-full bg-running animate-pulse" />
//                 <span className="text-sm text-muted-foreground">
//                   Running: {stats.running}
//                 </span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-3 h-3 rounded-full bg-destructive" />
//                 <span className="text-sm text-muted-foreground">
//                   Failed: {stats.failed}
//                 </span>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <div className="grid grid-cols-4 gap-4 mb-6">
//           <Card className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Total Items</p>
//                 <p className="text-2xl font-bold text-foreground">{stats.total}</p>
//               </div>
//               <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
//                 <Loader2 className="w-5 h-5 text-primary" />
//               </div>
//             </div>
//           </Card>
//           <Card className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Succeeded</p>
//                 <p className="text-2xl font-bold text-success">{stats.success}</p>
//               </div>
//               <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
//                 <CheckCircle2 className="w-5 h-5 text-success" />
//               </div>
//             </div>
//           </Card>
//           <Card className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Running</p>
//                 <p className="text-2xl font-bold text-running">{stats.running}</p>
//               </div>
//               <div className="w-10 h-10 rounded-lg bg-running/10 flex items-center justify-center">
//                 <Loader2 className="w-5 h-5 text-running animate-spin" />
//               </div>
//             </div>
//           </Card>
//           <Card className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Failed</p>
//                 <p className="text-2xl font-bold text-destructive">{stats.failed}</p>
//               </div>
//               <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
//                 <XCircle className="w-5 h-5 text-destructive" />
//               </div>
//             </div>
//           </Card>
//         </div>

//         <div className="flex items-center gap-3 mb-4">
//           <div className="relative flex-1 max-w-sm">
//             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
//             <Input
//               placeholder="Search items..."
//               className="pl-9"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>
//           <Select value={statusFilter} onValueChange={setStatusFilter}>
//             <SelectTrigger className="w-40">
//               <Filter className="w-4 h-4 mr-2" />
//               <SelectValue placeholder="Status" />
//             </SelectTrigger>
//             <SelectContent className="bg-popover">
//               <SelectItem value="all">All Status</SelectItem>
//               <SelectItem value="Success">Success</SelectItem>
//               <SelectItem value="Running">Running</SelectItem>
//               <SelectItem value="Failed">Failed</SelectItem>
//             </SelectContent>
//           </Select>
//           <Select value={typeFilter} onValueChange={setTypeFilter}>
//             <SelectTrigger className="w-40">
//               <SelectValue placeholder="Type" />
//             </SelectTrigger>
//             <SelectContent className="bg-popover">
//               <SelectItem value="all">All Types</SelectItem>
//               {synapseTypes.map((type) => (
//                 <SelectItem key={type.value} value={type.value}>
//                   {type.label}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         <Card>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="w-[50px]">
//                   <Checkbox
//                     checked={allFilteredSelected}
//                     onCheckedChange={toggleAllItems}
//                     aria-label="Select all items"
//                   />
//                 </TableHead>
//                 <TableHead className="w-[250px]">ITEM NAME</TableHead>
//                 <TableHead>TYPE</TableHead>
//                 <TableHead>TARGET WORKSPACE</TableHead>
//                 <TableHead>STATUS</TableHead>
//                 <TableHead>ERROR MESSAGE</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredItems.map((item) => (
//                 <TableRow key={item.id} className="hover:bg-muted/50">
//                   <TableCell>
//                     <Checkbox
//                       checked={selectedItems.has(item.id)}
//                       onCheckedChange={() => toggleItemSelection(item.id)}
//                       aria-label={`Select ${item.name}`}
//                     />
//                   </TableCell>
//                   <TableCell className="font-medium">{item.name}</TableCell>
//                   <TableCell>
//                     <span className="px-2 py-1 rounded bg-muted text-xs">
//                       {synapseTypes.find(t => t.value === item.type)?.label ?? item.type}
//                     </span>
//                   </TableCell>
//                   <TableCell className="text-muted-foreground">
//                     {item.targetWorkspace ?? "-"}
//                   </TableCell>
//                   <TableCell>
//                     <StatusBadge status={item.status} />
//                   </TableCell>
//                   <TableCell>
//                     {item.errorMessage ? (
//                       <div className="flex items-center gap-2 text-destructive text-sm">
//                         <AlertTriangle className="w-4 h-4" />
//                         {item.errorMessage}
//                       </div>
//                     ) : (
//                       <span className="text-muted-foreground">-</span>
//                     )}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </Card>

//         {filteredItems.length === 0 && (
//           <div className="text-center py-12">
//             <p className="text-muted-foreground">No items match your filters</p>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }

//24/02

 
// import { useState, useEffect } from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { StatusBadge } from "@/components/StatusBadge";
// import { Progress } from "@/components/ui/progress";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Search,
//   Filter,
//   Download,
//   CheckCircle2,
//   XCircle,
//   Loader2,
//   Home,
//   ChevronRight,
//   AlertTriangle,
//   List,
//   Minus,
//   RefreshCw,
//   FileText,
// } from "lucide-react";
// import type { MigrationItem } from "@/types/migration";
// import { MigrationReportDialog } from "../components/modals/MigrationReportDialog";
// import { LogsViewerDialog } from "../components/modals/SynapseLogsViewerDialogue";
 
// interface MigrationReportProps {
//   items: MigrationItem[];
//   onLogout: () => void;
//   onBackToHome: () => void;
// }
 
// export function MigrationReport({
//   items: initialItems,
//   onLogout,
//   onBackToHome,
// }: MigrationReportProps) {
//   const [items, setItems] = useState<MigrationItem[]>(initialItems);
//   const [statusFilter, setStatusFilter] = useState<string>("all");
//   const [typeFilter, setTypeFilter] = useState<string>("all");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
//   const [showReportDialog, setShowReportDialog] = useState(false);
 
//   const [logsDialog, setLogsDialog] = useState<{
//     open: boolean;
//     jobName: string;
//     runId: string;
//   } | null>(null);
 
//   const synapseTypes = [
//     { value: "SparkPool",     label: "Spark Pool"     },
//     { value: "Notebook",      label: "Notebook"       },
//     { value: "Pipeline",      label: "Pipeline"       },
//     { value: "LinkedService", label: "Linked Service" },
//   ];
 
//   useEffect(() => {
//     setItems(initialItems);
//   }, [initialItems]);
 
//   const stats = {
//     total:    items.length,
//     success:  items.filter(i => i.status === "Success").length,
//     running:  items.filter(i => i.status === "Running").length,
//     failed:   items.filter(i => i.status === "Failed").length,
//     skipped:  items.filter(i => i.status === "Skipped").length,
//     replaced: items.filter(i => i.status === "Replaced").length,
//   };
 
//   const hasRunningItems = stats.running > 0;
//   const progress =
//     stats.total > 0
//       ? ((stats.success + stats.failed + stats.replaced + stats.skipped) / stats.total) * 100
//       : 0;
 
//   const filteredItems = items.filter(item => {
//     const matchesStatus = statusFilter === "all" || item.status === statusFilter;
//     const matchesType   = typeFilter === "all"   || item.type === typeFilter;
//     const matchesSearch =
//       searchQuery === "" ||
//       item.name.toLowerCase().includes(searchQuery.toLowerCase());
//     return matchesStatus && matchesType && matchesSearch;
//   });
 
//   const toggleItemSelection = (itemId: string) => {
//     setSelectedItems(prev => {
//       const n = new Set(prev);
//       n.has(itemId) ? n.delete(itemId) : n.add(itemId);
//       return n;
//     });
//   };
 
//   const toggleAllItems = () => {
//     if (selectedItems.size === filteredItems.length) {
//       setSelectedItems(new Set());
//     } else {
//       setSelectedItems(new Set(filteredItems.map(item => item.id)));
//     }
//   };
 
//   const allFilteredSelected =
//     filteredItems.length > 0 && selectedItems.size === filteredItems.length;
 
//   const itemsToExport =
//     selectedItems.size > 0
//       ? items.filter(item => selectedItems.has(item.id))
//       : items;
 
//   return (
//     <div className="min-h-screen bg-background">
//       <main className="p-6 max-w-7xl mx-auto animate-fade-in">
//         {/* Breadcrumb */}
//         <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
//           <button
//             onClick={onBackToHome}
//             className="hover:text-foreground flex items-center gap-1"
//           >
//             <Home className="w-4 h-4" />
//             Home
//           </button>
//           <ChevronRight className="w-4 h-4" />
//           <span className="text-foreground font-medium">Synapse Migration Report</span>
//         </div>
 
//         {/* Page header */}
//         <div className="flex items-start justify-between mb-6">
//           <div>
//             <h1 className="text-2xl font-bold text-foreground mb-1">
//               Synapse Migration Report
//             </h1>
//             <p className="text-sm text-muted-foreground">
//               Track the progress of your Synapse to Fabric migration
//             </p>
//           </div>
//           <div className="flex gap-3">
//             <Button
//               variant="outline"
//               onClick={() => setShowReportDialog(true)}
//               disabled={hasRunningItems}
//               title={
//                 hasRunningItems
//                   ? "Wait for all items to complete before exporting"
//                   : "Export migration report"
//               }
//             >
//               <Download className="w-4 h-4" />
//               Export Report {selectedItems.size > 0 && `(${selectedItems.size})`}
//             </Button>
//             <Button variant="azure" onClick={onBackToHome}>
//               <Home className="w-4 h-4" />
//               Back to Home
//             </Button>
//           </div>
//         </div>
 
//         {/* Progress card */}
//         <Card className="mb-6">
//           <CardContent className="py-5">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="font-medium text-foreground">Overall Migration Progress</h3>
//               <span className="text-sm text-muted-foreground">
//                 {stats.success + stats.replaced + stats.skipped + stats.failed} of {stats.total} completed
//               </span>
//             </div>
//             <Progress value={progress} className="h-3" />
//             <div className="flex gap-6 mt-4">
//               <div className="flex items-center gap-2">
//                 <div className="w-3 h-3 rounded-full bg-success" />
//                 <span className="text-sm text-muted-foreground">Created: {stats.success}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className={`w-3 h-3 rounded-full bg-running ${stats.running > 0 ? "animate-pulse" : ""}`} />
//                 <span className="text-sm text-muted-foreground">Running: {stats.running}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-3 h-3 rounded-full bg-destructive" />
//                 <span className="text-sm text-muted-foreground">Failed: {stats.failed}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-3 h-3 rounded-full bg-blue-600" />
//                 <span className="text-sm text-muted-foreground">Replaced: {stats.replaced}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-3 h-3 rounded-full bg-gray-600" />
//                 <span className="text-sm text-muted-foreground">Skipped: {stats.skipped}</span>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
 
//         {/* Stat cards */}
//         <div className="grid grid-cols-6 gap-4 mb-6">
//           <Card className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Total Items</p>
//                 <p className="text-2xl font-bold text-foreground">{stats.total}</p>
//               </div>
//               <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
//                 <List className="w-5 h-5 text-primary" />
//               </div>
//             </div>
//           </Card>
 
//           <Card className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Created</p>
//                 <p className="text-2xl font-bold text-success">{stats.success}</p>
//               </div>
//               <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
//                 <CheckCircle2 className="w-5 h-5 text-success" />
//               </div>
//             </div>
//           </Card>
 
//           <Card className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Running</p>
//                 <p className="text-2xl font-bold text-running">{stats.running}</p>
//               </div>
//               <div className="w-10 h-10 rounded-lg bg-running/10 flex items-center justify-center">
//                 <Loader2 className={`w-5 h-5 text-running ${stats.running > 0 ? "animate-spin" : ""}`} />
//               </div>
//             </div>
//           </Card>
 
//           <Card className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Failed</p>
//                 <p className="text-2xl font-bold text-destructive">{stats.failed}</p>
//               </div>
//               <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
//                 <XCircle className="w-5 h-5 text-destructive" />
//               </div>
//             </div>
//           </Card>
 
//           <Card className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Replaced</p>
//                 <p className="text-2xl font-bold text-blue-600">{stats.replaced}</p>
//               </div>
//               <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
//                 <RefreshCw className="w-5 h-5 text-blue-600" />
//               </div>
//             </div>
//           </Card>
 
//           <Card className="p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Skipped</p>
//                 <p className="text-2xl font-bold text-gray-600">{stats.skipped}</p>
//               </div>
//               <div className="w-10 h-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
//                 <Minus className="w-5 h-5 text-gray-600" />
//               </div>
//             </div>
//           </Card>
//         </div>
 
//         {/* Filters */}
//         <div className="flex items-center gap-3 mb-4">
//           <div className="relative flex-1 max-w-sm">
//             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
//             <Input
//               placeholder="Search items..."
//               className="pl-9"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>
//           <Select value={statusFilter} onValueChange={setStatusFilter}>
//             <SelectTrigger className="w-40">
//               <Filter className="w-4 h-4 mr-2" />
//               <SelectValue placeholder="Status" />
//             </SelectTrigger>
//             <SelectContent className="bg-popover">
//               <SelectItem value="all">All Status</SelectItem>
//               <SelectItem value="Success">Created</SelectItem>
//               <SelectItem value="Running">Running</SelectItem>
//               <SelectItem value="Failed">Failed</SelectItem>
//               <SelectItem value="Replaced">Replaced</SelectItem>
//               <SelectItem value="Skipped">Skipped</SelectItem>
//             </SelectContent>
//           </Select>
//           <Select value={typeFilter} onValueChange={setTypeFilter}>
//             <SelectTrigger className="w-40">
//               <SelectValue placeholder="Type" />
//             </SelectTrigger>
//             <SelectContent className="bg-popover">
//               <SelectItem value="all">All Types</SelectItem>
//               {synapseTypes.map((t) => (
//                 <SelectItem key={t.value} value={t.value}>
//                   {t.label}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
 
//         {/* Table */}
//         <Card>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="w-[50px]">
//                   <Checkbox
//                     checked={allFilteredSelected}
//                     onCheckedChange={toggleAllItems}
//                     aria-label="Select all items"
//                   />
//                 </TableHead>
//                 <TableHead className="w-[250px]">ITEM NAME</TableHead>
//                 <TableHead>TYPE</TableHead>
//                 <TableHead>TARGET WORKSPACE</TableHead>
//                 <TableHead>STATUS</TableHead>
//                 <TableHead>ERROR MESSAGE</TableHead>
//                 <TableHead className="w-[100px]">Logs</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredItems.map((item) => {
//                 const runId = (item as any).runId as string | undefined;
 
//                 return (
//                   <TableRow key={item.id} className="hover:bg-muted/50">
//                     <TableCell>
//                       <Checkbox
//                         checked={selectedItems.has(item.id)}
//                         onCheckedChange={() => toggleItemSelection(item.id)}
//                         aria-label={`Select ${item.name}`}
//                       />
//                     </TableCell>
//                     <TableCell className="font-medium">{item.name}</TableCell>
//                     <TableCell>
//                       <span className="px-2 py-1 rounded bg-muted text-xs">
//                         {synapseTypes.find(t => t.value === item.type)?.label ?? item.type}
//                       </span>
//                     </TableCell>
//                     <TableCell className="text-muted-foreground">
//                       {item.targetWorkspace ?? "-"}
//                     </TableCell>
//                     <TableCell>
//                       <StatusBadge status={item.status} />
//                     </TableCell>
//                     <TableCell>
//                       {item.errorMessage ? (
//                         <div className="flex items-center gap-2 text-sm">
//                           {item.errorMessage.includes("already exists") ? (
//                             <>
//                               <AlertTriangle className="w-4 h-4 text-amber-500" />
//                               <span className="text-amber-600">{item.errorMessage}</span>
//                             </>
//                           ) : (
//                             <>
//                               <AlertTriangle className="w-4 h-4 text-destructive" />
//                               <span className="text-destructive">{item.errorMessage}</span>
//                             </>
//                           )}
//                         </div>
//                       ) : (
//                         <span className="text-muted-foreground">-</span>
//                       )}
//                     </TableCell>
//                     <TableCell>
//                       {runId ? (
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={() => {
//                             console.log(`🔍 Opening logs for ${item.type} "${item.name}" with runId:`, runId);
//                             setLogsDialog({
//                               open: true,
//                               jobName: item.name,
//                               runId,
//                             });
//                           }}
//                           title="View migration logs"
//                         >
//                           <FileText className="w-4 h-4" />
//                         </Button>
//                       ) : (
//                         <span className="text-xs text-muted-foreground">-</span>
//                       )}
//                     </TableCell>
//                   </TableRow>
//                 );
//               })}
//             </TableBody>
//           </Table>
//         </Card>
 
//         {filteredItems.length === 0 && (
//           <div className="text-center py-12">
//             <p className="text-muted-foreground">No items match your filters</p>
//           </div>
//         )}
//       </main>
 
//       <MigrationReportDialog
//         open={showReportDialog}
//         onOpenChange={setShowReportDialog}
//         items={itemsToExport}
//         selectedOnly={selectedItems.size > 0}
//       />
 
//       {logsDialog && (
//         <LogsViewerDialog
//           open={logsDialog.open}
//           onClose={() => setLogsDialog(null)}
//           jobName={logsDialog.jobName}
//           runId={logsDialog.runId}
//         />
//       )}
//     </div>
//   );
// }
 

//26/02

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ReplaceNotebooksDialog } from "@/components/modals/ReplaceNotebookDialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Search, Filter, Download, CheckCircle2, XCircle, Loader2,
  Home, ChevronRight, AlertTriangle, List, Minus, RefreshCw, FileText,
} from "lucide-react";
import type { MigrationItem } from "@/types/migration";
import { MigrationReportDialog } from "../components/modals/MigrationReportDialog";
import { LogsViewerDialog } from "../components/modals/SynapseLogsViewerDialogue";
import { useAzureCredentials } from "@/contexts/AzureCredentialsContext";
import { useFabricCredentials } from "@/contexts/FabricCredentialsContext";
import { useToast } from "@/hooks/use-toast";

interface MigrationReportProps {
  items: MigrationItem[];
  onLogout: () => void;
  onBackToHome: () => void;
  onMigrationUpdate: (updateFn: (prev: any[]) => any[]) => void;
  // ✅ The SOURCE Synapse workspace name (apiResponse.workspace), needed for
  //    the replace API payload. Different from targetWorkspace on items,
  //    which is the DESTINATION Fabric workspace name.
  synapseWorkspaceName: string;
}

const synapseTypes = [
  { value: "SparkPool",     label: "Spark Pool" },
  { value: "Notebook",      label: "Notebook" },
  { value: "Pipeline",      label: "Pipeline" },
  { value: "LinkedService", label: "Linked Service" },
];

export function MigrationReport({
  items,
  onLogout,
  onBackToHome,
  onMigrationUpdate,
  synapseWorkspaceName,
}: MigrationReportProps) {
  const { credentials } = useAzureCredentials();
  const { credentials: fabricCredentials } = useFabricCredentials();
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [logsDialog, setLogsDialog] = useState<{ open: boolean; jobName: string; runId: string } | null>(null);

  // ── Replace dialog state — identical pattern to DatabricksMigrationReport ──
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [conflictNotebooks, setConflictNotebooks] = useState<MigrationItem[]>([]);
  const [isReplacing, setIsReplacing] = useState(false);
  const hasShownReplaceDialog = useRef(false);

  // =========================================================
  // DETECT CONFLICT NOTEBOOKS — same logic as DatabricksMigrationReport
  // Looks for Notebook items that are Failed with "already exists" error.
  // Shows the dialog once, then never again (hasShownReplaceDialog ref).
  // =========================================================
  useEffect(() => {
    if (isReplacing) return;

    const conflicts = items.filter(
      (item) =>
        item.type === "Notebook" &&
        item.status === "Failed" &&
        (item as any).errorMessage?.includes("already exists")
    );

    const hasChanged =
      conflicts.length !== conflictNotebooks.length ||
      conflicts.some((c) => !conflictNotebooks.find((cn) => cn.id === c.id));

    if (hasChanged) {
      console.log(`📋 Found ${conflicts.length} conflict notebooks`);
      setConflictNotebooks(conflicts);
    }

    if (conflicts.length > 0 && !showReplaceDialog && !hasShownReplaceDialog.current) {
      console.log("🔔 Showing replace dialog");
      setShowReplaceDialog(true);
      hasShownReplaceDialog.current = true;
    }
  }, [items, showReplaceDialog, isReplacing]);

  const stats = {
    total:    items.length,
    success:  items.filter((i) => i.status === "Success").length,
    running:  items.filter((i) => i.status === "Running").length,
    failed:   items.filter((i) => i.status === "Failed").length,
    skipped:  items.filter((i) => i.status === "Skipped").length,
    replaced: items.filter((i) => i.status === "Replaced").length,
  };

  const hasRunningItems = stats.running > 0;
  const progress =
    stats.total > 0
      ? ((stats.success + stats.failed + stats.replaced + stats.skipped) / stats.total) * 100
      : 0;

  const filteredItems = items.filter((item) => {
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesType   = typeFilter   === "all" || item.type   === typeFilter;
    const matchesSearch =
      searchQuery === "" || item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) => {
      const n = new Set(prev);
      n.has(itemId) ? n.delete(itemId) : n.add(itemId);
      return n;
    });
  };
  const toggleAllItems = () => {
    if (selectedItems.size === filteredItems.length) setSelectedItems(new Set());
    else setSelectedItems(new Set(filteredItems.map((i) => i.id)));
  };

  const allFilteredSelected =
    filteredItems.length > 0 && selectedItems.size === filteredItems.length;

  const itemsToExport =
    selectedItems.size > 0 ? items.filter((i) => selectedItems.has(i.id)) : items;

  // =========================================================
  // REPLACE HANDLER — identical to DatabricksMigrationReport.handleReplaceNotebooks
  // =========================================================
  const handleReplaceNotebooks = async (notebooksToReplace: any[]) => {
    console.log("🔄 Starting Synapse notebook replacement...");
    setIsReplacing(true);
    setShowReplaceDialog(false);

    if (!fabricCredentials || !credentials) {
      console.error("❌ Missing credentials");
      toast({
        title: "Missing Credentials",
        description: "Azure or Fabric credentials not found",
        variant: "destructive",
      });
      setIsReplacing(false);
      return;
    }

    const notebooksToSkip = conflictNotebooks.filter(
      (nb) => !notebooksToReplace.find((r) => r.id === nb.id)
    );

    console.log(`✅ Replacing: ${notebooksToReplace.length} | ⏭️ Skipping: ${notebooksToSkip.length}`);

    // Step 1: Mark skipped notebooks immediately
    if (notebooksToSkip.length > 0) {
      onMigrationUpdate((prev) =>
        prev.map((item) =>
          notebooksToSkip.find((nb) => nb.id === item.id)
            ? { ...item, status: "Skipped", errorMessage: undefined }
            : item
        )
      );
    }

    if (notebooksToReplace.length === 0) {
      toast({ title: "All Notebooks Skipped", description: `${notebooksToSkip.length} notebook(s) skipped` });
      setIsReplacing(false);
      setConflictNotebooks([]);
      return;
    }

    // Step 2: Set selected notebooks to Running
    onMigrationUpdate((prev) =>
      prev.map((item) =>
        notebooksToReplace.find((nb) => nb.id === item.id)
          ? { ...item, status: "Running" }
          : item
      )
    );

    // Step 3: Get Fabric workspaceId from one of the conflicting items
    const sampleItem = notebooksToReplace[0];

    // Step 4: Call the API with replaceIfExists: true
    try {
      const payload = {
        synapse: {
          tenantId:      credentials.tenantId     || "",
          clientId:      credentials.clientId     || "",
          clientSecret:  credentials.clientSecret || "",
          // ✅ FIXED: Use the SOURCE Synapse workspace name passed as a prop,
          //    NOT sampleItem.targetWorkspace which is the Fabric destination name
          workspaceName: synapseWorkspaceName,
        },
        fabric: {
          tenantId:     fabricCredentials.tenantId,
          clientId:     fabricCredentials.clientId,
          clientSecret: fabricCredentials.clientSecret,
          workspaceId:  (sampleItem as any).targetWorkspaceId || "",
        },
        notebooks: notebooksToReplace.map((nb) => nb.name),
        replaceIfExists: true,
      };

      console.log("📤 Synapse replace notebooks payload:", payload);

      const response = await fetch("https://20.127.242.199/SynapseNotebooksMigration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("📊 Replace response:", JSON.stringify(result, null, 2));

      // Step 5: Update statuses from API response
      onMigrationUpdate((prev) =>
        prev.map((item) => {
          const wasInBatch = notebooksToReplace.find((nb) => nb.id === item.id);
          if (!wasInBatch) return item;

          const detail = (result.details || []).find((d: any) => d.name === item.name);
          const runId: string | undefined = detail?.run_id || result.run_id;

          let status: string = "Failed";
          let errorMessage: string | undefined;

          if (!detail) {
            errorMessage = "Not returned in API response";
          } else if (detail.status === "created")  { status = "Success"; }
          else if (detail.status === "replaced")    { status = "Replaced"; }
          else if (detail.status === "failed" || detail.status === "export-failed") {
            status = "Failed"; errorMessage = detail.error || "Replacement failed";
          } else {
            status = "Failed"; errorMessage = `Unknown status: ${detail.status}`;
          }

          console.log(`  📝 "${item.name}" → ${status}`);
          return { ...item, status, errorMessage, runId };
        })
      );

      const replacedCount = (result.details || []).filter((d: any) => d.status === "replaced").length;
      const createdCount  = (result.details || []).filter((d: any) => d.status === "created").length;
      const failedCount   = (result.details || []).filter((d: any) =>
        d.status === "failed" || d.status === "export-failed"
      ).length;

      toast({
        title: failedCount > 0 ? "Completed with Errors" : "Replacement Complete",
        description: `${replacedCount} replaced, ${createdCount} created, ${notebooksToSkip.length} skipped${failedCount > 0 ? `, ${failedCount} failed` : ""}`,
        variant: failedCount > 0 ? "destructive" : "default",
      });

    } catch (error) {
      console.error("❌ Replace error:", error);
      onMigrationUpdate((prev) =>
        prev.map((item) =>
          notebooksToReplace.find((nb) => nb.id === item.id)
            ? { ...item, status: "Failed", errorMessage: error instanceof Error ? error.message : "Replacement failed" }
            : item
        )
      );
      toast({
        title: "Replacement Failed",
        description: error instanceof Error ? error.message : "Failed to replace notebooks",
        variant: "destructive",
      });
    } finally {
      setIsReplacing(false);
      setConflictNotebooks([]);
    }
  };

  // =========================================================
  // SKIP ALL HANDLER
  // =========================================================
  const handleSkipAllNotebooks = () => {
    console.log("⏭️ Skipping all conflict notebooks");
    setShowReplaceDialog(false);

    onMigrationUpdate((prev) =>
      prev.map((item) =>
        conflictNotebooks.find((nb) => nb.id === item.id)
          ? { ...item, status: "Skipped", errorMessage: undefined }
          : item
      )
    );

    toast({
      title: "All Notebooks Skipped",
      description: `${conflictNotebooks.length} notebook(s) skipped`,
    });

    setConflictNotebooks([]);
  };

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="min-h-screen bg-background">
      <main className="p-6 max-w-7xl mx-auto animate-fade-in">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <button onClick={onBackToHome} className="hover:text-foreground flex items-center gap-1">
            <Home className="w-4 h-4" />Home
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Synapse Migration Report</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Synapse Migration Report</h1>
            <p className="text-sm text-muted-foreground">Track the progress of your Synapse to Fabric migration</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowReportDialog(true)}
              disabled={hasRunningItems}
              title={hasRunningItems ? "Wait for all items to complete before exporting" : "Export migration report"}
            >
              <Download className="w-4 h-4" />
              Export Report {selectedItems.size > 0 && `(${selectedItems.size})`}
            </Button>
            <Button variant="azure" onClick={onBackToHome}>
              <Home className="w-4 h-4" />Back to Home
            </Button>
          </div>
        </div>

        {/* Progress card */}
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
              {[
                { color: "bg-success",     label: `Created: ${stats.success}`,   pulse: false },
                { color: "bg-running",     label: `Running: ${stats.running}`,   pulse: stats.running > 0 },
                { color: "bg-destructive", label: `Failed: ${stats.failed}`,     pulse: false },
                { color: "bg-blue-600",    label: `Replaced: ${stats.replaced}`, pulse: false },
                { color: "bg-gray-600",    label: `Skipped: ${stats.skipped}`,   pulse: false },
              ].map(({ color, label, pulse }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${color} ${pulse ? "animate-pulse" : ""}`} />
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stat cards */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          <Card className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Items</p><p className="text-2xl font-bold text-foreground">{stats.total}</p></div><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><List className="w-5 h-5 text-primary" /></div></div></Card>
          <Card className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Created</p><p className="text-2xl font-bold text-success">{stats.success}</p></div><div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-success" /></div></div></Card>
          <Card className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Running</p><p className="text-2xl font-bold text-running">{stats.running}</p></div><div className="w-10 h-10 rounded-lg bg-running/10 flex items-center justify-center"><Loader2 className={`w-5 h-5 text-running ${stats.running > 0 ? "animate-spin" : ""}`} /></div></div></Card>
          <Card className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Failed</p><p className="text-2xl font-bold text-destructive">{stats.failed}</p></div><div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center"><XCircle className="w-5 h-5 text-destructive" /></div></div></Card>
          <Card className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Replaced</p><p className="text-2xl font-bold text-blue-600">{stats.replaced}</p></div><div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><RefreshCw className="w-5 h-5 text-blue-600" /></div></div></Card>
          <Card className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Skipped</p><p className="text-2xl font-bold text-gray-600">{stats.skipped}</p></div><div className="w-10 h-10 rounded-lg bg-gray-500/10 flex items-center justify-center"><Minus className="w-5 h-5 text-gray-600" /></div></div></Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search items..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="Status" /></SelectTrigger>
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
            <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">All Types</SelectItem>
              {synapseTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"><Checkbox checked={allFilteredSelected} onCheckedChange={toggleAllItems} aria-label="Select all" /></TableHead>
                <TableHead className="w-[250px]">ITEM NAME</TableHead>
                <TableHead>TYPE</TableHead>
                <TableHead>TARGET WORKSPACE</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead>ERROR MESSAGE</TableHead>
                <TableHead className="w-[100px]">Logs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => {
                const runId = (item as any).runId as string | undefined;
                return (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell><Checkbox checked={selectedItems.has(item.id)} onCheckedChange={() => toggleItemSelection(item.id)} aria-label={`Select ${item.name}`} /></TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded bg-muted text-xs">
                        {synapseTypes.find((t) => t.value === item.type)?.label ?? item.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.targetWorkspace ?? "-"}</TableCell>
                    <TableCell><StatusBadge status={item.status} /></TableCell>
                    <TableCell>
                      {(item as any).errorMessage ? (
                        <div className="flex items-center gap-2 text-sm">
                          {(item as any).errorMessage.includes("already exists") ? (
                            <><AlertTriangle className="w-4 h-4 text-amber-500" /><span className="text-amber-600">{(item as any).errorMessage}</span></>
                          ) : (
                            <><AlertTriangle className="w-4 h-4 text-destructive" /><span className="text-destructive">{(item as any).errorMessage}</span></>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {runId ? (
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => setLogsDialog({ open: true, jobName: item.name, runId })}
                          title="View migration logs"
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items match your filters</p>
          </div>
        )}
      </main>

      <MigrationReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        items={itemsToExport}
        selectedOnly={selectedItems.size > 0}
      />

      {logsDialog && (
        <LogsViewerDialog
          open={logsDialog.open}
          onClose={() => setLogsDialog(null)}
          jobName={logsDialog.jobName}
          runId={logsDialog.runId}
        />
      )}

      <ReplaceNotebooksDialog
        open={showReplaceDialog}
        notebooks={conflictNotebooks}
        isMigrating={isReplacing}
        onReplace={handleReplaceNotebooks}
        onSkipAll={handleSkipAllNotebooks}
      />
    </div>
  );
}