import { useState, useEffect } from "react";
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

interface DatabricksMigrationItem {
    id: string;
    name: string;
    type: "Job" | "Notebook" | "Cluster";
    status: Status;
    targetWorkspace?: string;
    targetWorkspaceId?: string;
    errorMessage?: string;
    // Databricks-specific fields
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
}

export function DatabricksMigrationReport({
    items: initialItems,
    onLogout,
    onBackToHome,
    targetWorkspaceId
}: DatabricksMigrationReportProps) {
    const { toast } = useToast();
    const { credentials: fabricCredentials } = useFabricCredentials();
    const { credentials: databricksCredentials } = useDatabricksCredentials();

    const [items, setItems] = useState<DatabricksMigrationItem[]>(initialItems);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [showReportDialog, setShowReportDialog] = useState(false);
    const [showReplaceDialog, setShowReplaceDialog] = useState(false);
    const [pausedNotebooks, setPausedNotebooks] = useState<DatabricksMigrationItem[]>([]);

    const databricksTypes = [
        { value: "Job", label: "Job" },
        { value: "Notebook", label: "Notebook" },
        { value: "Cluster", label: "Cluster" },
    ];

    useEffect(() => {
        const paused = items.filter(item => item.status === "Paused" && item.type === "Notebook");
        setPausedNotebooks(paused);

        // Auto-show dialog when paused notebooks appear
        if (paused.length > 0 && !showReplaceDialog) {
            setShowReplaceDialog(true);
        }
    }, [items]);

    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

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

    const handleReplaceNotebooks = async (notebooksToReplace: any[]) => {
        setShowReplaceDialog(false);

        if (!fabricCredentials || !databricksCredentials) {
            console.error("❌ Missing credentials:", { fabricCredentials, databricksCredentials });
            toast({
                title: "Missing Credentials",
                description: "Fabric or Databricks credentials not found",
                variant: "destructive",
            });
            return;
        }

        // ✅ FIX: Identify unselected notebooks and mark them as Skipped immediately
        const allPausedNotebooks = pausedNotebooks;
        const notebooksToSkip = allPausedNotebooks.filter(
            nb => !notebooksToReplace.find(r => r.id === nb.id)
        );

        // Mark unselected notebooks as Skipped right away
        notebooksToSkip.forEach(item => {
            setItems(prev => prev.map(i =>
                i.id === item.id ? { ...i, status: "Skipped" as Status } : i
            ));
        });

        if (notebooksToReplace.length === 0) {
            toast({
                title: "No Notebooks Selected",
                description: "Please select at least one notebook to replace",
                variant: "destructive",
            });
            return;
        }

        console.log("✅ Notebooks to replace:", notebooksToReplace);
        console.log("⏭️ Notebooks to skip:", notebooksToSkip);
        console.log("📋 Target Workspace ID:", targetWorkspaceId);

        // Mark selected notebooks as Running
        notebooksToReplace.forEach(item => {
            setItems(prev => prev.map(i =>
                i.id === item.id ? { ...i, status: "Running" as Status } : i
            ));
        });

        // Rest of your existing code...
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

            console.log("📤 REPLACE NOTEBOOKS PAYLOAD:", JSON.stringify(payload, null, 2));

            const response = await fetch(
                "https://databrickstofabric-fuhdb8a7dhbebrf5.eastus-01.azurewebsites.net/api/MigrateNotebooks?code=0KjRO6OQdRDSj6_ahlRgYhxO2dGy07eCqqegZMeuFJrzAzFuJcusuA==",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            console.log("📥 Response Status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ Response Error:", errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log("📥 REPLACE NOTEBOOKS RESPONSE:", JSON.stringify(result, null, 2));

            // Update status based on result
            notebooksToReplace.forEach(item => {
                const detail = result.details.find((d: any) => d.name === item.name);
                console.log(`🔄 Processing notebook "${item.name}":`, detail);

                const newStatus = detail?.status === "replaced" ? "Replaced" : "Success";

                setItems(prev => prev.map(i =>
                    i.id === item.id ? { ...i, status: newStatus as Status, errorMessage: undefined } : i
                ));
            });

            toast({
                title: "Operation Complete",
                description: `${notebooksToReplace.length} replaced, ${notebooksToSkip.length} skipped`,
            });
        } catch (error) {
            console.error("❌ REPLACE ERROR:", error);

            // Mark as Failed
            notebooksToReplace.forEach(item => {
                setItems(prev => prev.map(i =>
                    i.id === item.id ? { ...i, status: "Failed" as Status, errorMessage: "Replacement failed" } : i
                ));
            });

            toast({
                title: "Replacement Failed",
                description: error instanceof Error ? error.message : "Failed to replace notebooks",
                variant: "destructive",
            });
        }
    };


    const handleSkipNotebooks = () => {
        setShowReplaceDialog(false);
        pausedNotebooks.forEach(item => {
            setItems(prev => prev.map(i =>
                i.id === item.id ? { ...i, status: "Skipped" as Status } : i
            ));
        });
        toast({
            title: "All Notebooks Skipped",
            description: `${pausedNotebooks.length} notebook(s) skipped`,
        });
    }

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
                                {stats.success + stats.failed} of {stats.total} completed
                            </span>
                        </div>
                        <Progress value={progress} className="h-3" />
                        <div className="flex gap-6 mt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-success" />
                                <span className="text-sm text-muted-foreground">
                                    Success: {stats.success}
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
                            <SelectItem value="Success">Success</SelectItem>
                            <SelectItem value="Running">Running</SelectItem>
                            <SelectItem value="Failed">Failed</SelectItem>
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
                isMigrating={false}
                onReplace={handleReplaceNotebooks}
                onSkipAll={handleSkipNotebooks}
            />
        </div>
    );
}