// import {
//     Dialog,
//     DialogContent,
//     DialogDescription,
//     DialogHeader,
//     DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import {
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
// } from "@/components/ui/table";
// import { Download, Calendar } from "lucide-react";
// import type { Status } from "@/types/migration";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// interface DatabricksMigrationItem {
//     id: string;
//     name: string;
//     type: "Job" | "Notebook" | "Cluster";
//     status: Status;
//     targetWorkspace?: string;
//     errorMessage?: string;
//     schedule?: string;
//     cluster?: string;
//     language?: string;
//     path?: string;
//     runtime?: string;
//     workers?: string;
// }

// interface DatabricksMigrationReportDialogProps {
//     open: boolean;
//     onOpenChange: (open: boolean) => void;
//     items: DatabricksMigrationItem[];
//     selectedOnly: boolean;
// }

// export function DatabricksMigrationReportDialog({
//     open,
//     onOpenChange,
//     items,
//     selectedOnly,
// }: DatabricksMigrationReportDialogProps) {
//     const databricksTypes = [
//         { value: "Job", label: "Job" },
//         { value: "Notebook", label: "Notebook" },
//         { value: "Cluster", label: "Cluster" },
//     ];

//     const getTypeLabel = (type: string) => {
//         return databricksTypes.find(t => t.value === type)?.label ?? type;
//     };

//     const stats = {
//         total: items.length,
//         success: items.filter(i => i.status === "Success").length,
//         running: items.filter(i => i.status === "Running").length,
//         failed: items.filter(i => i.status === "Failed").length,
//         skipped: items.filter(i => i.status === "Skipped").length,
//         replaced: items.filter(i => i.status === "Replaced").length,
//         paused: items.filter(i => i.status === "Paused").length,
//     };

//     const completedItems = stats.success + stats.failed + stats.replaced + stats.skipped;
//     // Include Replaced as success
//     const successRate = completedItems > 0
//         ? (((stats.success + stats.replaced) / completedItems) * 100).toFixed(1)
//         : "0";

//     const getStatusColor = (status: string): { text: number[], bg?: number[] } => {
//         switch (status) {
//             case "Success":
//                 return { text: [34, 197, 94] }; // Green
//             case "Failed":
//                 return { text: [239, 68, 68] }; // Red
//             case "Running":
//                 return { text: [234, 179, 8] }; // Yellow
//             case "Replaced":
//                 return { text: [59, 130, 246] }; // Blue
//             case "Skipped":
//                 return { text: [107, 114, 128] }; // Gray
//             case "Paused":
//                 return { text: [245, 158, 11] }; // Amber
//             default:
//                 return { text: [0, 0, 0] }; // Black
//         }
//     };

//     const downloadPDF = () => {
//         try {
//             console.log('Starting PDF generation...', { itemCount: items.length });

//             const doc = new jsPDF();
//             const pageWidth = doc.internal.pageSize.getWidth();

//             // Title
//             doc.setFontSize(20);
//             doc.setFont("helvetica", "bold");
//             doc.setTextColor(0, 0, 0);
//             doc.text("Databricks Migration Report", pageWidth / 2, 22, { align: "center" });

//             // Subtitle bar
//             doc.setFillColor(240, 242, 245);
//             doc.rect(14, 28, pageWidth - 28, 8, 'F');
//             doc.setFontSize(9);
//             doc.setFont("helvetica", "normal");
//             doc.setTextColor(80, 80, 80);
//             doc.text(`Source: Databricks  |  Target: Microsoft Fabric`, pageWidth / 2, 33, { align: "center" });

//             // Report metadata
//             doc.setFontSize(8);
//             doc.setTextColor(100, 100, 100);
//             const generatedTimestamp = new Date().toLocaleString('en-US', {
//                 month: 'short',
//                 day: 'numeric',
//                 year: 'numeric',
//                 hour: '2-digit',
//                 minute: '2-digit'
//             });
//             doc.text(`Generated: ${generatedTimestamp}`, 14, 42);
//             if (selectedOnly) {
//                 doc.text(`Report Type: Selected Items Only (${items.length} items)`, pageWidth - 14, 42, { align: "right" });
//             } else {
//                 doc.text(`Report Type: Complete Migration (${items.length} items)`, pageWidth - 14, 42, { align: "right" });
//             }

//             // Enhanced Summary Section
//             const summaryY = 48;
            
//             // Summary header
//             doc.setFillColor(41, 128, 185);
//             doc.rect(14, summaryY, pageWidth - 28, 8, 'F');
//             doc.setFontSize(11);
//             doc.setFont("helvetica", "bold");
//             doc.setTextColor(255, 255, 255);
//             doc.text("Migration Summary", 18, summaryY + 5.5);

