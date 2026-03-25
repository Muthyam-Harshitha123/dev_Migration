import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronRight,
  ChevronDown,
  Database,
  Layers,
  ArrowRight,
  Table2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Schema {
  name: string;
  table_count: number;
  table_names: string[];
}

interface Catalog {
  name: string;
  schemas: Schema[];
}

interface CatalogTreeScreenProps {
  catalogs: Catalog[];
  selectedCatalogIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onConfirm: () => void;
  onBack: () => void;
  onBackToDiscovery: () => void;
}

function SchemaRow({ schema, catalogName }: { schema: Schema; catalogName: string }) {
  const [expanded, setExpanded] = useState(false);
  const hasTables = schema.table_names?.length > 0;

  return (
    <div>
      {/* Schema row */}
      <div
        className={cn(
          "flex items-center gap-2 pl-12 pr-4 py-2.5 hover:bg-muted/20 transition-colors",
          hasTables && "cursor-pointer"
        )}
        onClick={() => hasTables && setExpanded(p => !p)}
      >
        {hasTables ? (
          expanded
            ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        ) : (
          <span className="w-3.5 flex-shrink-0" />
        )}

        <div className="w-5 h-5 rounded bg-muted/60 flex items-center justify-center flex-shrink-0">
          <Layers className="w-3 h-3 text-muted-foreground" />
        </div>

        <span className="text-sm flex-1">{schema.name}</span>

        <span className="text-xs text-muted-foreground">
          {schema.table_count} table{schema.table_count !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table rows */}
      {expanded && hasTables && (
        <div className="pl-20 pr-4 pb-1">
          {schema.table_names.map((tableName) => (
            <div key={tableName} className="flex items-center gap-2 py-1.5">
              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                <Table2 className="w-3 h-3 text-muted-foreground/60" />
              </div>
              <span className="text-xs text-muted-foreground">{tableName}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CatalogRow({
  catalog,
  selectedCatalogIds,
  onToggle,
}: {
  catalog: Catalog;
  selectedCatalogIds: string[];
  onToggle: (catalogName: string, schemas: Schema[]) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const schemaIds = catalog.schemas.map(s => `${catalog.name}.${s.name}`);
  const allSelected = schemaIds.length > 0 && schemaIds.every(id => selectedCatalogIds.includes(id));
  const someSelected = schemaIds.some(id => selectedCatalogIds.includes(id));

  return (
    <div className="border-b border-muted/40 last:border-b-0">
      {/* Catalog header */}
      <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/10 transition-colors">
        <Checkbox
          checked={allSelected}
          onCheckedChange={() => onToggle(catalog.name, catalog.schemas)}
          className={cn(!allSelected && someSelected && "opacity-60")}
          onClick={(e) => e.stopPropagation()}
        />

        <button
          onClick={() => setExpanded(p => !p)}
          className="flex items-center gap-2 flex-1 text-left min-w-0"
        >
          {expanded
            ? <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            : <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          }
          <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Database className="w-3 h-3 text-primary" />
          </div>
          <span className="font-medium text-sm truncate">{catalog.name}</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
          <span>{catalog.schemas.length} schema{catalog.schemas.length !== 1 ? "s" : ""}</span>
          {someSelected && (
            <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
              {allSelected ? "All" : schemaIds.filter(id => selectedCatalogIds.includes(id)).length} selected
            </span>
          )}
        </div>
      </div>

      {/* Schemas */}
      {expanded && (
        <div className="border-t border-muted/20 bg-muted/5">
          {catalog.schemas.map(schema => (
            <SchemaRow
              key={`${catalog.name}.${schema.name}`}
              schema={schema}
              catalogName={catalog.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CatalogTreeScreen({
  catalogs,
  selectedCatalogIds,
  onSelectionChange,
  onConfirm,
  onBack,
  onBackToDiscovery,
}: CatalogTreeScreenProps) {
  const allSchemaIds = catalogs.flatMap(c =>
    c.schemas.map(s => `${c.name}.${s.name}`)
  );
  const allSelected = allSchemaIds.length > 0 && allSchemaIds.every(id => selectedCatalogIds.includes(id));

  const selectedCatalogCount = catalogs.filter(c =>
    c.schemas.some(s => selectedCatalogIds.includes(`${c.name}.${s.name}`))
  ).length;

  const toggleCatalog = (catalogName: string, schemas: Schema[]) => {
    const ids = schemas.map(s => `${catalogName}.${s.name}`);
    const allCatSelected = ids.every(id => selectedCatalogIds.includes(id));
    if (allCatSelected) {
      onSelectionChange(selectedCatalogIds.filter(id => !ids.includes(id)));
    } else {
      onSelectionChange([...new Set([...selectedCatalogIds, ...ids])]);
    }
  };

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(allSchemaIds);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="p-6 max-w-4xl mx-auto animate-fade-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button onClick={onBackToDiscovery} className="hover:text-foreground transition-colors">
            Discovery Results
          </button>
          <ChevronRight className="w-4 h-4" />
          <button onClick={onBack} className="hover:text-foreground transition-colors">
            Review Selection
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Migrate Data</span>
        </div>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Migrate Data</h1>
            <p className="text-sm text-muted-foreground">
              Select the catalogs you want to migrate to Microsoft Fabric
            </p>
          </div>
          <Button
            variant="azure"
            disabled={selectedCatalogCount === 0}
            onClick={onConfirm}
          >
            Confirm ({selectedCatalogCount} catalog{selectedCatalogCount !== 1 ? "s" : ""})
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              Unity Catalog
            </CardTitle>
            {allSchemaIds.length > 0 && (
              <div
                className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                onClick={toggleAll}
              >
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                <span>Select all</span>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-0">
            {catalogs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Database className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p>No catalogs found in this workspace</p>
              </div>
            ) : (
              <div>
                {catalogs.map(catalog => (
                  <CatalogRow
                    key={catalog.name}
                    catalog={catalog}
                    selectedCatalogIds={selectedCatalogIds}
                    onToggle={toggleCatalog}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}