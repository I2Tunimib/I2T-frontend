export interface LabelBounds {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  originalX: number;
  originalY: number;
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
}

export interface AdjustedLabel {
  id: string;
  x: number;
  y: number;
}

/**
 * Checks if two bounding boxes overlap
 */
export const checkOverlap = (a: LabelBounds, b: LabelBounds): boolean => {
  const padding = 4; // Add padding for better readability
  return !(
    a.x + a.width + padding < b.x ||
    b.x + b.width + padding < a.x ||
    a.y + a.height + padding < b.y ||
    b.y + b.height + padding < a.y
  );
};

/**
 * Calculates the overlap area between two bounding boxes
 */
export const calculateOverlapArea = (
  a: LabelBounds,
  b: LabelBounds,
): number => {
  const xOverlap = Math.max(
    0,
    Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x),
  );
  const yOverlap = Math.max(
    0,
    Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y),
  );
  return xOverlap * yOverlap;
};

/**
 * Calculates the repulsion force between two overlapping labels
 */
const calculateRepulsionForce = (
  label1: LabelBounds,
  label2: LabelBounds,
): { dx: number; dy: number } => {
  const centerX1 = label1.x + label1.width / 2;
  const centerY1 = label1.y + label1.height / 2;
  const centerX2 = label2.x + label2.width / 2;
  const centerY2 = label2.y + label2.height / 2;

  const dx = centerX1 - centerX2;
  const dy = centerY1 - centerY2;
  const distance = Math.sqrt(dx * dx + dy * dy) || 1;

  const overlapArea = calculateOverlapArea(label1, label2);
  const force = overlapArea > 0 ? overlapArea / 100 : 0;

  // Prefer vertical movement (downward) to stack labels when they overlap
  return {
    dx: (dx / distance) * force * 0.3, // Reduced horizontal force
    dy: (dy / distance) * force * 2.5, // Increased vertical force to push labels down
  };
};

/**
 * Calculates the attraction force pulling a label back to its original position
 */
const calculateAttractionForce = (
  label: LabelBounds,
): { dx: number; dy: number } => {
  const dx = label.originalX - label.x;
  const dy = label.originalY - label.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Stronger attraction the further away from original position
  const attractionStrength = 0.3; // Moderate attraction

  return {
    dx: dx * attractionStrength * 1.5,
    dy: dy * attractionStrength * 0.5, // Weaker vertical attraction to allow downward stacking
  };
};

/**
 * Adjusts label positions to resolve overlaps using a force-directed approach
 */
export const adjustLabelPositions = (
  labels: LabelBounds[],
  maxIterations: number = 40,
  convergenceThreshold: number = 0.5,
  maxDistanceHorizontal: number = 30, // Maximum horizontal distance
  maxDistanceVertical: number = 80, // Allow labels to move down more to avoid overlaps
): AdjustedLabel[] => {
  if (labels.length === 0) return [];

  // Create a working copy of labels
  const workingLabels = labels.map((label) => ({ ...label }));

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    let maxMovement = 0;
    const forces = workingLabels.map(() => ({ dx: 0, dy: 0 }));

    // Calculate repulsion forces between overlapping labels
    for (let i = 0; i < workingLabels.length; i++) {
      for (let j = i + 1; j < workingLabels.length; j++) {
        if (checkOverlap(workingLabels[i], workingLabels[j])) {
          const force = calculateRepulsionForce(
            workingLabels[i],
            workingLabels[j],
          );

          forces[i].dx += force.dx;
          forces[i].dy += force.dy;
          forces[j].dx -= force.dx;
          forces[j].dy -= force.dy;
        }
      }

      // Add attraction force to original position
      const attraction = calculateAttractionForce(workingLabels[i]);
      forces[i].dx += attraction.dx;
      forces[i].dy += attraction.dy;
    }

    // Apply forces and update positions
    for (let i = 0; i < workingLabels.length; i++) {
      const label = workingLabels[i];
      const force = forces[i];

      // Damping factor to prevent oscillation
      const damping = 0.5; // Reduced from 0.7 to make movements smaller
      const newX = label.x + force.dx * damping;
      const newY = label.y + force.dy * damping;

      // Calculate distance from original position (separate horizontal and vertical)
      const horizontalDistance = Math.abs(newX - label.originalX);
      const verticalDistance = Math.abs(newY - label.originalY);

      // Apply maximum distance constraints separately
      let constrainedX = newX;
      let constrainedY = newY;

      // Constrain horizontal movement
      if (horizontalDistance > maxDistanceHorizontal) {
        const direction = newX > label.originalX ? 1 : -1;
        constrainedX = label.originalX + direction * maxDistanceHorizontal;
      }

      // Constrain vertical movement more strictly
      if (verticalDistance > maxDistanceVertical) {
        const direction = newY > label.originalY ? 1 : -1;
        constrainedY = label.originalY + direction * maxDistanceVertical;
      }

      // Apply additional boundary constraints if they exist
      constrainedX = Math.max(
        label.minX ?? -Infinity,
        Math.min(label.maxX ?? Infinity, constrainedX),
      );
      constrainedY = Math.max(
        label.minY ?? -Infinity,
        Math.min(label.maxY ?? Infinity, constrainedY),
      );

      const movement = Math.sqrt(
        Math.pow(constrainedX - label.x, 2) +
          Math.pow(constrainedY - label.y, 2),
      );
      maxMovement = Math.max(maxMovement, movement);

      label.x = constrainedX;
      label.y = constrainedY;
    }

    // Check for convergence
    if (maxMovement < convergenceThreshold) {
      break;
    }
  }

  return workingLabels.map((label) => ({
    id: label.id,
    x: label.x,
    y: label.y,
  }));
};