//             // Summary content background
//             doc.setFillColor(248, 250, 252);
//             doc.rect(14, summaryY + 8, pageWidth - 28, 28, 'F');

//             // Summary stats in a grid
//             const statY = summaryY + 16;
//             const statSpacing = (pageWidth - 28) / 7;

//             const summaryItems = [
//                 { label: "Total", value: stats.total.toString(), color: [0, 0, 0] },
//                 { label: "Success", value: stats.success.toString(), color: [34, 197, 94] },
//                 { label: "Replaced", value: stats.replaced.toString(), color: [59, 130, 246] },
//                 { label: "Running", value: stats.running.toString(), color: [234, 179, 8] },
//                 { label: "Failed", value: stats.failed.toString(), color: [239, 68, 68] },
//                 { label: "Skipped", value: stats.skipped.toString(), color: [107, 114, 128] },
//                 { label: "Success Rate", value: `${successRate}%`, color: [0, 0, 0] },
//             ];

//             summaryItems.forEach((item, index) => {
//                 const x = 18 + statSpacing * index;
                
//                 doc.setFontSize(8);
//                 doc.setFont("helvetica", "normal");
//                 doc.setTextColor(100, 100, 100);
//                 doc.text(item.label, x, statY);
                
//                 doc.setFontSize(16);
//                 doc.setFont("helvetica", "bold");
//                 doc.setTextColor(item.color[0], item.color[1], item.color[2]);
//                 doc.text(item.value, x, statY + 8);
//             });

//             // Items Table
//             console.log('Preparing table data...');
//             const tableData = items.map(item => {
//                 let details = '';
//                 if (item.type === 'Job') {
//                     if (item.schedule) details = `Schedule: ${item.schedule}`;
//                     if (item.cluster) details += details ? ` | Cluster: ${item.cluster}` : `Cluster: ${item.cluster}`;
//                 } else if (item.type === 'Notebook') {
//                     if (item.language) details = `Language: ${item.language}`;
//                     if (item.path) {
//                         // Replace slashes with "slash + space" for better wrapping
//                         const wrappedPath = item.path.replace(/\//g, '/ ');
//                         details += details ? ` | Path: ${wrappedPath}` : `Path: ${wrappedPath}`;
//                     }
//                 } else if (item.type === 'Cluster') {
//                     if (item.runtime) details = `Runtime: ${item.runtime}`;
//                     if (item.workers) details += details ? ` | Workers: ${item.workers}` : `Workers: ${item.workers}`;
//                 }

//                 return [
//                     item.name || 'N/A',
//                     getTypeLabel(item.type) || 'N/A',
//                     details || '-',
//                     item.targetWorkspace || 'N/A',
//                     item.status || 'Unknown',
//                     item.errorMessage || '-'
//                 ];
//             });

//             console.log('Table data prepared:', tableData.length, 'rows');

//             const tableStartY = summaryY + 42;

//             autoTable(doc, {
//                 startY: tableStartY,
//                 head: [["Item Name", "Type", "Details", "Target Workspace", "Status", "Error/Notes"]],
//                 body: tableData,
//                 theme: 'striped',
//                 styles: {
//                     fontSize: 8,
//                     cellPadding: 3,
//                     overflow: 'linebreak',
//                     lineWidth: 0.1,
//                     lineColor: [220, 220, 220],
//                     valign: 'middle',
//                 },
//                 headStyles: {
//                     fillColor: [41, 128, 185],
//                     textColor: [255, 255, 255],
//                     fontStyle: "bold",
//                     fontSize: 9,
//                     halign: 'left',
//                     lineWidth: 0.1,
//                     cellPadding: 3.5,
//                 },
//                 alternateRowStyles: {
//                     fillColor: [252, 252, 253],
//                 },
//                 columnStyles: {
//                     0: { cellWidth: 35, fontStyle: 'bold' },
//                     1: { cellWidth: 18, halign: 'center' },
//                     2: { cellWidth: 45, fontSize: 7, textColor: [90, 90, 90] },
//                     3: { cellWidth: 30 },
//                     4: { cellWidth: 20, halign: 'center' },
//                     5: { cellWidth: 37 },
//                 },
//                 didDrawCell: (data: any) => {
//                     // Status column with colors
//                     if (data.section === 'body' && data.column.index === 4) {
//                         const status = data.cell.raw;
//                         const cellX = data.cell.x;
//                         const cellY = data.cell.y;
//                         const cellWidth = data.cell.width;
//                         const cellHeight = data.cell.height;

//                         doc.setFillColor(255, 255, 255);
//                         doc.rect(cellX + 0.5, cellY + 0.5, cellWidth - 1, cellHeight - 1, 'F');

