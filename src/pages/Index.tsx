// import { useState } from "react";
// import { FabricJobsHome } from "./FabricJobsHome";
// import { MigrationWorkspace } from "./MigrationWorkspace";
// import { DatabricksMigrationWorkspace } from "./DatabricksMigrationWorkspace";
// import { MigrationReport } from "./MigrationReport";
// import { DatabricksMigrationReport } from "./DatabricksMigrationReport";
// import { ConnectSynapseModal } from "@/components/modals/ConnectSynapseModal";
// import { ConnectDatabricksModal } from "@/components/modals/ConnectDatabricksModal";
// import { useAuth } from "@/contexts/AuthContext";
// import type { SynapseConnection } from "@/types/migration";

// type AppView =
//   | "home"
//   | "synapse-workspace"
//   | "databricks-workspace"
//   | "synapse-migration-report"
//   | "databricks-migration-report";

// interface SynapseMigrationItem {
//   id: string;
//   name: string;
//   type: "SparkPool" | "Notebook" | "Pipeline" | "LinkedService";
//   status: "Success" | "Running" | "Failed" | "Ready";
//   targetWorkspace?: string;
//   lastModified: string;
//   errorMessage?: string;
//   runtimeVersion?: string;
//   nodeType?: string;
//   nodes?: number;
//   language?: string;
//   dependencies?: number;
//   activities?: number;
// }

// interface DatabricksMigrationItem {
//   id: string;
//   name: string;
//   type: "Job" | "Notebook" | "Cluster";
//   status: "Success" | "Running" | "Failed" | "Ready";
//   targetWorkspace?: string;
//   lastModified: string;
//   errorMessage?: string;
//   schedule?: string;
//   cluster?: string;
//   language?: string;
//   path?: string;
//   runtime?: string;
//   workers?: string;
// }

// const Index = () => {
//   const { user, logout } = useAuth();

//   const [currentView, setCurrentView] = useState<AppView>("home");
//   const [showSynapseModal, setShowSynapseModal] = useState(false);
//   const [showDatabricksModal, setShowDatabricksModal] = useState(false);
  
//   // Separate state for each migration type
//   const [synapseMigrationItems, setSynapseMigrationItems] = useState<SynapseMigrationItem[]>([]);
//   const [databricksMigrationItems, setDatabricksMigrationItems] = useState<DatabricksMigrationItem[]>([]);
  
//   const [synapseApiResponse, setSynapseApiResponse] = useState<any>(null);
//   const [databricksApiResponse, setDatabricksApiResponse] = useState<any>(null);

//   const handleLogout = () => {
//     logout();
//   };

//   const handleMigrateFromSynapse = () => {
//     setShowSynapseModal(true);
//   };

//   const handleMigrateFromDatabricks = () => {
//     setShowDatabricksModal(true);
//   };

//   const handleSynapseConnect = (
//     connection: SynapseConnection,
//     apiResponse: any
//   ) => {
//     setSynapseApiResponse(apiResponse);
//     setShowSynapseModal(false);
//     setCurrentView("synapse-workspace");
//   };

//   const handleDatabricksConnect = (
//     config: any,
//     apiResponse: any
//   ) => {
//     setDatabricksApiResponse(apiResponse);
//     setShowDatabricksModal(false);
//     setCurrentView("databricks-workspace");
//   };

//   const handleSynapseMigrationComplete = (
//     items: SynapseMigrationItem[] | ((prev: SynapseMigrationItem[]) => SynapseMigrationItem[])
//   ) => {
//     if (typeof items === "function") {
//       setSynapseMigrationItems(items);
//     } else {
//       setSynapseMigrationItems(items);
//       setCurrentView("synapse-migration-report");
//     }
//   };

//   const handleSynapseMigrationUpdate = (
//     updateFn: (prev: SynapseMigrationItem[]) => SynapseMigrationItem[]
//   ) => {
//     setSynapseMigrationItems(updateFn);
//   };

//   const handleDatabricksMigrationComplete = (items: DatabricksMigrationItem[]) => {
//     setDatabricksMigrationItems(items);
//     setCurrentView("databricks-migration-report");
//   };

//   const handleBackToHome = () => {
//     setCurrentView("home");
//     setSynapseApiResponse(null);
//     setDatabricksApiResponse(null);
//     setSynapseMigrationItems([]);
//     setDatabricksMigrationItems([]);
//   };