/**
 * Detects overlapping labels and returns pairs of overlapping IDs
 */
export const detectOverlaps = (
  labels: LabelBounds[],
): Array<[string, string]> => {
  const overlaps: Array<[string, string]> = [];

  for (let i = 0; i < labels.length; i++) {
    for (let j = i + 1; j < labels.length; j++) {
      if (checkOverlap(labels[i], labels[j])) {
        overlaps.push([labels[i].id, labels[j].id]);
      }
    }
  }

  return overlaps;
};

/**
 * Smart positioning algorithm that tries vertical adjustment first,
 * then falls back to force-directed if needed
 */
export const smartAdjustLabels = (
  labels: LabelBounds[],
  svgBounds?: { width: number; height: number },
): AdjustedLabel[] => {
  if (labels.length === 0) return [];

  // Find all overlapping label pairs
  const allOverlaps = detectOverlaps(labels);

  // Get set of IDs that have overlaps
  const overlappingIds = new Set<string>();
  allOverlaps.forEach(([id1, id2]) => {
    overlappingIds.add(id1);
    overlappingIds.add(id2);
  });

  // Separate overlapping from non-overlapping labels
  const overlappingLabels = labels.filter((label) =>
    overlappingIds.has(label.id),
  );
  const nonOverlappingLabels = labels.filter(
    (label) => !overlappingIds.has(label.id),
  );

  // Non-overlapping labels stay at their original position
  const result: AdjustedLabel[] = nonOverlappingLabels.map((label) => ({
    id: label.id,
    x: label.originalX,
    y: label.originalY,
  }));

  // Only adjust overlapping labels
  if (overlappingLabels.length > 0) {
    // Sort overlapping labels by x position (left to right)
    const sortedLabels = [...overlappingLabels].sort((a, b) => a.x - b.x);

    // Simple vertical stacking for overlapping labels
    const verticallyAdjusted = sortedLabels.map((label, index) => {
      const workingLabel = { ...label };

      // Check for labels with similar x positions (within 80px)
      const nearbyLabels = sortedLabels.filter(
        (other, otherIndex) =>
          otherIndex < index &&
          Math.abs(other.x - label.x) < 80 &&
          checkOverlap(workingLabel, other),
      );

      if (nearbyLabels.length > 0) {
        // Stack vertically with spacing - move DOWN by adding to Y
        const spacing = 10;
        const lowestY = Math.max(
          ...nearbyLabels.map((l) => l.y + l.height + spacing),
        );
        workingLabel.y = lowestY;
      }

      return workingLabel;
    });

    // Check if still overlapping after vertical adjustment
    const stillOverlapping = detectOverlaps(verticallyAdjusted);

    if (stillOverlapping.length > 0) {
      // Apply force-directed adjustment only to still overlapping labels
      const constrainedLabels = verticallyAdjusted.map((label) => ({
        ...label,
        minX: svgBounds ? 10 : undefined,
        maxX: svgBounds ? svgBounds.width - label.width - 10 : undefined,
        minY: svgBounds ? 10 : undefined,
        maxY: svgBounds ? svgBounds.height - label.height - 10 : undefined,
      }));

      const adjusted = adjustLabelPositions(constrainedLabels, 40, 0.5, 30, 80);
      result.push(...adjusted);
    } else {
      // Vertical stacking resolved all overlaps
      result.push(
        ...verticallyAdjusted.map((label) => ({
          id: label.id,
          x: label.x,
          y: label.y,
        })),
      );
    }
  }

  return result;
};

/**
 * Calculates an optimal offset to avoid a specific region
 */
export const calculateAvoidanceOffset = (
  label: LabelBounds,
  obstacleLabels: LabelBounds[],
): { dx: number; dy: number } => {
  let bestDx = 0;
  let bestDy = 0;
  let minOverlap = Infinity;

  // Try different offset directions
  const offsets = [
    { dx: 0, dy: -20 }, // up
    { dx: 0, dy: 20 }, // down
    { dx: -20, dy: 0 }, // left
    { dx: 20, dy: 0 }, // right
    { dx: -15, dy: -15 }, // diagonal
    { dx: 15, dy: -15 },
    { dx: -15, dy: 15 },
    { dx: 15, dy: 15 },
  ];

  for (const offset of offsets) {
    const testLabel = {
      ...label,
      x: label.x + offset.dx,
      y: label.y + offset.dy,
    };

    let totalOverlap = 0;
    for (const obstacle of obstacleLabels) {
      if (checkOverlap(testLabel, obstacle)) {
        totalOverlap += calculateOverlapArea(testLabel, obstacle);
      }
    }

    if (totalOverlap < minOverlap) {
      minOverlap = totalOverlap;
      bestDx = offset.dx;
      bestDy = offset.dy;
    }

    // If we found a position with no overlap, use it
    if (totalOverlap === 0) {
      break;
    }
  }

  return { dx: bestDx, dy: bestDy };
};