//                         doc.setFontSize(8);
//                         doc.setFont("helvetica", "bold");

//                         const colors = getStatusColor(status);
//                         doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);

//                         doc.text(status, cellX + cellWidth / 2, cellY + cellHeight / 2, {
//                             align: 'center',
//                             baseline: 'middle'
//                         });
//                     }

//                     // Error/Notes column
//                     if (data.section === 'body' && data.column.index === 5 && data.cell.raw !== '-') {
//                         const cellX = data.cell.x;
//                         const cellY = data.cell.y;
//                         const cellWidth = data.cell.width;
//                         const cellHeight = data.cell.height;
//                         const errorMsg = data.cell.raw;

//                         doc.setFillColor(255, 255, 255);
//                         doc.rect(cellX + 0.5, cellY + 0.5, cellWidth - 1, cellHeight - 1, 'F');

//                         doc.setFontSize(7.5);
//                         doc.setFont("helvetica", "normal");
                        
//                         if (errorMsg.includes("already exists")) {
//                             doc.setTextColor(245, 158, 11);
//                         } else if (errorMsg.toLowerCase().includes("skipped") || errorMsg.toLowerCase().includes("replaced")) {
//                             doc.setTextColor(107, 114, 128);
//                         } else {
//                             doc.setTextColor(239, 68, 68);
//                         }

//                         const lines = doc.splitTextToSize(errorMsg, cellWidth - 4);
//                         const lineHeight = 3.2;
//                         const textHeight = lines.length * lineHeight;
//                         const startY = cellY + (cellHeight - textHeight) / 2 + lineHeight * 0.7;

//                         doc.text(lines, cellX + 2, startY);
//                     }
//                 }
//             });

//             // Footer
//             const pageCount = (doc as any).internal.getNumberOfPages();
//             const generatedDate = new Date().toLocaleString('en-US', {
//                 month: 'short',
//                 day: 'numeric',
//                 year: 'numeric',
//                 hour: '2-digit',
//                 minute: '2-digit'
//             });

//             for (let i = 1; i <= pageCount; i++) {
//                 doc.setPage(i);
                
//                 // Footer background
//                 const footerY = doc.internal.pageSize.getHeight() - 15;
//                 doc.setFillColor(248, 250, 252);
//                 doc.rect(0, footerY, pageWidth, 15, 'F');
                
//                 doc.setFontSize(8);
//                 doc.setTextColor(100, 100, 100);
//                 doc.text(
//                     `Generated: ${generatedDate}`,
//                     14,
//                     footerY + 9
//                 );
//                 doc.text(
//                     `Page ${i} of ${pageCount}`,
//                     pageWidth - 14,
//                     footerY + 9,
//                     { align: "right" }
//                 );
//             }

//             const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
//             const selectionSuffix = selectedOnly ? '-selected' : '';
//             const filename = `databricks-migration-report${selectionSuffix}-${timestamp}.pdf`;

//             console.log('Saving PDF as:', filename);
//             doc.save(filename);
//             console.log('PDF download initiated successfully');

//         } catch (error) {
//             console.error('Error generating PDF:', error);
//             alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
//         }
//     };

//     return (
//         <Dialog open={open} onOpenChange={onOpenChange}>
//             <DialogContent className="max-w-[95vw] w-[1400px] max-h-[90vh] overflow-hidden flex flex-col">
//                 <DialogHeader className="border-b pb-3 flex-shrink-0 space-y-2">
//                     <div className="flex items-start justify-between">
//                         <div>
//                             <DialogTitle className="text-lg font-semibold">
//                                 Migration Report Preview
//                             </DialogTitle>
//                             <DialogDescription className="text-sm mt-1">
//                                 Review your migration report before downloading
//                                 {selectedOnly && ` (${items.length} selected items)`}
//                             </DialogDescription>
//                         </div>
//                         <div className="flex items-center gap-3 text-xs text-muted-foreground">
//                             <div className="flex items-center gap-1.5">
//                                 <Calendar className="w-3.5 h-3.5" />
//                                 <span>{new Date().toLocaleString('en-US', {
//                                     month: 'short',
//                                     day: 'numeric',
//                                     year: 'numeric',
//                                     hour: '2-digit',
//                                     minute: '2-digit'
//                                 })}</span>
//                             </div>
//                             <span className="text-muted-foreground">•</span>
//                             <span>Databricks → Fabric</span>
//                             <span className="text-muted-foreground">•</span>
//                             <span className="font-medium">{items.length} items</span>
//                         </div>
//                     </div>
//                 </DialogHeader>

