

// import { useEffect, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { AlertCircle, Loader2 } from "lucide-react";

// interface ReplaceNotebooksDialogProps {
//   open: boolean;
//   notebooks: any[];
//   isMigrating: boolean;
//   onReplace: (selectedNotebooks: any[]) => void;
//   onSkipAll: () => void;
// }

// export function ReplaceNotebooksDialog({
//   open,
//   notebooks,
//   isMigrating,
//   onReplace,
//   onSkipAll,
// }: ReplaceNotebooksDialogProps) {
//   // ✅ CRITICAL FIX: All hooks MUST be called before any early returns
//   const [selectedNotebooks, setSelectedNotebooks] = useState<Set<string>>(new Set());

//   const toggleNotebook = (notebookId: string) => {
//     setSelectedNotebooks(prev => {
//       const newSet = new Set(prev);
//       if (newSet.has(notebookId)) {
//         newSet.delete(notebookId);
//       } else {
//         newSet.add(notebookId);
//       }
//       return newSet;
//     });
//   };

//   useEffect(() => {
//     if (open && notebooks.length > 0) {
//       setSelectedNotebooks(new Set(notebooks.map(nb => nb.id)));
//     }
//   }, [open, notebooks.length]);

//   const toggleAll = () => {
//     if (selectedNotebooks.size === notebooks.length) {
//       setSelectedNotebooks(new Set());
//     } else {
//       setSelectedNotebooks(new Set(notebooks.map(nb => nb.id)));
//     }
//   };

//   const handleReplace = () => {
//     const toReplace = notebooks.filter(nb => selectedNotebooks.has(nb.id));
//     onReplace(toReplace);
//   };

//   // ✅ MOVED: Early return AFTER all hooks
//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//       <Card className="w-full max-w-lg">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <AlertCircle className="w-5 h-5 text-amber-500" />
//             Notebooks Already Exist
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <p className="text-sm text-muted-foreground">
//             {notebooks.length} notebook(s) already exist in the target workspace.
//             Select which ones you want to replace:
//           </p>

//           <div className="border rounded-lg">
//             <div className="flex items-center gap-3 p-3 border-b bg-muted/30">
//               <Checkbox
//                 checked={selectedNotebooks.size === notebooks.length}
//                 onCheckedChange={toggleAll}
//                 disabled={isMigrating}
//               />
//               <span className="text-sm font-medium">
//                 Select All ({selectedNotebooks.size} of {notebooks.length} selected)
//               </span>
//             </div>

//             <div className="max-h-60 overflow-y-auto">
//               {notebooks.map((nb) => (
//                 <div
//                   key={nb.id}
//                   className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors"
//                 >
//                   <Checkbox
//                     checked={selectedNotebooks.has(nb.id)}
//                     onCheckedChange={() => toggleNotebook(nb.id)}
//                     disabled={isMigrating}
//                   />
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-medium truncate">{nb.name}</p>
//                     {nb.path && (
//                       <p className="text-xs text-muted-foreground truncate">{nb.path}</p>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
//             <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
//             <p className="text-xs text-amber-700 dark:text-amber-400">
//               Selected notebooks will be replaced. Unselected ones will be automatically skipped.
//             </p>
//           </div>

//           <div className="flex gap-3 justify-end pt-2">
//             <Button
//               variant="outline"
//               onClick={onSkipAll}
//               disabled={isMigrating}
//             >
//               Skip All
//             </Button>
//             <Button
//               variant="azure"
//               onClick={handleReplace}
//               disabled={isMigrating || selectedNotebooks.size === 0}
//             >
//               {isMigrating && <Loader2 className="w-4 h-4 animate-spin" />}
//               Replace Selected ({selectedNotebooks.size})
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }





//18/02
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Loader2 } from "lucide-react";
 
interface ReplaceNotebooksDialogProps {
  open: boolean;
  notebooks: any[];
  isMigrating: boolean;
  onReplace: (selectedNotebooks: any[]) => void;
  onSkipAll: () => void;
}
 
export function ReplaceNotebooksDialog({
  open,
  notebooks,
  isMigrating,
  onReplace,
  onSkipAll,
}: ReplaceNotebooksDialogProps) {
  // ✅ CRITICAL FIX: All hooks MUST be called before any early returns
  const [selectedNotebooks, setSelectedNotebooks] = useState<Set<string>>(new Set());
 
  const toggleNotebook = (notebookId: string) => {
    setSelectedNotebooks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notebookId)) {
        newSet.delete(notebookId);
      } else {
        newSet.add(notebookId);
      }
      return newSet;
    });
  };
 
  useEffect(() => {
    if (open && notebooks.length > 0) {
      setSelectedNotebooks(new Set(notebooks.map(nb => nb.id)));
    }
  }, [open, notebooks.length]);
 
  const toggleAll = () => {
    if (selectedNotebooks.size === notebooks.length) {
      setSelectedNotebooks(new Set());
    } else {
      setSelectedNotebooks(new Set(notebooks.map(nb => nb.id)));
    }
  };
 
  const handleReplace = () => {
    const toReplace = notebooks.filter(nb => selectedNotebooks.has(nb.id));
    onReplace(toReplace);
  };
 
  // ✅ MOVED: Early return AFTER all hooks
  if (!open) return null;
 
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Notebooks Already Exist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {notebooks.length} notebook(s) already exist in the target workspace.
            Select which ones you want to replace:
          </p>
 
          <div className="border rounded-lg">
            <div className="flex items-center gap-3 p-3 border-b bg-muted/30">
              <Checkbox
                checked={selectedNotebooks.size === notebooks.length}
                onCheckedChange={toggleAll}
                disabled={isMigrating}
              />
              <span className="text-sm font-medium">
                Select All ({selectedNotebooks.size} of {notebooks.length} selected)
              </span>
            </div>
 
            <div className="max-h-60 overflow-y-auto">
              {notebooks.map((nb) => (
                <div
                  key={nb.id}
                  className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedNotebooks.has(nb.id)}
                    onCheckedChange={() => toggleNotebook(nb.id)}
                    disabled={isMigrating}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{nb.name}</p>
                    {nb.path && (
                      <p className="text-xs text-muted-foreground truncate">{nb.path}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
 
          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Selected notebooks will be replaced. Unselected ones will be automatically skipped.
            </p>
          </div>
 
          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="outline"
              onClick={onSkipAll}
              disabled={isMigrating}
            >
              Skip All
            </Button>
            <Button
              variant="azure"
              onClick={handleReplace}
              disabled={isMigrating || selectedNotebooks.size === 0}
            >
              {isMigrating && <Loader2 className="w-4 h-4 animate-spin" />}
              Replace Selected ({selectedNotebooks.size})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
 