//   return (
//     <>
//       {currentView === "home" && (
//         <FabricJobsHome
//           onLogout={handleLogout}
//           onMigrateFromSynapse={handleMigrateFromSynapse}
//           onMigrateFromDatabricks={handleMigrateFromDatabricks}
//           userName={user?.name || "User"}
//         />
//       )}

//       {currentView === "synapse-workspace" && synapseApiResponse && (
//         <MigrationWorkspace
//           onLogout={handleLogout}
//           onBack={handleBackToHome}
//           onMigrationComplete={handleSynapseMigrationComplete}
//           onMigrationUpdate={handleSynapseMigrationUpdate}
//           apiResponse={synapseApiResponse}
//         />
//       )}

//       {currentView === "databricks-workspace" && databricksApiResponse && (
//         <DatabricksMigrationWorkspace
//           onLogout={handleLogout}
//           onBack={handleBackToHome}
//           onMigrationComplete={handleDatabricksMigrationComplete}
//           apiResponse={databricksApiResponse}
//         />
//       )}

//       {currentView === "synapse-migration-report" && (
//         <MigrationReport
//           items={synapseMigrationItems}
//           onLogout={handleLogout}
//           onBackToHome={handleBackToHome}
//         />
//       )}

//       {currentView === "databricks-migration-report" && (
//         <DatabricksMigrationReport
//           items={databricksMigrationItems}
//           onLogout={handleLogout}
//           onBackToHome={handleBackToHome}
//         />
//       )}

//       <ConnectSynapseModal
//         open={showSynapseModal}
//         onClose={() => setShowSynapseModal(false)}
//         onConnect={handleSynapseConnect}
//       />

//       <ConnectDatabricksModal
//         open={showDatabricksModal}
//         onClose={() => setShowDatabricksModal(false)}
//         onStartMigration={handleDatabricksConnect}
//       />
//     </>
//   );
// };

// export default Index;



//10feb
 
 
 
import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { FabricJobsHome } from "./FabricJobsHome";
import { MigrationWorkspace } from "./MigrationWorkspace";
import { DatabricksMigrationWorkspace } from "./DatabricksMigrationWorkspace";
import { MigrationReport } from "./MigrationReport";
import { DatabricksMigrationReport } from "./DatabricksMigrationReport";
import { ConnectSynapseModal } from "@/components/modals/ConnectSynapseModal";
import { ConnectDatabricksModal } from "@/components/modals/ConnectDatabricksModal";
import { useAuth } from "@/contexts/AuthContext";
import type { SynapseConnection } from "@/types/migration";
 
type AppView =
  | "home"
  | "synapse-workspace"
  | "databricks-workspace"
  | "synapse-migration-report"
  | "databricks-migration-report";
 
interface SynapseMigrationItem {
  id: string;
  name: string;
  type: "SparkPool" | "Notebook" | "Pipeline" | "LinkedService";
  status: "Success" | "Running" | "Failed" | "Ready";
  targetWorkspace?: string;
  lastModified: string;
  errorMessage?: string;
  runtimeVersion?: string;
  nodeType?: string;
  nodes?: number;
  language?: string;
  dependencies?: number;
  activities?: number;
}
 
interface DatabricksMigrationItem {
  id: string;
  name: string;
  type: "Job" | "Notebook" | "Cluster";
  status: "Success" | "Running" | "Failed" | "Ready";
  targetWorkspace?: string;
  lastModified: string;
  errorMessage?: string;
  schedule?: string;
  cluster?: string;
  language?: string;
  path?: string;
  runtime?: string;
  workers?: string;
}
 