//                 {/* Enhanced Summary Section */}
//                 <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 space-y-3 border border-blue-100">
//                     <div className="flex items-center justify-between">
//                         <h3 className="text-sm font-semibold text-gray-700">Migration Summary</h3>
//                         <span className="text-xs text-gray-500">{items.length} total items</span>
//                     </div>
//                     <div className="grid grid-cols-7 gap-3">
//                         <div className="text-center bg-white rounded-md p-2 border border-gray-100">
//                             <p className="text-xs text-muted-foreground mb-1">Total</p>
//                             <p className="text-xl font-bold">{stats.total}</p>
//                         </div>
//                         <div className="text-center bg-white rounded-md p-2 border border-green-100">
//                             <p className="text-xs text-muted-foreground mb-1">Success</p>
//                             <p className="text-xl font-bold text-success">{stats.success}</p>
//                         </div>
//                         <div className="text-center bg-white rounded-md p-2 border border-blue-100">
//                             <p className="text-xs text-muted-foreground mb-1">Replaced</p>
//                             <p className="text-xl font-bold text-blue-600">{stats.replaced}</p>
//                         </div>
//                         <div className="text-center bg-white rounded-md p-2 border border-yellow-100">
//                             <p className="text-xs text-muted-foreground mb-1">Running</p>
//                             <p className="text-xl font-bold text-running">{stats.running}</p>
//                         </div>
//                         <div className="text-center bg-white rounded-md p-2 border border-red-100">
//                             <p className="text-xs text-muted-foreground mb-1">Failed</p>
//                             <p className="text-xl font-bold text-destructive">{stats.failed}</p>
//                         </div>
//                         <div className="text-center bg-white rounded-md p-2 border border-gray-100">
//                             <p className="text-xs text-muted-foreground mb-1">Skipped</p>
//                             <p className="text-xl font-bold text-gray-600">{stats.skipped}</p>
//                         </div>
//                         <div className="text-center bg-white rounded-md p-2 border border-gray-100">
//                             <p className="text-xs text-muted-foreground mb-1">Success Rate</p>
//                             <p className="text-xl font-bold text-gray-900">{successRate}%</p>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Scrollable Table Section - NO horizontal scroll */}
//                 <div className="flex-1 border rounded-lg bg-background overflow-auto min-h-0">
//                     <Table>
//                         <TableHeader className="sticky top-0 bg-muted z-10 border-b">
//                             <TableRow>
//                                 <TableHead className="font-semibold w-[20%]">Item Name</TableHead>
//                                 <TableHead className="font-semibold w-[10%]">Type</TableHead>
//                                 <TableHead className="font-semibold w-[25%]">Details</TableHead>
//                                 <TableHead className="font-semibold w-[15%]">Target Workspace</TableHead>
//                                 <TableHead className="font-semibold w-[10%]">Status</TableHead>
//                                 <TableHead className="font-semibold w-[20%]">Error/Notes</TableHead>
//                             </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                             {items.map((item) => {
//                                 let details = '';
//                                 if (item.type === 'Job') {
//                                     if (item.schedule) details = `Schedule: ${item.schedule}`;
//                                     if (item.cluster) details += details ? ` | Cluster: ${item.cluster}` : `Cluster: ${item.cluster}`;
//                                 } else if (item.type === 'Notebook') {
//                                     if (item.language) details = `Language: ${item.language}`;
//                                     if (item.path) {
//                                         const wrappedPath = item.path.split('/').join('/ ');
//                                         details += details ? ` | Path: ${wrappedPath}` : `Path: ${wrappedPath}`;
//                                     }
//                                 } else if (item.type === 'Cluster') {
//                                     if (item.runtime) details = `Runtime: ${item.runtime}`;
//                                     if (item.workers) details += details ? ` | Workers: ${item.workers}` : `Workers: ${item.workers}`;
//                                 }

//                                 const getStatusBadgeClass = (status: string) => {
//                                     switch (status) {
//                                         case "Success":
//                                             return "bg-success/10 text-success";
//                                         case "Failed":
//                                             return "bg-destructive/10 text-destructive";
//                                         case "Running":
//                                             return "bg-running/10 text-running";
//                                         case "Replaced":
//                                             return "bg-blue-100 text-blue-700";
//                                         case "Skipped":
//                                             return "bg-gray-100 text-gray-700";
//                                         case "Paused":
//                                             return "bg-amber-100 text-amber-700";
//                                         default:
//                                             return "bg-gray-100 text-gray-700";
//                                     }
//                                 };

