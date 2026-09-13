import { index, integer, jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { idColumn, timestampColumns } from "./columns.helpers";
import { projects } from "./projects";
import { architectureNodeTypeEnum } from "./enums";

// A project's architecture diagram is modeled as three normalized pieces —
// layers, nodes, and connections between nodes — rather than one JSON blob,
// so the frontend can query/filter/reorder them individually and the admin
// UI can edit one node without rewriting an entire diagram document.
// `position` is JSONB because x/y (and possibly future z, width, height)
// coordinates are display metadata, not something we ever need to query or
// constrain relationally — a legitimate use of "flexible" JSONB.
export const architectureLayers = pgTable(
  "architecture_layers",
  {
    ...idColumn,
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    displayOrder: integer("display_order").notNull().default(0),
    ...timestampColumns,
  },
  (table) => [index("architecture_layers_project_id_idx").on(table.projectId)],
);

export const architectureNodes = pgTable(
  "architecture_nodes",
  {
    ...idColumn,
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    layerId: uuid("layer_id").references(() => architectureLayers.id, {
      onDelete: "set null",
    }),
    label: text("label").notNull(),
    type: architectureNodeTypeEnum("type").notNull(),
    description: text("description"),
    // { x: number, y: number } — purely presentational layout data.
    position: jsonb("position").$type<{ x: number; y: number }>(),
    ...timestampColumns,
  },
  (table) => [
    index("architecture_nodes_project_id_idx").on(table.projectId),
    index("architecture_nodes_layer_id_idx").on(table.layerId),
  ],
);

export const architectureConnections = pgTable(
  "architecture_connections",
  {
    ...idColumn,
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    fromNodeId: uuid("from_node_id")
      .notNull()
      .references(() => architectureNodes.id, { onDelete: "cascade" }),
    toNodeId: uuid("to_node_id")
      .notNull()
      .references(() => architectureNodes.id, { onDelete: "cascade" }),
    label: text("label"),
    ...timestampColumns,
  },
  (table) => [
    index("architecture_connections_project_id_idx").on(table.projectId),
    index("architecture_connections_from_node_id_idx").on(table.fromNodeId),
    index("architecture_connections_to_node_id_idx").on(table.toNodeId),
  ],
);
