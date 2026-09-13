"use client";

import { useState, type FormEvent } from "react";
import {
  architectureAdmin,
  ApiError,
  type RawArchitectureLayer,
  type RawArchitectureNode,
  type RawArchitectureConnection,
} from "@/lib/api/admin";
import { useToast } from "@/components/admin/Toast";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { TextField, NumberField, SelectField, TextAreaField } from "@/components/admin/fields";

const NODE_TYPES = ["SERVICE", "DATABASE", "QUEUE", "CACHE", "CLIENT", "EXTERNAL", "GATEWAY", "STORAGE"];

interface Graph {
  layers: RawArchitectureLayer[];
  nodes: RawArchitectureNode[];
  connections: RawArchitectureConnection[];
}

export default function ArchitectureEditor({
  projectId,
  initialGraph,
}: {
  projectId: string;
  initialGraph: Graph;
}) {
  const { notify } = useToast();
  const [graph, setGraph] = useState<Graph>(initialGraph);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function refresh() {
    const fresh = await architectureAdmin.get(projectId);
    setGraph(fresh);
  }

  function handleError(err: unknown) {
    setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
  }

  async function addLayer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      await architectureAdmin.layers.create(projectId, {
        name: String(formData.get("name") ?? ""),
        description: String(formData.get("description") ?? "") || undefined,
        displayOrder: Number(formData.get("displayOrder") ?? graph.layers.length),
      });
      notify("Layer added.");
      e.currentTarget.reset();
      await refresh();
    } catch (err) {
      handleError(err);
    } finally {
      setPending(false);
    }
  }

  async function addNode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const layerId = String(formData.get("layerId") ?? "");
    try {
      await architectureAdmin.nodes.create(projectId, {
        layerId: layerId || undefined,
        label: String(formData.get("label") ?? ""),
        type: String(formData.get("type") ?? "SERVICE"),
        description: String(formData.get("description") ?? "") || undefined,
      });
      notify("Node added.");
      e.currentTarget.reset();
      await refresh();
    } catch (err) {
      handleError(err);
    } finally {
      setPending(false);
    }
  }

  async function addConnection(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      await architectureAdmin.connections.create(projectId, {
        fromNodeId: String(formData.get("fromNodeId") ?? ""),
        toNodeId: String(formData.get("toNodeId") ?? ""),
        label: String(formData.get("label") ?? "") || undefined,
      });
      notify("Connection added.");
      e.currentTarget.reset();
      await refresh();
    } catch (err) {
      handleError(err);
    } finally {
      setPending(false);
    }
  }

  const layerName = (id: string | null) => graph.layers.find((l) => l.id === id)?.name ?? "—";
  const nodeLabel = (id: string) => graph.nodes.find((n) => n.id === id)?.label ?? id;

  return (
    <div className="flex flex-col gap-12">
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

      {/* Layers */}
      <section>
        <h2 className="font-display text-lg text-text">Layers</h2>
        <p className="mt-1 text-sm text-muted">Visual groupings (e.g. &ldquo;Frontend&rdquo;, &ldquo;Data layer&rdquo;).</p>

        <div className="mt-4 border border-border">
          {graph.layers.length === 0 ? (
            <p className="p-6 text-sm text-muted">No layers yet — add one below.</p>
          ) : (
            <ul className="divide-y divide-border">
              {graph.layers
                .slice()
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((layer) => (
                  <li key={layer.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm text-text">{layer.name}</p>
                      {layer.description && <p className="text-xs text-muted">{layer.description}</p>}
                    </div>
                    <ConfirmDialog
                      trigger={<button type="button" className="font-mono text-xs text-red-400 underline underline-offset-4">Delete</button>}
                      title={`Delete layer "${layer.name}"?`}
                      description="Nodes in this layer are kept, just unassigned from it."
                      onConfirm={async () => {
                        await architectureAdmin.layers.remove(projectId, layer.id);
                        notify("Layer deleted.");
                        await refresh();
                      }}
                    />
                  </li>
                ))}
            </ul>
          )}
        </div>

        <form onSubmit={addLayer} className="mt-4 grid max-w-lg gap-4 border border-border p-4 sm:grid-cols-2">
          <TextField label="Name" name="name" required className="sm:col-span-2" />
          <TextField label="Description" name="description" className="sm:col-span-2" />
          <NumberField label="Display order" name="displayOrder" defaultValue={graph.layers.length} />
          <button
            type="submit"
            disabled={pending}
            className="self-end border border-text px-4 py-2.5 font-mono text-xs text-text transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
          >
            Add layer
          </button>
        </form>
      </section>

      {/* Nodes */}
      <section>
        <h2 className="font-display text-lg text-text">Nodes</h2>
        <p className="mt-1 text-sm text-muted">Individual boxes in the diagram (services, databases, etc).</p>

        <div className="mt-4 border border-border">
          {graph.nodes.length === 0 ? (
            <p className="p-6 text-sm text-muted">No nodes yet — add one below.</p>
          ) : (
            <ul className="divide-y divide-border">
              {graph.nodes.map((node) => (
                <li key={node.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm text-text">
                      {node.label} <span className="font-mono text-xs text-dim">· {node.type}</span>
                    </p>
                    <p className="text-xs text-muted">{layerName(node.layerId)}</p>
                  </div>
                  <ConfirmDialog
                    trigger={<button type="button" className="font-mono text-xs text-red-400 underline underline-offset-4">Delete</button>}
                    title={`Delete node "${node.label}"?`}
                    description="Any connections to or from this node are removed too."
                    onConfirm={async () => {
                      await architectureAdmin.nodes.remove(projectId, node.id);
                      notify("Node deleted.");
                      await refresh();
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={addNode} className="mt-4 grid max-w-lg gap-4 border border-border p-4 sm:grid-cols-2">
          <TextField label="Label" name="label" required className="sm:col-span-2" />
          <SelectField label="Type" name="type" defaultValue="SERVICE" options={NODE_TYPES.map((t) => ({ value: t, label: t }))} />
          <SelectField
            label="Layer"
            name="layerId"
            defaultValue=""
            options={[{ value: "", label: "— None —" }, ...graph.layers.map((l) => ({ value: l.id, label: l.name }))]}
          />
          <TextAreaField label="Description" name="description" rows={2} className="sm:col-span-2" />
          <button
            type="submit"
            disabled={pending}
            className="self-end border border-text px-4 py-2.5 font-mono text-xs text-text transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
          >
            Add node
          </button>
        </form>
      </section>

      {/* Connections */}
      <section>
        <h2 className="font-display text-lg text-text">Connections</h2>
        <p className="mt-1 text-sm text-muted">Arrows between nodes. Requires at least two nodes.</p>

        <div className="mt-4 border border-border">
          {graph.connections.length === 0 ? (
            <p className="p-6 text-sm text-muted">No connections yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {graph.connections.map((conn) => (
                <li key={conn.id} className="flex items-center justify-between px-4 py-3">
                  <p className="text-sm text-text">
                    {nodeLabel(conn.fromNodeId)} <span className="text-dim">→</span> {nodeLabel(conn.toNodeId)}
                    {conn.label && <span className="ml-2 font-mono text-xs text-dim">({conn.label})</span>}
                  </p>
                  <ConfirmDialog
                    trigger={<button type="button" className="font-mono text-xs text-red-400 underline underline-offset-4">Delete</button>}
                    title="Delete this connection?"
                    onConfirm={async () => {
                      await architectureAdmin.connections.remove(projectId, conn.id);
                      notify("Connection deleted.");
                      await refresh();
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {graph.nodes.length >= 2 ? (
          <form onSubmit={addConnection} className="mt-4 grid max-w-lg gap-4 border border-border p-4 sm:grid-cols-2">
            <SelectField label="From" name="fromNodeId" options={graph.nodes.map((n) => ({ value: n.id, label: n.label }))} />
            <SelectField label="To" name="toNodeId" options={graph.nodes.map((n) => ({ value: n.id, label: n.label }))} />
            <TextField label="Label" name="label" className="sm:col-span-2" hint="Optional, e.g. 'reads from'" />
            <button
              type="submit"
              disabled={pending}
              className="self-end border border-text px-4 py-2.5 font-mono text-xs text-text transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
            >
              Add connection
            </button>
          </form>
        ) : (
          <p className="mt-4 text-xs text-dim">Add at least two nodes to create a connection.</p>
        )}
      </section>
    </div>
  );
}