//                                 return (
//                                     <TableRow key={item.id} className="hover:bg-muted/50">
//                                         <TableCell className="font-medium py-3 w-[20%]">
//                                             <div className="break-words">{item.name}</div>
//                                         </TableCell>
//                                         <TableCell className="py-3 w-[10%]">
//                                             <span className="px-2 py-1 rounded bg-muted text-xs whitespace-nowrap">
//                                                 {getTypeLabel(item.type)}
//                                             </span>
//                                         </TableCell>
//                                         <TableCell className="py-3 text-xs text-muted-foreground w-[25%]">
//                                             <div className="break-all leading-relaxed max-w-full">
//                                                 {details || "-"}
//                                             </div>
//                                         </TableCell>
//                                         <TableCell className="text-muted-foreground py-3 w-[15%]">
//                                             <div className="break-words">
//                                                 {item.targetWorkspace ?? "-"}
//                                             </div>
//                                         </TableCell>
//                                         <TableCell className="py-3 w-[10%]">
//                                             <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusBadgeClass(item.status)}`}>
//                                                 {item.status}
//                                             </span>
//                                         </TableCell>
//                                         <TableCell className="py-3 w-[20%]">
//                                             {item.errorMessage ? (
//                                                 <div className={`text-sm break-words leading-relaxed ${
//                                                     item.errorMessage.includes("already exists")
//                                                         ? "text-amber-600"
//                                                         : "text-destructive"
//                                                 }`}>
//                                                     {item.errorMessage}
//                                                 </div>
//                                             ) : (
//                                                 <span className="text-muted-foreground">-</span>
//                                             )}
//                                         </TableCell>
//                                     </TableRow>
//                                 );
//                             })}
//                         </TableBody>
//                     </Table>
//                 </div>

//                 {/* Footer */}
//                 <div className="flex justify-end gap-2 pt-3 border-t flex-shrink-0">
//                     <Button variant="outline" onClick={() => onOpenChange(false)}>
//                         Close
//                     </Button>
//                     <Button onClick={downloadPDF} className="gap-2">
//                         <Download className="w-4 h-4" />
//                         Download PDF
//                     </Button>
//                 </div>
//             </DialogContent>
//         </Dialog>
//     );
// }




//18/02

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Download, Calendar } from "lucide-react";
import type { Status } from "@/types/migration";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
 
interface DatabricksMigrationItem {
    id: string;
    name: string;
    type: "Job" | "Notebook" | "Cluster";
    status: Status;
    targetWorkspace?: string;
    errorMessage?: string;
    schedule?: string;
    cluster?: string;
    language?: string;
    path?: string;
    runtime?: string;
    workers?: string;
}
 
interface DatabricksMigrationReportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    items: DatabricksMigrationItem[];
    selectedOnly: boolean;
}
 
