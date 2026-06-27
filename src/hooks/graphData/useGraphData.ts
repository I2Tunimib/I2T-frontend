import { useState, useEffect, useMemo } from 'react';
import { exportTable } from '@store/slices/table/table.thunk';
import { useAppDispatch } from '../store';

export const useGraphData = (datasetId: string, tableId: string) => {
  const [w3cData, setW3cData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setLoading(true);
    dispatch(exportTable({ format: 'JSON (W3C Compliant)', params: { datasetId, tableId } }))
      .unwrap()
      .then((data) => {
        setW3cData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [datasetId, tableId, dispatch]);

  const graphData = useMemo(() => {
    if (!w3cData) return { nodes: [], links: [] };

    const schema = w3cData[0];
    const rows = w3cData.slice(1);

    const clean = (str: string) => str?.trim().replace(/^\uFEFF/, '');

    const nodes = Object.values(schema).map((th: any) => {
      const types = th.metadata?.flatMap((m: any) => m.type ?? []) ?? [];
      const typeHighestScore = types.length > 0
        ? types.reduce((highest: any, curr: any) => (curr.score > highest.score ? curr : highest))
        : undefined;
      const values = rows.map((row: any) => {
        const key = th.label;
        const cell = row[key];
        return cell?.label ?? 'N/A';
      });

      return {
        label: clean(th.label),
        kind: th.kind,
        datatype: th.datatype,
        role: th.role,
        metadata: typeHighestScore?.id ?? th.metadata?.[0]?.id ?? undefined,
        types,
        properties: th.metadata?.flatMap((m: any) => m.property ?? []),
        values
      };
    });

    const nodeLabels = new Set(nodes.map((n) => n.label));

    const rawLinks = Object.values(schema).flatMap((th: any) => {
      return (th.metadata ?? []).flatMap((m: any) => {
        return (m.property ?? []).map((p: any) => {
          const sourceLabel = clean(th.label);
          const targetLabel = clean(p.obj);

          if (nodeLabels.has(sourceLabel) && nodeLabels.has(targetLabel)) {
            return {
              id: `${sourceLabel}->${targetLabel}_${p.id}`,
              source: sourceLabel,
              target: targetLabel,
              label: p.name,
              propID: p.id,
            };
          }
          return null;
        });
      });
    }).filter((l): l is any => l !== null);

    const links = rawLinks.map((link) => {
      const sId = link.source;
      const tId = link.target;

      const hasInverse = rawLinks.some((l) => {
        return l.source === tId && l.target === sId;
      });

      return {
        ...link,
        curvature: hasInverse ? 0.25 : 0
      };
    });

    console.log('nodes', nodes);
    console.log('links', links);

    return { nodes, links };
  }, [w3cData]);

  const multiPropsMap = useMemo(() => {
    const map: Record<string, Array<{ propID: string; label: string }>> = {};
    if (!w3cData) return map;

    const schema = w3cData[0];
    const clean = (str: string) => str?.trim().replace(/^\uFEFF/, '');

    Object.values(schema).forEach((th: any) => {
      (th.metadata ?? []).forEach((m: any) => {
        (m.property ?? []).forEach((p: any) => {
          const sourceLabel = clean(th.label);
          const targetLabel = clean(p.obj);
          const pairKey = `${sourceLabel}->${targetLabel}`;

          if (!map[pairKey]) {
            map[pairKey] = [];
          }
          if (!map[pairKey].some((item) => item.propID === p.id)) {
            map[pairKey].push({ propID: p.id, label: p.name });
          }
        });
      });
    });
    return map;
  }, [w3cData]);

  const nodesLength = graphData.nodes.length;
  const linksLength = graphData.links.length;

  const isNodeIsolated = (node: any) => {
    return !graphData.links.some((l) =>
      (typeof l.source === 'object' ? l.source.label : l.source) === node.label ||
      (typeof l.target === 'object' ? l.target.label : l.target) === node.label);
  };

  const getOutgoingLinks = (label: string) =>
    graphData.links.filter((l) => (typeof l.source === 'object' ? l.source.label : l.source) === label);

  const getIncomingLinks = (label: string) =>
    graphData.links.filter((l) => (typeof l.target === 'object' ? l.target.label : l.target) === label);

  const density = nodesLength > 1 ? linksLength / (nodesLength * (nodesLength - 1)) : 0;
  const nodeDegrees = useMemo(() => {
    return graphData.nodes.map((n) => {
      const degree = graphData.links.filter(
        (l) => l.source === n.label || l.target === n.label
      ).length;

      return {
        label: n.label,
        degree
      };
    });
  }, [graphData]);

  const minDegree = useMemo(() => {
    if (!nodeDegrees.length) {
      return { value: 0, nodes: [] };
    }
    const value = Math.min(...nodeDegrees.map((n) => n.degree));
    const nodes = nodeDegrees.filter((n) => n.degree === value);

    return { value, nodes };
  }, [nodeDegrees]);

  const maxDegree = useMemo(() => {
    if (!nodeDegrees.length) {
      return { value: 0, nodes: [] };
    }
    const value = Math.max(...nodeDegrees.map((n) => n.degree));
    const nodes = nodeDegrees.filter((n) => n.degree === value);

    return { value, nodes };
  }, [nodeDegrees]);

  const rolesDistribution = useMemo(() => {
    const counter: Record<string, number> = {};
    const unknownNodes: string[] = [];

    graphData.nodes.forEach((n) => {
      const key = n.role || n.kind || 'unknown';
      counter[key] = (counter[key] || 0) + 1;

      if (key === 'unknown') unknownNodes.push(n.label);
    });

    const orderedRoles = ['subject', 'entity', 'literal', 'unknown'];
    return orderedRoles
      .map((r) => ({
        role: r,
        count: counter[r] || 0,
        unknownNodes: r === 'unknown' ? unknownNodes : []
      }));
  }, [graphData.nodes]);

  const metrics = useMemo(() => [
    {
      name: 'Density',
      value: density.toFixed(4),
      description: 'Measures how connected the graph is relative to the maximum possible. Useful to spot missing relations or sparse datasets.'
    },
    {
      name: 'Average Degree',
      value: (nodesLength > 0 ? (((2 * linksLength) / nodesLength).toFixed(2)) : '0'),
      description: 'Average number of relations per node. Nodes with higher degrees are more central or heavily ' +
        'referenced in the dataset. Helps identify key columns.'
    },
    {
      name: 'Max Degree',
      value: `${maxDegree.value} (${maxDegree.nodes.map((n) => n.label).join(', ')})`,
      description: 'Identifies node with the most connections—“hub” column, like a primary key or a frequently referenced entity.'
    },
    {
      name: 'Min Degree',
      value: `${minDegree.value} (${minDegree.nodes.map((n) => n.label).join(', ')})`,
      description: 'Represents isolated node (column) with the fewest or no connections—potentially unused or stand-alone data.'
    },
    {
      name: 'Roles Distribution',
      value: rolesDistribution,
      description: 'Shows the proportion of different types of nodes. Helps understand the semantic composition' +
        'of the dataset.'
    }
  ], [graphData, nodesLength, linksLength, density, rolesDistribution]);

  return {
    graphData,
    nodesLength,
    linksLength,
    multiPropsMap,
    metrics,
    loading,
    w3cData,
    getOutgoingLinks,
    getIncomingLinks,
    isNodeIsolated,
  };
};