const Index = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); // ✅ ADDED
 
  const [currentView, setCurrentView] = useState<AppView>("home");
  const [showSynapseModal, setShowSynapseModal] = useState(false);
  const [showDatabricksModal, setShowDatabricksModal] = useState(false);
 
  // Separate state for each migration type
  const [synapseMigrationItems, setSynapseMigrationItems] = useState<SynapseMigrationItem[]>([]);
  const [databricksMigrationItems, setDatabricksMigrationItems] = useState<DatabricksMigrationItem[]>([]);
 
  const [synapseApiResponse, setSynapseApiResponse] = useState<any>(null);
  const [databricksApiResponse, setDatabricksApiResponse] = useState<any>(null);
 
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");
 
  const handleLogout = () => {
    logout();
  };
 
  const handleMigrateFromSynapse = () => {
    setShowSynapseModal(true);
  };
 
  const handleMigrateFromDatabricks = () => {
    setShowDatabricksModal(true);
  };
 
  const handleSynapseConnect = (
    connection: SynapseConnection,
    apiResponse: any
  ) => {
    setSynapseApiResponse(apiResponse);
    setShowSynapseModal(false);
    setCurrentView("synapse-workspace");
    navigate("/synapse-workspace"); // ✅ ADDED - Sync URL with state
  };
 
  const handleDatabricksConnect = (
    config: any,
    apiResponse: any
  ) => {
    setDatabricksApiResponse(apiResponse);
    setShowDatabricksModal(false);
    setCurrentView("databricks-workspace");
    navigate("/databricks-workspace"); // ✅ ADDED - Sync URL with state
  };
 
  const handleSynapseMigrationComplete = (
    items: SynapseMigrationItem[] | ((prev: SynapseMigrationItem[]) => SynapseMigrationItem[])
  ) => {
    if (typeof items === "function") {
      setSynapseMigrationItems(items);
    } else {
      setSynapseMigrationItems(items);
      setCurrentView("synapse-migration-report");
      navigate("/synapse-report"); // ✅ ADDED - Sync URL with state
    }
  };
 
  const handleSynapseMigrationUpdate = (
    updateFn: (prev: SynapseMigrationItem[]) => SynapseMigrationItem[]
  ) => {
    setSynapseMigrationItems(updateFn);
  };
 
  const handleDatabricksMigrationComplete = (items: DatabricksMigrationItem[]) => {
    setDatabricksMigrationItems(items);
    setCurrentView("databricks-migration-report");
    navigate("/databricks-report"); // ✅ ADDED - Sync URL with state
  };
 
  const handleDatabricksMigrationUpdate = (
    updateFn: (prev: DatabricksMigrationItem[]) => DatabricksMigrationItem[]
  ) => {
    setDatabricksMigrationItems(updateFn);
  };
 
  const handleWorkspaceSelected = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
  };
 
  const handleBackToHome = () => {
    setCurrentView("home");
    setSynapseApiResponse(null);
    setDatabricksApiResponse(null);
    setSynapseMigrationItems([]);
    setDatabricksMigrationItems([]);
    setSelectedWorkspaceId("");
    navigate("/fabricjobshome"); // ✅ ADDED - Sync URL with state
  };
 
  return (
    <>
      {currentView === "home" && (
        <FabricJobsHome
          onLogout={handleLogout}
          onMigrateFromSynapse={handleMigrateFromSynapse}
          onMigrateFromDatabricks={handleMigrateFromDatabricks}
          userName={user?.name || "User"}
        />
      )}
 
      {currentView === "synapse-workspace" && synapseApiResponse && (
        <MigrationWorkspace
          onLogout={handleLogout}
          onBack={handleBackToHome}
          onMigrationComplete={handleSynapseMigrationComplete}
          onMigrationUpdate={handleSynapseMigrationUpdate}
          apiResponse={synapseApiResponse}
        />
      )}
 
      {currentView === "databricks-workspace" && databricksApiResponse && (
        <DatabricksMigrationWorkspace
          onLogout={handleLogout}
          onBack={handleBackToHome}
          onMigrationComplete={handleDatabricksMigrationComplete}
          onMigrationUpdate={handleDatabricksMigrationUpdate}
          onWorkspaceSelected={handleWorkspaceSelected}
          apiResponse={databricksApiResponse}
        />
      )}
 
      {currentView === "synapse-migration-report" && (
        <MigrationReport
          items={synapseMigrationItems}
          onLogout={handleLogout}
          onBackToHome={handleBackToHome}
        />
      )}
 
      {currentView === "databricks-migration-report" && (
        <DatabricksMigrationReport
          items={databricksMigrationItems}
          onLogout={handleLogout}
          onBackToHome={handleBackToHome}
          targetWorkspaceId={selectedWorkspaceId}
        />
      )}
 
      <ConnectSynapseModal
        open={showSynapseModal}
        onClose={() => setShowSynapseModal(false)}
        onConnect={handleSynapseConnect}
      />
 
      <ConnectDatabricksModal
        open={showDatabricksModal}
        onClose={() => setShowDatabricksModal(false)}
        onStartMigration={handleDatabricksConnect}
      />
    </>
  );
};
 
export default Index;
 