export function DatabricksMigrationReportDialog({
    open,
    onOpenChange,
    items,
    selectedOnly,
}: DatabricksMigrationReportDialogProps) {
    const databricksTypes = [
        { value: "Job", label: "Job" },
        { value: "Notebook", label: "Notebook" },
        { value: "Cluster", label: "Cluster" },
    ];
 
    const getTypeLabel = (type: string) => {
        return databricksTypes.find(t => t.value === type)?.label ?? type;
    };
 
    const stats = {
        total: items.length,
        created: items.filter(i => i.status === "Success").length,
        running: items.filter(i => i.status === "Running").length,
        failed: items.filter(i => i.status === "Failed").length,
        skipped: items.filter(i => i.status === "Skipped").length,
        replaced: items.filter(i => i.status === "Replaced").length,
        paused: items.filter(i => i.status === "Paused").length,
    };
 
    const completedItems = stats.created + stats.failed + stats.replaced + stats.skipped;
    // Include Replaced and Skipped as success
    const successRate = completedItems > 0
        ? (((stats.created + stats.replaced + stats.skipped) / completedItems) * 100).toFixed(1)
        : "0";
 
    const getStatusLabel = (status: Status): string => {
        if (status === "Success") return "Created";
        return status;
    };
    const getStatusColor = (status: string): { text: number[], bg?: number[] } => {
        switch (status) {
            case "Success":
                return { text: [34, 197, 94] }; // Green
            case "Failed":
                return { text: [239, 68, 68] }; // Red
            case "Running":
                return { text: [234, 179, 8] }; // Yellow
            case "Replaced":
                return { text: [59, 130, 246] }; // Blue
            case "Skipped":
                return { text: [107, 114, 128] }; // Gray
            case "Paused":
                return { text: [245, 158, 11] }; // Amber
            default:
                return { text: [0, 0, 0] }; // Black
        }
    };
 
    const downloadPDF = () => {
        try {
            console.log('Starting PDF generation...', { itemCount: items.length });
 
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
 
            // Title
            doc.setFontSize(20);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0);
            doc.text("Databricks Migration Report", pageWidth / 2, 22, { align: "center" });
 
            // Subtitle bar
            doc.setFillColor(240, 242, 245);
            doc.rect(14, 28, pageWidth - 28, 8, 'F');
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(80, 80, 80);
            doc.text(`Source: Databricks  |  Target: Microsoft Fabric`, pageWidth / 2, 33, { align: "center" });
 
            // Report metadata
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            const generatedTimestamp = new Date().toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            doc.text(`Generated: ${generatedTimestamp}`, 14, 42);
            if (selectedOnly) {
                doc.text(`Report Type: Selected Items Only (${items.length} items)`, pageWidth - 14, 42, { align: "right" });
            } else {
                doc.text(`Report Type: Complete Migration (${items.length} items)`, pageWidth - 14, 42, { align: "right" });
            }
 
            // Enhanced Summary Section
            const summaryY = 48;
 
            // Summary header
            doc.setFillColor(41, 128, 185);
            doc.rect(14, summaryY, pageWidth - 28, 8, 'F');
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(255, 255, 255);
            doc.text("Migration Summary", 18, summaryY + 5.5);
 
            // Summary content background
            doc.setFillColor(248, 250, 252);
            doc.rect(14, summaryY + 8, pageWidth - 28, 28, 'F');
 
            // Summary stats in a grid
            const statY = summaryY + 16;
            const statSpacing = (pageWidth - 28) / 7;
 
            const summaryItems = [
                { label: "Total", value: stats.total.toString(), color: [0, 0, 0] },
                { label: "Created", value: stats.created.toString(), color: [34, 197, 94] },  // Changed from Success
                { label: "Replaced", value: stats.replaced.toString(), color: [59, 130, 246] },
                { label: "Running", value: stats.running.toString(), color: [234, 179, 8] },
                { label: "Failed", value: stats.failed.toString(), color: [239, 68, 68] },
                { label: "Skipped", value: stats.skipped.toString(), color: [107, 114, 128] },
                { label: "Success Rate", value: `${successRate}%`, color: [0, 0, 0] },
            ];
 
            summaryItems.forEach((item, index) => {
                const x = 18 + statSpacing * index;
 
                doc.setFontSize(8);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(100, 100, 100);
                doc.text(item.label, x, statY);
 
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(item.color[0], item.color[1], item.color[2]);
                doc.text(item.value, x, statY + 8);
            });
 
            // Items Table
            console.log('Preparing table data...');
            const tableData = items.map(item => {
                let details = '';
                if (item.type === 'Job') {
                    if (item.schedule) details = `Schedule: ${item.schedule}`;
                    if (item.cluster) details += details ? ` | Cluster: ${item.cluster}` : `Cluster: ${item.cluster}`;
                } else if (item.type === 'Notebook') {
                    if (item.language) details = `Language: ${item.language}`;
                    if (item.path) {
                        const wrappedPath = item.path.replace(/\//g, '/ ');
                        details += details ? ` | Path: ${wrappedPath}` : `Path: ${wrappedPath}`;
                    }
                } else if (item.type === 'Cluster') {
                    if (item.runtime) details = `Runtime: ${item.runtime}`;
                    if (item.workers) details += details ? ` | Workers: ${item.workers}` : `Workers: ${item.workers}`;
                }
 
                return [
                    item.name || 'N/A',
                    getTypeLabel(item.type) || 'N/A',
                    details || '-',
                    item.targetWorkspace || 'N/A',
                    getStatusLabel(item.status) || 'Unknown',  // Changed this line
                    item.errorMessage || '-'
                ];
            });
 
            console.log('Table data prepared:', tableData.length, 'rows');
 
            const tableStartY = summaryY + 42;
 
            autoTable(doc, {
                startY: tableStartY,
                head: [["Item Name", "Type", "Details", "Target Workspace", "Status", "Error/Notes"]],
                body: tableData,
                theme: 'striped',
                styles: {
                    fontSize: 8,
                    cellPadding: 3,
                    overflow: 'linebreak',
                    lineWidth: 0.1,
                    lineColor: [220, 220, 220],
                    valign: 'middle',
                },
                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: [255, 255, 255],
                    fontStyle: "bold",
                    fontSize: 9,
                    halign: 'left',
                    lineWidth: 0.1,
                    cellPadding: 3.5,
                },
                alternateRowStyles: {
                    fillColor: [252, 252, 253],
                },
                columnStyles: {
                    0: { cellWidth: 35, fontStyle: 'bold' },
                    1: { cellWidth: 18, halign: 'center' },
                    2: { cellWidth: 45, fontSize: 7, textColor: [90, 90, 90] },
                    3: { cellWidth: 30 },
                    4: { cellWidth: 20, halign: 'center' },
                    5: { cellWidth: 37 },
                },
                didDrawCell: (data: any) => {
                    // Status column with colors
                    if (data.section === 'body' && data.column.index === 4) {
                        const status = data.cell.raw;
                        const cellX = data.cell.x;
                        const cellY = data.cell.y;
                        const cellWidth = data.cell.width;
                        const cellHeight = data.cell.height;
 
                        doc.setFillColor(255, 255, 255);
                        doc.rect(cellX + 0.5, cellY + 0.5, cellWidth - 1, cellHeight - 1, 'F');
 
                        doc.setFontSize(8);
                        doc.setFont("helvetica", "bold");
 
                        const colors = getStatusColor(status);
                        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
 
                        doc.text(status, cellX + cellWidth / 2, cellY + cellHeight / 2, {
                            align: 'center',
                            baseline: 'middle'
                        });
                    }
 
                    // Error/Notes column
                    if (data.section === 'body' && data.column.index === 5 && data.cell.raw !== '-') {
                        const cellX = data.cell.x;
                        const cellY = data.cell.y;
                        const cellWidth = data.cell.width;
                        const cellHeight = data.cell.height;
                        const errorMsg = data.cell.raw;
 
                        doc.setFillColor(255, 255, 255);
                        doc.rect(cellX + 0.5, cellY + 0.5, cellWidth - 1, cellHeight - 1, 'F');
 
                        doc.setFontSize(7.5);
                        doc.setFont("helvetica", "normal");
 
                        if (errorMsg.includes("already exists")) {
                            doc.setTextColor(245, 158, 11);
                        } else if (errorMsg.toLowerCase().includes("skipped") || errorMsg.toLowerCase().includes("replaced")) {
                            doc.setTextColor(107, 114, 128);
                        } else {
                            doc.setTextColor(239, 68, 68);
                        }
 
                        const lines = doc.splitTextToSize(errorMsg, cellWidth - 4);
                        const lineHeight = 3.2;
                        const textHeight = lines.length * lineHeight;
                        const startY = cellY + (cellHeight - textHeight) / 2 + lineHeight * 0.7;
 
                        doc.text(lines, cellX + 2, startY);
                    }
                }
            });
 
            // Footer
            const pageCount = (doc as any).internal.getNumberOfPages();
            const generatedDate = new Date().toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
 
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
 
                // Footer background
                const footerY = doc.internal.pageSize.getHeight() - 15;
                doc.setFillColor(248, 250, 252);
                doc.rect(0, footerY, pageWidth, 15, 'F');
 
                doc.setFontSize(8);
                doc.setTextColor(100, 100, 100);
                doc.text(
                    `Generated: ${generatedDate}`,
                    14,
                    footerY + 9
                );
                doc.text(
                    `Page ${i} of ${pageCount}`,
                    pageWidth - 14,
                    footerY + 9,
                    { align: "right" }
                );
            }
 
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const selectionSuffix = selectedOnly ? '-selected' : '';
            const filename = `databricks-migration-report${selectionSuffix}-${timestamp}.pdf`;
 
            console.log('Saving PDF as:', filename);
            doc.save(filename);
            console.log('PDF download initiated successfully');
 
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };
 
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] w-[1400px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="border-b pb-3 flex-shrink-0 space-y-2">
                    <div className="flex items-start justify-between">
                        <div>
                            <DialogTitle className="text-lg font-semibold">
                                Migration Report Preview
                            </DialogTitle>
                            <DialogDescription className="text-sm mt-1">
                                Review your migration report before downloading
                                {selectedOnly && ` (${items.length} selected items)`}
                            </DialogDescription>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{new Date().toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</span>
                            </div>
                            <span className="text-muted-foreground">•</span>
                            <span>Databricks → Fabric</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="font-medium">{items.length} items</span>
                        </div>
                    </div>
                </DialogHeader>
 
                {/* Enhanced Summary Section */}
                <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 space-y-3 border border-blue-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-700">Migration Summary</h3>
                        <span className="text-xs text-gray-500">{items.length} total items</span>
                    </div>
                    <div className="grid grid-cols-7 gap-3">
                        <div className="text-center bg-white rounded-md p-2 border border-gray-100">
                            <p className="text-xs text-muted-foreground mb-1">Total</p>
                            <p className="text-xl font-bold">{stats.total}</p>
                        </div>
                        <div className="text-center bg-white rounded-md p-2 border border-green-100">
                            <p className="text-xs text-muted-foreground mb-1">Created</p>
                            <p className="text-xl font-bold text-success">{stats.created}</p>
                        </div>
                        <div className="text-center bg-white rounded-md p-2 border border-blue-100">
                            <p className="text-xs text-muted-foreground mb-1">Replaced</p>
                            <p className="text-xl font-bold text-blue-600">{stats.replaced}</p>
                        </div>
                        <div className="text-center bg-white rounded-md p-2 border border-yellow-100">
                            <p className="text-xs text-muted-foreground mb-1">Running</p>
                            <p className="text-xl font-bold text-running">{stats.running}</p>
                        </div>
                        <div className="text-center bg-white rounded-md p-2 border border-red-100">
                            <p className="text-xs text-muted-foreground mb-1">Failed</p>
                            <p className="text-xl font-bold text-destructive">{stats.failed}</p>
                        </div>
                        <div className="text-center bg-white rounded-md p-2 border border-gray-100">
                            <p className="text-xs text-muted-foreground mb-1">Skipped</p>
                            <p className="text-xl font-bold text-gray-600">{stats.skipped}</p>
                        </div>
                        <div className="text-center bg-white rounded-md p-2 border border-gray-100">
                            <p className="text-xs text-muted-foreground mb-1">Success Rate</p>
                            <p className="text-xl font-bold text-gray-900">{successRate}%</p>
                        </div>
                    </div>
                </div>
 
                {/* Scrollable Table Section - NO horizontal scroll */}
                <div className="flex-1 border rounded-lg bg-background overflow-auto min-h-0">
                    <Table>
                        <TableHeader className="sticky top-0 bg-muted z-10 border-b">
                            <TableRow>
                                <TableHead className="font-semibold w-[20%]">Item Name</TableHead>
                                <TableHead className="font-semibold w-[10%]">Type</TableHead>
                                <TableHead className="font-semibold w-[25%]">Details</TableHead>
                                <TableHead className="font-semibold w-[15%]">Target Workspace</TableHead>
                                <TableHead className="font-semibold w-[10%]">Status</TableHead>
                                <TableHead className="font-semibold w-[20%]">Error/Notes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) => {
                                let details = '';
                                if (item.type === 'Job') {
                                    if (item.schedule) details = `Schedule: ${item.schedule}`;
                                    if (item.cluster) details += details ? ` | Cluster: ${item.cluster}` : `Cluster: ${item.cluster}`;
                                } else if (item.type === 'Notebook') {
                                    if (item.language) details = `Language: ${item.language}`;
                                    if (item.path) {
                                        const wrappedPath = item.path.split('/').join('/ ');
                                        details += details ? ` | Path: ${wrappedPath}` : `Path: ${wrappedPath}`;
                                    }
                                } else if (item.type === 'Cluster') {
                                    if (item.runtime) details = `Runtime: ${item.runtime}`;
                                    if (item.workers) details += details ? ` | Workers: ${item.workers}` : `Workers: ${item.workers}`;
                                }
 
                                const getStatusBadgeClass = (status: string) => {
                                    switch (status) {
                                        case "Success":
                                            return "bg-success/10 text-success";
                                        case "Failed":
                                            return "bg-destructive/10 text-destructive";
                                        case "Running":
                                            return "bg-running/10 text-running";
                                        case "Replaced":
                                            return "bg-blue-100 text-blue-700";
                                        case "Skipped":
                                            return "bg-gray-100 text-gray-700";
                                        case "Paused":
                                            return "bg-amber-100 text-amber-700";
                                        default:
                                            return "bg-gray-100 text-gray-700";
                                    }
                                };
 
                                return (
                                    <TableRow key={item.id} className="hover:bg-muted/50">
                                        <TableCell className="font-medium py-3 w-[20%]">
                                            <div className="break-words">{item.name}</div>
                                        </TableCell>
                                        <TableCell className="py-3 w-[10%]">
                                            <span className="px-2 py-1 rounded bg-muted text-xs whitespace-nowrap">
                                                {getTypeLabel(item.type)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-3 text-xs text-muted-foreground w-[25%]">
                                            <div className="break-all leading-relaxed max-w-full">
                                                {details || "-"}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground py-3 w-[15%]">
                                            <div className="break-words">
                                                {item.targetWorkspace ?? "-"}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3 w-[10%]">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusBadgeClass(item.status)}`}>
                                                {getStatusLabel(item.status)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-3 w-[20%]">
                                            {item.errorMessage ? (
                                                <div className={`text-sm break-words leading-relaxed ${item.errorMessage.includes("already exists")
                                                    ? "text-amber-600"
                                                    : "text-destructive"
                                                    }`}>
                                                    {item.errorMessage}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
 
                {/* Footer */}
                <div className="flex justify-end gap-2 pt-3 border-t flex-shrink-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    <Button onClick={downloadPDF} className="gap-2">
                        <Download className="w-4 h-4" />
                        Download PDF
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
 